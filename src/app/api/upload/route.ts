import { NextResponse } from 'next/server';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  
  console.log('Raw environment variables:', {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
  
  console.log('Resolved values:', {
    projectId,
    storageBucket
  });

  // Ensure storage bucket includes the full URL if not already present
  const fullBucketName = storageBucket?.includes('appspot.com') 
    ? storageBucket 
    : `${projectId}.appspot.com`;
    
  console.log('Final bucket name:', fullBucketName);

  try {
    const adminConfig = {
      credential: cert({
        projectId: projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: fullBucketName
    };
    
    console.log('Initializing Firebase Admin with config:', {
      ...adminConfig,
      credential: 'CREDENTIAL_HIDDEN' // Don't log the actual credential
    });

    initializeApp(adminConfig);
    console.log('Firebase Admin initialized successfully');
    
    // Test bucket access
    const testStorage = getStorage(getApp());
    const testBucket = testStorage.bucket(fullBucketName);
    console.log('Testing bucket access...');
    await testBucket.exists();
    console.log('Bucket exists and is accessible');
  } catch (error) {
    console.error('Error initializing Firebase Admin or accessing bucket:', error);
    throw error;
  }
}

const adminStorage = getStorage(getApp());
// Use the same bucket name format as in initialization
let bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!bucketName?.includes('appspot.com')) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  bucketName = `${projectId}.appspot.com`;
}

console.log('Using bucket for upload:', bucketName);

export async function POST(request: Request) {
  console.log('API upload route called!');
  
  // Wrap everything in a try-catch to ensure we always send a response
  try {
    // First check if Firebase Admin is initialized properly
    if (!getApps().length) {
      console.error('Firebase Admin not initialized');
      return NextResponse.json({ 
        error: 'Server configuration error', 
        details: 'Firebase Admin not initialized'
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    console.log('Received upload request:', {
      hasFile: !!file,
      userId,
      contentType: file?.type,
      fileSize: file?.size
    });
    
    if (!file || !userId) {
      console.error('Missing file or userId in upload request', { file: !!file, userId: !!userId });
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    // Create the correct path structure according to storage rules
    const fileName = `${Date.now()}_${file.name}`;
    const path = `thumbnails/${userId}/${fileName}`;

    if (!bucketName) {
      console.error('Storage bucket name not configured');
      return NextResponse.json({ 
        error: 'Storage configuration error',
        details: 'Bucket name not configured'
      }, { status: 500 });
    }
    
    console.log('Processing upload request', { 
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      path,
      userId,
      bucketName
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    console.log('File converted to buffer, size:', buffer.length);

    try {
      // Upload file to Firebase Storage
      const bucket = adminStorage.bucket(bucketName);
      console.log('Got bucket reference:', bucket.name);
      
      const fileUpload = bucket.file(path);
      console.log('Created file reference:', path);
      
      return new Promise((resolve) => {
        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.type,
          },
          resumable: false
        });

        let uploadError: Error | null = null;

        stream.on('error', (error) => {
          console.error('Upload stream error:', error);
          uploadError = error;
        });

        stream.on('finish', async () => {
          if (uploadError) {
            console.error('Upload failed:', uploadError);
            resolve(NextResponse.json({ 
              error: 'Failed to upload to Firebase Storage',
              details: uploadError.message
            }, { status: 500 }));
            return;
          }

          try {
            console.log('Upload finished, making file public...');
            await fileUpload.makePublic();
            
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileUpload.name}`;
            console.log('File uploaded successfully:', publicUrl);
            
            resolve(NextResponse.json({ 
              success: true,
              url: publicUrl 
            }));
          } catch (error: any) {
            console.error('Error making file public:', error);
            resolve(NextResponse.json({ 
              error: 'Failed to make file public',
              details: error.message
            }, { status: 500 }));
          }
        });

        // Write the file data to the stream
        console.log('Writing file data to stream...');
        stream.end(buffer);
      });
    } catch (uploadError: any) {
      console.error('Firebase Storage upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload to Firebase Storage',
        details: uploadError.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unhandled error in upload route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
} 
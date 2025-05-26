import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export async function POST(request: Request) {
  console.log('API upload route called!');
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;
    
    if (!file || !path) {
      console.error('Missing file or path in upload request', { file: !!file, path });
      return NextResponse.json({ error: 'Missing file or path' }, { status: 400 });
    }
    
    console.log('Processing upload request', { 
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      path
    });

    const storageRef = ref(storage, path);
    console.log('Created storage reference', { fullPath: storageRef.fullPath });
    
    const fileBuffer = await file.arrayBuffer();
    console.log('Converted file to array buffer, size:', fileBuffer.byteLength);
    
    // Upload the file
    console.log('Starting upload to Firebase Storage...');
    const uploadTask = await uploadBytesResumable(storageRef, new Uint8Array(fileBuffer));
    console.log('Upload complete!', { 
      bytesTransferred: uploadTask.bytesTransferred,
      totalBytes: uploadTask.totalBytes
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(uploadTask.ref);
    console.log('Got download URL:', downloadURL);
    
    return NextResponse.json({ url: downloadURL });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
    
    // Return a more detailed error response
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR' 
    }, { status: 500 });
  }
} 
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();

async function removeSampleContent() {
  try {
    console.log('Starting removal of all sample content...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    // 1. Delete all sample content items (isSample: true)
    console.log('Fetching sample content items...');
    const contentSnapshot = await db.collection('content')
      .where('isSample', '==', true)
      .get();
    
    console.log(`Found ${contentSnapshot.docs.length} sample content items to delete`);
    
    const contentDeletePromises = contentSnapshot.docs.map(doc => {
      console.log(`Deleting sample content: ${doc.data().title || doc.id}`);
      return doc.ref.delete();
    });
    
    await Promise.all(contentDeletePromises);
    console.log(`Deleted ${contentDeletePromises.length} sample content items`);
    
    // 2. Delete demo content (userId: 'demo')
    console.log('Fetching demo content items...');
    const demoContentSnapshot = await db.collection('content')
      .where('userId', '==', 'demo')
      .get();
    
    console.log(`Found ${demoContentSnapshot.docs.length} demo content items to delete`);
    
    const demoContentDeletePromises = demoContentSnapshot.docs.map(doc => {
      console.log(`Deleting demo content: ${doc.data().title || doc.id}`);
      return doc.ref.delete();
    });
    
    await Promise.all(demoContentDeletePromises);
    console.log(`Deleted ${demoContentDeletePromises.length} demo content items`);
    
    // 3. Delete content with userId 'sample'
    console.log('Fetching sample user content items...');
    const sampleUserSnapshot = await db.collection('content')
      .where('userId', '==', 'sample')
      .get();
    
    console.log(`Found ${sampleUserSnapshot.docs.length} sample user content items to delete`);
    
    const sampleUserDeletePromises = sampleUserSnapshot.docs.map(doc => {
      console.log(`Deleting sample user content: ${doc.data().title || doc.id}`);
      return doc.ref.delete();
    });
    
    await Promise.all(sampleUserDeletePromises);
    console.log(`Deleted ${sampleUserDeletePromises.length} sample user content items`);
    
    const totalDeleted = contentDeletePromises.length + demoContentDeletePromises.length + sampleUserDeletePromises.length;
    
    console.log('\n=== SAMPLE CONTENT REMOVAL COMPLETE ===');
    console.log(`Total sample content items deleted: ${totalDeleted}`);
    console.log('- Sample content (isSample: true): ' + contentDeletePromises.length);
    console.log('- Demo content (userId: demo): ' + demoContentDeletePromises.length);
    console.log('- Sample user content (userId: sample): ' + sampleUserDeletePromises.length);
    console.log('\nUsers will now start with clean, empty libraries!');
    
  } catch (error) {
    console.error('Error removing sample content:', error);
    process.exit(1);
  }
}

removeSampleContent().then(() => {
  console.log('Sample content removal completed successfully!');
  process.exit(0);
}); 
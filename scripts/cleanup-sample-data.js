const admin = require('firebase-admin');

// Initialize Firebase Admin SDK using environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();

async function cleanupSampleData() {
  try {
    console.log('Starting cleanup of sample data...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    // 1. Delete all sample content items
    console.log('Fetching sample content items...');
    const contentSnapshot = await db.collection('content')
      .where('isSample', '==', true)
      .get();
    
    console.log(`Found ${contentSnapshot.docs.length} sample content items to delete`);
    
    const contentDeletePromises = contentSnapshot.docs.map(doc => {
      console.log(`Deleting content: ${doc.data().title || doc.id}`);
      return doc.ref.delete();
    });
    
    await Promise.all(contentDeletePromises);
    console.log(`Deleted ${contentDeletePromises.length} sample content items`);
    
    // 2. Delete all sample player analysis videos
    console.log('Fetching sample player analysis videos...');
    const playerAnalysisSnapshot = await db.collection('playerAnalysisVideos')
      .where('isSample', '==', true)
      .get();
    
    console.log(`Found ${playerAnalysisSnapshot.docs.length} sample player analysis videos to delete`);
    
    const playerAnalysisDeletePromises = playerAnalysisSnapshot.docs.map(doc => {
      console.log(`Deleting player analysis: ${doc.data().playerName || doc.id}`);
      return doc.ref.delete();
    });
    
    await Promise.all(playerAnalysisDeletePromises);
    console.log(`Deleted ${playerAnalysisDeletePromises.length} sample player analysis videos`);
    
    // 3. Also clean up any content with userId 'demo' or 'sample'
    console.log('Cleaning up demo/sample user content...');
    const demoContentSnapshot = await db.collection('content')
      .where('userId', 'in', ['demo', 'sample'])
      .get();
    
    const demoDeletePromises = demoContentSnapshot.docs.map(doc => {
      console.log(`Deleting demo content: ${doc.data().title || doc.id}`);
      return doc.ref.delete();
    });
    
    await Promise.all(demoDeletePromises);
    console.log(`Deleted ${demoDeletePromises.length} demo content items`);
    
    // 4. Clean up demo player analysis videos
    const demoPlayerAnalysisSnapshot = await db.collection('playerAnalysisVideos')
      .where('userId', 'in', ['demo', 'sample'])
      .get();
    
    const demoPlayerDeletePromises = demoPlayerAnalysisSnapshot.docs.map(doc => {
      console.log(`Deleting demo player analysis: ${doc.data().playerName || doc.id}`);
      return doc.ref.delete();
    });
    
    await Promise.all(demoPlayerDeletePromises);
    console.log(`Deleted ${demoPlayerDeletePromises.length} demo player analysis videos`);
    
    console.log('\n=== CLEANUP COMPLETE ===');
    console.log(`Total items deleted:`);
    console.log(`- Sample content: ${contentDeletePromises.length}`);
    console.log(`- Sample player analysis: ${playerAnalysisDeletePromises.length}`);
    console.log(`- Demo content: ${demoDeletePromises.length}`);
    console.log(`- Demo player analysis: ${demoPlayerDeletePromises.length}`);
    console.log(`Total: ${contentDeletePromises.length + playerAnalysisDeletePromises.length + demoDeletePromises.length + demoPlayerDeletePromises.length}`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupSampleData()
  .then(() => {
    console.log('Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to cleanup sample data:', error);
    process.exit(1);
  }); 
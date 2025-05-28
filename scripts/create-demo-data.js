const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK using environment variables
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();

// User ID for berget3333@gmail.com
const SOURCE_USER_ID = 'uFjSMoXun5NUMw4bDCwfLgocZfl2';

async function createDemoData() {
  try {
    console.log('Starting demo data creation from real berget3333@gmail.com content...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    // 1. Fetch content from berget3333@gmail.com account
    console.log('Fetching content from source user...');
    const contentSnapshot = await db.collection('content')
      .where('userId', '==', SOURCE_USER_ID)
      .where('isSample', '==', false)
      .get();
    
    const sourceContent = [];
    contentSnapshot.forEach(doc => {
      sourceContent.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${sourceContent.length} content items`);
    
    // 2. Fetch player analysis videos from berget3333@gmail.com account
    console.log('Fetching player analysis videos from source user...');
    const playerAnalysisSnapshot = await db.collection('playerAnalysisVideos')
      .where('userId', '==', SOURCE_USER_ID)
      .get();
    
    const sourcePlayerAnalysis = [];
    playerAnalysisSnapshot.forEach(doc => {
      sourcePlayerAnalysis.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${sourcePlayerAnalysis.length} player analysis videos`);
    
    // 3. Create demo content items (marked as sample for demo purposes)
    console.log('Creating demo content items...');
    const demoContentPromises = sourceContent.map(async (content) => {
      const demoContent = {
        ...content,
        userId: 'demo',
        isSample: true, // Mark as sample so it shows in demo mode
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Remove the original id
      delete demoContent.id;
      
      return db.collection('content').add(demoContent);
    });
    
    const demoContentResults = await Promise.all(demoContentPromises);
    console.log(`Created ${demoContentResults.length} demo content items`);
    
    // 4. Create demo player analysis videos (for demo purposes)
    console.log('Creating demo player analysis videos...');
    const demoPlayerAnalysisPromises = sourcePlayerAnalysis.map(async (video) => {
      const demoVideo = {
        ...video,
        userId: 'demo',
        // Don't mark player analysis as sample - they have different logic
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Remove the original id
      delete demoVideo.id;
      
      return db.collection('playerAnalysisVideos').add(demoVideo);
    });
    
    const demoPlayerAnalysisResults = await Promise.all(demoPlayerAnalysisPromises);
    console.log(`Created ${demoPlayerAnalysisResults.length} demo player analysis videos`);
    
    // 5. Create a summary file
    const summary = {
      sourceUserId: SOURCE_USER_ID,
      sourceUserEmail: 'berget3333@gmail.com',
      createdAt: new Date().toISOString(),
      contentItems: {
        source: sourceContent.length,
        created: demoContentResults.length
      },
      playerAnalysisVideos: {
        source: sourcePlayerAnalysis.length,
        created: demoPlayerAnalysisResults.length
      },
      demoContentIds: demoContentResults.map(ref => ref.id),
      demoPlayerAnalysisIds: demoPlayerAnalysisResults.map(ref => ref.id),
      sourceContentSample: sourceContent.slice(0, 3).map(item => ({
        title: item.title,
        url: item.url,
        category: item.category,
        tags: item.tags
      })),
      sourcePlayerAnalysisSample: sourcePlayerAnalysis.slice(0, 3).map(video => ({
        playerName: video.playerName || video.category,
        videoUrl: video.videoUrl,
        videoType: video.videoType,
        notes: video.notes
      }))
    };
    
    // Save summary to file
    const summaryPath = path.join(__dirname, 'demo-data-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log('\n=== DEMO DATA CREATION COMPLETE ===');
    console.log(`Content items: ${sourceContent.length} → ${demoContentResults.length}`);
    console.log(`Player analysis videos: ${sourcePlayerAnalysis.length} → ${demoPlayerAnalysisResults.length}`);
    console.log(`Summary saved to: ${summaryPath}`);
    
    // 6. Output some sample data for verification
    console.log('\n=== SAMPLE CONTENT ITEMS (REAL URLS) ===');
    sourceContent.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   URL: ${item.url}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   Tags: ${item.tags?.join(', ') || 'None'}`);
      console.log('');
    });
    
    console.log('\n=== SAMPLE PLAYER ANALYSIS VIDEOS (REAL URLS) ===');
    sourcePlayerAnalysis.slice(0, 5).forEach((video, index) => {
      console.log(`${index + 1}. Player: ${video.playerName || video.category}`);
      console.log(`   URL: ${video.videoUrl}`);
      console.log(`   Type: ${video.videoType}`);
      console.log(`   Notes: ${video.notes || 'None'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error creating demo data:', error);
    process.exit(1);
  }
}

// Run the script
createDemoData()
  .then(() => {
    console.log('Demo data creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create demo data:', error);
    process.exit(1);
  }); 
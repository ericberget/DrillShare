#!/bin/bash

echo "=== DrillShare Demo Data Setup ==="
echo "This script will:"
echo "1. Clean up any existing sample/demo data"
echo "2. Create demo data from berget3333@gmail.com account"
echo ""

# Source user ID for berget3333@gmail.com
SOURCE_USER_ID="uFjSMoXun5NUMw4bDCwfLgocZfl2"

echo "Step 1: Cleaning up existing sample/demo data..."

# Delete sample content
echo "Deleting sample content items..."
firebase firestore:delete --project drillshare-e35f2 --recursive --yes \
  --shallow-query-file <(cat <<EOF
{
  "collection": "content",
  "where": [
    {
      "field": "isSample",
      "op": "==",
      "value": true
    }
  ]
}
EOF
) 2>/dev/null || echo "No sample content found to delete"

# Delete demo content
echo "Deleting demo content items..."
firebase firestore:delete --project drillshare-e35f2 --recursive --yes \
  --shallow-query-file <(cat <<EOF
{
  "collection": "content",
  "where": [
    {
      "field": "userId",
      "op": "==",
      "value": "demo"
    }
  ]
}
EOF
) 2>/dev/null || echo "No demo content found to delete"

# Delete demo player analysis videos
echo "Deleting demo player analysis videos..."
firebase firestore:delete --project drillshare-e35f2 --recursive --yes \
  --shallow-query-file <(cat <<EOF
{
  "collection": "playerAnalysisVideos",
  "where": [
    {
      "field": "userId",
      "op": "==",
      "value": "demo"
    }
  ]
}
EOF
) 2>/dev/null || echo "No demo player analysis videos found to delete"

echo "Cleanup completed!"
echo ""
echo "Step 2: Creating demo data from berget3333@gmail.com account..."
echo "This will create a Node.js script to duplicate the real data..."

# Create a temporary Node.js script for data duplication in the project directory
cat > ./scripts/temp-create-demo-data.js << 'EOF'
const admin = require('firebase-admin');

// Initialize with Application Default Credentials (from Firebase CLI)
admin.initializeApp({
  projectId: 'drillshare-e35f2'
});

const db = admin.firestore();
const SOURCE_USER_ID = 'uFjSMoXun5NUMw4bDCwfLgocZfl2';

async function createDemoData() {
  try {
    console.log('Fetching content from berget3333@gmail.com...');
    
    // Get source content
    const contentSnapshot = await db.collection('content')
      .where('userId', '==', SOURCE_USER_ID)
      .where('isSample', '==', false)
      .get();
    
    const sourceContent = [];
    contentSnapshot.forEach(doc => {
      sourceContent.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${sourceContent.length} content items`);
    
    // Get source player analysis videos
    const playerAnalysisSnapshot = await db.collection('playerAnalysisVideos')
      .where('userId', '==', SOURCE_USER_ID)
      .get();
    
    const sourcePlayerAnalysis = [];
    playerAnalysisSnapshot.forEach(doc => {
      sourcePlayerAnalysis.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${sourcePlayerAnalysis.length} player analysis videos`);
    
    // Create demo content
    console.log('Creating demo content items...');
    const batch = db.batch();
    let batchCount = 0;
    
    for (const content of sourceContent) {
      const demoContent = {
        ...content,
        userId: 'demo',
        isSample: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      delete demoContent.id;
      
      const docRef = db.collection('content').doc();
      batch.set(docRef, demoContent);
      batchCount++;
      
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    }
    
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log(`Created ${sourceContent.length} demo content items`);
    
    // Create demo player analysis videos
    console.log('Creating demo player analysis videos...');
    const playerBatch = db.batch();
    let playerBatchCount = 0;
    
    for (const video of sourcePlayerAnalysis) {
      const demoVideo = {
        ...video,
        userId: 'demo',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      delete demoVideo.id;
      
      const docRef = db.collection('playerAnalysisVideos').doc();
      playerBatch.set(docRef, demoVideo);
      playerBatchCount++;
      
      if (playerBatchCount >= 500) {
        await playerBatch.commit();
        playerBatchCount = 0;
      }
    }
    
    if (playerBatchCount > 0) {
      await playerBatch.commit();
    }
    
    console.log(`Created ${sourcePlayerAnalysis.length} demo player analysis videos`);
    
    // Show sample data
    console.log('\n=== SAMPLE CONTENT CREATED ===');
    sourceContent.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   URL: ${item.url}`);
      console.log(`   Category: ${item.category}`);
      console.log('');
    });
    
    console.log('\n=== SAMPLE PLAYER ANALYSIS CREATED ===');
    sourcePlayerAnalysis.slice(0, 3).forEach((video, index) => {
      console.log(`${index + 1}. Player: ${video.playerName || video.category}`);
      console.log(`   URL: ${video.videoUrl}`);
      console.log(`   Type: ${video.videoType}`);
      console.log('');
    });
    
    console.log('\nDemo data creation completed successfully!');
    
  } catch (error) {
    console.error('Error creating demo data:', error);
    process.exit(1);
  }
}

createDemoData().then(() => process.exit(0));
EOF

echo "Running demo data creation script..."
GOOGLE_APPLICATION_CREDENTIALS="" node ./scripts/temp-create-demo-data.js

# Clean up temporary file
rm ./scripts/temp-create-demo-data.js

echo ""
echo "=== DEMO DATA SETUP COMPLETE ==="
echo "Your demo data has been created from the real berget3333@gmail.com content!"
echo "The demo will now show real URLs, titles, and tags from your account." 
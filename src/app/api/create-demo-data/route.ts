import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

// User ID for berget3333@gmail.com
const SOURCE_USER_ID = 'uFjSMoXun5NUMw4bDCwfLgocZfl2';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting demo data creation from berget3333@gmail.com account...');
    
    // 1. Clean up existing demo/sample data first
    console.log('Cleaning up existing demo data...');
    
    // Delete existing sample content
    const existingSampleQuery = query(
      collection(db, 'content'),
      where('isSample', '==', true)
    );
    const existingSampleSnapshot = await getDocs(existingSampleQuery);
    
    const sampleDeletePromises = existingSampleSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(sampleDeletePromises);
    console.log(`Deleted ${sampleDeletePromises.length} existing sample content items`);
    
    // Delete existing demo content
    const existingDemoQuery = query(
      collection(db, 'content'),
      where('userId', '==', 'demo')
    );
    const existingDemoSnapshot = await getDocs(existingDemoQuery);
    
    const demoDeletePromises = existingDemoSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(demoDeletePromises);
    console.log(`Deleted ${demoDeletePromises.length} existing demo content items`);
    
    // Delete existing demo player analysis videos
    const existingDemoPlayerQuery = query(
      collection(db, 'playerAnalysisVideos'),
      where('userId', '==', 'demo')
    );
    const existingDemoPlayerSnapshot = await getDocs(existingDemoPlayerQuery);
    
    const demoPlayerDeletePromises = existingDemoPlayerSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(demoPlayerDeletePromises);
    console.log(`Deleted ${demoPlayerDeletePromises.length} existing demo player analysis videos`);
    
    // 2. Fetch source content from berget3333@gmail.com
    console.log('Fetching source content...');
    const contentQuery = query(
      collection(db, 'content'),
      where('userId', '==', SOURCE_USER_ID),
      where('isSample', '==', false)
    );
    const contentSnapshot = await getDocs(contentQuery);
    
    const sourceContent = contentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${sourceContent.length} source content items`);
    
    // 3. Fetch source player analysis videos
    console.log('Fetching source player analysis videos...');
    const playerAnalysisQuery = query(
      collection(db, 'playerAnalysisVideos'),
      where('userId', '==', SOURCE_USER_ID)
    );
    const playerAnalysisSnapshot = await getDocs(playerAnalysisQuery);
    
    const sourcePlayerAnalysis = playerAnalysisSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${sourcePlayerAnalysis.length} source player analysis videos`);
    
    // 4. Create demo content items
    console.log('Creating demo content items...');
    const demoContentPromises = sourceContent.map(async (content) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...contentWithoutId } = content;
      
      const demoContent = {
        ...contentWithoutId,
        userId: 'demo',
        isSample: true, // Mark as sample for demo mode
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      return addDoc(collection(db, 'content'), demoContent);
    });
    
    const demoContentResults = await Promise.all(demoContentPromises);
    console.log(`Created ${demoContentResults.length} demo content items`);
    
    // 5. Create demo player analysis videos
    console.log('Creating demo player analysis videos...');
    const demoPlayerAnalysisPromises = sourcePlayerAnalysis.map(async (video) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...videoWithoutId } = video;
      
      const demoVideo = {
        ...videoWithoutId,
        userId: 'demo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      return addDoc(collection(db, 'playerAnalysisVideos'), demoVideo);
    });
    
    const demoPlayerAnalysisResults = await Promise.all(demoPlayerAnalysisPromises);
    console.log(`Created ${demoPlayerAnalysisResults.length} demo player analysis videos`);
    
    // 6. Create summary
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
      cleanup: {
        deletedSampleContent: sampleDeletePromises.length,
        deletedDemoContent: demoDeletePromises.length,
        deletedDemoPlayerAnalysis: demoPlayerDeletePromises.length
      },
      sampleData: {
        content: sourceContent.slice(0, 3).map(item => ({
          title: (item as any).title || 'Unknown Title',
          url: (item as any).url || '',
          category: (item as any).category || 'unknown',
          tags: (item as any).tags || []
        })),
        playerAnalysis: sourcePlayerAnalysis.slice(0, 3).map(video => ({
          playerName: (video as any).playerName || (video as any).category || 'Unknown Player',
          videoUrl: (video as any).videoUrl || '',
          videoType: (video as any).videoType || 'unknown',
          notes: (video as any).notes || ''
        }))
      }
    };
    
    return NextResponse.json({
      success: true,
      message: 'Demo data created successfully from real berget3333@gmail.com content!',
      summary
    });
    
  } catch (error) {
    console.error('Error creating demo data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc
} from 'firebase/firestore';

export async function POST() {
  try {
    console.log('Starting removal of all sample content...');
    
    let totalDeleted = 0;
    
    // 1. Delete all sample content items (isSample: true)
    console.log('Fetching sample content items...');
    const sampleContentQuery = query(
      collection(db, 'content'),
      where('isSample', '==', true)
    );
    const sampleContentSnapshot = await getDocs(sampleContentQuery);
    
    console.log(`Found ${sampleContentSnapshot.docs.length} sample content items to delete`);
    
    const sampleContentDeletePromises = sampleContentSnapshot.docs.map(doc => {
      console.log(`Deleting sample content: ${doc.data().title || doc.id}`);
      return deleteDoc(doc.ref);
    });
    
    await Promise.all(sampleContentDeletePromises);
    totalDeleted += sampleContentDeletePromises.length;
    console.log(`Deleted ${sampleContentDeletePromises.length} sample content items`);
    
    // 2. Delete demo content (userId: 'demo')
    console.log('Fetching demo content items...');
    const demoContentQuery = query(
      collection(db, 'content'),
      where('userId', '==', 'demo')
    );
    const demoContentSnapshot = await getDocs(demoContentQuery);
    
    console.log(`Found ${demoContentSnapshot.docs.length} demo content items to delete`);
    
    const demoContentDeletePromises = demoContentSnapshot.docs.map(doc => {
      console.log(`Deleting demo content: ${doc.data().title || doc.id}`);
      return deleteDoc(doc.ref);
    });
    
    await Promise.all(demoContentDeletePromises);
    totalDeleted += demoContentDeletePromises.length;
    console.log(`Deleted ${demoContentDeletePromises.length} demo content items`);
    
    // 3. Delete content with userId 'sample'
    console.log('Fetching sample user content items...');
    const sampleUserQuery = query(
      collection(db, 'content'),
      where('userId', '==', 'sample')
    );
    const sampleUserSnapshot = await getDocs(sampleUserQuery);
    
    console.log(`Found ${sampleUserSnapshot.docs.length} sample user content items to delete`);
    
    const sampleUserDeletePromises = sampleUserSnapshot.docs.map(doc => {
      console.log(`Deleting sample user content: ${doc.data().title || doc.id}`);
      return deleteDoc(doc.ref);
    });
    
    await Promise.all(sampleUserDeletePromises);
    totalDeleted += sampleUserDeletePromises.length;
    console.log(`Deleted ${sampleUserDeletePromises.length} sample user content items`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully removed all sample content from the database.`,
      totalDeleted: totalDeleted,
      breakdown: {
        sampleContent: sampleContentDeletePromises.length,
        demoContent: demoContentDeletePromises.length,
        sampleUserContent: sampleUserDeletePromises.length
      }
    });
    
  } catch (error) {
    console.error('Error removing sample content:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to remove sample content',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
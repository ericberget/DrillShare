import { NextResponse } from 'next/server';
import { sampleContentItems } from '@/lib/sampleContent';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CONTENT_COLLECTION = 'content';

// Helper function to get sample content
async function getSampleContent() {
  const contentRef = collection(db, CONTENT_COLLECTION);
  const q = query(contentRef, where('isSample', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Helper function to create content
async function createContent(content: any) {
  const contentRef = collection(db, CONTENT_COLLECTION);
  const docRef = await addDoc(contentRef, content);
  return docRef.id;
}

// This route will seed the database with sample content
export async function GET() {
  try {
    console.log('Starting sample content seeding...');
    
    // First check if we already have sample content
    const existingSamples = await getSampleContent();
    console.log(`Found ${existingSamples.length} existing sample items`);
    
    // If we have samples, don't add more
    if (existingSamples.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${existingSamples.length} sample items. No action taken.`,
        alreadySeeded: true
      });
    }
    
    // Add sample content to the database
    const results = [];
    for (const content of sampleContentItems) {
      try {
        const id = await createContent(content);
        results.push({ id, title: content.title });
        console.log(`Created sample content: ${content.title}`);
      } catch (error) {
        console.error(`Error creating sample content item ${content.title}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Added ${results.length} sample content items to the database.`,
      items: results
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
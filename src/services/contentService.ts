'use client';

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { ContentItem } from '@/types/content';

const CONTENT_COLLECTION = 'content';

// Create a new content item
export const createContent = async (
  contentData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    console.log('Creating new content:', JSON.stringify(contentData, null, 2));
    
    if (!contentData.userId) {
      console.error('No userId provided for content creation!');
      throw new Error('userId is required to create content');
    }
    
    const contentRef = collection(db, CONTENT_COLLECTION);
    const newContentData = {
      ...contentData,
      isSample: false, // ensure it's not marked as sample
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('Saving content to Firestore...');
    const docRef = await addDoc(contentRef, newContentData);
    console.log(`Content created with ID: ${docRef.id}`);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
};

// Get a single content item by ID
export const getContentById = async (contentId: string): Promise<ContentItem | null> => {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, contentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ContentItem;
    }
    return null;
  } catch (error) {
    console.error('Error getting content:', error);
    throw error;
  }
};

// Get all content items
export const getAllContent = async (userId?: string): Promise<ContentItem[]> => {
  try {
    console.log('Getting all content for userId:', userId);
    const contentRef = collection(db, CONTENT_COLLECTION);
    
    // We need to run two separate queries and combine the results
    // since Firestore doesn't support OR queries directly
    
    if (userId) {
      // If user is logged in, get their content and sample content
      
      // First query: Get user's own content
      const userContentQuery = query(
        contentRef,
        where('userId', '==', userId),
        where('isSample', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      // Second query: Get sample content
      const sampleContentQuery = query(
        contentRef,
        where('isSample', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      // Execute both queries
      const [userSnapshot, sampleSnapshot] = await Promise.all([
        getDocs(userContentQuery),
        getDocs(sampleContentQuery)
      ]);
      
      // Combine the results
      const userContent = userSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      const sampleContent = sampleSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      console.log(`Retrieved ${userContent.length} user content items and ${sampleContent.length} sample content items`);
      
      return [...userContent, ...sampleContent] as ContentItem[];
    } else {
      // If no user, only get sample content
      const q = query(
        contentRef,
        where('isSample', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as ContentItem[];
    }
  } catch (error) {
    console.error('Error getting all content:', error);
    throw error;
  }
};

// Get sample content items
export const getSampleContent = async (): Promise<ContentItem[]> => {
  try {
    const contentRef = collection(db, CONTENT_COLLECTION);
    const q = query(contentRef, where('isSample', '==', true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as ContentItem[];
  } catch (error) {
    console.error('Error getting sample content:', error);
    throw error;
  }
};

// Get content items by user ID
export const getUserContent = async (userId: string): Promise<ContentItem[]> => {
  try {
    console.log(`Getting content for user: ${userId}`);
    const contentRef = collection(db, CONTENT_COLLECTION);
    const q = query(
      contentRef, 
      where('userId', '==', userId),
      where('isSample', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    console.log('Executing user content query...');
    const querySnapshot = await getDocs(q);
    console.log(`Retrieved ${querySnapshot.docs.length} user content items`);
    
    // Log the IDs of the first few items for debugging
    if (querySnapshot.docs.length > 0) {
      const firstItems = querySnapshot.docs.slice(0, 3).map(doc => doc.id);
      console.log(`First few content IDs: ${firstItems.join(', ')}`);
    }
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as ContentItem[];
  } catch (error) {
    console.error('Error getting user content:', error);
    throw error;
  }
};

// Get specific content items by their IDs (for shared collections)
export const getContentItemsByIds = async (contentIds: string[]): Promise<ContentItem[]> => {
  try {
    console.log(`Getting ${contentIds.length} content items by IDs:`, contentIds);
    
    if (contentIds.length === 0) {
      return [];
    }
    
    const contentRef = collection(db, CONTENT_COLLECTION);
    
    // Firestore has a limit of 10 items per 'in' query, so we need to batch if more than 10
    const batchSize = 10;
    const batches: Promise<ContentItem[]>[] = [];
    
    for (let i = 0; i < contentIds.length; i += batchSize) {
      const batchIds = contentIds.slice(i, i + batchSize);
      
      const batchQuery = query(
        contentRef,
        where('__name__', 'in', batchIds)
      );
      
      const batchPromise = getDocs(batchQuery).then(snapshot => 
        snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as ContentItem[]
      );
      
      batches.push(batchPromise);
    }
    
    // Wait for all batches to complete and flatten the results
    const results = await Promise.all(batches);
    const allContent = results.flat();
    
    console.log(`Successfully retrieved ${allContent.length} content items`);
    
    // Sort the results to match the original order of contentIds
    const sortedContent = contentIds.map(id => 
      allContent.find(item => item.id === id)
    ).filter(item => item !== undefined) as ContentItem[];
    
    return sortedContent;
  } catch (error) {
    console.error('Error getting content items by IDs:', error);
    throw error;
  }
};

// Update a content item
export const updateContent = async (contentId: string, data: Partial<ContentItem>): Promise<void> => {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, contentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

// Delete a content item
export const deleteContent = async (contentId: string): Promise<void> => {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, contentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// Toggle favorite status
export const toggleContentFavorite = async (contentId: string, currentStatus: boolean): Promise<void> => {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, contentId);
    await updateDoc(docRef, {
      favorite: !currentStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
};

// Update last viewed timestamp
export const updateContentLastViewed = async (contentId: string): Promise<void> => {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, contentId);
    await updateDoc(docRef, {
      lastViewed: Date.now(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating last viewed:', error);
    throw error;
  }
};

// Seed sample content for a specific user
export const seedUserSampleContent = async (userId: string): Promise<void> => {
  try {
    console.log(`Starting content seeding for user ${userId}`);
    
    // First check if the user already has any content
    const userContent = await getUserContent(userId);
    console.log(`User has ${userContent.length} existing content items`);
    
    // If user already has content, don't seed
    if (userContent.length > 0) {
      console.log('User already has content, skipping sample content seeding');
      return;
    }
    
    // Get existing sample content to use as templates
    const contentRef = collection(db, CONTENT_COLLECTION);
    const q = query(contentRef, where('isSample', '==', true));
    const querySnapshot = await getDocs(q);
    const sampleContent = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log(`Found ${sampleContent.length} sample content items to seed`);
    
    // If no sample content exists, create it first
    if (sampleContent.length === 0) {
      console.log('No sample content found, creating sample content first');
      const response = await fetch('/api/seed', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to seed sample content:', errorData);
        throw new Error(`Failed to seed sample content: ${errorData}`);
      }
      
      // Get the newly created sample content
      const newQuerySnapshot = await getDocs(q);
      const newSampleContent = newQuerySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      console.log(`Retrieved ${newSampleContent.length} new sample content items`);
      sampleContent.push(...newSampleContent);
    }
    
    // Create copies of sample content for the user
    let successCount = 0;
    for (const sample of sampleContent) {
      try {
        const userContent = {
          ...sample,
          id: undefined, // Remove id to create new document
          userId, // Set to the new user's ID
          isSample: false, // Mark as regular content
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        const contentRef = collection(db, CONTENT_COLLECTION);
        await addDoc(contentRef, userContent);
        successCount++;
        console.log(`Successfully created content item ${successCount}/${sampleContent.length} for user ${userId}`);
      } catch (itemError) {
        console.error(`Failed to create content item for user ${userId}:`, itemError);
        // Continue with other items even if one fails
      }
    }
    
    console.log(`Successfully seeded ${successCount}/${sampleContent.length} content items for user ${userId}`);
    
    if (successCount === 0) {
      throw new Error('Failed to seed any content items');
    }
  } catch (error) {
    console.error('Error in seedUserSampleContent:', error);
    throw error;
  }
}; 
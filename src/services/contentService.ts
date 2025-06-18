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
  orderBy,
  writeBatch
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
    const now = Date.now();
    const newContentData = {
      ...contentData,
      isSample: false, // ensure it's not marked as sample
      sortOrder: now, // Set initial sort order to current timestamp
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
    
    if (userId) {
      // If user is logged in, get only their content (no sample content)
      // First try to get content sorted by sortOrder
      try {
        const userContentQuery = query(
          contentRef,
          where('userId', '==', userId),
          where('isSample', '==', false),
          orderBy('sortOrder', 'asc')  // Sort by manual sort order first
        );
        
        const userSnapshot = await getDocs(userContentQuery);
        const userContent = userSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        console.log(`Retrieved ${userContent.length} user content items with sortOrder`);
        
        // If we got results, return them
        if (userContent.length > 0) {
          return userContent as ContentItem[];
        }
      } catch (sortOrderError) {
        console.log('sortOrder query failed, falling back to createdAt:', sortOrderError);
      }
      
      // Fallback: get content sorted by creation date (for existing content without sortOrder)
      const fallbackQuery = query(
        contentRef,
        where('userId', '==', userId),
        where('isSample', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const fallbackSnapshot = await getDocs(fallbackQuery);
      const fallbackContent = fallbackSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      console.log(`Retrieved ${fallbackContent.length} user content items with createdAt fallback`);
      
      return fallbackContent as ContentItem[];
    } else {
      // If no user, return empty array (no sample content)
      console.log('No user logged in - returning empty content array (sample content disabled)');
      return [];
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
    
    // First try to get content sorted by sortOrder
    try {
      const q = query(
        contentRef, 
        where('userId', '==', userId),
        where('isSample', '==', false),
        orderBy('sortOrder', 'asc')  // Sort by manual sort order first
      );
      
      console.log('Executing user content query with sortOrder...');
      const querySnapshot = await getDocs(q);
      console.log(`Retrieved ${querySnapshot.docs.length} user content items with sortOrder`);
      
      // Log the IDs of the first few items for debugging
      if (querySnapshot.docs.length > 0) {
        const firstItems = querySnapshot.docs.slice(0, 3).map(doc => doc.id);
        console.log(`First few content IDs: ${firstItems.join(', ')}`);
      }
      
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as ContentItem[];
    } catch (sortOrderError) {
      console.log('sortOrder query failed, falling back to createdAt:', sortOrderError);
    }
    
    // Fallback: get content sorted by creation date (for existing content without sortOrder)
    const fallbackQuery = query(
      contentRef, 
      where('userId', '==', userId),
      where('isSample', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    console.log('Executing user content query with createdAt fallback...');
    const fallbackSnapshot = await getDocs(fallbackQuery);
    console.log(`Retrieved ${fallbackSnapshot.docs.length} user content items with createdAt fallback`);
    
    // Log the IDs of the first few items for debugging
    if (fallbackSnapshot.docs.length > 0) {
      const firstItems = fallbackSnapshot.docs.slice(0, 3).map(doc => doc.id);
      console.log(`First few content IDs: ${firstItems.join(', ')}`);
    }
    
    return fallbackSnapshot.docs.map(doc => ({ 
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
    const contentRef = doc(db, CONTENT_COLLECTION, contentId);
    await updateDoc(contentRef, {
      lastViewed: Date.now()
    });
  } catch (error) {
    console.error('Error updating last viewed:', error);
    throw error;
  }
};

// Update sort order for a single content item
export const updateContentSortOrder = async (contentId: string, sortOrder: number): Promise<void> => {
  try {
    const contentRef = doc(db, CONTENT_COLLECTION, contentId);
    await updateDoc(contentRef, {
      sortOrder: sortOrder,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating sort order:', error);
    throw error;
  }
};

// Update sort orders for multiple content items (bulk update)
export const updateContentSortOrders = async (sortOrderUpdates: { id: string; sortOrder: number }[]): Promise<void> => {
  try {
    console.log(`Updating sort orders for ${sortOrderUpdates.length} items`);
    
    // Use batch writes for better performance
    const batch = writeBatch(db);
    
    sortOrderUpdates.forEach(({ id, sortOrder }) => {
      const contentRef = doc(db, CONTENT_COLLECTION, id);
      batch.update(contentRef, {
        sortOrder: sortOrder,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log('Successfully updated sort orders');
  } catch (error) {
    console.error('Error updating sort orders:', error);
    throw error;
  }
};

// Reset sort orders to match creation date order (newest first)
export const resetContentSortOrders = async (userId: string): Promise<void> => {
  try {
    console.log(`Resetting sort orders for user: ${userId}`);
    
    // Get all user content sorted by creation date (newest first)
    const contentRef = collection(db, CONTENT_COLLECTION);
    const q = query(
      contentRef,
      where('userId', '==', userId),
      where('isSample', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const contentItems = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as ContentItem[];
    
    // Create sort order updates (newest items get lower sort order numbers)
    const sortOrderUpdates = contentItems.map((item, index) => ({
      id: item.id,
      sortOrder: index + 1
    }));
    
    // Update all sort orders
    await updateContentSortOrders(sortOrderUpdates);
    console.log(`Reset sort orders for ${contentItems.length} items`);
  } catch (error) {
    console.error('Error resetting sort orders:', error);
    throw error;
  }
};

// Initialize sortOrder for existing content that doesn't have it
export const initializeContentSortOrders = async (userId: string): Promise<void> => {
  try {
    console.log(`Initializing sort orders for user: ${userId}`);
    
    // Get all user content sorted by creation date (newest first)
    const contentRef = collection(db, CONTENT_COLLECTION);
    const q = query(
      contentRef,
      where('userId', '==', userId),
      where('isSample', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const contentItems = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as ContentItem[];
    
    // Filter items that don't have sortOrder yet
    const itemsWithoutSortOrder = contentItems.filter(item => item.sortOrder === undefined);
    
    if (itemsWithoutSortOrder.length === 0) {
      console.log('All content already has sortOrder initialized');
      return;
    }
    
    console.log(`Found ${itemsWithoutSortOrder.length} items without sortOrder, initializing...`);
    
    // Create sort order updates (newest items get lower sort order numbers)
    const sortOrderUpdates = itemsWithoutSortOrder.map((item, index) => ({
      id: item.id,
      sortOrder: Date.now() + index // Use timestamp + index to ensure unique values
    }));
    
    // Update sort orders for items that don't have them
    await updateContentSortOrders(sortOrderUpdates);
    console.log(`Initialized sort orders for ${itemsWithoutSortOrder.length} items`);
  } catch (error) {
    console.error('Error initializing sort orders:', error);
    throw error;
  }
};

// Seed starter content for new users
export const seedUserStarterContent = async (userId: string): Promise<void> => {
  try {
    console.log(`🔥 Starting starter content seeding for user ${userId}`);
    console.log(`🔥 Current timestamp: ${new Date().toISOString()}`);
    
    // First check if the user already has any content
    console.log(`🔥 Checking if user ${userId} already has content...`);
    const userContent = await getUserContent(userId);
    console.log(`🔥 User has ${userContent.length} existing content items`);
    console.log(`🔥 Existing content:`, userContent.map(c => ({ id: c.id, title: c.title })));

    // Skip if user already has content
    if (userContent.length > 0) {
      console.log('🔥 User already has content - skipping starter content seeding');
      return;
    }

    console.log(`🔥 User has no content - proceeding with starter video seeding`);

    // Define starter videos for new users
    const starterVideos = [
      {
        title: 'Stop Casting',
        description: 'Good demo fo what casting the bat is, and how to fix.',
        url: 'https://www.youtube.com/watch?v=4b7AEunZS2Q',
        youtubeId: '4b7AEunZS2Q',
        thumbnailUrl: `https://img.youtube.com/vi/4b7AEunZS2Q/maxresdefault.jpg`,
        category: 'hitting' as const,
        tags: ['fundamentals', 'basics'],
        skillLevel: 'beginner' as const,
        orientation: 'vertical' as const,
        favorite: false,
        userId: userId,
        isSample: false,
        isStarter: true // Mark as starter content
      },
      {
        title: 'Fix Bat Drag', 
        description: 'Simple drill to remove common issue of bat drag.',
        url: 'https://www.youtube.com/watch?v=rw7rZu160E0',
        youtubeId: 'rw7rZu160E0',
        thumbnailUrl: `https://img.youtube.com/vi/rw7rZu160E0/maxresdefault.jpg`,
        category: 'pitching' as const,
        tags: ['swing mechanics'],
        skillLevel: 'beginner' as const,
        orientation: 'landscape' as const,
        favorite: false,
        userId: userId,
        isSample: false,
        isStarter: true // Mark as starter content
      },
      {
        title: 'Create Rhythm',
        description: 'Perfect illustration of right left for mid-level and high-level infielders. Jump to the middle of the video to get to the meat of it.',
        url: 'https://youtu.be/eD5FBGs6jMY?si=ppTX6F8gMfdYXXEx&t=195',
        youtubeId: 'eD5FBGs6jMY',
        thumbnailUrl: `https://img.youtube.com/vi/eD5FBGs6jMY/maxresdefault.jpg`,
        category: 'infield' as const,
        tags: ['rhythm', 'infield', 'high school', 'shortstop'],
        skillLevel: 'highLevel' as const,
        orientation: 'landscape' as const,
        favorite: false,
        userId: userId,
        isSample: false,
        isStarter: true // Mark as starter content
      },
      {
        title: 'Youth Pitching',
        description: 'A longer video on pitching basics.',
        url: 'https://youtu.be/4NOo7JSK6eA?si=vJyDsF4JXbknS1Mm&t=59',
        youtubeId: '4NOo7JSK6eA',
        thumbnailUrl: `https://img.youtube.com/vi/4NOo7JSK6eA/maxresdefault.jpg`,
        category: 'pitching' as const,
        tags: ['8u'],
        skillLevel: 'beginner' as const,
        orientation: 'landscape' as const,
        favorite: false,
        userId: userId,
        isSample: false,
        isStarter: true // Mark as starter content
      }
    ];
    
    console.log(`🔥 About to create ${starterVideos.length} starter videos for user ${userId}`);
    
    // Create starter content for the user
    let successCount = 0;
    for (let i = 0; i < starterVideos.length; i++) {
      const video = starterVideos[i];
      try {
        console.log(`🔥 Creating starter video ${i + 1}/${starterVideos.length}: "${video.title}"`);
        console.log(`🔥 Video data:`, JSON.stringify(video, null, 2));
        
        const contentRef = collection(db, CONTENT_COLLECTION);
        const docRef = await addDoc(contentRef, {
          ...video,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        successCount++;
        console.log(`🔥 ✅ Successfully created starter video ${successCount}/${starterVideos.length} (ID: ${docRef.id}) for user ${userId}`);
      } catch (itemError) {
        console.error(`🔥 ❌ Failed to create starter video "${video.title}" for user ${userId}:`, itemError);
        // Continue with other videos even if one fails
      }
    }
    
    console.log(`🔥 🎉 Successfully seeded ${successCount}/${starterVideos.length} starter videos for user ${userId}`);
    
    if (successCount > 0) {
      console.log(`🔥 🎊 New user ${userId} started with ${successCount} helpful training videos!`);
    } else {
      console.error(`🔥 ⚠️ WARNING: No starter videos were created for user ${userId}`);
    }
  } catch (error) {
    console.error('🔥 💥 Error in seedUserStarterContent:', error);
    console.error('🔥 💥 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      userId
    });
    throw error;
  }
};

// Legacy function - now disabled
export const seedUserSampleContent = async (userId: string): Promise<void> => {
  try {
    console.log(`Legacy sample content seeding called for user ${userId}`);
    console.log('Sample content seeding is disabled - users start with starter videos');
    
    // Redirect to new starter content seeding
    await seedUserStarterContent(userId);
  } catch (error) {
    console.error('Error in seedUserSampleContent:', error);
    throw error;
  }
}; 
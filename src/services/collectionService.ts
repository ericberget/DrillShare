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
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { Collection, CollectionCreationData } from '@/types/content';
import { generateRandomString } from '@/lib/utils';

const COLLECTIONS_COLLECTION = 'collections';

// Create a new collection
export const createCollection = async (
  collectionData: CollectionCreationData
): Promise<string> => {
  try {
    console.log('Creating new collection:', JSON.stringify(collectionData, null, 2));
    console.log('User ID (createdBy):', collectionData.createdBy);
    
    if (!collectionData.createdBy) {
      console.error('No createdBy provided for collection creation!');
      throw new Error('createdBy is required to create collection');
    }
    
    // Generate a unique shareLink
    const shareId = generateRandomString(8);
    
    // Get the base URL with proper fallbacks for production
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    // If no environment variable is set, try to get it from window (client-side only)
    if (!baseUrl && typeof window !== 'undefined') {
      baseUrl = window.location.origin;
    }
    
    // Final fallback to production URL if we're still missing it
    if (!baseUrl || baseUrl.includes('localhost')) {
      baseUrl = 'https://drillshare.netlify.app';
    }
    
    const shareLink = `${baseUrl}/share/collections/${shareId}`;
    console.log('Generated share link:', shareLink);
    
    const collectionRef = collection(db, COLLECTIONS_COLLECTION);
    const newCollectionData = {
      ...collectionData,
      shareLink,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      videos: collectionData.videos || [] // Ensure videos array exists
    };
    
    console.log('Final collection data to save:', JSON.stringify(newCollectionData, null, 2));
    console.log('Saving collection to Firestore...');
    
    const docRef = await addDoc(collectionRef, newCollectionData);
    console.log(`Collection created with ID: ${docRef.id}`);
    
    // Verify the collection was created
    const verifyDoc = await getDoc(docRef);
    if (verifyDoc.exists()) {
      console.log('Verified collection data:', JSON.stringify(verifyDoc.data(), null, 2));
    } else {
      console.error('Collection document does not exist after creation!');
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
};

// Get a collection by ID
export const getCollectionById = async (collectionId: string): Promise<Collection | null> => {
  try {
    console.log(`Getting collection by ID: ${collectionId}`);
    const collectionRef = doc(db, COLLECTIONS_COLLECTION, collectionId);
    const docSnap = await getDoc(collectionRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Collection;
    }
    
    console.log(`Collection with ID ${collectionId} not found`);
    return null;
  } catch (error) {
    console.error(`Error getting collection by ID ${collectionId}:`, error);
    throw error;
  }
};

// Get a collection by share link
export const getCollectionByShareLink = async (shareLink: string): Promise<Collection | null> => {
  try {
    console.log(`Getting collection by share link: ${shareLink}`);
    const collectionsRef = collection(db, COLLECTIONS_COLLECTION);
    const q = query(collectionsRef, where('shareLink', '==', shareLink));
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Collection;
    }
    
    console.log(`Collection with share link ${shareLink} not found`);
    return null;
  } catch (error) {
    console.error(`Error getting collection by share link ${shareLink}:`, error);
    throw error;
  }
};

// Get all collections for a user
export const getUserCollections = async (userId: string): Promise<Collection[]> => {
  try {
    console.log(`Getting collections for user: ${userId}`);
    const collectionsRef = collection(db, COLLECTIONS_COLLECTION);
    console.log('Created collections reference');
    
    const q = query(
      collectionsRef, 
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    console.log('Created query:', JSON.stringify({
      collection: COLLECTIONS_COLLECTION,
      filters: {
        createdBy: userId
      },
      orderBy: 'createdAt desc'
    }, null, 2));
    
    console.log('Executing query...');
    const querySnapshot = await getDocs(q);
    console.log(`Retrieved ${querySnapshot.docs.length} user collections`);
    
    // Log each collection's data
    querySnapshot.docs.forEach((doc, index) => {
      console.log(`Collection ${index + 1}:`, {
        id: doc.id,
        createdBy: doc.data().createdBy,
        name: doc.data().name,
        createdAt: doc.data().createdAt
      });
    });
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Collection[];
  } catch (error: any) {
    console.error('Error getting user collections:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    throw error;
  }
};

// Update a collection
export const updateCollection = async (collection: Collection): Promise<void> => {
  try {
    console.log(`Updating collection: ${collection.id}`);
    const collectionRef = doc(db, COLLECTIONS_COLLECTION, collection.id);
    
    // Remove id from the data to update
    const { id, ...collectionData } = collection;
    
    // Filter out undefined values to avoid Firebase errors
    const cleanedData = Object.fromEntries(
      Object.entries(collectionData).filter(([_, value]) => value !== undefined)
    );
    
    console.log('Cleaned collection data (no undefined values):', cleanedData);
    
    await updateDoc(collectionRef, {
      ...cleanedData,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Collection ${collection.id} updated successfully`);
  } catch (error) {
    console.error(`Error updating collection ${collection.id}:`, error);
    throw error;
  }
};

// Delete a collection
export const deleteCollection = async (collectionId: string): Promise<void> => {
  try {
    console.log(`Deleting collection: ${collectionId}`);
    const collectionRef = doc(db, COLLECTIONS_COLLECTION, collectionId);
    await deleteDoc(collectionRef);
    console.log(`Collection ${collectionId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting collection ${collectionId}:`, error);
    throw error;
  }
}; 
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Collection, CollectionCreationData } from '@/types/content';
import { useFirebase } from './FirebaseContext';
import {
  createCollection,
  getUserCollections,
  getCollectionById,
  updateCollection as updateCollectionService,
  deleteCollection as deleteCollectionService
} from '@/services/collectionService';
import { useToast } from './ToastContext';

// Create the context interface
interface CollectionContextType {
  collections: Collection[];
  isLoading: boolean;
  addCollection: (collection: CollectionCreationData) => Promise<string>;
  updateCollection: (collection: Collection) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  refreshCollections: () => Promise<void>;
}

// Create context with default values
const CollectionContext = createContext<CollectionContextType>({
  collections: [],
  isLoading: true,
  addCollection: async () => '',
  updateCollection: async () => {},
  deleteCollection: async () => {},
  refreshCollections: async () => {}
});

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useFirebase();
  const { showToast, hideToast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load collections when user changes
  useEffect(() => {
    if (user) {
      loadCollections();
    } else {
      setCollections([]);
      setIsLoading(false);
    }
  }, [user]);

  // Function to load collections
  const loadCollections = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      showToast('Loading your collections...', 'loading', 0, true);
      const userCollections = await getUserCollections(user.uid);
      setCollections(userCollections);
      hideToast();
    } catch (error) {
      console.error('Error loading collections:', error);
      showToast('Failed to load collections', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh collections
  const refreshCollections = async () => {
    await loadCollections();
  };

  // Function to add a new collection
  const addCollection = async (collectionData: CollectionCreationData): Promise<string> => {
    try {
      if (!user) throw new Error('You must be logged in to create a collection');
      
      // Make sure createdBy is set to current user
      const newCollectionData = {
        ...collectionData,
        createdBy: user.uid
      };
      
      const collectionId = await createCollection(newCollectionData);
      
      // Refresh collections
      await refreshCollections();
      
      showToast('Collection created successfully', 'success');
      return collectionId;
    } catch (error) {
      console.error('Error adding collection:', error);
      showToast('Failed to create collection', 'error');
      throw error;
    }
  };

  // Function to update a collection
  const updateCollection = async (collection: Collection): Promise<void> => {
    try {
      if (!user) throw new Error('You must be logged in to update a collection');
      
      await updateCollectionService(collection);
      
      // Update the local state
      setCollections(prev => 
        prev.map(item => 
          item.id === collection.id ? collection : item
        )
      );
      
      showToast('Collection updated successfully', 'success');
    } catch (error) {
      console.error('Error updating collection:', error);
      showToast('Failed to update collection', 'error');
      throw error;
    }
  };

  // Function to delete a collection
  const deleteCollection = async (collectionId: string): Promise<void> => {
    try {
      if (!user) throw new Error('You must be logged in to delete a collection');
      
      await deleteCollectionService(collectionId);
      
      // Update the local state
      setCollections(prev => prev.filter(item => item.id !== collectionId));
      
      showToast('Collection deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting collection:', error);
      showToast('Failed to delete collection', 'error');
      throw error;
    }
  };

  return (
    <CollectionContext.Provider value={{
      collections,
      isLoading,
      addCollection,
      updateCollection,
      deleteCollection,
      refreshCollections
    }}>
      {children}
    </CollectionContext.Provider>
  );
}

export const useCollections = () => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionProvider');
  }
  return context;
}; 
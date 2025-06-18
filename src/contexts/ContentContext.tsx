'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ContentItem, ContentCreationData } from '@/types/content';
import { ContentContextType } from '@/types/content';
import { useFirebase } from './FirebaseContext';
import {
  createContent,
  getAllContent,
  getSampleContent,
  getUserContent,
  updateContent as updateContentService,
  deleteContent as deleteContentService,
  toggleContentFavorite,
  updateContentLastViewed,
  updateContentSortOrders,
  resetContentSortOrders,
  initializeContentSortOrders
} from '@/services/contentService';
import { Timestamp } from 'firebase/firestore';
import { useToast } from './ToastContext';

// Create context with default values
const ContentContext = createContext<ContentContextType>({
  contentItems: [],
  userContentItems: [],
  sampleContentItems: [],
  isLoading: true,
  isReordering: false,
  addContent: async () => '',
  updateContent: async () => {},
  deleteContent: async () => {},
  toggleFavorite: async () => {},
  updateLastViewed: async () => {},
  updateSortOrders: async () => {},
  resetSortOrders: async () => {}
});

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useFirebase();
  const { showToast, hideToast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [userContentItems, setUserContentItems] = useState<ContentItem[]>([]);
  const [sampleContentItems, setSampleContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  // Load content when user changes
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        console.log('Starting content loading process');
        
        if (user) {
          // Only show toast for logged in users
          showToast('Loading your content...', 'loading', 0, true);
        }
        
        // DISABLED: Sample content loading is now disabled
        // Always load sample content
        // const sampleContent = await getSampleContent();
        // setSampleContentItems(sampleContent);
        // console.log(`Loaded ${sampleContent.length} sample content items`);
        setSampleContentItems([]);
        
        // If user is logged in, load their content
        if (user) {
          console.log(`Loading content for user ${user.uid}`);
          const userContent = await getUserContent(user.uid);
          setUserContentItems(userContent);
          console.log(`Loaded ${userContent.length} user content items`);
          
          // Initialize sortOrder for existing content that doesn't have it
          if (userContent.length > 0) {
            try {
              await initializeContentSortOrders(user.uid);
              console.log('Initialized sortOrder for existing content');
            } catch (initError) {
              console.log('Could not initialize sortOrder, continuing with existing data:', initError);
            }
          }
          
          // Get all content (just user's content now, no sample content)
          const allContent = await getAllContent(user.uid);
          setContentItems(allContent);
          console.log(`Loaded ${allContent.length} total content items`);
          
          // Hide the loading toast
          hideToast();
        } else {
          // No content for non-logged in users (no sample content)
          setContentItems([]);
          console.log('No user logged in, showing empty content list');
        }
      } catch (error) {
        console.error('Error loading content:', error);
        if (user) {
          showToast('There was an issue loading your content', 'error');
        }
      } finally {
        setIsLoading(false);
        console.log('Content loading complete');
      }
    };

    loadContent();
    
    // Set up content refresh when needed
    const refreshInterval = setInterval(() => {
      // Only refresh if we're not already loading or reordering
      if (!isLoading && !isReordering && user) {
        console.log('Refreshing content in background');
        loadContent();
      }
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [user, showToast, hideToast]);

  // Add new content
  const addContent = async (contentData: ContentCreationData) => {
    if (!user) throw new Error('User must be logged in to add content');
    
    const newContentData = {
      ...contentData,
      userId: user.uid,
      isSample: false
    };
    
    const newContentId = await createContent(newContentData);
    
    // Add the new content to state with generated timestamps
    const newContent: ContentItem = {
      ...newContentData,
      id: newContentId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userId: user.uid // Ensure userId is set to the current user
    };
    
    setUserContentItems(prev => [newContent, ...prev]);
    setContentItems(prev => [newContent, ...prev]);
    
    return newContentId;
  };

  // Update content
  const updateContent = async (content: ContentItem) => {
    if (!user) throw new Error('User must be logged in to update content');
    if (content.userId !== user.uid && !content.isSample) {
      throw new Error('You can only update your own content');
    }
    
    await updateContentService(content.id, content);
    
    // Update state
    const updatedUserContent = userContentItems.map(item => 
      item.id === content.id ? { ...content, updatedAt: Timestamp.now() } : item
    );
    
    setUserContentItems(updatedUserContent);
    setContentItems([...updatedUserContent, ...sampleContentItems]);
  };

  // Delete content
  const deleteContent = async (contentId: string) => {
    if (!user) throw new Error('User must be logged in to delete content');
    
    const contentToDelete = userContentItems.find(item => item.id === contentId);
    if (!contentToDelete) throw new Error('Content not found');
    
    if (contentToDelete.userId !== user.uid) {
      throw new Error('You can only delete your own content');
    }
    
    await deleteContentService(contentId);
    
    // Update state
    const filteredUserContent = userContentItems.filter(item => item.id !== contentId);
    setUserContentItems(filteredUserContent);
    setContentItems([...filteredUserContent, ...sampleContentItems]);
  };

  // Toggle favorite status
  const toggleFavorite = async (contentId: string) => {
    if (!user) throw new Error('User must be logged in to favorite content');
    
    const contentItem = contentItems.find(item => item.id === contentId);
    if (!contentItem) throw new Error('Content not found');
    
    const currentFavorite = contentItem.favorite || false;
    await toggleContentFavorite(contentId, currentFavorite);
    
    // Update state
    const updatedItems = contentItems.map(item => 
      item.id === contentId ? { ...item, favorite: !currentFavorite } : item
    );
    
    const updatedUserItems = userContentItems.map(item => 
      item.id === contentId ? { ...item, favorite: !currentFavorite } : item
    );
    
    const updatedSampleItems = sampleContentItems.map(item => 
      item.id === contentId ? { ...item, favorite: !currentFavorite } : item
    );
    
    setContentItems(updatedItems);
    setUserContentItems(updatedUserItems);
    setSampleContentItems(updatedSampleItems);
  };

  // Update last viewed
  const updateLastViewed = async (contentId: string) => {
    if (!user) return; // Only track for logged in users
    
    const now = Date.now();
    await updateContentLastViewed(contentId);
    
    // Update state
    const updatedItems = contentItems.map(item => 
      item.id === contentId ? { ...item, lastViewed: now } : item
    );
    
    const updatedUserItems = userContentItems.map(item => 
      item.id === contentId ? { ...item, lastViewed: now } : item
    );
    
    const updatedSampleItems = sampleContentItems.map(item => 
      item.id === contentId ? { ...item, lastViewed: now } : item
    );
    
    setContentItems(updatedItems);
    setUserContentItems(updatedUserItems);
    setSampleContentItems(updatedSampleItems);
  };

  // Update sort orders for multiple content items
  const updateSortOrders = async (sortOrderUpdates: { id: string; sortOrder: number }[]) => {
    if (!user) throw new Error('User must be logged in to update sort orders');
    setIsReordering(true);
    await updateContentSortOrders(sortOrderUpdates);
    // Update state with new sort orders
    const updatedItems = contentItems.map(item => {
      const update = sortOrderUpdates.find(u => u.id === item.id);
      return update ? { ...item, sortOrder: update.sortOrder } : item;
    });
    const updatedUserItems = userContentItems.map(item => {
      const update = sortOrderUpdates.find(u => u.id === item.id);
      return update ? { ...item, sortOrder: update.sortOrder } : item;
    });
    // Sort by sortOrder
    const sortedItems = updatedItems.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const sortedUserItems = updatedUserItems.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    setContentItems(sortedItems);
    setUserContentItems(sortedUserItems);
    setIsReordering(false);
  };

  // Reset sort orders to match creation date order
  const resetSortOrders = async () => {
    if (!user) throw new Error('User must be logged in to reset sort orders');
    
    await resetContentSortOrders(user.uid);
    
    // Reload content to get the updated sort orders
    const userContent = await getUserContent(user.uid);
    const allContent = await getAllContent(user.uid);
    
    setUserContentItems(userContent);
    setContentItems(allContent);
  };

  return (
    <ContentContext.Provider
      value={{
        contentItems,
        userContentItems,
        sampleContentItems,
        isLoading,
        isReordering,
        addContent,
        updateContent,
        deleteContent,
        toggleFavorite,
        updateLastViewed,
        updateSortOrders,
        resetSortOrders
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}; 
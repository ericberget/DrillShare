'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ContentItem, ContentContextType, ContentCreationData } from '@/types/content';
import { useFirebase } from './FirebaseContext';
import {
  createContent,
  getAllContent,
  getSampleContent,
  getUserContent,
  updateContent as updateContentService,
  deleteContent as deleteContentService,
  toggleContentFavorite,
  updateContentLastViewed
} from '@/services/contentService';
import { Timestamp } from 'firebase/firestore';
import { useToast } from './ToastContext';

// Create context with default values
const ContentContext = createContext<ContentContextType>({
  contentItems: [],
  userContentItems: [],
  sampleContentItems: [],
  isLoading: true,
  addContent: async () => '',
  updateContent: async () => {},
  deleteContent: async () => {},
  toggleFavorite: async () => {},
  updateLastViewed: async () => {}
});

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useFirebase();
  const { showToast, hideToast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [userContentItems, setUserContentItems] = useState<ContentItem[]>([]);
  const [sampleContentItems, setSampleContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        
        // Always load sample content
        const sampleContent = await getSampleContent();
        setSampleContentItems(sampleContent);
        console.log(`Loaded ${sampleContent.length} sample content items`);
        
        // If user is logged in, load their content
        if (user) {
          console.log(`Loading content for user ${user.uid}`);
          const userContent = await getUserContent(user.uid);
          setUserContentItems(userContent);
          console.log(`Loaded ${userContent.length} user content items`);
          
          // Get all content (user's content + sample content)
          const allContent = await getAllContent(user.uid);
          setContentItems(allContent);
          console.log(`Loaded ${allContent.length} total content items`);
          
          // Hide the loading toast
          hideToast();
        } else {
          // Just show sample content for non-logged in users
          setContentItems(sampleContent);
          console.log('No user logged in, only showing sample content');
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
      // Only refresh if we're not already loading
      if (!isLoading && user) {
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

  return (
    <ContentContext.Provider
      value={{
        contentItems,
        userContentItems,
        sampleContentItems,
        isLoading,
        addContent,
        updateContent,
        deleteContent,
        toggleFavorite,
        updateLastViewed
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
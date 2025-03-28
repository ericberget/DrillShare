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
import { PlayerAnalysisVideo } from '@/types/content';

const PLAYER_ANALYSIS_COLLECTION = 'playerAnalysis';

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Create a new player analysis video
export const createPlayerAnalysis = async (
  analysisData: Omit<PlayerAnalysisVideo, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    console.log('Creating new player analysis:', JSON.stringify(analysisData, null, 2));
    
    if (!analysisData.userId) {
      console.error('No userId provided for player analysis creation!');
      throw new Error('userId is required to create player analysis');
    }

    // Validate video type and URL
    if (analysisData.videoType === 'youtube') {
      const videoId = extractYouTubeId(analysisData.videoUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      analysisData.youtubeVideoId = videoId;
      // Generate thumbnail URL from YouTube video ID
      analysisData.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } else if (analysisData.videoType === 'upload') {
      if (!analysisData.fileSize || !analysisData.fileName) {
        throw new Error('File information is required for uploaded videos');
      }
    }
    
    const analysisRef = collection(db, PLAYER_ANALYSIS_COLLECTION);
    const newAnalysisData = {
      ...analysisData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('Saving player analysis to Firestore...');
    const docRef = await addDoc(analysisRef, newAnalysisData);
    console.log(`Player analysis created with ID: ${docRef.id}`);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating player analysis:', error);
    throw error;
  }
};

// Get all player analysis videos for a user
export const getUserPlayerAnalysis = async (userId: string): Promise<PlayerAnalysisVideo[]> => {
  try {
    console.log(`Getting player analysis videos for user: ${userId}`);
    const analysisRef = collection(db, PLAYER_ANALYSIS_COLLECTION);
    
    const q = query(
      analysisRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Retrieved ${querySnapshot.docs.length} player analysis videos`);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as PlayerAnalysisVideo[];
  } catch (error) {
    console.error('Error getting user player analysis videos:', error);
    throw error;
  }
};

// Get a player analysis video by ID
export const getPlayerAnalysisById = async (analysisId: string): Promise<PlayerAnalysisVideo | null> => {
  try {
    console.log(`Getting player analysis by ID: ${analysisId}`);
    const analysisRef = doc(db, PLAYER_ANALYSIS_COLLECTION, analysisId);
    const docSnap = await getDoc(analysisRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PlayerAnalysisVideo;
    }
    
    console.log(`Player analysis with ID ${analysisId} not found`);
    return null;
  } catch (error) {
    console.error(`Error getting player analysis by ID ${analysisId}:`, error);
    throw error;
  }
};

// Update a player analysis video
export const updatePlayerAnalysis = async (analysis: PlayerAnalysisVideo): Promise<void> => {
  try {
    console.log(`Updating player analysis: ${analysis.id}`);
    const analysisRef = doc(db, PLAYER_ANALYSIS_COLLECTION, analysis.id);
    
    // Remove id from the data to update
    const { id, ...analysisData } = analysis;
    
    await updateDoc(analysisRef, {
      ...analysisData,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Player analysis ${analysis.id} updated successfully`);
  } catch (error) {
    console.error(`Error updating player analysis ${analysis.id}:`, error);
    throw error;
  }
};

// Delete a player analysis video
export const deletePlayerAnalysis = async (analysisId: string): Promise<void> => {
  try {
    console.log(`Deleting player analysis: ${analysisId}`);
    const analysisRef = doc(db, PLAYER_ANALYSIS_COLLECTION, analysisId);
    await deleteDoc(analysisRef);
    console.log(`Player analysis ${analysisId} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting player analysis ${analysisId}:`, error);
    throw error;
  }
}; 
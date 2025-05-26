'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PlayerAnalysisVideo } from '@/types/content';
import { useFirebase } from './FirebaseContext';
import {
  createPlayerAnalysis,
  getUserPlayerAnalysis,
  getPlayerAnalysisById,
  updatePlayerAnalysis as updatePlayerAnalysisService,
  deletePlayerAnalysis as deletePlayerAnalysisService
} from '@/services/playerAnalysisService';
import { useToast } from './ToastContext';

// Create the context interface
interface PlayerAnalysisContextType {
  analyses: PlayerAnalysisVideo[];
  isLoading: boolean;
  addAnalysis: (analysis: Omit<PlayerAnalysisVideo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateAnalysis: (analysis: PlayerAnalysisVideo) => Promise<void>;
  deleteAnalysis: (analysisId: string) => Promise<void>;
  refreshAnalyses: () => Promise<void>;
}

// Create context with default values
const PlayerAnalysisContext = createContext<PlayerAnalysisContextType>({
  analyses: [],
  isLoading: true,
  addAnalysis: async () => '',
  updateAnalysis: async () => {},
  deleteAnalysis: async () => {},
  refreshAnalyses: async () => {}
});

export function PlayerAnalysisProvider({ children }: { children: React.ReactNode }) {
  const { user } = useFirebase();
  const { showToast, hideToast } = useToast();
  const [analyses, setAnalyses] = useState<PlayerAnalysisVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load analyses when user changes
  useEffect(() => {
    if (user) {
      loadAnalyses();
    } else {
      setAnalyses([]);
      setIsLoading(false);
    }
  }, [user]);

  // Function to load analyses
  const loadAnalyses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      showToast('Loading your player analyses...', 'loading', 0, true);
      const userAnalyses = await getUserPlayerAnalysis(user.uid);
      setAnalyses(userAnalyses);
      hideToast();
    } catch (error) {
      console.error('Error loading player analyses:', error);
      showToast('Failed to load player analyses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh analyses
  const refreshAnalyses = async () => {
    await loadAnalyses();
  };

  // Function to add a new analysis
  const addAnalysis = async (analysis: Omit<PlayerAnalysisVideo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User must be authenticated to add analysis');
    
    try {
      showToast('Creating player analysis...', 'loading', 0, true);
      const analysisId = await createPlayerAnalysis({
        ...analysis,
        userId: user.uid
      });
      await loadAnalyses();
      hideToast();
      showToast('Player analysis created successfully', 'success');
      return analysisId;
    } catch (error) {
      console.error('Error creating player analysis:', error);
      showToast('Failed to create player analysis', 'error');
      throw error;
    }
  };

  // Function to update an analysis
  const updateAnalysis = async (analysis: PlayerAnalysisVideo) => {
    try {
      showToast('Updating player analysis...', 'loading', 0, true);
      await updatePlayerAnalysisService(analysis);
      await loadAnalyses();
      hideToast();
      showToast('Player analysis updated successfully', 'success');
    } catch (error) {
      console.error('Error updating player analysis:', error);
      showToast('Failed to update player analysis', 'error');
      throw error;
    }
  };

  // Function to delete an analysis
  const deleteAnalysis = async (analysisId: string) => {
    try {
      showToast('Deleting player analysis...', 'loading', 0, true);
      await deletePlayerAnalysisService(analysisId);
      await loadAnalyses();
      hideToast();
      showToast('Player analysis deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting player analysis:', error);
      showToast('Failed to delete player analysis', 'error');
      throw error;
    }
  };

  return (
    <PlayerAnalysisContext.Provider
      value={{
        analyses,
        isLoading,
        addAnalysis,
        updateAnalysis,
        deleteAnalysis,
        refreshAnalyses
      }}
    >
      {children}
    </PlayerAnalysisContext.Provider>
  );
}

export const usePlayerAnalysis = () => {
  const context = useContext(PlayerAnalysisContext);
  if (!context) {
    throw new Error('usePlayerAnalysis must be used within a PlayerAnalysisProvider');
  }
  return context;
}; 
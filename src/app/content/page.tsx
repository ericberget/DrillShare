'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContentGrid } from '@/components/ContentGrid';
import { ContentUploader } from '@/components/ContentUploader';
import { ContentDetails } from '@/components/ContentDetails';
import { useContent } from '@/contexts/ContentContext';
import { ContentItem } from '@/types/content';
import { useFirebase } from '@/contexts/FirebaseContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TestFirebaseButton } from '@/components/TestFirebaseButton';
import { Button } from '@/components/ui/button';

// Separate component for search params handling
function ContentPageInner() {
  const { user } = useFirebase();
  const [showUploader, setShowUploader] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  const searchParams = useSearchParams();

  // Check for action=upload in URL params
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'upload') {
      setShowUploader(true);
    }
  }, [searchParams]);

  const handleAddContent = () => {
    setSelectedContent(null);
    setEditMode(false);
    setShowUploader(true);
  };

  const handleCloseUploader = () => {
    setShowUploader(false);
    setEditMode(false);
  };

  const handleSelectContent = (content: ContentItem) => {
    setSelectedContent(content);
    setEditMode(false);
  };

  const handleCloseDetails = () => {
    setSelectedContent(null);
  };

  const handleEditContent = (content: ContentItem) => {
    setSelectedContent(content);
    setEditMode(true);
    setShowUploader(true);
  };

  const handleContentDelete = () => {
    setShowUploader(false);
    setEditMode(false);
    setSelectedContent(null);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 flex flex-col items-center">
          <div className="w-full max-w-[600px] sm:max-w-[600px] mx-auto mb-6 px-4 sm:px-0">
            <img 
              src="/logo.png" 
              alt="DrillHub Logo" 
              className="w-full h-auto"
            />
          </div>
          <p className="text-slate-400 text-center max-w-2xl">Browse and manage your baseball technique videos collection</p>
        </div>
        
        <ContentGrid 
          onAddContent={handleAddContent}
          onSelectContent={handleSelectContent}
          onEditContent={handleEditContent}
        />
        
        {showUploader && (
          <ContentUploader 
            isOpen={showUploader}
            onClose={handleCloseUploader}
            onDelete={handleContentDelete}
            existingContent={editMode && selectedContent ? selectedContent : undefined}
          />
        )}
        
        {selectedContent && !editMode && !showUploader && (
          <ContentDetails 
            content={selectedContent}
            onClose={handleCloseDetails}
            onEdit={user?.uid === selectedContent.userId && !selectedContent.isSample ? handleEditContent : undefined}
          />
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function ContentPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <ContentPageInner />
      </Suspense>
    </ProtectedRoute>
  );
} 
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
    <div className="min-h-screen bg-[#0D1529]">
      <header
        className="w-full border-b border-slate-800/30 flex items-center justify-center py-8 animate-fade-in-down"
        style={{
          backgroundImage: "url('/bgtexture.jpg')",
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
          minHeight: '100px',
        }}
      >
        <img 
          src="/videolibraryTitle.png" 
          alt="Video Library" 
          className="h-14 md:h-16 lg:h-20 xl:h-24 mb-0 mx-auto"
        />
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 flex flex-col items-center">
          {/* <p className="text-slate-400 text-center max-w-2xl">Browse and manage your baseball technique videos collection</p> */}
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
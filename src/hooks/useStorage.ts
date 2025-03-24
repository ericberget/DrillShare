'use client';

import { useState } from 'react';

export interface UploadProgress {
  progress: number;
  url: string | null;
  error: Error | null;
}

export function useStorage() {
  const [uploadState, setUploadState] = useState<UploadProgress>({
    progress: 0,
    url: null,
    error: null
  });

  const uploadFile = async (file: File, path: string) => {
    if (!file) return;

    console.log('Starting upload to API route for path:', path);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      
      // Set initial progress
      setUploadState({ progress: 10, url: null, error: null });
      
      // Simulate upload progress (since fetch doesn't provide progress events)
      const progressInterval = setInterval(() => {
        setUploadState(prev => {
          // Only update if not complete and not errored
          if (prev.progress < 90 && !prev.error) {
            return { ...prev, progress: prev.progress + 10 };
          }
          return prev;
        });
      }, 300);
      
      // Send the file to our API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      console.log('Upload complete! Got download URL:', data.url);
      
      // Update state with complete status
      setUploadState({ progress: 100, url: data.url, error: null });
      
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadState({ progress: 0, url: null, error: error as Error });
      throw error;
    }
  };

  return {
    uploadFile,
    ...uploadState
  };
} 
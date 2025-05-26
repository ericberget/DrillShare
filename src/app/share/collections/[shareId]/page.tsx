'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getCollectionByShareLink } from '@/services/collectionService';
import { Collection, ContentItem } from '@/types/content';
import { formatTimestamp } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Lock, Video } from 'lucide-react';
import { ContentDetails } from '@/components/ContentDetails';
import { useContent } from '@/contexts/ContentContext';
import Image from 'next/image';

export default function SharedCollectionPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/share/collections/${shareId}` : '';

  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  
  const { contentItems, isLoading: isContentLoading, updateLastViewed } = useContent();
  
  // Fetch the collection on component mount
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setIsLoading(true);
        const collection = await getCollectionByShareLink(shareLink);
        
        if (!collection) {
          setError('Collection not found');
          return;
        }
        
        // Check if password is required
        if (collection.hasPassword) {
          setIsPasswordRequired(true);
          // Don't set the collection yet, wait for password
        } else {
          setCollection(collection);
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        setError('Failed to load collection');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (shareLink) {
      fetchCollection();
    }
  }, [shareLink]);
  
  // Handle password submission
  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      setPasswordError('Please enter the password');
      return;
    }
    
    setPasswordError(null);
    
    // Verify password
    getCollectionByShareLink(shareLink).then(collection => {
      if (collection && collection.password === password) {
        setCollection(collection);
        setIsPasswordRequired(false);
      } else {
        setPasswordError('Incorrect password');
      }
    });
  };
  
  // Get content items for this collection
  const getCollectionContentItems = (): ContentItem[] => {
    if (!collection) return [];
    return contentItems.filter(item => collection.videos.includes(item.id));
  };
  
  // Handle content selection
  const handleContentSelection = (content: ContentItem) => {
    updateLastViewed(content.id);
    setSelectedContent(content);
  };
  
  // Handle content details close
  const handleCloseDetails = () => {
    setSelectedContent(null);
  };
  
  // Check if collection has expired
  const isCollectionExpired = (): boolean => {
    if (!collection || !collection.expirationDate) return false;
    
    const now = new Date();
    const expirationDate = collection.expirationDate.toDate();
    return now > expirationDate;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="DrillHub Logo"
            width={300}
            height={300}
            className="w-full h-auto max-w-[300px]"
          />
        </div>
        <div className="bg-slate-800/80 p-8 rounded-xl border border-slate-700 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    );
  }
  
  if (isPasswordRequired) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="DrillHub Logo"
            width={300}
            height={300}
            className="w-full h-auto max-w-[300px]"
          />
        </div>
        <div className="bg-slate-800/80 p-8 rounded-xl border border-slate-700 max-w-md w-full">
          <div className="flex justify-center mb-4">
            <div className="bg-amber-500/20 rounded-full p-3">
              <Lock className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white text-center mb-4">Password Protected Collection</h2>
          <p className="text-slate-400 text-center mb-6">This collection is password protected. Please enter the password to view it.</p>
          
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>
            
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handlePasswordSubmit}
            >
              Access Collection
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (isCollectionExpired()) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="DrillHub Logo"
            width={300}
            height={300}
            className="w-full h-auto max-w-[300px]"
          />
        </div>
        <div className="bg-slate-800/80 p-8 rounded-xl border border-slate-700 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Collection Expired</h2>
          <p className="text-slate-400 mb-6">This collection is no longer available as it has expired.</p>
          <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    );
  }
  
  if (!collection) return null;
  
  const collectionVideos = getCollectionContentItems();
  
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:24px_24px]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col items-center">
          <div className="max-w-[350px] mb-6">
            <Image
              src="/logo.png"
              alt="DrillHub Logo"
              width={350}
              height={350}
              className="w-full h-auto"
            />
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-8 max-w-4xl w-full shadow-2xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-4 text-center">{collection.name}</h1>
            
            {collection.description && (
              <div className="mb-6 p-4 bg-slate-100 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap">{collection.description}</p>
              </div>
            )}
            
            <div className="text-sm text-slate-500 text-center mb-8">
              Shared on {formatTimestamp(collection.createdAt)}
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-emerald-800 mb-4">Share This Collection</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-emerald-200 rounded-lg py-3 px-4 text-slate-700 font-mono text-sm">
                    {shareLink}
                  </div>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      // You might want to add a copied state here
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
                <p className="text-emerald-700 text-sm">
                  Share this link with your team, players, or parents. Anyone with this link can view the collection without signing in.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isContentLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                </div>
              ) : collectionVideos.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 inline-block">
                    <p className="text-slate-700 mb-2">No videos found in this collection.</p>
                    <p className="text-sm text-slate-500">Videos added to this collection will appear here.</p>
                  </div>
                </div>
              ) : (
                collectionVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => handleContentSelection(video)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 mb-1">{video.title}</h3>
                        <p className="text-sm text-slate-500">Added {formatTimestamp(video.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {selectedContent && (
        <ContentDetails 
          content={selectedContent} 
          onClose={handleCloseDetails} 
        />
      )}
    </div>
  );
} 
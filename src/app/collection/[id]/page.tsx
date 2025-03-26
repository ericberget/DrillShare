'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Collection, ContentItem } from '@/types/content';
import { useContent } from '@/contexts/ContentContext';
import { useCollections } from '@/contexts/CollectionContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { formatTimestamp } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentDetails } from '@/components/ContentDetails';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, Copy, Edit, Loader2, Share, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionId = params.id as string;
  const router = useRouter();
  
  const { user } = useFirebase();
  const { collections, isLoading: isCollectionsLoading, updateCollection, deleteCollection } = useCollections();
  const { contentItems, isLoading: isContentLoading, updateLastViewed } = useContent();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Find the collection when collections load
  useEffect(() => {
    if (!isCollectionsLoading && collections.length > 0) {
      const found = collections.find(c => c.id === collectionId);
      setCollection(found || null);
    }
  }, [collectionId, collections, isCollectionsLoading]);
  
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
  
  // Handle delete collection
  const handleDeleteCollection = async () => {
    if (!collection) return;
    
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await deleteCollection(collection.id);
        router.push('/collections');
      } catch (error) {
        console.error('Error deleting collection:', error);
      }
    }
  };
  
  // Handle copy share link
  const handleCopyShareLink = () => {
    if (!collection) return;
    
    navigator.clipboard.writeText(collection.shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };
  
  if (isCollectionsLoading || isContentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!collection) {
    return (
      <ProtectedRoute>
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
            <h2 className="text-xl font-semibold text-white mb-2">Collection Not Found</h2>
            <p className="text-slate-400 mb-6">The collection you're looking for doesn't exist or you don't have access to it.</p>
            <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link href="/collections">Return to Collections</Link>
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }
  
  const collectionVideos = getCollectionContentItems();
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button variant="ghost" className="text-slate-400 mr-2" asChild>
              <Link href="/collections">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-white">{collection.name}</h1>
          </div>
          
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl mb-8">
            <div className="p-6">
              {collection.description ? (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Description / Notes</h3>
                  <div className="p-3 bg-slate-700/30 rounded-md">
                    <p className="text-slate-300 whitespace-pre-wrap">{collection.description}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic mb-4">No description provided</p>
              )}
              
              <div className="flex items-center text-xs text-slate-400 mb-4">
                <div>Created: {formatTimestamp(collection.createdAt)}</div>
                <div className="mx-2">•</div>
                <div>
                  {collection.hasPassword ? 'Password protected' : 'Public access'}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-slate-600 text-slate-300"
                  onClick={handleCopyShareLink}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copiedLink ? 'Copied!' : 'Copy Share Link'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-emerald-600/40 text-emerald-400"
                  asChild
                >
                  <Link href={`/collections?edit=${collection.id}`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Collection
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 border-red-600/40 text-red-400"
                  onClick={handleDeleteCollection}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Videos in this Collection</h2>
            
            {collectionVideos.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/40 border border-slate-700 rounded-xl">
                <p className="text-slate-400 mb-4">This collection doesn't have any videos yet.</p>
                <Button asChild>
                  <Link href={`/collections?edit=${collection.id}`}>
                    Add Videos
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collectionVideos.map(video => (
                  <Card 
                    key={video.id} 
                    className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/70 cursor-pointer transition-all duration-300 h-full flex flex-col"
                    onClick={() => handleContentSelection(video)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg leading-tight">{video.title}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {video.category} • {video.skillLevel}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {video.description && (
                        <p className="text-sm text-slate-300 line-clamp-3">{video.description}</p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2 border-t border-slate-700">
                      <div className="flex items-center text-emerald-400 text-sm">
                        <Video className="w-3 h-3 mr-1" />
                        Watch Video
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-8 bg-slate-800/40 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Share This Collection</h3>
            <div className="mb-4">
              <p className="text-slate-300 mb-2">Share link:</p>
              <div className="flex items-center">
                <div className="bg-slate-900 border border-slate-700 rounded-md py-2 px-3 flex-1 text-slate-300 overflow-hidden overflow-ellipsis">
                  {collection.shareLink}
                </div>
                <Button 
                  className="ml-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleCopyShareLink}
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-slate-400">
              <p>Share this link with your team, players, or parents. {collection.hasPassword ? 'They will need the password to access the content.' : 'Anyone with this link can view the collection without signing in.'}</p>
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
    </ProtectedRoute>
  );
} 
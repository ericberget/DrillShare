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
import { ArrowLeft, Copy, Edit, Loader2, Share, Trash2, Video, Play, ExternalLink, Clock, Tag } from 'lucide-react';
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

  // Get YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
    } catch (e) {
      console.error('Invalid URL:', e);
    }
    return null;
  };
  
  if (isCollectionsLoading || isContentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-16 h-16 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
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
              alt="DrillShare Logo"
              width={300}
              height={300}
              className="w-full h-auto max-w-[300px]"
            />
          </div>
          <div className="bg-slate-800/80 p-8 rounded-xl border border-slate-700 max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Collection Not Found</h2>
            <p className="text-slate-400 mb-6">The collection you're looking for doesn't exist or you don't have access to it.</p>
            <Button className="bg-slate-600 hover:bg-slate-700" asChild>
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
      <div className="min-h-screen bg-[#0D1529]">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button variant="ghost" className="text-slate-400 mr-4" asChild>
                <Link href="/collections">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Collections
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
                <p className="text-slate-400 mt-1">
                  {collectionVideos.length} video{collectionVideos.length !== 1 ? 's' : ''} • Created {formatTimestamp(collection.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-600 text-slate-800 hover:bg-slate-700 hover:text-white"
                onClick={handleCopyShareLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copiedLink ? 'Copied!' : 'Share Collection'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-600 text-slate-800 hover:bg-slate-700 hover:text-white"
                asChild
              >
                <Link href={`/collections?edit=${collection.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Collection Info */}
          {collection.description && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{collection.description}</p>
            </div>
          )}
          
          {/* Videos Grid */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Videos in this Collection</h2>
            
            {collectionVideos.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="mb-4">
                  <div className="mx-auto bg-slate-700/50 rounded-full w-16 h-16 flex items-center justify-center">
                    <Video className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Videos Yet</h3>
                <p className="text-slate-400 mb-6">This collection doesn't have any videos yet.</p>
                <Button asChild className="bg-slate-600 hover:bg-slate-700">
                  <Link href={`/collections?edit=${collection.id}`}>
                    Add Videos to Collection
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collectionVideos.map(video => {
                  const youtubeId = getYouTubeVideoId(video.url);
                  const thumbnailUrl = video.thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/0.jpg` : null);
                  
                  return (
                    <Card 
                      key={video.id} 
                      className="bg-slate-800/50 border-slate-700/50 hover:border-slate-500/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                      onClick={() => handleContentSelection(video)}
                    >
                      <div className="relative aspect-video bg-slate-700/50 rounded-t-lg overflow-hidden">
                        {thumbnailUrl ? (
                          <img 
                            src={thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-12 h-12 text-slate-500" />
                          </div>
                        )}
                        
                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-slate-900 ml-1" />
                          </div>
                        </div>
                        
                        {/* Skill level badge */}
                        <div className="absolute top-2 right-2">
                          <span className="bg-slate-900/80 text-slate-200 text-xs px-2 py-1 rounded-full">
                            {video.skillLevel === 'beginner' ? 'Beginner' :
                             video.skillLevel === 'littleLeague' ? 'Little League' : 'High Level'}
                          </span>
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-slate-200 transition-colors">
                          {video.title}
                        </h3>
                        
                        {video.description && (
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        
                        {/* Tags */}
                        {video.tags && video.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {video.tags.slice(0, 3).map(tag => (
                              <span 
                                key={tag}
                                className="bg-slate-700/50 text-slate-300 text-xs px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {video.tags.length > 3 && (
                              <span className="text-xs text-slate-500">
                                +{video.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {video.lastViewed ? `Viewed ${new Date(video.lastViewed).toLocaleDateString()}` : 'Not viewed'}
                          </div>
                          {video.favorite && (
                            <div className="text-yellow-400">★</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Collection Actions */}
          <div className="flex justify-center gap-4 pt-8 border-t border-slate-700/50">
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              asChild
            >
              <Link href={`/collections?edit=${collection.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Collection
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-red-600/40 text-red-400 hover:bg-red-950/20"
              onClick={handleDeleteCollection}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Collection
            </Button>
          </div>
        </div>
      </div>

      {/* Content Details Modal */}
      {selectedContent && (
        <ContentDetails
          content={selectedContent}
          onClose={handleCloseDetails}
        />
      )}
    </ProtectedRoute>
  );
} 
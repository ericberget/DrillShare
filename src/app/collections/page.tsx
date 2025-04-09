'use client';

import React, { useState } from 'react';
import { useCollections } from '@/contexts/CollectionContext';
import { Collection, ContentItem } from '@/types/content';
import { useContent } from '@/contexts/ContentContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatTimestamp } from '@/lib/utils';
import { Plus, Copy, Trash2, Edit, ExternalLink, Calendar, Lock, Unlock, Video } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CollectionsPage() {
  const { user } = useFirebase();
  const { collections, isLoading, addCollection, updateCollection, deleteCollection } = useCollections();
  const { contentItems } = useContent();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  // Function to copy share link to clipboard
  const copyShareLink = (shareLink: string, collectionId: string) => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(collectionId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Get the content items for a collection
  const getCollectionContentItems = (collectionId: string): ContentItem[] => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return [];
    
    return contentItems.filter(item => collection.videos.includes(item.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 bg-[linear-gradient(to_right,rgb(15_23_42_/_0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgb(15_23_42_/_0.2)_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-10 flex flex-col items-center">
            <div className="w-[600px] mb-6">
              <img 
                src="/logo.png" 
                alt="DrillHub Logo" 
                className="w-full h-auto"
              />
            </div>
            <p className="text-slate-400 text-center max-w-2xl">Create and share collections of baseball drills</p>
          </div>
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">My Collections</h1>
            <Button
              onClick={() => {
                setCurrentCollection(null);
                setIsCreateDialogOpen(true);
              }}
              className="bg-white text-emerald-600 hover:bg-gray-50 border-2 border-emerald-600"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Collection
            </Button>
          </div>
          
          {collections.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4">
                <div className="mx-auto bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Collections Yet</h3>
              <p className="text-slate-400 mb-6">Create your first collection to share with your team or players</p>
              <Button
                onClick={() => {
                  setCurrentCollection(null);
                  setIsCreateDialogOpen(true);
                }}
                className="bg-white text-emerald-600 hover:bg-gray-50 border-2 border-emerald-600"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Collection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map(collection => {
                const contentItems = getCollectionContentItems(collection.id);
                
                return (
                  <Card key={collection.id} className="bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/30 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="text-white flex justify-between items-center">
                        <div className="truncate flex-1">{collection.name}</div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-white"
                            onClick={() => {
                              setCurrentCollection(collection);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this collection?')) {
                                deleteCollection(collection.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatTimestamp(collection.createdAt)}
                          </div>
                          <div className="h-3 w-[1px] bg-slate-600"></div>
                          <div className="flex items-center">
                            {collection.hasPassword ? (
                              <Lock className="h-3 w-3 mr-1 text-amber-400" />
                            ) : (
                              <Unlock className="h-3 w-3 mr-1 text-emerald-400" />
                            )}
                            {collection.hasPassword ? 'Password protected' : 'Public'}
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-slate-300">
                      <div className="mb-4">
                        {collection.description ? (
                          <p className="text-sm text-slate-300">{collection.description}</p>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No description</p>
                        )}
                      </div>
                      
                      <div className="text-sm mb-3 font-semibold flex items-center">
                        <div className="bg-emerald-700/30 h-6 px-2 rounded-md flex items-center">
                          {contentItems.length} video{contentItems.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      {contentItems.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <div className="grid grid-cols-3 gap-1">
                            {contentItems.slice(0, 3).map(item => {
                              // Get YouTube thumbnail or use custom thumbnail
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

                              const youtubeId = getYouTubeVideoId(item.url);
                              const thumbnailUrl = item.thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/0.jpg` : null);

                              return (
                                <div key={item.id} className="relative aspect-video bg-slate-800 rounded overflow-hidden group">
                                  {thumbnailUrl ? (
                                    <img 
                                      src={thumbnailUrl}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                      <Video className="w-6 h-6 text-slate-400" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="text-xs text-white p-1 text-center">
                                      {item.title}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {contentItems.length > 3 && (
                            <div className="text-xs text-slate-500 text-center mt-2">
                              +{contentItems.length - 3} more videos
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <Link href={`/collection/${collection.id}`} passHref className="text-blue-400 text-sm flex items-center hover:text-blue-300">
                        <ExternalLink className="h-3 w-3 mr-1" /> Open
                      </Link>
                      <Button 
                        variant="ghost" 
                        className={`text-sm h-8 flex items-center ${copiedLink === collection.id ? 'text-blue-400' : 'text-slate-400'}`}
                        onClick={() => copyShareLink(collection.shareLink, collection.id)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {copiedLink === collection.id ? 'Copied!' : 'Copy share link'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Create Collection Dialog */}
          <CollectionDialog 
            isOpen={isCreateDialogOpen} 
            onClose={() => setIsCreateDialogOpen(false)}
            onSave={addCollection}
            contentItems={contentItems}
            isEdit={false}
          />
          
          {/* Edit Collection Dialog */}
          {currentCollection && (
            <CollectionDialog 
              isOpen={isEditDialogOpen} 
              onClose={() => setIsEditDialogOpen(false)}
              onSave={async (formData) => {
                if (currentCollection) {
                  await updateCollection({
                    ...currentCollection,
                    name: formData.name,
                    description: formData.description,
                    videos: formData.videos,
                    hasPassword: formData.hasPassword,
                    password: formData.password,
                    expirationDate: formData.expirationDate
                  });
                }
              }}
              contentItems={contentItems}
              isEdit={true}
              initialData={currentCollection}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Collection Dialog Component
interface CollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<any>;
  contentItems: ContentItem[];
  isEdit: boolean;
  initialData?: Collection;
}

interface FormData {
  name: string;
  description: string;
  videos: string[];
  hasPassword: boolean;
  password?: string;
  expirationDate?: Date;
}

function CollectionDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  contentItems, 
  isEdit, 
  initialData 
}: CollectionDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    videos: initialData?.videos || [],
    hasPassword: initialData?.hasPassword || false,
    password: initialData?.password || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<ContentItem[]>(
    contentItems.filter(item => formData.videos.includes(item.id))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  
  // Filter content items based on search term
  const filteredContentItems = contentItems.filter(item => 
    !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Please enter a name for the collection');
      return;
    }
    
    if (formData.videos.length === 0) {
      alert('Please select at least one video for the collection');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving collection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle video selection
  const toggleVideoSelection = (contentItem: ContentItem) => {
    const isSelected = formData.videos.includes(contentItem.id);
    
    if (isSelected) {
      // Remove video
      setFormData({
        ...formData,
        videos: formData.videos.filter(id => id !== contentItem.id)
      });
      setSelectedVideos(selectedVideos.filter(item => item.id !== contentItem.id));
    } else {
      // Add video
      setFormData({
        ...formData,
        videos: [...formData.videos, contentItem.id]
      });
      setSelectedVideos([...selectedVideos, contentItem]);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-slate-900/95 backdrop-blur-md border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-400">
            {isEdit ? 'Edit Collection' : 'Create New Collection'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Collection Name</Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter collection name"
                className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Description / Notes</Label>
              <Textarea 
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add notes or instructions for this collection..."
                className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300">Videos</Label>
              
              {selectedVideos.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-md p-6 text-center">
                  <p className="text-slate-400 mb-4">No videos selected</p>
                  <Button
                    variant="outline" 
                    className="bg-white text-emerald-600 hover:bg-gray-50 border-2 border-emerald-600"
                    onClick={() => setShowVideoSelector(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Select Videos
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">{selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''} selected</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 bg-white text-emerald-600 hover:bg-gray-50 border-2 border-emerald-600"
                      onClick={() => setShowVideoSelector(true)}
                    >
                      <Edit className="mr-1 h-3 w-3" /> Edit Selection
                    </Button>
                  </div>
                  
                  <div className="bg-slate-800 border border-slate-700 rounded-md p-3 max-h-[200px] overflow-y-auto">
                    <div className="space-y-2">
                      {selectedVideos.map(video => (
                        <div key={video.id} className="flex justify-between items-center bg-slate-700/40 rounded px-3 py-2">
                          <span className="text-sm text-slate-200 truncate">{video.title}</span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-red-500"
                            onClick={() => toggleVideoSelection(video)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasPassword"
                  checked={formData.hasPassword}
                  onChange={e => setFormData(prev => ({ ...prev, hasPassword: e.target.checked }))}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500"
                />
                <Label htmlFor="hasPassword" className="text-slate-300">Password Protection</Label>
              </div>
              
              {formData.hasPassword && (
                <div className="pl-6 space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-white text-emerald-600 hover:bg-gray-50 border-2 border-emerald-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Collection' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* Video Selector Dialog */}
      <Dialog open={showVideoSelector} onOpenChange={setShowVideoSelector}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col bg-slate-900/95 backdrop-blur-md border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-emerald-400">
              Select Videos for Collection
            </DialogTitle>
          </DialogHeader>
          
          <div className="mb-4">
            <Input 
              placeholder="Search videos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredContentItems.map(item => {
                const isSelected = formData.videos.includes(item.id);
                
                return (
                  <div 
                    key={item.id} 
                    className={`cursor-pointer p-3 rounded-md ${
                      isSelected 
                        ? 'bg-emerald-900/30 border border-emerald-600' 
                        : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => toggleVideoSelection(item)}
                  >
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="mt-1 rounded border-slate-600 text-emerald-500"
                      />
                      <div>
                        <h4 className="text-sm font-medium text-slate-200">{item.title}</h4>
                        <p className="text-xs text-slate-400">{item.category} • {item.skillLevel}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredContentItems.length === 0 && (
                <div className="col-span-3 text-center py-8 text-slate-400">
                  No videos found. Try adjusting your search.
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
            <div className="text-sm text-slate-400">
              {formData.videos.length} video{formData.videos.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowVideoSelector(false)} 
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => setShowVideoSelector(false)} 
                className="bg-white text-emerald-600 hover:bg-gray-50 border-2 border-emerald-600"
              >
                Confirm Selection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
} 
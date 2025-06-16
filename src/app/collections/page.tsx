'use client';

import React, { useState, useEffect } from 'react';
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
import { Timestamp } from 'firebase/firestore';

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
        <div className="w-16 h-16 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950">
        <header
          className="w-full border-b border-slate-800/30 flex items-center justify-center"
          style={{
            backgroundImage: "url('/bgtexture.jpg')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            backgroundPosition: "center",
            minHeight: '180px',
          }}
        >
          <img 
            src="/collectionsTitle.png" 
            alt="Collections" 
            className="h-12 md:h-16 lg:h-20 xl:h-24 mb-0"
            style={{ marginTop: 0 }}
          />
        </header>
        <div className="container mx-auto px-4 py-8">
          {/* Collections Grid */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">My Collections</h2>
            <Button
              onClick={() => {
                setCurrentCollection(null);
                setIsCreateDialogOpen(true);
              }}
              className="bg-slate-600 hover:bg-slate-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Collection
            </Button>
          </div>
          
          {collections.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <div className="mx-auto bg-slate-800/50 rounded-full w-20 h-20 flex items-center justify-center">
                  <Plus className="h-10 w-10 text-slate-400" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Create Your First Collection</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Start organizing your training videos into collections that you can easily share with your team, 
                league, or coaching staff.
              </p>
              <Button
                onClick={() => {
                  setCurrentCollection(null);
                  setIsCreateDialogOpen(true);
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" /> Create Your First Collection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map(collection => {
                const contentItems = getCollectionContentItems(collection.id);
                
                return (
                  <Card key={collection.id} className="bg-slate-800/50 border-slate-700/50 hover:border-slate-500/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader>
                      <CardTitle className="text-white flex justify-between items-start">
                        <div className="truncate flex-1 pr-2">{collection.name}</div>
                        <div className="flex space-x-1 flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-600/80"
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
                            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-red-600/80"
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
                        <div className="flex items-center space-x-2 text-xs mb-2">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatTimestamp(collection.createdAt)}
                          </div>
                          <div className="h-3 w-[1px] bg-slate-600"></div>
                          <div className="flex items-center">
                            {collection.hasPassword ? (
                              <Lock className="h-3 w-3 mr-1 text-amber-400" />
                            ) : (
                              <Unlock className="h-3 w-3 mr-1 text-green-400" />
                            )}
                            {collection.hasPassword ? 'Private' : 'Public'}
                          </div>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-slate-300">
                      <div className="mb-4">
                        {collection.description ? (
                          <p className="text-sm text-slate-300 line-clamp-3">{collection.description}</p>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No description</p>
                        )}
                      </div>
                      
                      <div className="text-sm mb-4 font-semibold flex items-center">
                        <div className="bg-slate-600/30 h-6 px-3 rounded-full flex items-center text-slate-300">
                          <Video className="w-3 h-3 mr-1" />
                          {contentItems.length} video{contentItems.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      {contentItems.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <div className="grid grid-cols-3 gap-2">
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
                                <div key={item.id} className="relative aspect-video bg-slate-700/50 rounded overflow-hidden group">
                                  {thumbnailUrl ? (
                                    <img 
                                      src={thumbnailUrl}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Video className="w-4 h-4 text-slate-500" />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </div>
                              );
                            })}
                          </div>
                          {contentItems.length > 3 && (
                            <p className="text-xs text-slate-500 text-center">
                              +{contentItems.length - 3} more video{contentItems.length - 3 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex gap-2 w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-slate-600 text-slate-800 hover:bg-slate-600 hover:text-white hover:border-slate-500"
                          asChild
                        >
                          <Link href={`/collection/${collection.id}`}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-slate-600 text-slate-800 hover:bg-slate-600 hover:text-white hover:border-slate-500"
                          onClick={() => copyShareLink(collection.shareLink, collection.id)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {copiedLink === collection.id ? 'Copied!' : 'Share'}
                        </Button>
                      </div>
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
            onSave={async (formData) => {
              try {
                console.log('Creating collection with data:', formData);
                await addCollection(formData);
                setIsCreateDialogOpen(false);
              } catch (error) {
                console.error('Error creating collection:', error);
                throw error; // Re-throw to let the dialog handle the error
              }
            }}
            contentItems={contentItems}
            isEdit={false}
          />
          
          {/* Edit Collection Dialog */}
          {currentCollection && (
            <CollectionDialog 
              isOpen={isEditDialogOpen} 
              onClose={() => {
                setIsEditDialogOpen(false);
                setCurrentCollection(null);
              }}
              onSave={async (formData) => {
                try {
                  console.log('=== EDIT COLLECTION SAVE START ===');
                  console.log('Current collection:', currentCollection);
                  console.log('Form data received:', formData);
                  
                  if (currentCollection) {
                    const updatedCollection = {
                      ...currentCollection,
                      name: formData.name,
                      description: formData.description,
                      videos: formData.videos,
                      hasPassword: formData.hasPassword,
                      password: formData.password,
                      // Only include expirationDate if it's not undefined
                      ...(formData.expirationDate && { expirationDate: formData.expirationDate })
                    };
                    
                    console.log('Updated collection object:', updatedCollection);
                    console.log('Calling updateCollection...');
                    
                    await updateCollection(updatedCollection);
                    
                    console.log('updateCollection completed successfully');
                    setIsEditDialogOpen(false);
                    setCurrentCollection(null);
                    console.log('=== EDIT COLLECTION SAVE SUCCESS ===');
                  } else {
                    console.error('No currentCollection found!');
                  }
                } catch (error: any) {
                  console.error('=== EDIT COLLECTION SAVE ERROR ===');
                  console.error('Error updating collection:', error);
                  console.error('Error stack:', error?.stack);
                  throw error; // Re-throw to let the dialog handle the error
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
  expirationDate?: Timestamp;
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
    name: '',
    description: '',
    videos: [],
    hasPassword: false,
    password: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Reset form data when dialog opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      const newFormData = {
        name: initialData?.name || '',
        description: initialData?.description || '',
        videos: initialData?.videos || [],
        hasPassword: initialData?.hasPassword || false,
        password: initialData?.password || ''
      };
      
      setFormData(newFormData);
      
      // Update selected videos based on the form data
      const newSelectedVideos = contentItems.filter(item => 
        newFormData.videos.includes(item.id)
      );
      setSelectedVideos(newSelectedVideos);
      
      // Reset other states
      setSearchTerm('');
      setShowVideoSelector(false);
      setIsSubmitting(false);
      setSelectedTag('all');
    }
  }, [isOpen, initialData, contentItems]);

  // Get all unique tags from content items
  const getAllTags = () => {
    const tagsSet = new Set<string>();
    contentItems.forEach(item => {
      item.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  };

  // Get YouTube video ID for thumbnail generation
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
      if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1];
      }
    } catch (e) {
      console.error('Invalid URL:', e);
    }
    return null;
  };
  
  // Filter content items based on search term and tag
  const filteredContentItems = contentItems.filter(item => {
    const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });
  
  // Handle form submission
  const handleSubmit = async () => {
    console.log('=== DIALOG SUBMIT START ===');
    console.log('Form data:', formData);
    console.log('Is edit mode:', isEdit);
    console.log('Initial data:', initialData);
    
    if (!formData.name.trim()) {
      console.log('Validation failed: No name');
      alert('Please enter a name for the collection');
      return;
    }
    
    if (formData.videos.length === 0) {
      console.log('Validation failed: No videos');
      alert('Please select at least one video for the collection');
      return;
    }
    
    console.log('Validation passed, setting submitting state...');
    setIsSubmitting(true);
    
    try {
      console.log('Calling onSave with form data:', formData);
      await onSave(formData);
      console.log('onSave completed, calling onClose...');
      onClose();
      console.log('=== DIALOG SUBMIT SUCCESS ===');
    } catch (error: any) {
      console.error('=== DIALOG SUBMIT ERROR ===');
      console.error('Error saving collection:', error);
      console.error('Error details:', error?.message);
      alert('Failed to save collection. Please try again.');
    } finally {
      console.log('Setting submitting state to false...');
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
          <DialogTitle className="text-xl font-bold text-slate-400">
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
                    className="bg-slate-600 hover:bg-slate-700 text-white border-slate-500"
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
                      className="h-8 bg-slate-600 hover:bg-slate-700 text-white border-slate-500"
                      onClick={() => setShowVideoSelector(true)}
                    >
                      <Edit className="mr-1 h-3 w-3" /> Edit Selection
                    </Button>
                  </div>
                  
                  <div className="bg-slate-800 border border-slate-700 rounded-md p-3 max-h-[200px] overflow-y-auto">
                    <div className="space-y-2">
                      {selectedVideos.map(video => {
                        const youtubeId = getYouTubeVideoId(video.url);
                        const thumbnailUrl = video.thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/0.jpg` : null);
                        
                        return (
                          <div key={video.id} className="flex items-center gap-3 bg-slate-700/40 rounded px-3 py-2">
                            <div className="w-12 h-8 bg-slate-600 rounded overflow-hidden flex-shrink-0">
                              {thumbnailUrl ? (
                                <img 
                                  src={thumbnailUrl}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Video className="w-3 h-3 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-slate-200 truncate flex-1">{video.title}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-500 flex-shrink-0"
                              onClick={() => toggleVideoSelection(video)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
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
              className="bg-slate-600 hover:bg-slate-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Collection' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* Video Selector Dialog */}
      <Dialog open={showVideoSelector} onOpenChange={setShowVideoSelector}>
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col bg-slate-900/95 backdrop-blur-md border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-400">
              Select Videos for Collection
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input 
                placeholder="Search videos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
              />
            </div>
            <div className="w-48">
              <select
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
                className="w-full h-10 px-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="all">All Tags</option>
                {getAllTags().map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContentItems.map(item => {
                const isSelected = formData.videos.includes(item.id);
                const youtubeId = getYouTubeVideoId(item.url);
                const thumbnailUrl = item.thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/0.jpg` : null);
                
                return (
                  <div 
                    key={item.id} 
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                      isSelected 
                        ? 'bg-slate-700/50 border-2 border-slate-500 shadow-lg' 
                        : 'bg-slate-800 border border-slate-700 hover:border-slate-600 hover:shadow-md'
                    }`}
                    onClick={() => toggleVideoSelection(item)}
                  >
                    <div className="relative aspect-video bg-slate-700">
                      {thumbnailUrl ? (
                        <img 
                          src={thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-slate-500" />
                        </div>
                      )}
                      
                      {/* Selection overlay */}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 rounded border-slate-600 text-slate-500 bg-slate-800/80"
                        />
                      </div>
                      
                      {/* Selected overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-slate-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-slate-200 mb-1 line-clamp-2">{item.title}</h4>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{item.category} • {item.skillLevel}</span>
                        {item.tags.length > 0 && (
                          <div className="flex gap-1">
                            {item.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="bg-slate-700 px-1.5 py-0.5 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 2 && (
                              <span className="text-slate-500">+{item.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredContentItems.length === 0 && (
                <div className="col-span-3 text-center py-12 text-slate-400">
                  <Video className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p className="text-lg mb-2">No videos found</p>
                  <p className="text-sm">Try adjusting your search or tag filter.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
            <div className="text-sm text-slate-400">
              {formData.videos.length} video{formData.videos.length !== 1 ? 's' : ''} selected
              {selectedTag !== 'all' && (
                <span className="ml-2 text-slate-500">• Filtered by: {selectedTag}</span>
              )}
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
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                Confirm Selection ({formData.videos.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
} 
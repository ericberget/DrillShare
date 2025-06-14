'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowRight, Filter, Search, X, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function DemoPage() {
  // DEMO: Three YouTube videos for demo mode
  const sampleVideos = {
    hitting: [
      {
        id: 'default-1',
        title: 'How to Hit a Baseball',
        url: 'https://www.youtube.com/watch?v=YY9tErIBVQw',
        category: 'hitting',
        skillLevel: 'beginner',
        teachingCue: 'Good start to finish basics of hitting for a beginner player. Line up your knuckles. Load. Stride. etc. All the main components of a fundamental swing.',
        tags: ['tball', 'coach pitch']
      }
    ],
    pitching: [
      {
        id: 'default-2',
        title: '3 Velocity Tips/Drills',
        url: 'https://www.youtube.com/watch?v=mh5oBfiu6PA',
        category: 'pitching',
        skillLevel: 'highLevel',
        teachingCue: 'Good video for high school level kids (maybe younger) looking to increase velocity.',
        tags: ['12u', 'high school', 'velocity']
      }
    ],
    infield: [
      {
        id: 'default-3',
        title: 'Create Rhythm',
        url: 'https://youtu.be/eD5FBGs6jMY?si=ppTX6F8gMfdYXXEx&t',
        category: 'infield',
        skillLevel: 'littleLeague',
        teachingCue: 'Perfect illustration of right left for mid-level and high-level infielders.\nJump to the middle of the video to get to the meat of it.',
        tags: ['12u']
      }
    ],
    catching: [],
    other: []
  };

  // Demo state
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSignupOverlay, setShowSignupOverlay] = useState(false);
  const [filterInteractions, setFilterInteractions] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Demo videos state
  const [demoVideos, setDemoVideos] = useState<any[]>([]);
  
  // Form state for adding videos
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    tags: [] as string[],
    newTag: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Animation state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [animatingTab, setAnimatingTab] = useState<string | null>(null);

  // Load demo videos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('drillshare-demo-videos');
    if (saved) {
      try {
        setDemoVideos(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading demo videos:', e);
      }
    }
  }, []);

  // Save demo videos to localStorage when they change
  useEffect(() => {
    if (demoVideos.length > 0) {
      localStorage.setItem('drillshare-demo-videos', JSON.stringify(demoVideos));
    }
  }, [demoVideos]);

  // Handle initial load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      if (urlObj.pathname.includes('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1];
      }
    } catch (e) {
      console.error('Invalid URL:', e);
    }
    return null;
  };

  // Generate auto thumbnail from URL
  const generateThumbnailUrl = (url: string): string | null => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/0.jpg`;
    }
    return null;
  };

  // Handle tab change with animation
  const handleTabChange = (newTab: string) => {
    if (newTab !== activeTab) {
      setAnimatingTab(newTab);
      setTimeout(() => {
        setActiveTab(newTab);
        setAnimatingTab(null);
      }, 150);
    }
  };

  // Track filter interactions
  const handleFilterInteraction = () => {
    const newCount = filterInteractions + 1;
    setFilterInteractions(newCount);
    
    if (newCount >= 3 && !showSignupOverlay) {
      setTimeout(() => setShowSignupOverlay(true), 1000);
    }
  };

  // Get all videos (sample + demo)
  const getAllVideos = () => {
    const allSampleVideos = Object.values(sampleVideos).flat();
    return [...allSampleVideos, ...demoVideos];
  };

  // Get videos by category
  const getVideosByCategory = (category: string) => {
    if (category === 'all') {
      return getAllVideos();
    }
    const sampleCategoryVideos = sampleVideos[category as keyof typeof sampleVideos] || [];
    const demoCategoryVideos = demoVideos.filter(video => video.category === category);
    return [...sampleCategoryVideos, ...demoCategoryVideos];
  };

  // Get all unique tags and skill levels for filters
  const getAllTags = () => {
    const tags = new Set();
    getAllVideos().forEach(video => {
      video.tags?.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags);
  };

  // Filter videos based on current filters
  const getFilteredVideos = (categoryVideos: any[]) => {
    return categoryVideos.filter((video: any) => {
      const matchesTag = selectedTag === 'all' || video.tags?.includes(selectedTag);
      const matchesFavorites = !showFavoritesOnly || video.favorite === true;
      return matchesTag && matchesFavorites;
    });
  };

  // Handle closing modal
  const handleClose = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      category: '',
      tags: [],
      newTag: ''
    });
    setFormError('');
    setShowAddModal(false);
  };

  // Handle form submission
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    // Validation
    if (!formData.title.trim()) {
      setFormError('Title is required');
      setIsSubmitting(false);
      return;
    }
    if (!formData.url.trim()) {
      setFormError('URL is required');
      setIsSubmitting(false);
      return;
    }
    if (!formData.category) {
      setFormError('Category is required');
      setIsSubmitting(false);
      return;
    }

    // Validate URL format
    const videoId = getYouTubeVideoId(formData.url);
    if (!videoId) {
      setFormError('Please enter a valid YouTube URL');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create new video object
      const newVideo = {
        id: `demo-user-${Date.now()}`,
        title: formData.title.trim(),
        url: formData.url.trim(),
        category: formData.category,
        skillLevel: 'Little League', // Default for demo
        teachingCue: formData.description.trim() || 'User-added demo video',
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        favorite: false,
        isUserAdded: true
      };

      // Add to demo videos
      setDemoVideos(prev => [...prev, newVideo]);

      // Reset form and close modal
      handleClose();
      
      // Show success message (optional)
      setTimeout(() => {
        alert('Video added to demo! Sign up to save permanently and share with your team.');
      }, 500);

    } catch (error) {
      setFormError('Failed to add video. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding tags
  const handleAddTag = () => {
    const tag = formData.newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        newTag: ''
      }));
    }
  };

  // Handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Stable input handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, url: e.target.value }));
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };
  
  const handleNewTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, newTag: e.target.value }));
  };

  // Toggle favorite status
  const toggleFavorite = (videoId: string) => {
    setDemoVideos(prev => prev.map(v =>
      v.id === videoId ? { ...v, favorite: !v.favorite } : v
    ));
  };

  // Video card component
  const VideoCard = ({ video, index }: { video: any; index: number }) => {
    const youtubeId = getYouTubeVideoId(video.url);
    const animationDelay = isInitialLoad ? `${index * 100 + 200}ms` : `${index * 50}ms`;
    
    return (
      <Card 
        className={`bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 cursor-pointer transition-all duration-200 hover:border-slate-600/50 hover:scale-105 hover:shadow-xl ${
          isInitialLoad ? 'animate-fade-in opacity-0' : animatingTab ? 'animate-fade-out' : 'animate-fade-in'
        } ${video.isUserAdded ? 'ring-1 ring-blue-500/30' : ''}`}
        style={{ 
          animationDelay: animationDelay,
          animationFillMode: 'forwards'
        }}
        onClick={() => setSelectedVideo(video)}
      >
        <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
          <div className="aspect-video bg-slate-700 rounded-lg mb-2 md:mb-3 flex items-center justify-center relative overflow-hidden">
            {youtubeId ? (
              <img 
                src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800"></div>
            )}
            {/* Favorite Star Button - bottom right */}
            <button
              onClick={e => { e.stopPropagation(); toggleFavorite(video.id); }}
              className="absolute bottom-2 right-2 z-10 bg-black/40 rounded-full p-1 hover:bg-yellow-400/20 transition"
              title={video.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              {video.favorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#facc15" viewBox="0 0 24 24"><path d="M12 17.75l-6.172 3.245 1.179-6.873-5-4.873 6.9-1.002L12 2.25l3.093 6.997 6.9 1.002-5 4.873 1.179 6.873z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#facc15" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17.75l-6.172 3.245 1.179-6.873-5-4.873 6.9-1.002L12 2.25l3.093 6.997 6.9 1.002-5 4.873 1.179 6.873z"/></svg>
              )}
            </button>
            {video.isUserAdded && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-blue-600 text-white text-xs">Your Video</Badge>
              </div>
            )}
          </div>
          <CardTitle className="text-base md:text-lg text-slate-100 line-clamp-2">{video.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-3 md:p-6">
          <p className="text-slate-400 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">{video.teachingCue}</p>
          <div className="flex gap-1 flex-wrap">
            {video.tags?.filter((tag: string) => 
              tag !== 'Little League' && tag !== 'Advanced' && tag !== 'Intermediate' && tag !== 'High Level'
            ).slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-slate-700 text-slate-300 transition-colors duration-200 hover:bg-slate-600">
                {tag}
              </Badge>
            ))}
            {video.tags && video.tags.filter((tag: string) => 
              tag !== 'Little League' && tag !== 'Advanced' && tag !== 'Intermediate' && tag !== 'High Level'
            ).length > 3 && (
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 transition-colors duration-200 hover:bg-slate-600">
                +{video.tags.filter((tag: string) => 
                  tag !== 'Little League' && tag !== 'Advanced' && tag !== 'Intermediate' && tag !== 'High Level'
                ).length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Add Video Modal (Demo version with full form)
  const AddVideoModal = () => {
    return (
      <Dialog open={showAddModal} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-4xl bg-slate-900/95 backdrop-blur-md border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-400">
              Add Video to Demo
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a video to your demo collection. This will be saved locally in your browser.
            </DialogDescription>
          </DialogHeader>
          
          <form 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo-title" className="text-slate-300">Title</Label>
                <Input 
                  id="demo-title"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Enter video title"
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  required
                  autoComplete="off"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="demo-url" className="text-slate-300">Video URL</Label>
                <Input 
                  id="demo-url"
                  name="url"
                  value={formData.url}
                  onChange={handleUrlChange}
                  placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-slate-400">Supports YouTube videos and YouTube Shorts</p>
                
                {/* Show video type information */}
                {formData.url && getYouTubeVideoId(formData.url) && (
                  <div className="mt-1">
                    <Badge className="bg-slate-700 text-slate-300">
                      YouTube Video Detected
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="demo-description" className="text-slate-300">Description / Teaching Notes</Label>
                <Textarea 
                  id="demo-description"
                  name="description"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Enter teaching notes or description for this video"
                  className="bg-slate-800 border-slate-700 min-h-24 text-slate-200 placeholder:text-slate-500"
                  autoComplete="off"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="demo-category" className="text-slate-300">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="demo-category" className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectItem value="hitting">Hitting</SelectItem>
                    <SelectItem value="pitching">Pitching</SelectItem>
                    <SelectItem value="infield">Infield</SelectItem>
                    <SelectItem value="catching">Catching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Video Preview</Label>
                <div className="mt-2">
                  {formData.url && getYouTubeVideoId(formData.url) ? (
                    <div className="w-full aspect-video bg-slate-800 border border-slate-700 rounded-md overflow-hidden">
                      <img 
                        src={generateThumbnailUrl(formData.url) || ''} 
                        alt="Video thumbnail" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iOTAiIGZpbGw9IiM2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VmlkZW8gUHJldmlldyBOb3QgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-slate-800 border border-slate-700 rounded-md flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🎥</div>
                        <div className="text-sm text-slate-400">Enter a YouTube URL to see preview</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Tags</Label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.newTag}
                    onChange={handleNewTagChange}
                    placeholder="Add a tag"
                    className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                    autoComplete="off"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    onClick={handleAddTag}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-slate-700 text-slate-300 hover:bg-slate-600"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-red-400"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-400">Add tags to help categorize and find your videos</p>
              </div>
              
              {formError && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded-md">
                  <p className="text-red-300 text-sm">{formError}</p>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-700">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => handleClose()}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                disabled={isSubmitting}
                onClick={handleAddVideo}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? 'Adding...' : 'Add to Demo'}
              </Button>
            </div>
          </form>
          
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-md">
            <p className="text-blue-300 text-sm">
              <strong>Demo Mode:</strong> Videos are saved locally in your browser. Sign up to save permanently and share with your team!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Signup Overlay
  const SignupOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-lg p-6 md:p-8 text-center border border-slate-500/20">
        <div className="mb-4 md:mb-6">
          <div className="w-12 md:w-16 h-12 md:h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Image src="/logo-small.png" alt="DrillShare" width={40} height={40} className="w-8 md:w-10 h-8 md:h-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-400 mb-2">Like what you see?</h2>
          <p className="text-slate-300 text-sm md:text-base">Sign up free to create your own library and unlock all features</p>
        </div>
        
        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-300 text-sm md:text-base">Save unlimited videos</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-300 text-sm md:text-base">Custom tags and categories</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-300 text-sm md:text-base">Share with your team</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/auth/signup" className="flex-1">
            <Button className="w-full bg-slate-600 hover:bg-slate-700 text-sm md:text-base">
              Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => setShowSignupOverlay(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm md:text-base"
          >
            Keep Exploring Demo
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className={`mb-8 md:mb-12 text-center ${isInitialLoad ? 'animate-fade-in opacity-0' : ''}`} style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
          <div className="w-full max-w-[300px] md:max-w-[400px] mx-auto mb-4 md:mb-6">
            <Image
              src="/logo.png"
              alt="DrillShare Logo"
              width={400}
              height={400}
              className="w-full h-auto"
            />
          </div>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-6 md:mb-8 text-sm md:text-base px-4">Browse and manage your baseball technique videos collection</p>
          
          {/* Sign Up Button */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-slate-500/20 text-slate-400 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium">
              DEMO MODE
            </div>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-200 hover:scale-105 text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className={`mb-6 md:mb-8 ${isInitialLoad ? 'animate-fade-in opacity-0' : ''}`} style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-between">
            {/* Demo Mode Badge and Add Content Button */}
            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto justify-center sm:justify-end">
              <Button onClick={() => setShowAddModal(true)} className="bg-slate-600 hover:bg-slate-700 transition-all duration-200 hover:scale-105 text-sm md:text-base px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto">
                + Add Content
              </Button>
            </div>
          </div>
        </div>

        {/* Category Selection - Mobile Dropdown / Desktop Tabs */}
        <div className="w-full">
          {/* Mobile Dropdown */}
          <div className={`md:hidden mb-6 ${isInitialLoad ? 'animate-fade-in opacity-0' : ''}`} style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
            <Select value={activeTab} onValueChange={handleTabChange}>
              <SelectTrigger className="w-full bg-slate-800 border-slate-700 transition-all duration-200 hover:border-slate-600 text-sm">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <img src="/baseball.png" alt="Baseball" className="w-4 h-4 opacity-80" />
                    All
                  </div>
                </SelectItem>
                <SelectItem value="hitting">
                  <div className="flex items-center gap-2">
                    <img src="/baseball.png" alt="Baseball" className="w-4 h-4 opacity-80" />
                    Hitting
                  </div>
                </SelectItem>
                <SelectItem value="infield">
                  <div className="flex items-center gap-2">
                    <img src="/baseball.png" alt="Baseball" className="w-4 h-4 opacity-80" />
                    Infield
                  </div>
                </SelectItem>
                <SelectItem value="pitching">
                  <div className="flex items-center gap-2">
                    <img src="/baseball.png" alt="Baseball" className="w-4 h-4 opacity-80" />
                    Pitching
                  </div>
                </SelectItem>
                <SelectItem value="catching">
                  <div className="flex items-center gap-2">
                    <img src="/baseball.png" alt="Baseball" className="w-4 h-4 opacity-80" />
                    Catching
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className={`hidden md:flex w-full justify-center gap-4 mb-8 ${isInitialLoad ? 'animate-fade-in opacity-0' : ''}`} style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
              <TabsTrigger 
                value="all" 
                className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:scale-105"
              >
                <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
                All
              </TabsTrigger>
              <TabsTrigger 
                value="hitting" 
                className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:scale-105"
              >
                <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
                Hitting
              </TabsTrigger>
              <TabsTrigger 
                value="infield" 
                className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:scale-105"
              >
                <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
                Infield
              </TabsTrigger>
              <TabsTrigger 
                value="pitching" 
                className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:scale-105"
              >
                <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
                Pitching
              </TabsTrigger>
              <TabsTrigger 
                value="catching" 
                className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:scale-105"
              >
                <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
                Catching
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mt-8 md:mt-12">
          {/* All Videos Tab */}
          <div className={animatingTab === 'all' ? 'animate-fade-out' : 'animate-fade-in'} style={{ display: activeTab === 'all' ? 'block' : 'none' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {getAllVideos().length > 0 ? (
                getFilteredVideos(getAllVideos()).map((video: any, index: number) => (
                  <VideoCard key={video.id} video={video} index={index} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 md:py-12 text-slate-400">
                  <p className="mb-4 text-sm md:text-base">No videos available.</p>
                  <p className="text-xs md:text-sm">Sign up to start adding your own content!</p>
                </div>
              )}
            </div>
          </div>

          {/* Individual Category Tabs */}
          {Object.keys(sampleVideos).map((category) => (
            <div key={category} className={animatingTab === category ? 'animate-fade-out' : 'animate-fade-in'} style={{ display: activeTab === category ? 'block' : 'none' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {getFilteredVideos(getVideosByCategory(category)).length > 0 ? (
                  getFilteredVideos(getVideosByCategory(category)).map((video: any, index: number) => (
                    <VideoCard key={video.id} video={video} index={index} />
                  ))
                ) : getVideosByCategory(category).length === 0 ? (
                  <div className="col-span-full text-center py-8 md:py-12 text-slate-400 animate-fade-in">
                    <p className="mb-4 text-sm md:text-base">No sample videos in this category yet.</p>
                    <p className="text-xs md:text-sm">Sign up to start adding your own content!</p>
                  </div>
                ) : (
                  <div className="col-span-full text-center py-8 md:py-12 text-slate-400 animate-fade-in">
                    <p className="text-sm md:text-base">No videos match your current filters.</p>
                    <Button
                      variant="outline"
                      className="mt-4 border-slate-600 text-slate-300 transition-all duration-200 hover:scale-105 text-sm md:text-base"
                      onClick={() => {
                        setSelectedTag('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Details Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-40">
          <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-3 md:p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-slate-400 pr-4 line-clamp-2">{selectedVideo.title}</h2>
              <Button variant="ghost" onClick={() => setSelectedVideo(null)} className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 md:p-6">
              <div className="aspect-video bg-slate-700 mb-3 md:mb-4 flex flex-col items-center justify-center p-2 md:p-4 rounded">
                {getYouTubeVideoId(selectedVideo.url) ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.url)}`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded"
                  ></iframe>
                ) : (
                  <div className="text-center">
                    <p className="mb-3 md:mb-4 text-slate-300 text-sm md:text-base">Preview not available</p>
                    <a 
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 md:px-6 py-2 md:py-3 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors text-sm md:text-base"
                    >
                      Open Video
                    </a>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-slate-300 text-sm md:text-base">Teaching Notes:</h3>
                  <p className="text-slate-300 text-sm md:text-base">{selectedVideo.teachingCue}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-slate-300 text-sm md:text-base">Skill Level:</h3>
                  <Badge className="bg-slate-700 text-slate-300 text-xs md:text-sm">{selectedVideo.skillLevel}</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-slate-300 text-sm md:text-base">Tags:</h3>
                  <div className="flex gap-1 md:gap-2 flex-wrap">
                    {selectedVideo.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-700 text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddVideoModal />}
      {showSignupOverlay && <SignupOverlay />}
    </div>
  );
} 
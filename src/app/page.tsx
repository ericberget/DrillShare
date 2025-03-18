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
import type { Video, VideosByCategory, VideoCategory, SkillLevel, VideoOrientation } from '@/types/video';
import ReactPlayer from 'react-player';

// Add Facebook SDK type declarations at the top of the file
declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string;
        xfbml: boolean;
        version: string;
      }) => void;
      XFBML: {
        parse: () => void;
      };
    };
    fbAsyncInit?: () => void;
  }
}

const CoachingApp = () => {
  // Add theme state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [skillLevelFilter, setSkillLevelFilter] = useState<'all' | SkillLevel>('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Initialize Facebook SDK
  useEffect(() => {
    // Load the Facebook SDK asynchronously
    const loadFacebookSDK = () => {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.FB) {
          resolve(window.FB);
          return;
        }
        
        // Add meta tags for Facebook SDK
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'fb:app_id');
        meta.content = '1939549029785569';
        document.head.appendChild(meta);
        
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          window.fbAsyncInit = function() {
            if (window.FB) {
              window.FB.init({
                appId: '1939549029785569',
                xfbml: true,
                version: 'v18.0'
              });
              window.FB.XFBML.parse();
              resolve(window.FB);
            }
          };
        };
        
        document.body.appendChild(script);
      });
    };

    loadFacebookSDK().then(() => {
      console.log('Facebook SDK loaded successfully');
    }).catch(error => {
      console.error('Error loading Facebook SDK:', error);
    });
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Update document class for global theme
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Extract YouTube video ID from URL
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

  // Convert Facebook share URL to video URL
  const convertFacebookShareUrl = async (shareUrl: string): Promise<string> => {
    // Remove @ symbol if present
    if (shareUrl.startsWith('@')) {
      shareUrl = shareUrl.substring(1);
    }

    // Handle direct reel URLs
    const reelMatch = shareUrl.match(/facebook\.com\/reel\/(\d+)/);
    if (reelMatch) {
      return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/${reelMatch[1]}&show_text=false&width=560&t=0`;
    }

    // Handle direct video URLs
    const videoMatch = shareUrl.match(/facebook\.com\/.*?\/videos\/(\d+)/);
    if (videoMatch) {
      return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/video.php?v=${videoMatch[1]}&show_text=false&width=560&t=0`;
    }

    // For all other URLs, try to extract the video ID
    const videoIdMatch = shareUrl.match(/\/(\d{15,})/);
    if (videoIdMatch) {
      return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/video.php?v=${videoIdMatch[1]}&show_text=false&width=560&t=0`;
    }

    return shareUrl;
  };

  // Add this to handle URL conversion when adding or editing videos
  const handleVideoUrlConversion = async (url: string) => {
    if (url.includes('facebook.com') || url.startsWith('@')) {
      return await convertFacebookShareUrl(url);
    }
    return url;
  };

  // Add loading and error states for video playback
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Initial video data
  const initialVideos = {
    hitting: [
      {
        id: 'default-1',
        title: 'How to Make Your Swing Shorter and Quicker',
        url: 'https://www.youtube.com/watch?v=6dfjV84ZN1g',
        category: 'hitting',
        skillLevel: 'highLevel',
        teachingCue: 'longer video on shortening the swing.',
        tags: ['mechanics'],
        favorite: false,
        lastViewed: Date.now(),
        orientation: 'vertical'
      },
      {
        id: 'default-2',
        title: 'Elbow In Palm Up',
        url: 'https://www.facebook.com/100064856274850/videos/1047037899618974',
        category: 'hitting',
        skillLevel: 'littleLeague',
        teachingCue: 'Focus on keeping elbow in with palm up position',
        tags: ['mechanics', 'fundamentals'],
        favorite: false,
        lastViewed: Date.now(),
        orientation: 'vertical'
      },
      {
        id: 'default-3',
        title: 'Load Position - Chest Over Back Foot',
        url: 'https://www.facebook.com/reel/1650842449194914',
        category: 'hitting',
        skillLevel: 'highLevel',
        teachingCue: 'Load is not turn the shoulders...it\'s Chest over back foot',
        tags: ['mechanics', 'load'],
        favorite: false,
        lastViewed: Date.now(),
        orientation: 'vertical'
      }
    ],
    pitching: [
      {
        id: 'default-5',
        title: 'Coil Mechanics',
        url: 'https://www.facebook.com/100064856274850/videos/1047037899618974',
        category: 'pitching',
        skillLevel: 'highLevel',
        teachingCue: 'Not Tall and Fall or drop... Screw Yourself into the ground (COIL)',
        tags: ['mechanics', 'advanced'],
        favorite: false,
        lastViewed: Date.now(),
        orientation: 'vertical'
      },
      {
        id: 'default-6',
        title: 'Whip vs Push Mechanics',
        url: 'https://www.facebook.com/100064856274850/videos/1047037899618974',
        category: 'pitching',
        skillLevel: 'highLevel',
        teachingCue: 'For better velocity Make a Whip, (not a push) - and recoil',
        tags: ['mechanics', 'velocity'],
        favorite: false,
        lastViewed: Date.now(),
        orientation: 'vertical'
      }
    ],
    infield: [],
    catching: []
  };

  // State declarations
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideosByCategory>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('baseballVideos');
      if (saved) {
        const parsedData = JSON.parse(saved);
        // Handle data migration from teamVideos to myVideos
        if (parsedData.teamVideos && !parsedData.myVideos) {
          parsedData.myVideos = parsedData.teamVideos;
          delete parsedData.teamVideos;
        }
        return parsedData;
      }
      return initialVideos;
    }
    return initialVideos;
  });

  // Modify addVideo to handle URL conversion
  const addVideo = async (videoData: Omit<Video, 'id'>) => {
    const convertedUrl = await handleVideoUrlConversion(videoData.url);
    const newVideo: Video = {
      id: Date.now().toString(),
      ...videoData,
      url: convertedUrl,
      orientation: videoData.orientation || 'vertical'
    };
    setVideos(prev => ({
      ...prev,
      [videoData.category]: [...(prev[videoData.category] || []), newVideo]
    }));
    setShowAddForm(false);
  };

  // Modify handleSaveEdit to handle URL conversion
  const handleSaveEdit = async (updatedVideo: Video) => {
    const convertedUrl = await handleVideoUrlConversion(updatedVideo.url);
    const finalVideo = { ...updatedVideo, url: convertedUrl, orientation: updatedVideo.orientation };
    setVideos(prev => ({
      ...prev,
      [updatedVideo.category]: prev[updatedVideo.category].map(v => 
        v.id === updatedVideo.id ? { ...finalVideo, isEditing: false } : v
      )
    }));
    setSelectedVideo(null);
  };

  // Get all videos with sorting
  const getAllVideos = () => {
    let allVideos = Object.values(videos)
      .flat()
      .sort((a, b) => parseInt(b.id) - parseInt(a.id)); // Sort by newest first
    
    if (skillLevelFilter !== 'all') {
      allVideos = allVideos.filter(video => video.skillLevel === skillLevelFilter);
    }
    
    if (activeTag) {
      allVideos = allVideos.filter((video: Video) => video.tags.includes(activeTag));
    }
    
    return allVideos;
  };

  // Get category videos with sorting
  const getCategoryVideos = (category: string) => {
    let categoryVideos = videos[category as keyof VideosByCategory] || [];
    
    categoryVideos = categoryVideos.sort((a, b) => parseInt(b.id) - parseInt(a.id)); // Sort by newest first
    
    if (skillLevelFilter !== 'all') {
      categoryVideos = categoryVideos.filter(video => video.skillLevel === skillLevelFilter);
    }
    
    if (activeTag) {
      categoryVideos = categoryVideos.filter(video => video.tags?.includes(activeTag));
    }
    
    return categoryVideos;
  };

  // Get all unique tags
  const getAllTags = () => {
    const tagsSet = new Set<string>();
    Object.values(videos)
      .flat()
      .forEach((video: Video) => {
        video.tags.forEach((tag: string) => tagsSet.add(tag));
      });
    return Array.from(tagsSet);
  };

  // Handle tag click
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video card click
    setActiveTag(currentTag => currentTag === tag ? null : tag);
  };

  // Add this utility function near the top of the file, after the imports
  const compressImage = (base64String: string, maxWidth: number = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG with 0.7 quality
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  // Modify the useEffect hook that saves to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('baseballVideos', JSON.stringify(videos));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      alert('Unable to save changes. The data might be too large. Try removing some images or videos.');
    }
  }, [videos]);

  // Toggle favorite
  const toggleFavorite = (videoId: string, category: VideoCategory) => {
    setVideos(prev => ({
      ...prev,
      [category]: prev[category].map(video =>
        video.id === videoId
          ? { ...video, favorite: !video.favorite }
          : video
      )
    }));
  };

  // Update last viewed
  const updateLastViewed = (videoId: string, category: VideoCategory) => {
    setVideos(prev => ({
      ...prev,
      [category]: prev[category].map(video =>
        video.id === videoId
          ? { ...video, lastViewed: Date.now() }
          : video
      )
    }));
  };

  // Modify VideoCard component to include favorite button
  const VideoCard: React.FC<{ video: Video; index: number }> = ({ video, index }) => {
    const youtubeId = getYouTubeVideoId(video.url);
    
    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedVideo({ ...video, isEditing: true });
    };

    const handleFavorite = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavorite(video.id, video.category);
    };
    
    return (
      <Card 
        className={`cursor-pointer h-full flex flex-col rounded-xl border-2 ${
          isDarkMode 
            ? 'bg-slate-900/30 border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800/40' 
            : 'bg-white/80 border-stone-200 hover:border-emerald-500/30 hover:bg-stone-50'
        } shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-emerald-500/10 animate-float-up relative overflow-hidden`}
        onClick={() => {
          updateLastViewed(video.id, video.category);
          setSelectedVideo({ ...video, isEditing: false });
        }}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <CardHeader className="p-4 pb-0 flex-grow">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex justify-between items-start">
              <CardTitle className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} line-clamp-2 tracking-tight`}>
                {video.title}
              </CardTitle>
              <Button 
                onClick={handleEdit}
                variant="ghost" 
                size="sm"
                className={`${isDarkMode ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'} transition-colors rounded-lg`}
              >
                ✎
              </Button>
            </div>
            <div className="aspect-video w-full relative rounded-xl overflow-hidden ring-1 ring-black/5">
              {video.thumbnail ? (
                <img 
                  src={video.thumbnail}
                  alt="Custom thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : youtubeId ? (
                <img 
                  src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : video.url.includes('facebook.com') ? (
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/80 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <img 
                    src="/facebook-thumb.jpg" 
                    alt="Video thumbnail"
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-[url('/facebook-thumb.jpg')] bg-cover bg-center blur-md opacity-50" />
                  <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/60' : 'bg-slate-800/40'}`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <p className={isDarkMode ? 'text-slate-300' : 'text-slate-100'}>Preview not available</p>
                    <a 
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors mt-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open Video
                    </a>
                  </div>
                </>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/80 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            </div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>
              {video.teachingCue}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex gap-2 flex-wrap">
            {video.tags?.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className={`cursor-pointer transition-all duration-200 rounded-lg ${
                  activeTag === tag 
                    ? isDarkMode 
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 scale-110'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 scale-110'
                    : isDarkMode
                      ? 'bg-slate-800/50 text-white/90 hover:bg-slate-700/50'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                } font-medium shadow-sm hover:-translate-y-0.5`}
                onClick={(e) => handleTagClick(tag, e)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <button
            onClick={handleFavorite}
            className={`absolute bottom-3 right-3 z-10 p-2 rounded-lg ${
              isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-stone-200/50'
            } transition-all duration-200 ${video.favorite ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={video.favorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={video.favorite ? "text-emerald-500" : isDarkMode ? "text-slate-400" : "text-slate-600"}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </CardContent>
      </Card>
    );
  };

  // Edit form component
  interface EditFormProps {
    video: Video;
    onSave: (video: Video) => void;
    onCancel: () => void;
  }

  // Add deleteVideo function
  const deleteVideo = (videoId: string, category: VideoCategory) => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      setVideos(prev => ({
        ...prev,
        [category]: prev[category].filter(video => video.id !== videoId)
      }));
      setSelectedVideo(null);
    }
  };

  const EditForm: React.FC<EditFormProps> = ({ video, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Video>({
      ...video,
      orientation: video.orientation || 'vertical'
    });
    const [imagePreview, setImagePreview] = useState<string | null>(video.thumbnail || null);
    const [error, setError] = useState<string | null>(null);
    const [newTag, setNewTag] = useState('');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64String = reader.result as string;
            const compressedImage = await compressImage(base64String);
            setImagePreview(compressedImage);
            setFormData(prev => ({ ...prev, thumbnail: compressedImage }));
          };
          reader.readAsDataURL(file);
        } catch (error) {
          setError('Failed to process image. Please try a smaller image.');
        }
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    const handleAddTag = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (newTag) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
        setNewTag('');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] bg-slate-800 rounded-lg animate-slide-up">
          <div className="flex justify-between items-center p-6 pb-0">
            <h2 className="text-xl font-bold text-emerald-400">
              Edit Content
            </h2>
            <Button
              onClick={() => deleteVideo(video.id, video.category)}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Delete
            </Button>
          </div>
          
          <ScrollArea className="p-6 pt-4 max-h-[calc(90vh-120px)]">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="editThumbnail" className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Custom Thumbnail</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full aspect-video mb-2">
                      <img 
                        src={imagePreview} 
                        alt="Thumbnail preview" 
                        className="rounded w-full h-full object-cover"
                      />
                      <Button
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, thumbnail: undefined }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-slate-700 rounded flex items-center justify-center cursor-pointer hover:bg-slate-600 relative">
                      <input
                        type="file"
                        id="editThumbnail"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="text-center">
                        <div className="text-3xl mb-2">🖼️</div>
                        <div className="text-sm text-slate-300">Click to upload thumbnail</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="editUrl" className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Video URL</Label>
                <Input 
                  id="editUrl"
                  value={formData.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, url: e.target.value})}
                  className={`${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-slate-100' 
                      : 'bg-stone-100 border-stone-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <Label htmlFor="editTitle" className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Title</Label>
                <Input 
                  id="editTitle"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, title: e.target.value})}
                  className={`${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-slate-100' 
                      : 'bg-stone-100 border-stone-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <Label htmlFor="editSkillLevel" className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Skill Level</Label>
                <Select 
                  value={formData.skillLevel}
                  onValueChange={(value: SkillLevel) => setFormData({...formData, skillLevel: value})}
                >
                  <SelectTrigger className={`${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-slate-100' 
                      : 'bg-stone-100 border-stone-200 text-slate-900'
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="littleLeague">Little League</SelectItem>
                    <SelectItem value="highLevel">High Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editTeachingCue" className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Teaching Cue</Label>
                <Textarea 
                  id="editTeachingCue"
                  value={formData.teachingCue}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, teachingCue: e.target.value})}
                  className={`${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-slate-100' 
                      : 'bg-stone-100 border-stone-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <Label className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag: string) => (
                    <Badge 
                      key={tag}
                      variant="secondary"
                      className={`cursor-pointer ${
                        isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600' 
                          : 'bg-stone-100 hover:bg-stone-200'
                      }`}
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.filter(t => t !== tag)
                      }))}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new tag"
                    value={newTag}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                    className={`${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                        : 'bg-stone-100 border-stone-200 text-slate-900 placeholder-slate-400'
                    }`}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(e as unknown as React.MouseEvent<HTMLButtonElement>);
                      }
                    }}
                  />
                  <Button onClick={handleAddTag} className="bg-emerald-600 hover:bg-emerald-700">
                    Add Tag
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="orientation" className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Video Orientation</Label>
                <Select 
                  value={formData.orientation}
                  onValueChange={(value: VideoOrientation) => setFormData({...formData, orientation: value})}
                >
                  <SelectTrigger className={`${
                    isDarkMode 
                      ? 'bg-slate-700 border-slate-600 text-slate-100' 
                      : 'bg-stone-100 border-stone-200 text-slate-900'
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={onCancel} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Save Changes
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  // Add content form component
  interface AddContentFormProps {
    onSubmit: (video: Omit<Video, 'id'>) => void;
  }

  const AddContentForm: React.FC<AddContentFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<Omit<Video, 'id'>>({
      title: '',
      url: '',
      category: 'hitting',
      skillLevel: 'beginner',
      teachingCue: '',
      tags: [],
      favorite: false,
      lastViewed: Date.now(),
      orientation: 'vertical'
    });
    const [newTag, setNewTag] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64String = reader.result as string;
            const compressedImage = await compressImage(base64String);
            setImagePreview(compressedImage);
            setFormData(prev => ({ ...prev, thumbnail: compressedImage }));
          };
          reader.readAsDataURL(file);
        } catch (error) {
          setError('Failed to process image. Please try a smaller image.');
        }
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!formData.title.trim()) {
        setError('Please enter a title');
        return;
      }
      if (!formData.url.trim()) {
        setError('Please enter a video URL');
        return;
      }
      if (!formData.category) {
        setError('Please select a category');
        return;
      }
      if (!formData.teachingCue.trim()) {
        setError('Please enter a teaching cue');
        return;
      }

      try {
        new URL(formData.url); // Validate URL format
        onSubmit(formData);
      } catch (e) {
        setError('Please enter a valid URL');
      }
    };

    const handleAddTag = () => {
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
        setNewTag('');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-2xl max-h-[90vh] bg-slate-800 rounded-lg animate-slide-up">
          <h2 className="text-xl font-bold mb-4 text-emerald-400 p-6 pb-0">Add New Content</h2>
          
          <ScrollArea className="p-6 pt-4 max-h-[calc(90vh-120px)]">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="thumbnail" className="text-slate-200">Custom Thumbnail</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full aspect-video mb-2">
                      <img 
                        src={imagePreview} 
                        alt="Thumbnail preview" 
                        className="rounded w-full h-full object-cover"
                      />
                      <Button
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, thumbnail: undefined }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-slate-700 rounded flex items-center justify-center cursor-pointer hover:bg-slate-600 relative">
                      <input
                        type="file"
                        id="thumbnail"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="text-center">
                        <div className="text-3xl mb-2">🖼️</div>
                        <div className="text-sm text-slate-300">Click to upload thumbnail</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="url" className="text-slate-200">Video URL</Label>
                <Input 
                  id="url"
                  value={formData.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, url: e.target.value})}
                  placeholder="Paste Facebook or YouTube URL"
                  required
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                />
              </div>

              <div>
                <Label htmlFor="title" className="text-slate-200">Title</Label>
                <Input 
                  id="title"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, title: e.target.value})}
                  placeholder="Video title"
                  required
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-slate-200">Category</Label>
                <Select 
                  value={formData.category}
                  onValueChange={(value: VideoCategory) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hitting">Hitting</SelectItem>
                    <SelectItem value="infield">Infield</SelectItem>
                    <SelectItem value="pitching">Pitching</SelectItem>
                    <SelectItem value="catching">Catching</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="skillLevel" className="text-slate-200">Skill Level</Label>
                <Select 
                  value={formData.skillLevel}
                  onValueChange={(value: SkillLevel) => setFormData({...formData, skillLevel: value})}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="littleLeague">Little League</SelectItem>
                    <SelectItem value="highLevel">High Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="teachingCue" className="text-slate-200">Teaching Cue/Notes</Label>
                <Textarea 
                  id="teachingCue"
                  value={formData.teachingCue}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, teachingCue: e.target.value})}
                  placeholder="Key teaching points or notes"
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                />
              </div>

              <div>
                <Label className="text-slate-200">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <Badge 
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer bg-slate-700 hover:bg-slate-600"
                      onClick={() => setFormData({
                        ...formData,
                        tags: formData.tags.filter(t => t !== tag)
                      })}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new tag"
                    value={newTag}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                    className={`${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400' 
                        : 'bg-stone-100 border-stone-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <Button onClick={handleAddTag} className="bg-emerald-600 hover:bg-emerald-700">
                    Add Tag
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="orientation" className="text-slate-200">Video Orientation</Label>
                <Select 
                  value={formData.orientation}
                  onValueChange={(value: VideoOrientation) => setFormData({...formData, orientation: value})}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                Add Content
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  // Main component return
  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-slate-950/90' : 'bg-stone-100'} bg-gradient-glow bg-mesh bg-glow`}>
      {/* Hamburger Menu Overlay */}
      {isMenuOpen && (
        <div 
          className={`fixed inset-0 ${isDarkMode ? 'bg-black/40' : 'bg-black/20'} z-40`}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 ${isDarkMode ? 'bg-slate-900/95' : 'bg-stone-50'} z-50 transform transition-transform duration-300 ease-in-out ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Menu</h2>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className={`${isDarkMode ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'} transition-colors`}
            >
              ×
            </button>
          </div>
          <nav>
            <div className="space-y-6">
              <a
                href="/player-analysis#myvideos"
                className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-emerald-400' 
                    : 'text-slate-600 hover:bg-stone-100 hover:text-emerald-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Player Analysis
              </a>
              <button
                onClick={() => {
                  setShowInstructions(true);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-emerald-400' 
                    : 'text-slate-600 hover:bg-stone-100 hover:text-emerald-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Instructions
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowInstructions(false)}
        >
          <div 
            className={`w-full max-w-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-stone-50'} rounded-lg shadow-xl animate-slide-up`}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  How To Add Videos
                </h2>
                <button 
                  onClick={() => setShowInstructions(false)}
                  className={`${isDarkMode ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'} transition-colors`}
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-stone-100'}`}>
                  <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Facebook Videos
                  </h3>
                  <ol className={`list-decimal list-inside space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <li>Open the video on Facebook</li>
                    <li>Copy the URL from your browser's address bar</li>
                    <li>Do NOT use the "Share" link - it won't work</li>
                    <li>URL should look like:
                      <div className={`mt-1 px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-stone-200'} font-mono text-xs break-all`}>
                        facebook.com/reel/123456789
                      </div>
                    </li>
                  </ol>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-stone-100'}`}>
                  <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    YouTube Videos
                  </h3>
                  <ol className={`list-decimal list-inside space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <li>Open the video on YouTube</li>
                    <li>Copy the URL from your browser's address bar</li>
                    <li>Both full URLs and youtu.be links work:
                      <div className={`mt-1 px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-stone-200'} font-mono text-xs break-all`}>
                        youtube.com/watch?v=abcd1234
                        <br />
                        youtu.be/abcd1234
                      </div>
                    </li>
                  </ol>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-stone-100'}`}>
                  <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Video Orientation
                  </h3>
                  <ul className={`list-disc list-inside space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <li>Choose "Vertical" for phone videos filmed in portrait mode</li>
                    <li>Choose "Landscape" for videos filmed horizontally</li>
                    <li>Default is set to "Vertical" for most baseball training videos</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={() => setShowInstructions(false)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`border-b ${isDarkMode ? 'border-slate-800/30 bg-gradient-to-b from-slate-900/95 to-slate-950/95' : 'border-stone-200 bg-gradient-to-b from-stone-50 to-stone-100/80'}`}>
        <div className="container mx-auto">
          <div className="flex flex-col items-center py-12">
            <div className="flex items-center gap-4 relative w-full justify-center">
              {/* Hamburger Button */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                className={`absolute left-4 ${isDarkMode ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'} transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>

              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                className={`absolute right-4 ${isDarkMode ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'} transition-colors`}
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>

              <img 
                src="/logo.png" 
                alt="DrillShare" 
                className="h-16 animate-fade-in"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="container mx-auto">
          <div className="flex justify-between items-center py-4">
            <Select
              value={skillLevelFilter}
              onValueChange={(value: typeof skillLevelFilter) => setSkillLevelFilter(value)}
            >
              <SelectTrigger className={`w-[200px] ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-stone-200'
              }`}>
                <SelectValue placeholder="Filter by skill level..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skill Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="littleLeague">Little League</SelectItem>
                <SelectItem value="highLevel">High Level</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => setShowAddForm(true)} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200 shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5"
            >
              + Add Content
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <div className={`border-b ${isDarkMode ? 'border-slate-800/30 bg-slate-900/40' : 'border-stone-200 bg-stone-50/60'}`}>
            <div className="container mx-auto py-2">
              <TabsList className="w-full justify-start px-4 bg-slate-800 border-b border-slate-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">All Videos</TabsTrigger>
                <TabsTrigger value="hitting" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Hitting</TabsTrigger>
                <TabsTrigger value="infield" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Infield</TabsTrigger>
                <TabsTrigger value="pitching" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Pitching</TabsTrigger>
                <TabsTrigger value="catching" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Catching</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {activeTag && (
            <div className={`h-[40px] ${
              isDarkMode 
                ? 'bg-emerald-600/30 border-y border-emerald-600/40' 
                : 'bg-emerald-50 border-y border-emerald-200'
            } flex items-center animate-slide-in-right shadow-inner`}>
              <div className="container mx-auto px-4">
                <div className={`flex items-center gap-3 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'} font-medium`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                  </svg>
                  <span className="text-base">Filtering by tag:</span>
                  <Badge variant="secondary" className={`${
                    isDarkMode 
                      ? 'bg-emerald-500/30' 
                      : 'bg-emerald-100'
                  } px-3 py-1 text-base`}>
                    {activeTag}
                    <button 
                      onClick={() => setActiveTag(null)}
                      className={`ml-3 ${isDarkMode ? 'hover:text-emerald-100' : 'hover:text-emerald-800'} transition-colors`}
                    >
                      ×
                    </button>
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="container mx-auto py-8 px-4">
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {getAllVideos().map((video, index) => (
                    <VideoCard key={video.id} video={video} index={index} />
                  ))}
                  {getAllVideos().length === 0 && activeTag && (
                    <div className={`col-span-3 text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      No videos found with tag: {activeTag}
                    </div>
                  )}
                </div>
              </TabsContent>

              {Object.entries(videos).map(([category, categoryVideos]) => (
                <TabsContent key={category} value={category} className="mt-0">
                  {getCategoryVideos(category).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {getCategoryVideos(category).map((video, index) => (
                        <VideoCard key={video.id} video={video} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {activeTag 
                        ? `No videos found in ${category} with tag: ${activeTag}`
                        : `No videos in ${category} yet. Add your first one!`
                      }
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl animate-slide-up">
            <AddContentForm onSubmit={addVideo} />
          </div>
        </div>
      )}
      
      {selectedVideo?.isEditing ? (
        <EditForm 
          video={selectedVideo} 
          onSave={handleSaveEdit}
          onCancel={() => setSelectedVideo(null)} 
        />
      ) : selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-slate-800 rounded-lg animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-emerald-400">{selectedVideo.title}</h2>
            </div>
            <ScrollArea className="max-h-[calc(90vh-100px)]">
              <div className="p-4">
                <div className={`${
                  selectedVideo.orientation === 'vertical' 
                    ? 'aspect-[9/16] max-w-[400px]' 
                    : 'aspect-video w-full'
                } bg-slate-700 mb-4 rounded overflow-hidden relative mx-auto`}>
                  {isVideoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
                    </div>
                  )}
                  {videoError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/90 p-4">
                      <p className="text-red-400 mb-4 text-center">{videoError}</p>
                      <Button
                        asChild
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <a 
                          href={selectedVideo.url.includes('plugins/video.php?href=') 
                            ? decodeURIComponent(selectedVideo.url.split('href=')[1].split('&')[0])
                            : selectedVideo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Original
                        </a>
                      </Button>
                    </div>
                  ) : (
                    selectedVideo.url.includes('facebook.com') ? (
                      <iframe
                        src={selectedVideo.url}
                        width="100%"
                        height="100%"
                        style={{ border: 'none', overflow: 'hidden' }}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      />
                    ) : (
                      <ReactPlayer
                        url={selectedVideo.url}
                        width="100%"
                        height="100%"
                        controls={true}
                        playing={true}
                        playsinline={true}
                        onBuffer={() => {
                          setIsVideoLoading(true);
                          setVideoError(null);
                        }}
                        onBufferEnd={() => setIsVideoLoading(false)}
                        onError={(e) => {
                          console.error('Video playback error:', e);
                          setVideoError('Unable to play this video. The video may be private or no longer available.');
                          setIsVideoLoading(false);
                        }}
                        onReady={() => {
                          setIsVideoLoading(false);
                          setVideoError(null);
                        }}
                      />
                    )
                  )}
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2 text-emerald-300">Teaching Cue:</h3>
                  <div className="text-base font-medium text-slate-400">{selectedVideo.teachingCue}</div>
                </div>
                <div className="flex justify-between">
                  <div>
                    {selectedVideo.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="mr-2 bg-slate-700">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className={`${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-stone-200 text-slate-600 hover:bg-stone-100'}`}
                    >
                      <a 
                        href={selectedVideo.url.includes('plugins/video.php?href=') 
                          ? decodeURIComponent(selectedVideo.url.split('href=')[1].split('&')[0])
                          : selectedVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Original
                      </a>
                    </Button>
                    <Button 
                      onClick={() => setSelectedVideo(null)}
                      className="bg-slate-700 hover:bg-slate-600"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachingApp;
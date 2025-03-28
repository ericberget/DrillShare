'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { PlayerAnalysisVideo } from '@/types/content';
import { Timestamp } from 'firebase/firestore';

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Video Card Component for individual videos
const VideoCard = ({ 
  video, 
  onDelete, 
  onView,
  formatDate 
}: { 
  video: PlayerAnalysisVideo, 
  onDelete: (id: string) => void, 
  onView: (video: PlayerAnalysisVideo) => void,
  formatDate: (timestamp: Timestamp) => string
}) => {
  return (
    <Card className="bg-slate-900/30 border-slate-700/50">
      <CardContent className="p-4">
        <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden mb-4">
          {video.videoType === 'youtube' ? (
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeVideoId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={video.videoUrl}
              className="w-full h-full object-cover"
              controls
            />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-100">{video.playerName}</h3>
          <p className="text-sm text-slate-400">{video.category}</p>
          <p className="text-sm text-slate-400">Added: {formatDate(video.createdAt)}</p>
          {video.fileSize && (
            <p className="text-sm text-slate-400">
              Size: {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            className="flex-1 border-slate-700 text-slate-300 hover:text-slate-100"
            onClick={() => onView(video)}
          >
            View
          </Button>
          <Button 
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete(video.id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PlayerAnalysisPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [notes, setNotes] = useState('');
  const [savedVideos, setSavedVideos] = useState<PlayerAnalysisVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PlayerAnalysisVideo | null>(null);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("myvideos");
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hitting' | 'pitching'>('all');
  const [videoType, setVideoType] = useState<'upload' | 'youtube'>('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
  
  // Define accepted file types
  const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/mov'];
  const ACCEPTED_IMAGE_TYPES = ['image/heic', 'image/heif'];
  
  // Load saved videos from localStorage on component mount
  useEffect(() => {
    const loadSavedVideos = () => {
      try {
        const saved = localStorage.getItem('playerAnalysisVideos');
        if (saved) {
          setSavedVideos(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error loading saved videos:', err);
      }
    };
    
    loadSavedVideos();
  }, []);
  
  // Check URL hash for tab selection
  useEffect(() => {
    // Get hash from URL (e.g., #myvideos)
    const hash = window.location.hash?.substring(1);
    
    // If hash is one of our valid tabs, set it as active
    if (hash === 'upload' || hash === 'myvideos') {
      setActiveTab(hash);
    }
    
    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash?.substring(1);
      if (newHash === 'upload' || newHash === 'myvideos') {
        setActiveTab(newHash);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };
  
  const captureThumbnail = (): string | undefined => {
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          return canvas.toDataURL('image/jpeg');
        }
      } catch (error) {
        console.error('Error capturing thumbnail:', error);
      }
    }
    return undefined;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !thumbnail) {
      const currentTime = videoRef.current.currentTime;
      if (currentTime > 0) {
        const newThumbnail = captureThumbnail();
        if (newThumbnail) {
          setThumbnail(newThumbnail);
        }
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const simulateFileConversion = (fileName: string): Promise<void> => {
    return new Promise((resolve) => {
      setIsConverting(true);
      setWarning(`Converting ${fileName} to a compatible format...`);
      
      // Simulate conversion process with a delay
      setTimeout(() => {
        setIsConverting(false);
        setWarning('');
        resolve();
      }, 2000);
    });
  };

  const processFile = async (file: File) => {
    setError('');
    setWarning('');
    setThumbnail(undefined);
    
    // Check file size first
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds maximum limit of 50MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Handle MOV files (QuickTime format from iPhone)
    if (file.type === 'video/quicktime' || file.type === 'video/mov' || fileExtension === 'mov') {
      await simulateFileConversion(file.name);
      // In a real implementation, you would convert the file here
    }
    
    // Handle HEIC/HEIF images (iPhone photos)
    else if (ACCEPTED_IMAGE_TYPES.includes(file.type) || fileExtension === 'heic' || fileExtension === 'heif') {
      await simulateFileConversion(file.name);
      // In a real implementation, you would convert the image here
    }
    
    // Check if file type is acceptable
    else if (!ACCEPTED_VIDEO_TYPES.includes(file.type) && !file.type.startsWith('video/')) {
      setError(`Unsupported file type: ${file.type || fileExtension}. Please upload MP4, MOV videos or HEIC images.`);
      return;
    }
    
    setFile(file);
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setVideoSrc(objectUrl);
    
    // Simulate upload
    simulateUpload();
  };
  
  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setWarning('');
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setVideoSrc(previewUrl);
      
      // Check file size
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size exceeds 50MB limit');
        setFile(null);
        setVideoSrc('');
        return;
      }
      
      // Check file type
      const fileType = selectedFile.type;
      if (!fileType.startsWith('video/') && !fileType.startsWith('image/')) {
        setError('Invalid file type. Please upload a video or image file.');
        setFile(null);
        setVideoSrc('');
        return;
      }
      
      // Check if conversion is needed
      if (fileType === 'image/heic' || fileType === 'image/heif' || fileType === 'video/quicktime') {
        setWarning('File will be converted to MP4 format');
        setIsConverting(true);
        // Simulate conversion
        setTimeout(() => {
          setIsConverting(false);
        }, 2000);
      }
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };
  
  const saveVideoAnalysis = () => {
    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }
    
    if (!selectedCategory || selectedCategory === 'all') {
      setError('Please select a category (Hitting or Pitching)');
      return;
    }

    if (videoType === 'youtube') {
      if (!youtubeUrl.trim()) {
        setError('Please enter a YouTube URL');
        return;
      }
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        setError('Invalid YouTube URL');
        return;
      }
    } else {
      if (!file) {
        setError('No video file to save');
        return;
      }
    }
    
    setIsSaving(true);
    
    // Capture thumbnail if not already done
    const thumbnailUrl = thumbnail || captureThumbnail();
    
    setTimeout(() => {
      const newAnalysis: PlayerAnalysisVideo = {
        id: Date.now().toString(),
        userId: 'user123', // This should come from your auth context
        playerName: playerName,
        category: selectedCategory,
        videoType: videoType,
        videoUrl: videoType === 'youtube' ? youtubeUrl : videoSrc,
        thumbnailUrl: thumbnailUrl === null ? undefined : thumbnailUrl,
        notes: notes,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        fileSize: file?.size,
        fileName: file?.name,
        youtubeVideoId: videoType === 'youtube' ? extractYouTubeId(youtubeUrl) : undefined
      };
      
      const updatedVideos = [...savedVideos, newAnalysis];
      setSavedVideos(updatedVideos);
      
      // Save to localStorage
      try {
        localStorage.setItem('playerAnalysisVideos', JSON.stringify(updatedVideos));
      } catch (err) {
        console.error('Error saving to localStorage:', err);
        setError('Failed to save video. Try clearing some space in your browser storage.');
      }
      
      setIsSaving(false);
      setFile(null);
      setVideoSrc('');
      setPlayerName('');
      setNotes('');
      setThumbnail(undefined);
      setSelectedCategory('all');
      setYoutubeUrl('');
      setVideoType('upload');
    }, 1000);
  };
  
  const deleteVideo = (id: string) => {
    if (confirm('Are you sure you want to delete this video analysis?')) {
      const updatedVideos = savedVideos.filter(video => video.id !== id);
      setSavedVideos(updatedVideos);
      
      // Update localStorage
      try {
        localStorage.setItem('playerAnalysisVideos', JSON.stringify(updatedVideos));
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }
      
      if (selectedVideo?.id === id) {
        setSelectedVideo(null);
      }
    }
  };
  
  const formatDate = (timestamp: Timestamp) => {
    return new Date(timestamp.toDate()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/30 bg-gradient-to-b from-slate-900/95 to-slate-950/95">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4 text-emerald-400 hover:text-emerald-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              <span className="font-medium">Back to DrillShare</span>
            </Link>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-emerald-400">Player Analysis</h1>
              <p className="text-slate-400">Upload and analyze player videos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="border-b border-slate-800/30 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              className={`${selectedCategory === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-slate-400 hover:text-slate-300'}`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            <Button
              variant={selectedCategory === 'hitting' ? 'default' : 'ghost'}
              className={`${selectedCategory === 'hitting' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-slate-400 hover:text-slate-300'}`}
              onClick={() => setSelectedCategory('hitting')}
            >
              Hitting
            </Button>
            <Button
              variant={selectedCategory === 'pitching' ? 'default' : 'ghost'}
              className={`${selectedCategory === 'pitching' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-slate-400 hover:text-slate-300'}`}
              onClick={() => setSelectedCategory('pitching')}
            >
              Pitching
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start px-4 bg-slate-800 border-b border-slate-700 mb-6">
            <TabsTrigger value="upload" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Upload Video</TabsTrigger>
            <TabsTrigger value="myvideos" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">My Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card className="bg-slate-900/30 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-emerald-400">Upload Video</CardTitle>
                  <CardDescription className="text-slate-400">
                    Upload videos (max 50MB) for swing analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Video Upload or YouTube URL Input */}
                  {videoType === 'upload' ? (
                    <div
                      className={`p-4 border-2 border-dashed rounded-xl transition-colors flex flex-col items-center justify-center h-64 ${
                        isDragging
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : error
                          ? 'border-red-500 bg-red-500/10'
                          : isConverting
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={handleSelectFile}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".mp4,.mov,.heic,.heif,video/mp4,video/quicktime,image/heic,image/heif"
                        onChange={handleFileChange}
                      />
                      
                      {isConverting ? (
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-t-transparent border-amber-400 rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-amber-300">Converting file format...</p>
                        </div>
                      ) : isUploading ? (
                        <div className="w-full px-4">
                          <div className="mb-2 text-center text-sm font-medium text-slate-300">
                            Uploading: {uploadProgress}%
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div 
                              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : file ? (
                        <div className="text-center">
                          <div className="text-emerald-400 text-lg font-medium mb-2">
                            Video ready for analysis
                          </div>
                          <p className="text-slate-300 text-sm mb-4">
                            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </p>
                          <Button 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              simulateUpload();
                            }}
                          >
                            Start Analysis
                          </Button>
                        </div>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-slate-400 mb-4"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <p className="text-slate-300 mb-2 text-center">
                            Drag & drop your video here or click to browse
                          </p>
                          <p className="text-slate-500 text-sm text-center">
                            Accepts MP4, MOV videos and HEIC images up to 50MB
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="youtube-url" className="text-slate-300">YouTube URL</Label>
                        <Input 
                          id="youtube-url"
                          placeholder="Paste YouTube video URL"
                          className="bg-slate-800 border-slate-700 text-slate-100"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                        />
                        <p className="text-sm text-slate-400 mt-1">
                          Supports standard YouTube URLs and shortened youtu.be links
                        </p>
                      </div>
                      {youtubeUrl && (
                        <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden">
                          <iframe
                            src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl)}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {error && (
                    <Alert className="mt-4 bg-red-900/20 border border-red-800 text-red-300">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {warning && !error && (
                    <Alert className="mt-4 bg-amber-900/20 border border-amber-800 text-amber-300">
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="mt-6">
                    <Label htmlFor="category" className="text-slate-300">Category</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={selectedCategory === 'hitting' ? 'default' : 'outline'}
                        className={`${selectedCategory === 'hitting' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-700 text-slate-400 hover:text-slate-300'}`}
                        onClick={() => setSelectedCategory('hitting')}
                      >
                        Hitting
                      </Button>
                      <Button
                        variant={selectedCategory === 'pitching' ? 'default' : 'outline'}
                        className={`${selectedCategory === 'pitching' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-700 text-slate-400 hover:text-slate-300'}`}
                        onClick={() => setSelectedCategory('pitching')}
                      >
                        Pitching
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Section */}
              <Card className="bg-slate-900/30 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-emerald-400">Preview</CardTitle>
                  <CardDescription className="text-slate-400">
                    Review your video before saving
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {videoType === 'youtube' ? (
                    youtubeUrl ? (
                      <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl)}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center">
                        <p className="text-slate-400">Enter a YouTube URL to preview</p>
                      </div>
                    )
                  ) : (
                    videoSrc ? (
                      <video
                        ref={videoRef}
                        src={videoSrc}
                        className="w-full aspect-video rounded-xl"
                        controls
                        onTimeUpdate={handleTimeUpdate}
                      />
                    ) : (
                      <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center">
                        <p className="text-slate-400">Upload a video to preview</p>
                      </div>
                    )
                  )}
                  
                  {videoSrc && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <Label htmlFor="player-name" className="text-slate-300">Player Name</Label>
                        <Input 
                          id="player-name" 
                          placeholder="Enter player name" 
                          className="bg-slate-800 border-slate-700 text-slate-100"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes" className="text-slate-300">Analysis Notes</Label>
                        <textarea 
                          id="notes" 
                          placeholder="Add your analysis notes here..."
                          className="w-full h-24 rounded-md border border-slate-700 bg-slate-800 text-slate-100 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-500 text-white"
                          onClick={saveVideoAnalysis}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : "Save Analysis"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="myvideos" className="mt-0">
            {/* My Videos Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-emerald-400 mb-2">My Saved Videos</h2>
              <p className="text-slate-400">View and manage your saved video analyses</p>
            </div>
            
            {savedVideos.filter(video => selectedCategory === 'all' || video.category === selectedCategory).length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-700/50 rounded-lg p-8 text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mx-auto mb-4 text-slate-500"
                >
                  <path d="M19 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" />
                  <rect width="10" height="10" x="12" y="12" rx="2" />
                  <path d="m16 16 4 4" />
                </svg>
                <h3 className="text-lg font-medium text-slate-300 mb-2">No videos saved yet</h3>
                <p className="text-slate-400 mb-4">Upload a video and save your analysis to see it here</p>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  onClick={() => handleTabChange('upload')}
                >
                  Upload a Video
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedVideos
                  .filter(video => selectedCategory === 'all' || video.category === selectedCategory)
                  .map(video => (
                    <VideoCard 
                      key={video.id}
                      video={video}
                      onDelete={deleteVideo}
                      onView={setSelectedVideo}
                      formatDate={formatDate}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Video Detail Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-900/90 border-slate-700/50 max-w-4xl w-full">
            <CardHeader>
              <CardTitle className="text-emerald-400">{selectedVideo.playerName}</CardTitle>
              <CardDescription className="text-slate-400">
                {selectedVideo.category} Analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden mb-4">
                {selectedVideo.videoType === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeVideoId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedVideo.videoUrl}
                    className="w-full h-full"
                    controls
                  />
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Notes</Label>
                  <p className="text-slate-300 mt-2">{selectedVideo.notes || 'No notes available'}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-slate-800">
                    {selectedVideo.category}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-800">
                    {formatDate(selectedVideo.createdAt)}
                  </Badge>
                  {selectedVideo.fileSize && (
                    <Badge variant="secondary" className="bg-slate-800">
                      {(selectedVideo.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:text-slate-100"
                onClick={() => setSelectedVideo(null)}
              >
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PlayerAnalysisPage; 
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';

interface VideoAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  dateUploaded: number;
  playerName: string;
  notes: string;
  videoPreviewUrl?: string;
  thumbnailUrl?: string;
}

// Video Card Component for individual videos
const VideoCard = ({ 
  video, 
  onDelete, 
  onView, 
  formatDate 
}: { 
  video: VideoAnalysis, 
  onDelete: (id: string) => void, 
  onView: (video: VideoAnalysis) => void,
  formatDate: (timestamp: number) => string
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <Card 
      key={video.id} 
      className="bg-slate-900/30 border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800/40 transition-all cursor-pointer"
      onClick={() => {
        if (!isPlaying && video.videoPreviewUrl) {
          setIsPlaying(true);
        } else {
          onView(video);
        }
      }}
    >
      <div className="aspect-video overflow-hidden bg-slate-800 relative">
        {isPlaying && video.videoPreviewUrl ? (
          <video 
            src={video.videoPreviewUrl} 
            controls 
            autoPlay
            className="w-full h-full" 
            onError={() => setIsPlaying(false)}
          />
        ) : video.thumbnailUrl ? (
          <>
            <img 
              src={video.thumbnailUrl} 
              alt={video.playerName} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/80 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            No Preview
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-between p-4">
          <Button 
            className="bg-emerald-600 hover:bg-emerald-500"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(video);
            }}
          >
            View
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-500"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(video.id);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-emerald-400 mb-1 truncate">{video.playerName}</h3>
        <div className="text-sm text-slate-400 mb-2">Uploaded {formatDate(video.dateUploaded)}</div>
        <p className="text-slate-300 line-clamp-2 text-sm h-10 overflow-hidden">
          {video.notes || "No analysis notes"}
        </p>
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
  const [savedVideos, setSavedVideos] = useState<VideoAnalysis[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoAnalysis | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("myvideos");
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
  
  // Capture thumbnail from video
  const captureThumbnail = () => {
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setThumbnail(dataUrl);
        return dataUrl;
      } catch (e) {
        console.error('Error capturing thumbnail:', e);
      }
    }
    return null;
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
    setThumbnail(null);
    
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
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };
  
  const saveVideoAnalysis = () => {
    if (!file) {
      setError('No video file to save');
      return;
    }
    
    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }
    
    setIsSaving(true);
    
    // Capture thumbnail if not already done
    const thumbnailUrl = thumbnail || captureThumbnail();
    
    setTimeout(() => {
      const newAnalysis: VideoAnalysis = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        dateUploaded: Date.now(),
        playerName: playerName,
        notes: notes,
        videoPreviewUrl: videoSrc,
        thumbnailUrl: thumbnailUrl || undefined
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
      setThumbnail(null);
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
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
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
                    <h3 className="text-sm font-medium text-slate-300 mb-2">TIPS FOR BEST ANALYSIS:</h3>
                    <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
                      <li>Ensure good lighting and a clean background</li>
                      <li>Film from side angle for swing analysis</li>
                      <li>Keep camera steady and focused on the player</li>
                      <li>Include the full swing from setup to follow-through</li>
                      <li>iPhone videos (MOV) and photos (HEIC) will be automatically converted</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Video Preview */}
              <Card className="bg-slate-900/30 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-emerald-400">Video Preview</CardTitle>
                  <CardDescription className="text-slate-400">
                    Review your uploaded video before analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {videoSrc ? (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden">
                      <video 
                        ref={videoRef}
                        src={videoSrc} 
                        controls 
                        className="w-full h-full" 
                        onLoadedData={() => captureThumbnail()}
                        onError={() => setError('Error loading video')}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-slate-800/50 rounded-xl flex items-center justify-center">
                      <p className="text-slate-500">No video selected</p>
                    </div>
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
            
            {savedVideos.length === 0 ? (
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
                {savedVideos.map(video => (
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
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="w-full max-w-4xl bg-slate-900 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-emerald-400">{selectedVideo.playerName}</h2>
              <Button 
                variant="ghost" 
                className="text-slate-400 hover:text-slate-200"
                onClick={() => setSelectedVideo(null)}
              >
                ×
              </Button>
            </div>
            
            <ScrollArea className="max-h-[calc(80vh-120px)]">
              <div className="p-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                  {selectedVideo.videoPreviewUrl ? (
                    <video 
                      src={selectedVideo.videoPreviewUrl} 
                      controls 
                      className="w-full h-full" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      Video preview not available
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">FILE DETAILS</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="bg-slate-800">
                      {selectedVideo.fileName}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-800">
                      {(selectedVideo.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-800">
                      {formatDate(selectedVideo.dateUploaded)}
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">ANALYSIS NOTES</h3>
                  <div className="bg-slate-800 rounded-lg p-4 text-slate-200">
                    {selectedVideo.notes || "No analysis notes provided"}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    className="bg-red-600 hover:bg-red-500"
                    onClick={() => {
                      deleteVideo(selectedVideo.id);
                      setSelectedVideo(null);
                    }}
                  >
                    Delete Analysis
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerAnalysisPage; 
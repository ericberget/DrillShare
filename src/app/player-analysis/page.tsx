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
import { PlayerAnalysisVideo, VideoAnnotation } from '@/types/content';
import { Timestamp } from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { VideoAnnotationCanvas } from '@/components/VideoAnnotationCanvas';

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
  onEdit,
  formatDate 
}: { 
  video: PlayerAnalysisVideo, 
  onDelete: (id: string) => void, 
  onView: (video: PlayerAnalysisVideo) => void,
  onEdit: (video: PlayerAnalysisVideo) => void,
  formatDate: (timestamp: Timestamp | string | number) => string
}) => {
  return (
    <Card className="bg-slate-900/30 border-slate-700/50">
      <CardContent className="p-4">
        <div className={`bg-slate-800 rounded-lg overflow-hidden mb-4 ${
          video.orientation === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'
        }`}>
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
              className={`w-full h-full ${video.orientation === 'vertical' ? 'object-contain' : 'object-cover'}`}
              controls
            />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-100">{video.playerName}</h3>
          <p className="text-sm text-slate-400">Player: {video.category}</p>
          <p className="text-sm text-slate-400">Added: {formatDate(video.createdAt)}</p>
          {video.fileSize && (
            <p className="text-sm text-slate-400">
              Size: {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          )}
        </div>
        <div className="flex gap-1 mt-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            onClick={() => onView(video)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            View
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="flex-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            onClick={() => onEdit(video)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="flex-1 text-slate-500 hover:text-red-400 hover:bg-red-900/20"
            onClick={() => onDelete(video.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
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
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [videoType, setVideoType] = useState<'upload' | 'youtube'>('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [orientation, setOrientation] = useState<'landscape' | 'vertical'>('landscape');
  const [availablePlayers, setAvailablePlayers] = useState<string[]>([]);
  const [showPlayerInput, setShowPlayerInput] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, db, storage } = useFirebase();

  // Annotation-related state
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [videoAnnotations, setVideoAnnotations] = useState<VideoAnnotation[]>([]);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB max upload (before compression)
  const TARGET_COMPRESSED_SIZE = 50 * 1024 * 1024; // Target 50MB after compression (better quality)
  
  // Define accepted file types
  const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/mov'];
  const ACCEPTED_IMAGE_TYPES = ['image/heic', 'image/heif'];
  
  // Load videos from Firestore
  useEffect(() => {
    const loadVideos = async () => {
      if (!user || !db) return;

      try {
        const videosRef = collection(db, 'playerAnalysisVideos');
        const q = query(
          videosRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const videos = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as PlayerAnalysisVideo[];
        
        setSavedVideos(videos);
        
        // Extract unique player names for filtering, excluding old category values
        const playerNames = [...new Set(videos.map(video => video.category))]
          .filter(name => name !== 'hitting' && name !== 'pitching') // Exclude old category values
          .sort();
        setAvailablePlayers(playerNames);
        
      } catch (err) {
        console.error('Error loading videos:', err);
        setError('Failed to load videos');
      }
    };

    loadVideos();
  }, [user, db]);

  // Check URL hash for tab selection
  useEffect(() => {
    // Get hash from URL (e.g., #myvideos)
    const hash = window.location.hash?.substring(1) || '';
    
    // If hash is one of our valid tabs, set it as active
    if (hash === 'upload' || hash === 'myvideos') {
      setActiveTab(hash);
    }
    
    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash?.substring(1) || '';
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
      setError(`File size exceeds maximum limit of 500MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
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
    
    // Check if compression is needed
    if (file.size > TARGET_COMPRESSED_SIZE && file.type.startsWith('video/')) {
      setWarning(`Large file detected (${(file.size / 1024 / 1024).toFixed(2)}MB). Video will be compressed to 720p and optimized to ~50MB for efficient storage.`);
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
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError('File size exceeds 500MB limit');
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
  
  // Handle file upload to Firebase Storage
  const uploadToStorage = async (file: File): Promise<string> => {
    if (!storage || !user) {
      throw new Error('Storage not initialized or user not logged in');
    }

    try {
      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const storageRef = ref(storage, `player-analysis/${user.uid}/${fileName}`);
      
      // Use uploadBytes instead of uploadBytesResumable for testing
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
      
    } catch (err) {
      console.error('Error in uploadToStorage:', err);
      throw err;
    }
  };

  // Simplified video compression function using FFmpeg-like approach
  const compressVideo = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // If file is already small enough, don't compress
      if (file.size <= TARGET_COMPRESSED_SIZE) {
        resolve(file);
        return;
      }

      setWarning('Compressing video to 720p with good quality...');
      setIsConverting(true);

      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.onloadedmetadata = () => {
        // Compress to 720p but maintain good quality
        const aspectRatio = video.videoWidth / video.videoHeight;
        let targetWidth = video.videoWidth;
        let targetHeight = video.videoHeight;
        
        // Only reduce resolution if it's larger than 720p
        if (targetHeight > 720) {
          targetHeight = 720;
          targetWidth = Math.round(targetHeight * aspectRatio);
        }
        if (targetWidth > 1280) {
          targetWidth = 1280;
          targetHeight = Math.round(targetWidth / aspectRatio);
        }
        
        // For extremely large files, consider going to 540p
        const compressionRatio = TARGET_COMPRESSED_SIZE / file.size;
        if (compressionRatio < 0.05) {
          // Very aggressive compression needed - go to 540p
          if (targetHeight > 540) {
            targetHeight = 540;
            targetWidth = Math.round(targetHeight * aspectRatio);
          }
        }
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Calculate more generous bitrate for better quality
        const targetBitrate = Math.floor((TARGET_COMPRESSED_SIZE * 8) / video.duration * 0.8); // 80% for video
        const maxBitrate = Math.min(targetBitrate, 4000000); // Cap at 4Mbps for better quality
        const minBitrate = 1500000; // Minimum 1.5Mbps for decent quality
        const finalBitrate = Math.max(minBitrate, maxBitrate);
        
        const stream = canvas.captureStream(30); // Back to 30 FPS for smoother playback
        
        // Try different codecs based on browser support
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }
        }
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: finalBitrate
        });
        
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const compressedBlob = new Blob(chunks, { type: mimeType.split(';')[0] });
          const compressedFile = new File([compressedBlob], 
            file.name.replace(/\.[^/.]+$/, '_compressed.webm'), 
            { type: compressedBlob.type }
          );
          
          setIsConverting(false);
          setWarning('');
          
          console.log(`Compression complete: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (${targetWidth}x${targetHeight} @ ${(finalBitrate/1000000).toFixed(1)}Mbps)`);
          resolve(compressedFile);
        };
        
        mediaRecorder.onerror = (event) => {
          setIsConverting(false);
          setWarning('');
          reject(new Error('Video compression failed'));
        };
        
        // Start recording
        mediaRecorder.start();
        
        let currentTime = 0;
        const frameRate = 30;
        const frameDuration = 1 / frameRate;
        
        const drawFrame = () => {
          if (currentTime >= video.duration) {
            mediaRecorder.stop();
            return;
          }
          
          video.currentTime = currentTime;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
            currentTime += frameDuration;
            requestAnimationFrame(drawFrame);
          };
        };
        
        video.currentTime = 0;
        drawFrame();
      };
      
      video.onerror = () => {
        setIsConverting(false);
        setWarning('');
        reject(new Error('Video loading failed'));
      };
      
      video.src = URL.createObjectURL(file);
      video.load();
    });
  };

  // Save video analysis to Firestore
  const saveVideoAnalysis = async () => {
    if (!user || !db) {
      setError('You must be logged in to save videos');
      return;
    }

    if (!selectedPlayer || selectedPlayer === 'all' || selectedPlayer === '') {
      setError('Please select a player');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let videoUrl = '';
      let youtubeVideoId;

      if (videoType === 'youtube') {
        if (!youtubeUrl.trim()) {
          setError('Please enter a YouTube URL');
          return;
        }
        youtubeVideoId = extractYouTubeId(youtubeUrl);
        if (!youtubeVideoId) {
          setError('Invalid YouTube URL');
          return;
        }
        videoUrl = youtubeUrl;
      } else {
        if (!file) {
          setError('No video file to save');
          return;
        }
        
        try {
          // Compress video if needed
          let fileToUpload = file;
          if (file.size > TARGET_COMPRESSED_SIZE && file.type.startsWith('video/')) {
            setWarning('Compressing video to 720p with good quality...');
            fileToUpload = await compressVideo(file);
            setWarning(`Compression complete! Size reduced from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB (good quality 720p)`);
            
            // Brief delay to show compression success message
            await new Promise(resolve => setTimeout(resolve, 2000));
            setWarning('');
          }
          
          // Upload compressed file to Firebase Storage
          videoUrl = await uploadToStorage(fileToUpload);
        } catch (compressionError) {
          console.error('Compression failed:', compressionError);
          setError('Video compression failed. Uploading original file...');
          // Fall back to original file if compression fails
          videoUrl = await uploadToStorage(file);
        }
      }

      // Capture thumbnail if not already done
      const thumbnailUrl = thumbnail || captureThumbnail();

      // Create video data object and filter out undefined values
      const videoDataRaw = {
        userId: user.uid,
        playerName: selectedPlayer,
        category: selectedPlayer,
        videoType,
        videoUrl,
        thumbnailUrl,
        notes,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        orientation,
        ...(file ? { fileSize: file.size, fileName: file.name } : {}),
        ...(videoType === 'youtube' ? { youtubeVideoId } : {})
      };

      // Create properly typed video data
      const videoData: Omit<PlayerAnalysisVideo, 'id'> = {
        userId: user.uid,
        playerName: selectedPlayer,
        category: selectedPlayer,
        videoType,
        videoUrl,
        notes,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        orientation,
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(file && { fileSize: file.size, fileName: file.name }),
        ...(videoType === 'youtube' && youtubeVideoId && { youtubeVideoId })
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'playerAnalysisVideos'), videoData);
      const newVideo = { ...videoData, id: docRef.id } as PlayerAnalysisVideo;
      
      setSavedVideos(prev => [newVideo, ...prev]);
      
      // Reset form
      setFile(null);
      setVideoSrc('');
      setNotes('');
      setThumbnail(undefined);
      setSelectedPlayer('');
      setYoutubeUrl('');
      setVideoType('upload');
      setOrientation('landscape');
      setShowPlayerInput(false);
      setNewPlayerName('');
      
      // Redirect to My Videos tab after successful save
      handleTabChange('myvideos');
      
    } catch (err) {
      console.error('Error saving video:', err);
      setError('Failed to save video. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete video
  const deleteVideo = async (id: string) => {
    if (!user || !db) return;

    try {
      // Get the video data first
      const videoDoc = doc(db, 'playerAnalysisVideos', id);
      const video = savedVideos.find(v => v.id === id);

      if (!video) return;

      // If it's an uploaded video, delete from storage
      if (video.videoType === 'upload' && storage) {
        try {
          const storageRef = ref(storage, video.videoUrl);
          await deleteObject(storageRef);
        } catch (err) {
          console.error('Error deleting from storage:', err);
        }
      }

      // Delete from Firestore
      await deleteDoc(videoDoc);

      // Update state
      setSavedVideos(prev => prev.filter(v => v.id !== id));

    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video');
    }
  };

  // Update video
  const updateVideo = async (id: string) => {
    if (!user || !db) return;

    setIsSaving(true);
    setError('');

    try {
      const videoDoc = doc(db, 'playerAnalysisVideos', id);
      
      // Only update if player is not 'all'
      if (selectedPlayer === 'all' || selectedPlayer === '') {
        setError('Please select a specific player');
        return;
      }

      const updates = {
        playerName: selectedPlayer,
        category: selectedPlayer,
        notes,
        orientation,
        updatedAt: Timestamp.now()
      };

      await updateDoc(videoDoc, updates);

      // Update local state
      setSavedVideos(prev => prev.map(v => 
        v.id === id ? { ...v, ...updates } : v
      ));

      // Reset form
      setFile(null);
      setVideoSrc('');
      setNotes('');
      setThumbnail(undefined);
      setSelectedPlayer('');
      setYoutubeUrl('');
      setVideoType('upload');
      setOrientation('landscape');
      setShowPlayerInput(false);
      setNewPlayerName('');
      setSelectedVideo(null);

      // Redirect to My Videos tab after successful update
      handleTabChange('myvideos');

    } catch (err) {
      console.error('Error updating video:', err);
      setError('Failed to update video');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (timestamp: Timestamp | string | number) => {
    const date = timestamp instanceof Timestamp 
      ? timestamp.toDate() 
      : new Date(timestamp);
      
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEditVideo = (video: PlayerAnalysisVideo) => {
    setSelectedVideo(video);
    setNotes(video.notes || '');
    setSelectedPlayer(video.category);
    setOrientation(video.orientation || 'landscape');
    setVideoType(video.videoType);
    if (video.videoType === 'youtube') {
      setYoutubeUrl(video.videoUrl);
    } else {
      setVideoSrc(video.videoUrl);
    }
    handleTabChange('upload');
  };

  // Annotation handling functions
  const handleAnnotationSave = async (annotation: VideoAnnotation) => {
    if (!selectedVideo || !user || !db) return;

    try {
      // Add annotation to local state
      setVideoAnnotations(prev => [...prev, annotation]);

      // Update video in Firestore with new annotation
      const videoRef = doc(db, 'playerAnalysisVideos', selectedVideo.id);
      const updatedAnnotations = [...(selectedVideo.annotations || []), annotation];
      
      await updateDoc(videoRef, {
        annotations: updatedAnnotations,
        updatedAt: Timestamp.now()
      });

      // Update local selectedVideo state
      setSelectedVideo(prev => prev ? {
        ...prev,
        annotations: updatedAnnotations
      } : null);

    } catch (error) {
      console.error('Error saving annotation:', error);
      setError('Failed to save annotation');
    }
  };

  const handleVideoTimeUpdate = () => {
    if (modalVideoRef.current) {
      setCurrentVideoTime(modalVideoRef.current.currentTime);
    }
  };

  const toggleAnnotationMode = () => {
    setIsAnnotationMode(!isAnnotationMode);
    if (modalVideoRef.current && !isAnnotationMode) {
      // Pause video when entering annotation mode
      modalVideoRef.current.pause();
    }
  };

  // Load annotations when video is selected
  useEffect(() => {
    if (selectedVideo && selectedVideo.annotations) {
      setVideoAnnotations(selectedVideo.annotations);
    } else {
      setVideoAnnotations([]);
    }
  }, [selectedVideo]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/30 bg-gradient-to-b from-slate-900/95 to-slate-950/95">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {activeTab === 'upload' && selectedVideo ? (
                <button 
                  onClick={() => {
                    setSelectedVideo(null);
                    setNotes('');
                    setSelectedPlayer('');
                    setOrientation('landscape');
                    setVideoType('upload');
                    setVideoSrc('');
                    setYoutubeUrl('');
                    setFile(null);
                    handleTabChange('myvideos');
                  }}
                  className="flex items-center gap-4 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 19-7-7 7-7"/>
                    <path d="M19 12H5"/>
                  </svg>
                  <span className="font-medium">Back to My Videos</span>
                </button>
              ) : (
                <Link href="/" className="flex items-center gap-4 text-emerald-400 hover:text-emerald-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 19-7-7 7-7"/>
                    <path d="M19 12H5"/>
                  </svg>
                  <span className="font-medium">Back to DrillShare</span>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold text-slate-400">FILM ROOM</h1>
                <p className="text-slate-400">Upload player videos for analysis</p>
              </div>
              <Button 
                onClick={() => handleTabChange('upload')}
                className="bg-slate-600 hover:bg-slate-700 text-white flex items-center gap-2"
                size="lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Upload Video
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsContent value="upload" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card className="bg-slate-900/30 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-400">Upload Video</CardTitle>
                  <CardDescription className="text-slate-400">
                    Upload videos (max 500MB) for swing analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Video Type Toggle */}
                  <div className="mb-6">
                    <Label className="text-slate-300">Video Source</Label>
                    <div className="flex gap-3 mt-2">
                      <Button
                        variant={videoType === 'upload' ? 'default' : 'outline'}
                        className={`flex-1 ${videoType === 'upload' ? 'bg-slate-600 hover:bg-slate-700 text-white' : 'border-slate-700 text-slate-400 hover:text-slate-300 hover:bg-slate-800'}`}
                        onClick={() => setVideoType('upload')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload File
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${videoType === 'youtube' ? 'bg-slate-800 text-slate-300' : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/50'}`}
                        onClick={() => setVideoType('youtube')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                          <path d="m10 15 5-3-5-3z"/>
                        </svg>
                        YouTube
                      </Button>
                    </div>
                  </div>

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
                            Accepts MP4, MOV videos and HEIC images up to 500MB
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
                            src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl) || ''}`}
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
                    <Label htmlFor="player" className="text-slate-300 mb-3 block">Select Player</Label>
                    <div className="space-y-3">
                      {/* Player Selection Dropdown */}
                      <div className="relative">
                        <select
                          value={selectedPlayer}
                          onChange={(e) => {
                            if (e.target.value === 'new') {
                              setShowPlayerInput(true);
                              setSelectedPlayer('');
                            } else {
                              setSelectedPlayer(e.target.value);
                              setShowPlayerInput(false);
                            }
                          }}
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                          <option value="">Select a player...</option>
                          {availablePlayers.map(player => (
                            <option key={player} value={player}>{player}</option>
                          ))}
                          <option value="new">+ Add New Player</option>
                        </select>
                      </div>
                      
                      {/* New Player Input */}
                      {showPlayerInput && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Enter new player name"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-slate-100"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-slate-600 hover:bg-slate-700 text-white"
                              onClick={() => {
                                if (newPlayerName.trim()) {
                                  setSelectedPlayer(newPlayerName.trim());
                                  setAvailablePlayers(prev => [...prev, newPlayerName.trim()].sort());
                                  setNewPlayerName('');
                                  setShowPlayerInput(false);
                                }
                              }}
                            >
                              Add Player
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-700 text-slate-400 hover:text-slate-300"
                              onClick={() => {
                                setShowPlayerInput(false);
                                setNewPlayerName('');
                                setSelectedPlayer('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Selected Player Display */}
                      {selectedPlayer && selectedPlayer !== 'all' && !showPlayerInput && (
                        <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-md border border-slate-700">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-slate-300">Selected: {selectedPlayer}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="orientation" className="text-slate-300 mb-3 block">Video Orientation</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={orientation === 'landscape' ? 'default' : 'outline'}
                        className={`h-auto p-4 flex flex-col items-center gap-2 relative ${
                          orientation === 'landscape' 
                            ? 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600' 
                            : 'border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500'
                        }`}
                        onClick={() => setOrientation('landscape')}
                      >
                        {orientation === 'landscape' && (
                          <div className="absolute top-2 right-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        )}
                        <div className="w-8 h-5 border-2 border-current rounded-sm flex items-center justify-center">
                          <div className="w-2 h-1 bg-current rounded-sm"></div>
                        </div>
                        <span className="text-sm font-medium">Landscape</span>
                        <span className="text-xs opacity-75">16:9 ratio</span>
                      </Button>
                      <Button
                        variant={orientation === 'vertical' ? 'default' : 'outline'}
                        className={`h-auto p-4 flex flex-col items-center gap-2 relative ${
                          orientation === 'vertical' 
                            ? 'bg-slate-600 hover:bg-slate-700 text-white border-slate-600' 
                            : 'border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-500'
                        }`}
                        onClick={() => setOrientation('vertical')}
                      >
                        {orientation === 'vertical' && (
                          <div className="absolute top-2 right-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        )}
                        <div className="w-5 h-8 border-2 border-current rounded-sm flex items-center justify-center">
                          <div className="w-1 h-2 bg-current rounded-sm"></div>
                        </div>
                        <span className="text-sm font-medium">Vertical</span>
                        <span className="text-xs opacity-75">9:16 ratio</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Section */}
              <Card className="bg-slate-900/30 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-400">Preview</CardTitle>
                  <CardDescription className="text-slate-400">
                    Review your video before saving
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`${
                    videoType === 'youtube' 
                      ? 'aspect-video' 
                      : orientation === 'vertical' 
                        ? 'aspect-[9/16]' 
                        : 'aspect-video'
                  } bg-slate-800 rounded-xl overflow-hidden`}>
                    {videoType === 'youtube' ? (
                      youtubeUrl ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl) || ''}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-slate-400">Enter a YouTube URL to preview</p>
                        </div>
                      )
                    ) : (
                      videoSrc ? (
                        <video
                          ref={videoRef}
                          src={videoSrc}
                          className={`w-full h-full ${orientation === 'vertical' ? 'object-contain' : 'object-cover'}`}
                          controls
                          onTimeUpdate={handleTimeUpdate}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-slate-400">Upload a video to preview</p>
                        </div>
                      )
                    )}
                  </div>
                  
                  {(videoSrc || selectedVideo) && (
                    <div className="mt-4 space-y-4">
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
                          className="bg-slate-600 hover:bg-slate-700 text-white"
                          onClick={() => {
                            if (selectedVideo) {
                              // We're editing an existing video
                              updateVideo(selectedVideo.id);
                            } else {
                              // We're creating a new video
                              saveVideoAnalysis();
                            }
                          }}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {selectedVideo ? 'Updating...' : 'Saving...'}
                            </>
                          ) : (selectedVideo ? 'Update' : 'Save')}
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
              <h2 className="text-xl font-bold text-slate-400 mb-2">My Saved Videos</h2>
              <p className="text-slate-400">View and manage your saved video analyses</p>
            </div>
            
            {/* Player Filter */}
            <div className="mb-6">
              <Label className="text-slate-300 mb-3 block">Filter by Player</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedPlayer === 'all' ? 'default' : 'outline'}
                  className={`${selectedPlayer === 'all' ? 'bg-slate-600 hover:bg-slate-700' : 'border-slate-700 text-slate-400 hover:text-slate-300'}`}
                  onClick={() => setSelectedPlayer('all')}
                >
                  All Players ({savedVideos.length})
                </Button>
                {availablePlayers.map(player => (
                  <Button
                    key={player}
                    variant={selectedPlayer === player ? 'default' : 'outline'}
                    className={`${selectedPlayer === player ? 'bg-slate-600 hover:bg-slate-700' : 'border-slate-700 text-slate-400 hover:text-slate-300'}`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    {player} ({savedVideos.filter(v => v.category === player).length})
                  </Button>
                ))}
              </div>
            </div>
            
            {savedVideos.filter(video => selectedPlayer === 'all' || video.category === selectedPlayer).length === 0 ? (
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
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  {selectedPlayer === 'all' ? 'No videos saved yet' : `No videos for ${selectedPlayer}`}
                </h3>
                <p className="text-slate-400 mb-4">
                  {selectedPlayer === 'all' 
                    ? 'Upload a video and save your analysis to see it here'
                    : `Upload and assign videos to ${selectedPlayer} to see them here`
                  }
                </p>
                <Button 
                  className="bg-slate-600 hover:bg-slate-700 text-white"
                  onClick={() => handleTabChange('upload')}
                >
                  Upload a Video
                </Button>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-0">
                {savedVideos
                  .filter(video => selectedPlayer === 'all' || video.category === selectedPlayer)
                  .map(video => (
                    <div key={video.id} className="break-inside-avoid mb-6">
                      <VideoCard 
                        video={video}
                        onDelete={deleteVideo}
                        onView={setSelectedVideo}
                        onEdit={handleEditVideo}
                        formatDate={formatDate}
                      />
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Video Detail Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-900/90 border-slate-700/50 max-w-5xl w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-400">{selectedVideo.playerName}</CardTitle>
                  <CardDescription className="text-slate-400">
                    Player: {selectedVideo.category}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={isAnnotationMode ? 'default' : 'outline'}
                    size="sm"
                    className={`${
                      isAnnotationMode 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                    onClick={toggleAnnotationMode}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    {isAnnotationMode ? 'Exit Annotation' : 'Annotate'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden mb-4">
                {selectedVideo.videoType === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeVideoId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <video
                      ref={modalVideoRef}
                      src={selectedVideo.videoUrl}
                      className="w-full h-full"
                      controls={!isAnnotationMode}
                      onTimeUpdate={handleVideoTimeUpdate}
                      style={{
                        pointerEvents: isAnnotationMode ? 'none' : 'auto'
                      }}
                    />
                    <VideoAnnotationCanvas
                      videoElement={modalVideoRef.current}
                      isAnnotationMode={isAnnotationMode}
                      onAnnotationSave={handleAnnotationSave}
                      existingAnnotations={videoAnnotations}
                      currentTime={currentVideoTime}
                    />
                  </>
                )}
              </div>
              
              {isAnnotationMode && (
                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 mb-2">
                        <strong>Annotation Mode Active</strong> - Draw directly on the video to highlight swing mechanics
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div>• <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">L</kbd> Line tool</div>
                        <div>• <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">C</kbd> Circle tool</div>
                        <div>• <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">A</kbd> Arrow tool</div>
                        <div>• <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">F</kbd> Freehand tool</div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        💡 Tip: Pause the video first, then draw. Annotations are saved automatically at the current timestamp.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Notes</Label>
                  <p className="text-slate-300 mt-2">{selectedVideo.notes || 'No notes available'}</p>
                </div>
                
                {videoAnnotations.length > 0 && (
                  <div>
                    <Label className="text-slate-300">Annotations ({videoAnnotations.length})</Label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {videoAnnotations.map((annotation, index) => (
                        <div key={annotation.id} className="flex items-center gap-2 text-sm">
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: annotation.color }}
                          />
                          <span className="text-slate-400">
                            {Math.floor(annotation.timestamp / 60)}:{(annotation.timestamp % 60).toFixed(1).padStart(4, '0')}s
                          </span>
                          <span className="text-slate-300 capitalize">{annotation.tool}</span>
                          {annotation.notes && (
                            <span className="text-slate-400 text-xs">- {annotation.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-slate-800">
                    Player: {selectedVideo.category}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-800">
                    {formatDate(selectedVideo.createdAt)}
                  </Badge>
                  {selectedVideo.fileSize && (
                    <Badge variant="secondary" className="bg-slate-800">
                      {(selectedVideo.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </Badge>
                  )}
                  {videoAnnotations.length > 0 && (
                    <Badge variant="secondary" className="bg-emerald-800">
                      {videoAnnotations.length} annotation{videoAnnotations.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:text-slate-100"
                onClick={() => {
                  setSelectedVideo(null);
                  setIsAnnotationMode(false);
                  setVideoAnnotations([]);
                }}
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
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentItem } from '@/types/content';
import { getCollectionByShareLink } from '@/services/collectionService';
import { getContentItemsByIds } from '@/services/contentService';
import { formatTimestamp } from '@/lib/utils';
import { Lock, Loader2, Video, Play, ChevronLeft, ChevronRight, Copy, Check, Clock, ArrowRight, Eye } from 'lucide-react';
import Image from 'next/image';
import { ContentDetails } from '@/components/ContentDetails';

export default function SharedCollectionPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const shareLink = `${window.location.origin}/share/collections/${shareId}`;
  
  const [collection, setCollection] = useState<any>(null);
  const [collectionVideos, setCollectionVideos] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideosLoading, setIsVideosLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if collection is expired
  const isCollectionExpired = (): boolean => {
    if (!collection?.expirationDate) return false;
    return new Date() > collection.expirationDate.toDate();
  };

  // Load collection videos
  const loadCollectionVideos = async (collection: any) => {
    if (!collection || !collection.videos || collection.videos.length === 0) {
      setCollectionVideos([]);
      return;
    }

    try {
      setIsVideosLoading(true);
      console.log('Loading videos for collection:', collection.videos);
      const videos = await getContentItemsByIds(collection.videos);
      console.log('Loaded videos:', videos);
      setCollectionVideos(videos);
    } catch (error) {
      console.error('Error loading collection videos:', error);
      setCollectionVideos([]);
    } finally {
      setIsVideosLoading(false);
    }
  };

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
          // Load the videos for this collection
          await loadCollectionVideos(collection);
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
  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setPasswordError('Please enter the password');
      return;
    }
    
    setPasswordError(null);
    
    try {
      // Verify password
      const collection = await getCollectionByShareLink(shareLink);
      if (collection && collection.password === password) {
        setCollection(collection);
        setIsPasswordRequired(false);
        // Load the videos for this collection
        await loadCollectionVideos(collection);
      } else {
        setPasswordError('Incorrect password');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setPasswordError('Error verifying password');
    }
  };

  // Handle content selection
  const handleContentSelection = (content: ContentItem) => {
    setSelectedContent(content);
  };

  // Handle content details close
  const handleCloseDetails = () => {
    setSelectedContent(null);
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

  // Copy share link
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Get skill level color
  const getSkillLevelColor = (skillLevel: string) => {
    switch (skillLevel) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Video Card Component
  const VideoCard = ({ video }: { video: ContentItem }) => {
    const youtubeId = getYouTubeVideoId(video.url);
    const thumbnailUrl = video.thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/0.jpg` : null);
    
    return (
      <Card 
        className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 cursor-pointer transition-all duration-200 hover:border-slate-600/50"
        onClick={() => handleContentSelection(video)}
      >
        <CardHeader className="pb-3">
          <div className="aspect-video bg-slate-700 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800"></div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
              <Play className="w-12 h-12 text-white relative z-10" />
            </div>
          </div>
          <CardTitle className="text-lg text-slate-100 line-clamp-2">{video.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{video.description}</p>
          <div className="flex items-center justify-between mb-3">
            <Badge className={getSkillLevelColor(video.skillLevel)}>
              {video.skillLevel}
            </Badge>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              {video.category}
            </Badge>
          </div>
          <div className="flex gap-1 flex-wrap">
            {video.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                {tag}
              </Badge>
            ))}
            {video.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                +{video.tags.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <div className="w-[400px] mx-auto">
            <Image
              src="/logo.png"
              alt="DrillShare Logo"
              width={400}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 max-w-md w-full text-center">
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
        <div className="mb-8">
          <div className="w-[400px] mx-auto">
            <Image
              src="/logo.png"
              alt="DrillShare Logo"
              width={400}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 max-w-md w-full">
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
        <div className="mb-8">
          <div className="w-[400px] mx-auto">
            <Image
              src="/logo.png"
              alt="DrillShare Logo"
              width={400}
              height={400}
              className="w-full h-auto"
            />
          </div>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 max-w-md w-full text-center">
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

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="w-[400px] mx-auto mb-6">
            <Image
              src="/logo.png"
              alt="DrillShare Logo"
              width={400}
              height={400}
              className="w-full h-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{collection.name}</h1>
          <p className="text-slate-400 text-lg">
            Shared on {formatTimestamp(collection.createdAt)}
          </p>
        </div>

        {collection.description && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <p className="text-slate-300 text-center whitespace-pre-wrap leading-relaxed">
                {collection.description}
              </p>
            </div>
          </div>
        )}

        {/* Video Gallery */}
        {isVideosLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading videos...</p>
            </div>
          </div>
        ) : collectionVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 max-w-md mx-auto">
              <Video className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Videos Found</h3>
              <p className="text-slate-400">Videos added to this collection will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collectionVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {/* Share Section - Moved to bottom and made more subtle */}
        <div className="max-w-2xl mx-auto mt-16 mb-8">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-lg font-medium text-slate-300 mb-3 text-center">Share This Collection</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg py-2 px-3 text-slate-400 font-mono text-xs">
                {shareLink}
              </div>
              <Button 
                size="sm"
                variant="outline"
                className={`border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 ${
                  copiedLink ? 'bg-slate-700 text-white' : ''
                }`}
                onClick={copyShareLink}
              >
                {copiedLink ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copiedLink ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-slate-500 text-xs text-center mt-2">
              Anyone with this link can view the collection without signing in.
            </p>
          </div>
        </div>

        {/* Footer CTA for Non-Authenticated Users */}
        <div className="relative mt-20 bg-slate-950">
          <div className="absolute inset-0 bg-gradient-radial from-slate-800/20 via-transparent to-transparent" />
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" 
            style={{ backgroundImage: 'url(/bgCoach.jpg)' }} 
          />
          <div className="relative z-10 py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <Image
                  src="/logo.png"
                  alt="DrillShare Logo"
                  width={300}
                  height={300}
                  className="mx-auto w-full max-w-[200px] h-auto opacity-90"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Create Your Own Training Collections
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Build, organize, and share your own drill libraries with DrillShare. 
                Join thousands of coaches transforming their training programs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 transform transition-all duration-200 hover:scale-105"
                  asChild
                >
                  <a href="/">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-slate-400 text-slate-200 hover:bg-slate-800/50 hover:text-white text-lg px-8 py-6"
                  asChild
                >
                  <a href="/demo">
                    Try Demo
                    <Eye className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
              <p className="text-slate-400 text-sm mt-6">
                No credit card required • Start organizing your drills today
              </p>
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
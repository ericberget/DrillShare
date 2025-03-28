'use client';

import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Button } from './ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  orientation?: 'landscape' | 'vertical';
}

// Helper function to extract video info
function extractVideoInfo(url: string): { platform: string; id: string | null } {
  // YouTube standard URL
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&#]+)/);
  if (match) return { platform: 'youtube', id: match[1] };

  // YouTube Shorts URL
  match = url.match(/youtube\.com\/shorts\/([^/?&]+)/);
  if (match) return { platform: 'youtube-shorts', id: match[1] };

  // Facebook Video URL - different patterns
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    // Try to extract Facebook video ID from various URL formats
    match = url.match(/facebook\.com\/(?:watch\/\?v=|video\.php\?v=|watch\?v=)(\d+)/);
    if (match) return { platform: 'facebook', id: match[1] };
    
    match = url.match(/facebook\.com\/[^/]+\/videos\/(\d+)/);
    if (match) return { platform: 'facebook', id: match[1] };
    
    match = url.match(/fb\.watch\/([^/]+)/);
    if (match) return { platform: 'facebook', id: match[1] };
    
    // If we have a Facebook URL but couldn't extract the ID
    return { platform: 'facebook', id: null };
  }

  return { platform: 'unknown', id: null };
}

export default function VideoPlayer({ url, orientation = 'landscape' }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{ platform: string; id: string | null }>({ platform: 'unknown', id: null });
  
  // Detect video type when URL changes
  useEffect(() => {
    const info = extractVideoInfo(url);
    setVideoInfo(info);
    setError(null);
    setIsLoading(true);
    
    // For Facebook videos, show a warning
    if (info.platform === 'facebook') {
      setError('Facebook videos may require opening in a browser.');
    }
  }, [url]);

  return (
    <div className={`relative ${orientation === 'vertical' ? 'aspect-[9/16] max-h-[80vh]' : 'aspect-video'} w-full bg-slate-900 rounded-md overflow-hidden`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      )}
      
      {error || videoInfo.platform === 'facebook' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-4">
          <div className="relative w-full h-full group cursor-pointer" onClick={(e) => {
            e.preventDefault();
            window.open(url, '_blank');
          }}>
            {/* Custom thumbnail container */}
            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center transform transition-transform group-hover:scale-110">
                <svg 
                  className="w-8 h-8 text-white ml-1" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-medium">Click to watch on Facebook</span>
            </div>
          </div>
        </div>
      ) : (
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          controls={true}
          playing={false}
          playsinline={true}
          config={{
            youtube: {
              playerVars: { 
                modestbranding: 1,
                rel: 0
              }
            },
            facebook: {
              appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1234567890'
            }
          }}
          onBuffer={() => {
            setIsLoading(true);
            setError(null);
          }}
          onBufferEnd={() => setIsLoading(false)}
          onError={(e) => {
            console.error('Video playback error:', e);
            if (videoInfo.platform === 'facebook') {
              setError('This Facebook video cannot be played here. Please click below to view it directly on Facebook.');
            } else {
              setError('Unable to play this video. The video may be private or no longer available.');
            }
            setIsLoading(false);
          }}
          onReady={() => {
            setIsLoading(false);
            setError(null);
          }}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            margin: orientation === 'vertical' ? '0 auto' : '0',
            aspectRatio: orientation === 'vertical' ? '9/16' : '16/9'
          }}
        />
      )}
    </div>
  );
} 
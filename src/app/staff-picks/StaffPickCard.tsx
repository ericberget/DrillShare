import React from 'react';
import { ContentItem } from '@/types/content';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StaffPickCardProps {
  content: ContentItem;
  onSelect: (content: ContentItem) => void;
}

export function StaffPickCard({ content, onSelect }: StaffPickCardProps) {
  // Extract YouTube video ID for thumbnail
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1).split(/[\?&#]/)[0];
      }
    } catch (e) {
      console.error('Invalid URL:', e);
    }
    return null;
  };

  const youtubeId = getYouTubeVideoId(content.url);

  return (
    <Card 
      className={`group cursor-pointer h-full flex flex-col rounded-xl border-2 border-emerald-800 bg-white/85 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden`}
      onClick={() => onSelect(content)}
    >
      <CardHeader className="p-4 pb-0 flex-grow text-emerald-900">
        <div className="flex flex-col gap-4 h-full">
          <CardTitle className="text-xl font-semibold font-oswald text-emerald-900">
            {content.title}
          </CardTitle>
          <div className={`aspect-video w-full relative rounded-xl overflow-hidden ring-1 ${content.isSample ? 'ring-drillhub-600/30' : 'ring-slate-700/50'}`}>
            {content.thumbnailUrl ? (
              <img 
                src={content.thumbnailUrl}
                alt="Custom thumbnail"
                className="w-full h-full object-cover"
              />
            ) : youtubeId ? (
              <img 
                src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full relative bg-slate-800 flex items-center justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  content.isSample ? 'bg-drillhub-600/80' : 'bg-drillhub-500/80'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-emerald-900/80 line-clamp-2 group-hover:opacity-100 transition-opacity duration-200">
            {content.description}
          </div>
          <div className="flex justify-center mt-4 mb-4">
            <Button
              className="bg-emerald-700 text-white font-semibold px-4 py-2 rounded shadow-md hover:bg-emerald-800 border border-emerald-700"
              onClick={(e) => {
                e.stopPropagation();
                alert('Add to My Library (coming soon)');
              }}
            >
              Add to My Library
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
} 
import React from 'react';
import { ContentItem } from '@/types/content';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/contexts/FirebaseContext';

interface ContentCardProps {
  content: ContentItem;
  onSelect: (content: ContentItem) => void;
  onFavoriteToggle: (e: React.MouseEvent, contentId: string) => void;
  onTagClick: (tag: string, e: React.MouseEvent) => void;
  activeTag: string | null;
  onEdit?: (content: ContentItem) => void;
}

export function ContentCard({ 
  content, 
  onSelect, 
  onFavoriteToggle, 
  onTagClick, 
  activeTag,
  onEdit
}: ContentCardProps) {
  const { user } = useFirebase();
  // Extract YouTube video ID for thumbnail
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

  const youtubeId = getYouTubeVideoId(content.url);

  // Function to get initials from the creator name or email
  const getInitials = (userId: string) => {
    if (!userId) return '?';
    return userId.substring(0, 2).toUpperCase();
  };

  return (
    <Card 
      className={`cursor-pointer h-full flex flex-col rounded-xl border-2 hover:border-drillhub-500/30 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden ${
        content.isSample 
          ? 'bg-slate-800/50 border-drillhub-700/30 hover:bg-slate-700/50' 
          : 'bg-slate-900/30 border-slate-700/50 hover:bg-slate-800/40'
      }`}
      onClick={() => onSelect(content)}
    >
      {content.isSample && (
        <div className="absolute -right-8 -top-8 w-16 h-16 rotate-45 bg-drillhub-600 z-10"></div>
      )}
      
      {/* Edit Button - only shown for user's own content */}
      {user && user.uid === content.userId && !content.isSample && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(content);
          }}
          className="absolute top-2 right-2 z-20 bg-slate-800/80 hover:bg-slate-700 text-emerald-600 hover:text-emerald-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </Button>
      )}
      
      {/* Favorite Star Button */}
      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1">
        {content.isTeamContent && (
          <div className="w-6 h-6 rounded-full bg-slate-800/90 flex items-center justify-center text-emerald-500" title="Program Content">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
            </svg>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => onFavoriteToggle(e, content.id)}
          className="text-slate-500/70 hover:text-slate-400/90"
        >
          {content.favorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          )}
        </Button>
      </div>
      
      <CardHeader className="p-4 pb-0 flex-grow">
        <div className="flex flex-col gap-4 h-full">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-semibold text-emerald-600 line-clamp-2 tracking-normal font-oswald">
              {content.title}
            </CardTitle>
            {content.isSample && (
              <div className="flex items-center gap-1 z-20">
                <Badge variant="outline" className="border-drillhub-700 text-drillhub-400 bg-drillhub-900/30 flex items-center gap-1 font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Sample
                </Badge>
              </div>
            )}
          </div>
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
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                content.isSample ? 'bg-drillhub-600/80' : 'bg-drillhub-500/80'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="white">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            {content.isSample && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-drillhub-900/70 to-transparent h-12 flex items-end">
                <span className="text-xs text-drillhub-200 p-2 font-medium">Sample Content</span>
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-slate-300 line-clamp-2">
            {content.description}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
            {content.tags.slice(0, 3).map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className={`text-xs cursor-pointer ${
                  activeTag === tag
                    ? 'bg-drillhub-900/50 text-drillhub-300 hover:bg-drillhub-900/70'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-200'
                }`}
                onClick={(e) => onTagClick(tag, e)}
              >
                {tag}
              </Badge>
            ))}
            {content.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                +{content.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
} 
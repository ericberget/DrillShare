'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ContentItem } from '@/types/content';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatTimestamp } from '@/lib/utils';
import { CategoryColors } from '@/lib/constants';
import VideoPlayer from './VideoPlayer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ContentDetailsProps {
  content: ContentItem;
  onClose: () => void;
  onEdit?: (content: ContentItem) => void;
}

// Helper function to get initials
const getInitials = (userId: string) => {
  if (!userId) return '?';
  return userId.substring(0, 2).toUpperCase();
};

export function ContentDetails({ content, onClose, onEdit }: ContentDetailsProps) {
  const categoryColor = CategoryColors[content.category] || 'bg-drillhub-600';

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl bg-slate-900/95 backdrop-blur-md border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-drillhub-400">
            {content.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center gap-2 my-1">
          <Badge className={`${categoryColor}`}>
            {content.category.charAt(0).toUpperCase() + content.category.slice(1)}
          </Badge>
          <Badge variant="outline" className="border-slate-700 text-slate-300">
            {content.skillLevel.charAt(0).toUpperCase() + content.skillLevel.slice(1)}
          </Badge>
          {content.isSample && (
            <Badge className="bg-blue-500/30 text-blue-300 border border-blue-500/20">
              Sample
            </Badge>
          )}
        </div>
        
        {content.description && (
          <p className="text-slate-300 text-sm mb-4">{content.description}</p>
        )}
        
        <div className="p-6">
          {/* Remove the creator info section */}
          
          <div className="rounded-md overflow-hidden mb-6">
            <VideoPlayer url={content.url} orientation={content.orientation} />
          </div>
          
          {content.tags && content.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-slate-400 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {content.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="bg-slate-800 text-slate-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          {onEdit && (
            <Button 
              variant="outline"
              onClick={() => onEdit(content)}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
            >
              Edit
            </Button>
          )}
          <Button 
            onClick={onClose}
            className="bg-drillhub-600 hover:bg-drillhub-700 text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
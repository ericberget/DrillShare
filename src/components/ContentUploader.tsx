'use client';

import React, { useState, useEffect } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { ContentCategory, SkillLevel, ContentOrientation, ContentItem } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStorage } from '@/hooks/useStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash } from 'lucide-react';

interface ContentUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void; // Callback for when content is deleted
  existingContent?: ContentItem; // Add support for editing existing content
}

// Function to extract video IDs from different video platforms
function extractVideoInfo(url: string): { platform: string; id: string | null } {
  // YouTube standard URL
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\?&#]+)/);
  if (match) return { platform: 'youtube', id: match[1] };

  // YouTube Shorts URL
  match = url.match(/youtube\.com\/shorts\/([^/?&]+)/);
  if (match) return { platform: 'youtube-shorts', id: match[1] };

  // Facebook Video URL - different patterns
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    // Try to extract Facebook video ID from various URL formats
    match = url.match(/facebook\.com\/(?:watch\/?v=|video\.php\?v=|watch\?v=)(\d+)/);
    if (match) return { platform: 'facebook', id: match[1] };
    
    match = url.match(/facebook\.com\/[^/]+\/videos\/(\d+)/);
    if (match) return { platform: 'facebook', id: match[1] };
    
    match = url.match(/fb\.watch\/([^/]+)/);
    if (match) return { platform: 'facebook', id: match[1] };
    
    // If we have a Facebook URL but couldn't extract the ID
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return { platform: 'facebook', id: null };
    }
  }

  // Improved extraction for youtu.be links with query params/fragments
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return { platform: 'youtube', id: urlObj.pathname.slice(1).split(/[\?&#]/)[0] };
    }
  } catch (e) {}

  return { platform: 'unknown', id: null };
}

// Thumbnail generator for different platforms
function generateThumbnailUrl(url: string): string | null {
  const { platform, id } = extractVideoInfo(url);
  
  if ((platform === 'youtube' || platform === 'youtube-shorts') && id) {
    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  }
  
  // Facebook doesn't provide easy thumbnail access via URL
  return null;
}

export function ContentUploader({ isOpen, onClose, onDelete, existingContent }: ContentUploaderProps) {
  const { addContent, updateContent, deleteContent } = useContent();
  const { uploadFile, progress } = useStorage();
  const { user } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [autoThumbnail, setAutoThumbnail] = useState<string | null>(null);
  const [useAutoThumbnail, setUseAutoThumbnail] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'hitting' as ContentCategory,
    skillLevel: 'beginner' as SkillLevel,
    tags: [] as string[],
    orientation: 'vertical' as ContentOrientation,
    thumbnailUrl: '',
    isSample: false,
    isTeamContent: false
  });

  // Initialize form with existing content if provided
  useEffect(() => {
    if (existingContent) {
      setIsEdit(true);
      setFormData({
        title: existingContent.title,
        url: existingContent.url,
        description: existingContent.description || '',
        category: existingContent.category,
        skillLevel: existingContent.skillLevel,
        tags: [...existingContent.tags],
        orientation: existingContent.orientation,
        thumbnailUrl: existingContent.thumbnailUrl || '',
        isSample: existingContent.isSample,
        isTeamContent: existingContent.isTeamContent || false
      });
      
      if (existingContent.thumbnailUrl) {
        setImagePreview(existingContent.thumbnailUrl);
      }
    }
  }, [existingContent]);

  // Check for auto-thumbnails when URL changes
  useEffect(() => {
    if (formData.url) {
      const thumbnail = generateThumbnailUrl(formData.url);
      setAutoThumbnail(thumbnail);
      
      // If we got a thumbnail and don't have a custom one, use it
      if (thumbnail && !imagePreview && !formData.thumbnailUrl) {
        setUseAutoThumbnail(true);
        setFormData(prev => ({ ...prev, thumbnailUrl: thumbnail }));
      }
    } else {
      setAutoThumbnail(null);
      setUseAutoThumbnail(false);
    }
  }, [formData.url, imagePreview]);

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      category: 'hitting',
      skillLevel: 'beginner',
      tags: [],
      orientation: 'vertical',
      thumbnailUrl: '',
      isSample: false,
      isTeamContent: false
    });
    setImagePreview(null);
    setNewTag('');
    setError(null);
    setIsEdit(false);
    setAutoThumbnail(null);
    setUseAutoThumbnail(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const fetchFacebookThumbnail = async (url: string) => {
    setError(null);
    try {
      const response = await fetch('/api/facebook-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Facebook thumbnail.');
      }
      
      if (data.thumbnailUrl) {
        setAutoThumbnail(data.thumbnailUrl);
      }
    } catch (err: any) {
      console.error("Error fetching Facebook thumbnail:", err);
      setError(`Facebook API Error: ${err.message}`);
      setAutoThumbnail(null);
    }
  };

  const handleDelete = async () => {
    if (!existingContent) return;
    
    if (window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      setIsSubmitting(true);
      try {
        await deleteContent(existingContent.id);
        // Call onDelete callback if provided, otherwise just close
        if (onDelete) {
          onDelete();
        } else {
          onClose();
        }
      } catch (error) {
        console.error('Error deleting content:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete content');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUseAutoThumbnail = () => {
    if (autoThumbnail) {
      setUseAutoThumbnail(true);
      setImagePreview(autoThumbnail);
      setFormData(prev => ({ ...prev, thumbnailUrl: autoThumbnail }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setUseAutoThumbnail(false);
      setIsSubmitting(true);
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file (jpg, png, etc.)');
      }
      
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error(`Image too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum size is 5MB.`);
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (!user) {
        throw new Error('You must be logged in to upload images');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);
      
      const path = `thumbnails/${user.uid}/${Date.now()}_${file.name}`;
      formData.append('path', path);
      
      console.log("Starting upload to API route with file:", {
        name: file.name,
        size: file.size,
        type: file.type,
        path
      });
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        let responseData;
        const responseText = await response.text();
        console.log('Raw API response:', responseText);

        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse API response:', e);
          throw new Error('Invalid response from server');
        }

        if (!response.ok) {
          console.error('API error response:', responseData);
          throw new Error(responseData.details || responseData.error || 'Failed to upload image');
        }

        if (!responseData.url) {
          throw new Error('No URL returned from the API');
        }

        console.log('Upload successful:', responseData);
        setFormData(prev => ({ ...prev, thumbnailUrl: responseData.url }));

      } catch (uploadError: any) {
        console.error('Upload request failed:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

    } catch (error: any) {
      console.error('Image upload error:', error);
      setImagePreview(null);
      setError(`Failed to upload image: ${error.message}`);
      if (e.target) {
        e.target.value = '';
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setFormData(prev => ({ ...prev, url: newUrl }));

    const { platform } = extractVideoInfo(newUrl);

    if (platform === 'youtube' || platform === 'youtube-shorts') {
      const thumbnail = generateThumbnailUrl(newUrl);
      setAutoThumbnail(thumbnail);
    } else if (platform === 'facebook') {
      fetchFacebookThumbnail(newUrl);
    } 
    else {
      setAutoThumbnail(null);
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

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const validateVideo = (): boolean => {
    if (!formData.url.trim()) {
      setError('Please enter a video URL');
      return false;
    }
    
    const { platform } = extractVideoInfo(formData.url);
    if (platform === 'unknown') {
      setError('Unsupported video URL. Please use YouTube or Facebook video links.');
      return false;
    }

    // Additional validation for Facebook videos
    if (platform === 'facebook') {
      // Check if the URL is a valid Facebook video URL
      const isValidFacebookUrl = /^https?:\/\/(www\.)?(facebook\.com|fb\.watch)\/.+/.test(formData.url);
      if (!isValidFacebookUrl) {
        setError('Please enter a valid Facebook video URL');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!validateVideo()) {
      return;
    }

    // If we have an auto-thumbnail and nothing else, use it
    if (autoThumbnail && !formData.thumbnailUrl) {
      setFormData(prev => ({ ...prev, thumbnailUrl: autoThumbnail }));
    }

    try {
      setIsSubmitting(true);
      
      // Check if it's at least a somewhat valid URL
      try {
        new URL(formData.url);
      } catch (e) {
        setError('Please enter a valid URL');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare the content object with proper video info
      const videoInfo = extractVideoInfo(formData.url);
      const contentToSave = {
        ...formData,
        videoType: videoInfo.platform
      };
      
      if (isEdit && existingContent) {
        // Update existing content
        await updateContent({
          ...existingContent,
          ...contentToSave
        });
      } else {
        // Create new content
        await addContent(contentToSave);
      }
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving content:', error);
      setError(error instanceof Error ? error.message : 'Failed to save content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-md border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-400">
            {isEdit ? 'Edit Content' : 'Add New Content'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-4">
            {/* Left Column: Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">Title</Label>
                <Input 
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter content title"
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-slate-300">Video URL</Label>
                <Input 
                  id="url"
                  value={formData.url}
                  onChange={handleUrlChange}
                  placeholder="YouTube or Facebook URL"
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                />
                 <p className="text-xs text-slate-400">Supports YouTube, YouTube Shorts, and Facebook videos</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Description</Label>
                <Textarea 
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter a description of this content"
                  className="bg-slate-800 border-slate-700 min-h-24 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-300">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: ContentCategory) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger id="category" className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200 max-h-[200px] sm:max-h-[300px]">
                      <SelectItem value="hitting">Hitting</SelectItem>
                      <SelectItem value="infield">Infield</SelectItem>
                      <SelectItem value="pitching">Pitching</SelectItem>
                      <SelectItem value="catching">Catching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillLevel" className="text-slate-300">Skill Level</Label>
                  <Select 
                    value={formData.skillLevel} 
                    onValueChange={(value: SkillLevel) => setFormData(prev => ({ ...prev, skillLevel: value }))}
                  >
                    <SelectTrigger id="skillLevel" className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectValue placeholder="Select a skill level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200 max-h-[200px] sm:max-h-[300px]">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="littleLeague">Little League</SelectItem>
                      <SelectItem value="highLevel">High Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>

            {/* Right Column: Thumbnail and Settings */}
            <div className="space-y-4">
               <div>
                <Label htmlFor="thumbnail" className="text-slate-300">Thumbnail Image</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full aspect-video mb-2">
                      <img 
                        src={imagePreview} 
                        alt="Thumbnail preview" 
                        className="rounded-md w-full h-full object-cover ring-1 ring-slate-700"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-slate-800 border border-slate-700 rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-700 relative">
                      <input
                        type="file"
                        id="thumbnail"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isSubmitting}
                      />
                      <div className="text-center">
                        <div className="text-3xl mb-2">🖼️</div>
                        <div className="text-sm text-slate-400">Click to upload custom thumbnail</div>
                      </div>
                    </div>
                  )}
                  {autoThumbnail && !imagePreview && (
                    <div className="mt-2 text-center">
                       <Button
                          onClick={handleUseAutoThumbnail}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Use Auto Thumbnail
                        </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orientation" className="text-slate-300">Video Orientation</Label>
                <Select 
                  value={formData.orientation}
                  onValueChange={(value: ContentOrientation) => setFormData(prev => ({ ...prev, orientation: value }))}
                >
                  <SelectTrigger id="orientation" className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-200 max-h-[200px] sm:max-h-[300px]">
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                 <Label className="text-slate-300">Tags</Label>
                 <div className="flex flex-wrap gap-2 mb-2">
                   {formData.tags.map(tag => (
                     <Badge 
                       key={tag}
                       variant="secondary"
                       className="cursor-pointer bg-slate-800 text-slate-200 hover:bg-slate-700"
                       onClick={() => handleRemoveTag(tag)}
                     >
                       {tag} ×
                     </Badge>
                   ))}
                 </div>
                 <div className="flex gap-2">
                   <Input
                     placeholder="Add a tag"
                     value={newTag}
                     onChange={(e) => setNewTag(e.target.value)}
                     className="flex-1 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                     disabled={isSubmitting}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         e.preventDefault();
                         handleAddTag();
                       }
                     }}
                   />
                   <Button 
                     type="button" 
                     onClick={handleAddTag} 
                     className="bg-emerald-600 hover:bg-emerald-700"
                     disabled={isSubmitting}
                   >
                     Add
                   </Button>
                 </div>
               </div>
            </div>
          </div>
          <div className="flex justify-between gap-4 pt-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#519872] hover:bg-[#417a5a] text-white font-semibold shadow-none border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
'use client';

import React, { useState } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { ContentItem, ContentCategory, SkillLevel } from '@/types/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentLoader } from './ContentLoader';
import { ContentCard } from './ContentCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ContentGridProps {
  onAddContent: () => void;
  onSelectContent: (content: ContentItem) => void;
  onEditContent?: (content: ContentItem) => void;
}

export function ContentGrid({ onAddContent, onSelectContent, onEditContent }: ContentGridProps) {
  const { contentItems, userContentItems, sampleContentItems, isLoading, toggleFavorite, updateLastViewed } = useContent();
  const [activeCategory, setActiveCategory] = useState<'all' | ContentCategory>('all');
  const [skillLevelFilter, setSkillLevelFilter] = useState<'all' | SkillLevel>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Get filtered content based on active category, skill level, tag, and favorites
  const getFilteredContent = () => {
    let filtered = contentItems;
    
    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    
    // Apply skill level filter
    if (skillLevelFilter !== 'all') {
      filtered = filtered.filter(item => item.skillLevel === skillLevelFilter);
    }
    
    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(item => item.favorite === true);
    }
    
    // Apply tag filter
    if (activeTag) {
      filtered = filtered.filter(item => item.tags.includes(activeTag));
    }
    
    return filtered;
  };

  // Get all unique tags
  const getAllTags = () => {
    const tagsSet = new Set<string>();
    contentItems.forEach(item => {
      item.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  };

  // Handle tag click
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTag(currentTag => currentTag === tag ? null : tag);
  };

  // Handle content selection
  const handleContentSelection = (content: ContentItem) => {
    updateLastViewed(content.id);
    onSelectContent(content);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();
    toggleFavorite(contentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <Select
            value={skillLevelFilter}
            onValueChange={(value: typeof skillLevelFilter) => setSkillLevelFilter(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by skill level..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skill Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="littleLeague">Little League</SelectItem>
              <SelectItem value="highLevel">High Level</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="p-2 h-10 w-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span className="sr-only">Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-4 bg-slate-900 border-slate-700">
              <div className="space-y-4">
                <h4 className="font-medium text-emerald-400 mb-2">Filters</h4>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="favorites" 
                    checked={showFavoritesOnly}
                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                      setShowFavoritesOnly(checked === true);
                    }}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <Label htmlFor="favorites" className="text-slate-300">
                    <div className="flex items-center">
                      Favorites only
                      <svg className="ml-1.5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </Label>
                </div>
                
                <div className="pt-2">
                  <h5 className="text-sm font-medium text-slate-400 mb-2">Popular Tags</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {getAllTags().slice(0, 6).map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={`text-xs cursor-pointer ${
                          activeTag === tag
                            ? 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900/70'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-200'
                        }`}
                        onClick={() => setActiveTag(currentTag => currentTag === tag ? null : tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={onAddContent} className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-900">+ Add Content</Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/collections'} 
            className="w-full sm:w-auto border-emerald-600 text-emerald-600 hover:bg-emerald-950/50"
          >
            Collect & Share
          </Button>
        </div>
      </div>

      {/* Active tag display or favorites filter indication */}
      {(activeTag || showFavoritesOnly) && (
        <div className="p-2 bg-slate-800/50 border border-slate-700 rounded-md">
          <div className="flex items-center gap-3 text-emerald-400 font-medium">
            <span>Filtering by:</span>
            <div className="flex flex-wrap gap-2">
              {activeTag && (
                <Badge className="bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/70">
                  {activeTag}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTag(null);
                    }}
                    className="ml-3 hover:text-emerald-200 transition-colors"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {showFavoritesOnly && (
                <Badge className="bg-slate-700/80 text-white hover:bg-slate-600/80">
                  <div className="flex items-center">
                    <svg className="mr-1.5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Favorites
                    <button 
                      onClick={() => setShowFavoritesOnly(false)}
                      className="ml-3 hover:text-emerald-200 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <ContentLoader message="Loading your content..." />
      ) : (
        <Tabs defaultValue="all" onValueChange={(value) => setActiveCategory(value as 'all' | ContentCategory)}>
          <TabsList className="w-full bg-slate-800 flex">
            <TabsTrigger value="all" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6 mx-2 font-oswald">All</TabsTrigger>
            <TabsTrigger value="hitting" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6 mx-2 font-oswald">Hitting</TabsTrigger>
            <TabsTrigger value="infield" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6 mx-2 font-oswald">Infield</TabsTrigger>
            <TabsTrigger value="pitching" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6 mx-2 font-oswald">Pitching</TabsTrigger>
            <TabsTrigger value="catching" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6 mx-2 font-oswald">Catching</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredContent().map(content => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onSelect={handleContentSelection}
                  onFavoriteToggle={handleFavoriteToggle}
                  onTagClick={handleTagClick}
                  activeTag={activeTag}
                  onEdit={onEditContent}
                />
              ))}
              {getFilteredContent().length === 0 && (
                <div className="col-span-3 text-center py-12 text-slate-400">
                  No content found. Try adjusting your filters or adding new content.
                </div>
              )}
            </div>
          </TabsContent>

          {(['hitting', 'infield', 'pitching', 'catching'] as ContentCategory[]).map(category => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredContent().map(content => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onSelect={handleContentSelection}
                    onFavoriteToggle={handleFavoriteToggle}
                    onTagClick={handleTagClick}
                    activeTag={activeTag}
                    onEdit={onEditContent}
                  />
                ))}
                {getFilteredContent().length === 0 && (
                  <div className="col-span-3 text-center py-12 text-slate-400">
                    No content found in {category}. Try adjusting your filters or adding new content.
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
} 
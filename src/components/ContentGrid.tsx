'use client';

import React, { useState, useEffect } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { doc, getDoc } from 'firebase/firestore';
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
  const { user, db } = useFirebase();
  const { contentItems, userContentItems, sampleContentItems, isLoading, toggleFavorite, updateLastViewed } = useContent();
  const [activeCategory, setActiveCategory] = useState<'all' | ContentCategory>('all');
  const [skillLevelFilter, setSkillLevelFilter] = useState<'all' | SkillLevel>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showTeamContentOnly, setShowTeamContentOnly] = useState(false);

  // Load program settings when component mounts
  useEffect(() => {
    const loadProgramSettings = async () => {
      if (!user || !db) return;
      
      try {
        const programDoc = await getDoc(doc(db, 'programs', user.uid));
        if (programDoc.exists()) {
          const data = programDoc.data();
          if (data.defaultShowTeamContent) {
            setShowTeamContentOnly(true);
          }
        }
      } catch (error) {
        console.error('Error loading program settings:', error);
      }
    };

    loadProgramSettings();
  }, [user, db]);

  // Get filtered content based on active category, skill level, tag, and filters
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

    // Apply team content filter
    if (showTeamContentOnly) {
      filtered = filtered.filter(item => item.isTeamContent === true);
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
              <Button variant="outline" className="flex items-center gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-4 bg-slate-900 border-slate-700">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-400">Filters</h4>
                  {(activeTag || showFavoritesOnly || showTeamContentOnly) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-slate-400 hover:text-slate-300"
                      onClick={() => {
                        setActiveTag(null);
                        setShowFavoritesOnly(false);
                        setShowTeamContentOnly(false);
                      }}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="favorites" 
                      checked={showFavoritesOnly}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        setShowFavoritesOnly(checked === true);
                        if (checked === true) setShowTeamContentOnly(false);
                      }}
                      className="data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600"
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

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="teamContent" 
                      checked={showTeamContentOnly}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        setShowTeamContentOnly(checked === true);
                        if (checked === true) setShowFavoritesOnly(false);
                      }}
                      className="data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-600"
                    />
                    <Label htmlFor="teamContent" className="text-slate-300">
                      <div className="flex items-center">
                        My Program
                        <div className="ml-1.5 w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h20"></path>
                            <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path>
                            <path d="M12 8v8"></path>
                            <path d="M8 12h8"></path>
                          </svg>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="pt-2">
                    <h5 className="text-sm font-medium text-slate-400 mb-3">Popular Tags</h5>
                    <div className="flex flex-wrap gap-2">
                      {getAllTags().slice(0, 8).map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={`text-xs cursor-pointer transition-colors ${
                            activeTag === tag
                              ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70'
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
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={onAddContent} className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-900">+ Add Content</Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/collections'} 
            className="w-full sm:w-auto bg-slate-600 hover:bg-slate-700 text-white border-0"
          >
            Collect & Share
          </Button>
        </div>
      </div>

      {/* Active tag display or filters indication */}
      {(activeTag || showFavoritesOnly || showTeamContentOnly) && (
        <div className="p-2 bg-slate-800/50 border border-slate-700 rounded-md">
          <div className="flex items-center gap-3 text-slate-400 font-medium">
            <span>Filtering by:</span>
            <div className="flex flex-wrap gap-2">
              {activeTag && (
                <Badge className="bg-slate-700/50 text-slate-300 hover:bg-slate-600/70">
                  {activeTag}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTag(null);
                    }}
                    className="ml-3 hover:text-slate-200 transition-colors"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {showFavoritesOnly && (
                <Badge className="bg-slate-700/50 text-slate-300 hover:bg-slate-600/70">
                  <div className="flex items-center">
                    <svg className="mr-1.5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Favorites
                    <button 
                      onClick={() => setShowFavoritesOnly(false)}
                      className="ml-3 hover:text-slate-200 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </Badge>
              )}
              {showTeamContentOnly && (
                <Badge className="bg-slate-700/50 text-slate-300 hover:bg-slate-600/70">
                  <div className="flex items-center">
                    <div className="mr-1.5 w-3 h-3 rounded-full bg-slate-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h20"></path>
                        <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path>
                        <path d="M12 8v8"></path>
                        <path d="M8 12h8"></path>
                      </svg>
                    </div>
                    My Program
                    <button 
                      onClick={() => setShowTeamContentOnly(false)}
                      className="ml-3 hover:text-slate-200 transition-colors"
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
          <TabsList className="w-full flex justify-center gap-4 mb-12">
            <TabsTrigger 
              value="all" 
              className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300"
            >
              <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
              All
            </TabsTrigger>
            <TabsTrigger 
              value="hitting" 
              className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300"
            >
              <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
              Hitting
            </TabsTrigger>
            <TabsTrigger 
              value="infield" 
              className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300"
            >
              <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
              Infield
            </TabsTrigger>
            <TabsTrigger 
              value="pitching" 
              className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300"
            >
              <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
              Pitching
            </TabsTrigger>
            <TabsTrigger 
              value="catching" 
              className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300"
            >
              <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
              Catching
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-12">
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
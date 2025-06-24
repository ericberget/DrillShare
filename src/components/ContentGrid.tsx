'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useContent } from '@/contexts/ContentContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { doc, getDoc } from 'firebase/firestore';
import { ContentItem, ContentCategory, SkillLevel } from '@/types/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentLoader } from './ContentLoader';
import { ContentCard } from './ContentCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, Target, Users, Zap, Hand, Circle, GripVertical, RotateCcw, Star, List, Grid, SlidersHorizontal, PlusCircle, X } from 'lucide-react';
import { CategoryTransition, StaggerContainer, FadeInUp } from '@/components/animations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ContentGridProps {
  onAddContent: () => void;
  onSelectContent: (content: ContentItem) => void;
  onEditContent?: (content: ContentItem) => void;
}

// Category configuration with icons and descriptions
const categoryConfig = {
  all: {
    icon: Circle,
    title: 'All Content',
    description: 'Browse your complete video library across all baseball skills and techniques',
    gradient: 'from-slate-600 to-slate-700'
  },
  hitting: {
    icon: Target,
    title: 'Hitting',
    description: 'Batting techniques, swing mechanics, and offensive strategies',
    gradient: 'from-red-600 to-red-700'
  },
  infield: {
    icon: Users,
    title: 'Infield',
    description: 'Fielding fundamentals, positioning, and defensive plays',
    gradient: 'from-blue-600 to-blue-700'
  },
  pitching: {
    icon: Zap,
    title: 'Pitching',
    description: 'Throwing mechanics, pitch types, and mound strategies',
    gradient: 'from-green-600 to-green-700'
  },
  catching: {
    icon: Hand,
    title: 'Catching',
    description: 'Receiving techniques, framing, and game management',
    gradient: 'from-purple-600 to-purple-700'
  },
  favorites: {
    icon: Star,
    title: 'Favorites',
    description: 'Your hand-picked collection of top drills and videos',
    gradient: 'from-yellow-500 to-yellow-600'
  }
};

// Sortable Content Card Component
interface SortableContentCardProps {
  content: ContentItem;
  onSelect: (content: ContentItem) => void;
  onTagClick: (tag: string, e: React.MouseEvent) => void;
  activeTag: string | null;
  onEdit?: (content: ContentItem) => void;
  onFavoriteToggle?: (contentId: string, e: React.MouseEvent) => void;
  viewMode: 'grid' | 'list';
}

function SortableContentCard({ 
  content, 
  onSelect, 
  onTagClick, 
  activeTag,
  onEdit,
  onFavoriteToggle,
  viewMode
}: SortableContentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <ContentCard
        content={content}
        onSelect={onSelect}
        onTagClick={onTagClick}
        activeTag={activeTag}
        onEdit={onEdit}
        onFavoriteToggle={onFavoriteToggle}
        viewMode={viewMode}
      />
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 w-6 h-6 p-0 bg-slate-800/60 hover:bg-slate-700/80 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 group-hover:opacity-100 transition-all duration-200 z-10 mt-[4px]"
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}

export function ContentGrid({ onAddContent, onSelectContent, onEditContent }: ContentGridProps) {
  const { user, db } = useFirebase();
  const { contentItems, userContentItems, sampleContentItems, isLoading, toggleFavorite, updateLastViewed, updateSortOrders, resetSortOrders } = useContent();
  const [activeCategory, setActiveCategory] = useState<'all' | ContentCategory>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showTeamContentOnly, setShowTeamContentOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [programSettings, setProgramSettings] = useState<any>(null);
  const [activeSkillLevel, setActiveSkillLevel] = useState<SkillLevel | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sortOrder, setSortOrder] = useState<'manual' | 'date' | 'alphabetical'>('manual');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Enhanced filtering with search
  const getFilteredContent = () => {
    let filtered = contentItems;
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory);
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
    
    // Apply skill level filter
    if (activeSkillLevel) {
      filtered = filtered.filter(item => item.skillLevel === activeSkillLevel);
    }
    
    // Sort based on selected sort order
    switch (sortOrder) {
      case 'manual':
        // Sort by sortOrder (manual drag & drop order)
        return filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      case 'date':
        // Sort by creation date (newest first)
        return filtered.sort((a, b) => {
          const dateA = typeof a.createdAt === 'number' ? a.createdAt : 
                       a.createdAt instanceof Date ? a.createdAt.getTime() : 
                       a.createdAt?.toMillis?.() || 0;
          const dateB = typeof b.createdAt === 'number' ? b.createdAt : 
                       b.createdAt instanceof Date ? b.createdAt.getTime() : 
                       b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });
      case 'alphabetical':
        // Sort alphabetically by title
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
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
    setActiveTag(activeTag === tag ? null : tag);
  };

  // Handle content selection
  const handleContentSelection = (content: ContentItem) => {
    updateLastViewed(content.id);
    onSelectContent(content);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (contentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleFavorite(contentId);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const filteredContent = getFilteredContent();
      const oldIndex = filteredContent.findIndex(item => item.id === active.id);
      const newIndex = filteredContent.findIndex(item => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedContent = arrayMove(filteredContent, oldIndex, newIndex);
        
        // Create sort order updates
        const sortOrderUpdates = reorderedContent.map((item, index) => ({
          id: item.id,
          sortOrder: index + 1
        }));

        setIsReordering(true);
        try {
          await updateSortOrders(sortOrderUpdates);
        } catch (error) {
          console.error('Error updating sort orders:', error);
        } finally {
          setIsReordering(false);
        }
      }
    }
  };

  // Handle reset sort order
  const handleResetSortOrder = async () => {
    if (window.confirm("Are you sure you want to reset the manual sort order for all content?")) {
      await resetSortOrders();
    }
  };

  // Get content count for each category
  const getCategoryCount = (category: 'all' | ContentCategory | 'favorites') => {
    if (category === 'all') return contentItems.length;
    if (category === 'favorites') return contentItems.filter(c => c.favorite).length;
    return contentItems.filter(c => c.category === category).length;
  };

  const currentCategory = categoryConfig[activeCategory];
  const CurrentIcon = currentCategory.icon;

  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const filteredContent = getFilteredContent();

  const handleCategorySelect = (category: 'all' | ContentCategory | 'favorites') => {
    if (category === 'favorites') {
      setShowFavoritesOnly(true);
      setActiveCategory('all');
    } else {
      setShowFavoritesOnly(false);
      setActiveCategory(category);
    }
    setActiveTag(null);
  };

  // Mobile filter logic
  const activeFilterCount = [
    activeSkillLevel,
    showFavoritesOnly && 'fav',
    activeTag,
    searchQuery && 'search',
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-160px)]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800">
        <Button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 bg-slate-800 text-slate-200"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && <Badge className="ml-2">{activeFilterCount}</Badge>}
        </Button>
        <div className="flex items-center gap-2">
           <Button
            onClick={onAddContent}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Content</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </Button>
        </div>
      </div>

       {/* Mobile Filter Panel */}
       {isMobileFiltersOpen && (
        <div className="fixed inset-0 bg-slate-950 z-50 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Filters</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6">
            <input 
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder:text-slate-500 mb-4"
            />
             <div>
              <h3 className="text-sm font-semibold text-slate-400 px-2 mb-2">Categories</h3>
              {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
                 if (key === 'favorites' && userContentItems.filter(c => c.favorite).length === 0) {
                  return null;
                }
                const category = categoryConfig[key];
                const isFavoriteCategory = key === 'favorites';
                const isActive = showFavoritesOnly ? isFavoriteCategory : activeCategory === key;
                return (
                  <Button
                    key={key}
                    onClick={() => handleCategorySelect(key as any)}
                    variant="ghost"
                    className={`w-full justify-start items-center space-x-3 ${isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-300'}`}
                  >
                    <category.icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{category.title}</span>
                    <Badge variant="secondary" className="ml-auto bg-slate-700 text-slate-300">{getCategoryCount(key as any)}</Badge>
                  </Button>
                );
              })}
            </div>
            {/* Other filters like skill level can be added here */}
          </div>
           <Button onClick={() => setIsMobileFiltersOpen(false)} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700">Apply Filters</Button>
        </div>
      )}

      {/* Main content area (search/filter + grid) */}
      <div className="flex-1 flex flex-col">
        {/* Desktop: Search and filter bar above grid */}
        <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 w-full">
          <div className="flex-1">
            <input 
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform ${
                showFilters
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-blue-500/8 hover:border-blue-500/15 hover:text-blue-300 hover:shadow-md hover:shadow-blue-500/5 hover:scale-105'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Filters</span>
              {(activeSkillLevel || showFavoritesOnly || activeTag || searchQuery) && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {[activeSkillLevel, showFavoritesOnly && 'fav', activeTag, searchQuery && 'search'].filter(Boolean).length}
                </span>
              )}
              <svg className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>
            </div>
        {/* --- Mobile: Dropdown and Add Content button only --- */}
        <div className="md:hidden flex flex-col gap-2 p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Select value={activeCategory} onValueChange={v => handleCategorySelect(v as any)}>
              <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => (
                  <SelectItem key={key} value={key} className="flex items-center gap-2">
                    <span>{categoryConfig[key].title}</span>
                    <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">{getCategoryCount(key as any)}</Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={onAddContent}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              + Add Content
            </Button>
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      {isLoading ? (
        <ContentLoader message="Loading your content..." />
      ) : (
        <div className="mt-12">
          <CategoryTransition categoryKey={`${activeCategory}-${activeTag}-${showFavoritesOnly}-${showTeamContentOnly}-${activeSkillLevel}`}>
            {sortOrder === 'manual' ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={getFilteredContent().map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredContent().map((content, index) => (
                      <SortableContentCard
                        key={content.id}
                        content={content}
                        onSelect={handleContentSelection}
                        onTagClick={handleTagClick}
                        activeTag={activeTag}
                        onEdit={onEditContent}
                            onFavoriteToggle={handleFavoriteToggle}
                            viewMode={viewMode}
                      />
                    ))}
                    {getFilteredContent().length === 0 && (
                      <FadeInUp className="col-span-3 text-center py-12 text-slate-400">
                        <div>
                          No content found{activeCategory !== 'all' ? ` in ${activeCategory}` : ''}. Try adjusting your filters or adding new content.
                        </div>
                      </FadeInUp>
                    )}
                  </StaggerContainer>
                </SortableContext>
              </DndContext>
            ) : (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredContent().map((content, index) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onSelect={handleContentSelection}
                    onTagClick={handleTagClick}
                    activeTag={activeTag}
                    onEdit={onEditContent}
                        onFavoriteToggle={handleFavoriteToggle}
                        viewMode={viewMode}
                  />
                ))}
                {getFilteredContent().length === 0 && (
                  <FadeInUp className="col-span-3 text-center py-12 text-slate-400">
                    <div>
                      No content found{activeCategory !== 'all' ? ` in ${activeCategory}` : ''}. Try adjusting your filters or adding new content.
                    </div>
                  </FadeInUp>
                )}
              </StaggerContainer>
            )}
          </CategoryTransition>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Desktop Category Navigation */}
      <div className="hidden md:block w-64 p-4 space-y-2 bg-slate-900 border-r border-slate-800 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-sm font-semibold text-slate-400 px-2">Categories</h3>
            <Button
              onClick={onAddContent}
              size="sm"
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              <PlusCircle className="h-3 w-3" />
              Add
            </Button>
        </div>
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((key) => {
          if (key === 'favorites' && userContentItems.filter(c => c.favorite).length === 0) {
            return null; // Don't show favorites if there are none
          }
          const category = categoryConfig[key];
          const isActive = activeCategory === key;
          return (
            <Button
              key={key}
              onClick={() => setActiveCategory(key as any)}
              variant="ghost"
              className={`w-full justify-start items-center space-x-3 ${isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-300'}`}
            >
              <category.icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{category.title}</span>
              <Badge variant="secondary" className="ml-auto bg-slate-700 text-slate-300">{getCategoryCount(key as any)}</Badge>
            </Button>
          );
        })}
      </div>

      {isReordering && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-2">
          <Button
            onClick={handleResetSortOrder}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Reset Sort Order
          </Button>
        </div>
      )}
    </div>
  );
} 
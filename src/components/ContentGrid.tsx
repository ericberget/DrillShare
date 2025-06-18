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
import { ChevronDown, Target, Users, Zap, Hand, Circle, GripVertical, RotateCcw } from 'lucide-react';
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
  }
};

// Sortable Content Card Component
interface SortableContentCardProps {
  content: ContentItem;
  onSelect: (content: ContentItem) => void;
  onTagClick: (tag: string, e: React.MouseEvent) => void;
  activeTag: string | null;
  onEdit?: (content: ContentItem) => void;
}

function SortableContentCard({ 
  content, 
  onSelect, 
  onTagClick, 
  activeTag,
  onEdit 
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
    setIsReordering(true);
    try {
      await resetSortOrders();
    } catch (error) {
      console.error('Error resetting sort orders:', error);
    } finally {
      setIsReordering(false);
    }
  };

  // Get content count for each category
  const getCategoryCount = (category: 'all' | ContentCategory) => {
    if (category === 'all') {
      return contentItems.length;
    }
    return contentItems.filter(item => item.category === category).length;
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

  return (
    <div className="space-y-6 bg-[#0D1529]">
      <FadeInUp>
        {/* Top Row - Filters, Categories, and Add Content Button Alignment */}
        <div className="flex flex-row items-center justify-between gap-4 w-full">
          {/* Left: Filters & Sort */}
          <div className="flex gap-2">
            {/* Filters Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform ${
                showFilters || activeSkillLevel || showFavoritesOnly || activeTag || searchQuery
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-blue-500/8 hover:border-blue-500/15 hover:text-blue-300 hover:shadow-md hover:shadow-blue-500/5 hover:scale-105'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Filters
              {(activeSkillLevel || showFavoritesOnly || activeTag || searchQuery) && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {[activeSkillLevel, showFavoritesOnly && 'fav', activeTag, searchQuery && 'search'].filter(Boolean).length}
                </span>
              )}
              <svg className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 transform ${
                  showSettings
                    ? 'bg-slate-600/20 text-slate-300 border border-slate-500/30 shadow-lg shadow-slate-500/10'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-600/8 hover:border-slate-500/15 hover:text-slate-200 hover:shadow-md hover:shadow-slate-500/5 hover:scale-105'
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Sort
                <svg className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Settings Dropdown */}
              {showSettings && (
                <div ref={settingsDropdownRef} className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    <div className="text-xs text-slate-400 px-2 py-1">Sort Order</div>
                    <button
                      onClick={() => {
                        setSortOrder('manual');
                        setShowSettings(false);
                      }}
                      className={`w-full text-left px-2 py-2 rounded text-sm transition-colors ${
                        sortOrder === 'manual'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Manual (drag & drop)
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder('date');
                        setShowSettings(false);
                      }}
                      className={`w-full text-left px-2 py-2 rounded text-sm transition-colors ${
                        sortOrder === 'date'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Date (newest first)
                    </button>
                    <button
                      onClick={() => {
                        setSortOrder('alphabetical');
                        setShowSettings(false);
                      }}
                      className={`w-full text-left px-2 py-2 rounded text-sm transition-colors ${
                        sortOrder === 'alphabetical'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Alphabetical (A-Z)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Category Tabs */}
          <div className="flex-1 flex justify-center">
            <div className="flex gap-4">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const isActive = activeCategory === key;
                return (
                  <motion.button
                    key={key}
                    onClick={() => setActiveCategory(key as 'all' | ContentCategory)}
                    className={`min-w-[120px] px-8 py-3 font-oswald flex flex-col items-center text-base rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1c263b] text-white'
                        : 'hover:bg-slate-700/50 text-slate-300'
                    }`}
                    whileHover={{
                      scale: 1.05,
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{
                      scale: 0.95,
                      transition: { duration: 0.1 }
                    }}
                    animate={isActive ? {
                      scale: 1.02,
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                    } : {
                      scale: 1,
                      boxShadow: '0 0px 0px rgba(0, 0, 0, 0)',
                    }}
                  >
                    <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
                    {config.title === 'All Content' ? 'All Content' : config.title}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right: Add Content Button */}
          <div>
            <Button
              onClick={onAddContent}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              + Add Content
            </Button>
          </div>
        </div>

        {/* Add more space below the category tabs */}
        <div className="mb-8"></div>

        {/* Collapsible Filter Options with Search Bar inside */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ 
                opacity: 0,
                scaleY: 0,
                transformOrigin: "top"
              }}
              animate={{ 
                opacity: 1,
                scaleY: 1,
                transformOrigin: "top"
              }}
              exit={{ 
                opacity: 0,
                scaleY: 0,
                transformOrigin: "top"
              }}
              transition={{ 
                duration: 0.25,
                ease: [0.23, 1, 0.32, 1],
                opacity: { duration: 0.2 }
              }}
              className="overflow-hidden"
            >
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 relative overflow-hidden">
                {/* Faded background image */}
                <img src="/bg-5.jpg" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none" />
                <div className="flex flex-row gap-8 items-start w-full relative z-10">
                  {/* Left Column: Skill Level and Quick Filters */}
                  <div className="flex flex-col gap-4 flex-1 min-w-0">
                    {/* Skill Level Filters */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 mr-2 flex-shrink-0">Skill Level:</span>
                      <button
                        onClick={() => setActiveSkillLevel(activeSkillLevel === 'beginner' ? null : 'beginner')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 transform ${
                          activeSkillLevel === 'beginner'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-300 hover:shadow-md hover:shadow-blue-500/5 hover:scale-105'
                        }`}
                      >
                        Beginner
                      </button>
                      <button
                        onClick={() => setActiveSkillLevel(activeSkillLevel === 'littleLeague' ? null : 'littleLeague')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 transform ${
                          activeSkillLevel === 'littleLeague'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-yellow-500/10 hover:border-yellow-500/20 hover:text-yellow-300 hover:shadow-md hover:shadow-yellow-500/5 hover:scale-105'
                        }`}
                      >
                        Little League
                      </button>
                      <button
                        onClick={() => setActiveSkillLevel(activeSkillLevel === 'highLevel' ? null : 'highLevel')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 transform ${
                          activeSkillLevel === 'highLevel'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-300 hover:shadow-md hover:shadow-red-500/5 hover:scale-105'
                        }`}
                      >
                        High Level
                      </button>
                      <div className="h-6 w-px bg-slate-600 mx-2"></div>
                    </div>
                    {/* Quick Filters/Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 mr-1 flex-shrink-0">Quick Filters:</span>
                      <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 transform ${
                          showFavoritesOnly
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-300 hover:shadow-md hover:shadow-emerald-500/5 hover:scale-105'
                        }`}
                      >
                        <svg className="h-3 w-3" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Favorites
                      </button>
                      {getAllTags().slice(0, 4).map(tag => (
                        <button
                          key={tag}
                          onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 transform ${
                            activeTag === tag
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                              : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-purple-500/10 hover:border-purple-500/20 hover:text-purple-300 hover:shadow-md hover:shadow-purple-500/5 hover:scale-105'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    {/* Clear All Filters */}
                    {(activeSkillLevel || showFavoritesOnly || activeTag) && (
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            setActiveSkillLevel(null);
                            setShowFavoritesOnly(false);
                            setActiveTag(null);
                          }}
                          className="text-xs text-slate-400 hover:text-slate-200 underline"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Right Column: Search Bar */}
                  <div className="flex-1 flex items-center justify-end min-w-[260px]">
                    <div className="relative w-full max-w-xs">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FadeInUp>

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
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Filter, Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function DemoPage() {
  // Sample videos with the provided YouTube links
  const sampleVideos = {
    hitting: [
      {
        id: 'demo-1',
        title: 'Hitting Mechanics Fundamentals',
        url: 'https://www.youtube.com/watch?v=hoaiArCfav4',
        category: 'hitting',
        skillLevel: 'Little League',
        teachingCue: 'Essential hitting mechanics for developing players',
        tags: ['Little League', 'Mechanics', 'Fundamentals'],
        favorite: false
      },
      {
        id: 'demo-2',
        title: 'Fixing Casting in Your Swing',
        url: 'https://www.youtube.com/watch?v=GsP74PgqgPk',
        category: 'hitting',
        skillLevel: 'Little League',
        teachingCue: 'How to identify and correct casting in the swing',
        tags: ['Little League', 'Casting', 'Mechanics'],
        favorite: true
      },
      {
        id: 'demo-7',
        title: 'Bat Drag Correction Techniques',
        url: 'https://www.youtube.com/watch?v=rw7rZu160E0&t=431s',
        category: 'hitting',
        skillLevel: 'Intermediate',
        teachingCue: 'Learn to identify and fix bat drag in your swing',
        tags: ['Bat Drag', 'Mechanics', 'Swing Fix'],
        favorite: false
      },
      {
        id: 'demo-8',
        title: 'Optimal Bat Path Training',
        url: 'https://www.youtube.com/watch?v=-RTV8LHHFvI',
        category: 'hitting',
        skillLevel: 'Advanced',
        teachingCue: 'Understanding and developing the proper bat path through the zone',
        tags: ['Bat Path', 'Advanced', 'Swing Mechanics'],
        favorite: true
      },
      {
        id: 'demo-9',
        title: 'Advanced Hitting Techniques',
        url: 'https://www.youtube.com/watch?v=tBBjgzEGfRw',
        category: 'hitting',
        skillLevel: 'High Level',
        teachingCue: 'Advanced hitting concepts for serious players',
        tags: ['Advanced', 'High Level', 'Technique'],
        favorite: false
      }
    ],
    pitching: [
      {
        id: 'demo-3',
        title: 'A Guide to Youth Pitching',
        url: 'https://www.youtube.com/watch?v=4NOo7JSK6eA',
        category: 'pitching',
        skillLevel: 'Little League',
        teachingCue: 'Essential pitching fundamentals for young players',
        tags: ['Little League', 'Youth Pitching', 'Fundamentals'],
        favorite: false
      },
      {
        id: 'demo-10',
        title: 'Pitching Mechanics Masterclass',
        url: 'https://www.youtube.com/watch?v=JvsKsHS3cxQ',
        category: 'pitching',
        skillLevel: 'Advanced',
        teachingCue: 'Advanced pitching mechanics and delivery techniques',
        tags: ['Mechanics', 'Advanced', 'Delivery'],
        favorite: true
      }
    ],
    infield: [
      {
        id: 'demo-5',
        title: 'Double Play Fundamentals',
        url: 'https://youtu.be/DZcRRrq6jRI?si=xyWVKitbQ5bwqXVf&t=766',
        category: 'infield',
        skillLevel: 'High Level',
        teachingCue: 'Quick hands and footwork for turning two',
        tags: ['Double Play', 'Drills', 'Fundamentals'],
        favorite: true
      },
      {
        id: 'demo-6',
        title: 'Infield Training - 12U Skills',
        url: 'https://www.youtube.com/watch?v=eD5FBGs6jMY',
        category: 'infield',
        skillLevel: 'Little League',
        teachingCue: 'Essential infield skills and drills for Little League players',
        tags: ['Little League', 'Infield Skills', 'Training'],
        favorite: false
      }
    ],
    catching: [],
    other: []
  };

  // Demo state
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSignupOverlay, setShowSignupOverlay] = useState(false);
  const [filterInteractions, setFilterInteractions] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Animation state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [animatingTab, setAnimatingTab] = useState<string | null>(null);

  // Handle initial load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle tab change with animation
  const handleTabChange = (newTab: string) => {
    if (newTab !== activeTab) {
      setAnimatingTab(newTab);
      setTimeout(() => {
        setActiveTab(newTab);
        setAnimatingTab(null);
      }, 150);
    }
  };

  // Track filter interactions
  const handleFilterInteraction = () => {
    const newCount = filterInteractions + 1;
    setFilterInteractions(newCount);
    
    if (newCount >= 3 && !showSignupOverlay) {
      setTimeout(() => setShowSignupOverlay(true), 1000);
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      }
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      if (urlObj.pathname.includes('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1];
      }
    } catch (e) {
      console.error('Invalid URL:', e);
    }
    return null;
  };

  // Get all unique tags and skill levels for filters
  const getAllTags = () => {
    const tags = new Set();
    Object.values(sampleVideos).flat().forEach(video => {
      video.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  const getAllSkillLevels = () => {
    const levels = new Set();
    Object.values(sampleVideos).flat().forEach(video => {
      levels.add(video.skillLevel);
    });
    return Array.from(levels);
  };

  // Filter videos based on current filters
  const getFilteredVideos = (categoryVideos: any[]) => {
    return categoryVideos.filter((video: any) => {
      const matchesSkillLevel = selectedSkillLevel === 'all' || video.skillLevel === selectedSkillLevel;
      
      const matchesTag = selectedTag === 'all' || video.tags?.includes(selectedTag);
      
      const matchesFavorites = !showFavoritesOnly || video.favorite === true;
      
      return matchesSkillLevel && matchesTag && matchesFavorites;
    });
  };

  // Video card component
  const VideoCard = ({ video, index }: { video: any; index: number }) => {
    const youtubeId = getYouTubeVideoId(video.url);
    const animationDelay = isInitialLoad ? `${index * 100 + 200}ms` : `${index * 50}ms`;
    
    return (
      <Card 
        className={`bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 cursor-pointer transition-all duration-200 hover:border-slate-600/50 hover:scale-105 hover:shadow-xl ${
          isInitialLoad ? 'animate-fade-in opacity-0' : animatingTab ? 'animate-fade-out' : 'animate-fade-in'
        }`}
        style={{ 
          animationDelay: animationDelay,
          animationFillMode: 'forwards'
        }}
        onClick={() => setSelectedVideo(video)}
      >
        <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
          <div className="aspect-video bg-slate-700 rounded-lg mb-2 md:mb-3 flex items-center justify-center relative overflow-hidden">
            {youtubeId ? (
              <img 
                src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800"></div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
              <div className="w-8 md:w-12 h-8 md:h-12 bg-white/90 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
                <div className="w-0 h-0 border-l-[6px] md:border-l-[8px] border-l-slate-900 border-t-[4px] md:border-t-[6px] border-t-transparent border-b-[4px] md:border-b-[6px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
          <CardTitle className="text-base md:text-lg text-slate-100 line-clamp-2">{video.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-3 md:p-6">
          <p className="text-slate-400 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">{video.teachingCue}</p>
          <div className="flex items-center justify-between mb-2 md:mb-3 gap-2">
            <Badge className="bg-slate-700 text-slate-300 transition-colors duration-200 hover:bg-slate-600 text-xs">
              {video.category}
            </Badge>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300 transition-colors duration-200 hover:bg-slate-600 text-xs">
              {video.skillLevel}
            </Badge>
          </div>
          <div className="flex gap-1 flex-wrap">
            {video.tags?.filter((tag: string) => 
              tag !== 'Little League' && tag !== 'Advanced'
            ).slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-slate-700 text-slate-300 transition-colors duration-200 hover:bg-slate-600">
                {tag}
              </Badge>
            ))}
            {video.tags && video.tags.filter((tag: string) => 
              tag !== 'Little League' && tag !== 'Advanced'
            ).length > 2 && (
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 transition-colors duration-200 hover:bg-slate-600">
                +{video.tags.filter((tag: string) => 
                  tag !== 'Little League' && tag !== 'Advanced'
                ).length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Add Video Modal (Demo version)
  const AddVideoModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-md p-4 md:p-6 text-center">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-slate-400">Sign Up to Save Videos</h2>
        <p className="text-slate-300 mb-4 md:mb-6 text-sm md:text-base">
          You're using the demo version. Sign up for free to start building your own video library!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <Link href="/auth/signup">
            <Button className="bg-slate-600 hover:bg-slate-700 w-full sm:w-auto text-sm md:text-base">
              Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-slate-600 text-slate-300 w-full sm:w-auto text-sm md:text-base">
            Continue Demo
          </Button>
        </div>
      </div>
    </div>
  );

  // Signup Overlay
  const SignupOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-lg p-6 md:p-8 text-center border border-slate-500/20">
        <div className="mb-4 md:mb-6">
          <div className="w-12 md:w-16 h-12 md:h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Image src="/logo-small.png" alt="DrillShare" width={40} height={40} className="w-8 md:w-10 h-8 md:h-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-400 mb-2">Like what you see?</h2>
          <p className="text-slate-300 text-sm md:text-base">Sign up free to create your own library and unlock all features</p>
        </div>
        
        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-300 text-sm md:text-base">Save unlimited videos</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-300 text-sm md:text-base">Custom tags and categories</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-300 text-sm md:text-base">Share with your team</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/auth/signup" className="flex-1">
            <Button className="w-full bg-slate-600 hover:bg-slate-700 text-sm md:text-base">
              Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => setShowSignupOverlay(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm md:text-base"
          >
            Keep Exploring Demo
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className={`mb-8 md:mb-12 text-center ${isInitialLoad ? 'animate-fade-in opacity-0' : ''}`} style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
          <div className="w-full max-w-[300px] md:max-w-[400px] mx-auto mb-4 md:mb-6">
            <Image
              src="/logo.png"
              alt="DrillShare Logo"
              width={400}
              height={400}
              className="w-full h-auto"
            />
          </div>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-6 md:mb-8 text-sm md:text-base px-4">Browse and manage your baseball technique videos collection</p>
          
          {/* Sign Up Button */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-slate-500/20 text-slate-400 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium">
              DEMO MODE
            </div>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-200 hover:scale-105 text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className={`mb-6 md:mb-8 ${isInitialLoad ? 'animate-fade-in opacity-0' : ''}`} style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
              <Select value={selectedSkillLevel} onValueChange={(value) => {
                setSelectedSkillLevel(value);
                handleFilterInteraction();
              }}>
                <SelectTrigger className="w-full sm:w-40 bg-slate-800 border-slate-700 transition-all duration-200 hover:border-slate-600 text-sm md:text-base">
                  <SelectValue placeholder="All Skill Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skill Levels</SelectItem>
                  {(getAllSkillLevels() as string[]).map((level: string) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Demo Mode Badge and Add Content Button */}
            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto justify-center sm:justify-end">
              <Button onClick={() => setShowAddModal(true)} className="bg-slate-600 hover:bg-slate-700 transition-all duration-200 hover:scale-105 text-sm md:text-base px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto">
                + Add Content
              </Button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className={`w-full grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-6 md:mb-8 ${isInitialLoad ? 'animate-fade-in opacity-0' : ''}`} style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
            <TabsTrigger 
              value="all" 
              className="min-w-0 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-2 md:px-8 font-oswald flex flex-col items-center py-2 md:py-3 text-xs md:text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:scale-105"
            >
              <img src="/baseball.png" alt="Baseball" className="w-4 md:w-5 h-4 md:h-5 mb-1 md:mb-2 opacity-80" />
              All
            </TabsTrigger>
            <TabsTrigger 
              value="hitting" 
              className="min-w-0 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-2 md:px-8 font-oswald flex flex-col items-center py-2 md:py-3 text-xs md:text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:scale-105"
            >
              <img src="/baseball.png" alt="Baseball" className="w-4 md:w-5 h-4 md:h-5 mb-1 md:mb-2 opacity-80" />
              Hitting
            </TabsTrigger>
            <TabsTrigger 
              value="infield" 
              className="min-w-0 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-2 md:px-8 font-oswald flex flex-col items-center py-2 md:py-3 text-xs md:text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:scale-105"
            >
              <img src="/baseball.png" alt="Baseball" className="w-4 md:w-5 h-4 md:h-5 mb-1 md:mb-2 opacity-80" />
              Infield
            </TabsTrigger>
            <TabsTrigger 
              value="pitching" 
              className="min-w-0 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-2 md:px-8 font-oswald flex flex-col items-center py-2 md:py-3 text-xs md:text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:scale-105"
            >
              <img src="/baseball.png" alt="Baseball" className="w-4 md:w-5 h-4 md:h-5 mb-1 md:mb-2 opacity-80" />
              Pitching
            </TabsTrigger>
            <TabsTrigger 
              value="catching" 
              className="min-w-0 data-[state=active]:bg-slate-600 data-[state=active]:text-white px-2 md:px-8 font-oswald flex flex-col items-center py-2 md:py-3 text-xs md:text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300 hover:scale-105"
            >
              <img src="/baseball.png" alt="Baseball" className="w-4 md:w-5 h-4 md:h-5 mb-1 md:mb-2 opacity-80" />
              Catching
            </TabsTrigger>
          </TabsList>

          <div className="mt-8 md:mt-12">
            {/* All Videos Tab */}
            <TabsContent value="all" className={animatingTab === 'all' ? 'animate-fade-out' : 'animate-fade-in'}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Object.values(sampleVideos).flat().length > 0 ? (
                  getFilteredVideos(Object.values(sampleVideos).flat() as any[]).map((video: any, index: number) => (
                    <VideoCard key={video.id} video={video} index={index} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 md:py-12 text-slate-400">
                    <p className="mb-4 text-sm md:text-base">No videos available.</p>
                    <p className="text-xs md:text-sm">Sign up to start adding your own content!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Individual Category Tabs */}
            {Object.entries(sampleVideos).map(([category, categoryVideos]) => (
              <TabsContent key={category} value={category} className={animatingTab === category ? 'animate-fade-out' : 'animate-fade-in'}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {getFilteredVideos(categoryVideos as any[]).length > 0 ? (
                    getFilteredVideos(categoryVideos as any[]).map((video: any, index: number) => (
                      <VideoCard key={video.id} video={video} index={index} />
                    ))
                  ) : (categoryVideos as any[]).length === 0 ? (
                    <div className="col-span-full text-center py-8 md:py-12 text-slate-400 animate-fade-in">
                      <p className="mb-4 text-sm md:text-base">No sample videos in this category yet.</p>
                      <p className="text-xs md:text-sm">Sign up to start adding your own content!</p>
                    </div>
                  ) : (
                    <div className="col-span-full text-center py-8 md:py-12 text-slate-400 animate-fade-in">
                      <p className="text-sm md:text-base">No videos match your current filters.</p>
                      <Button
                        variant="outline"
                        className="mt-4 border-slate-600 text-slate-300 transition-all duration-200 hover:scale-105 text-sm md:text-base"
                        onClick={() => {
                          setSelectedSkillLevel('all');
                          setSelectedTag('all');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      {/* Video Details Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-40">
          <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-3 md:p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-slate-400 pr-4 line-clamp-2">{selectedVideo.title}</h2>
              <Button variant="ghost" onClick={() => setSelectedVideo(null)} className="flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 md:p-6">
              <div className="aspect-video bg-slate-700 mb-3 md:mb-4 flex flex-col items-center justify-center p-2 md:p-4 rounded">
                {getYouTubeVideoId(selectedVideo.url) ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.url)}`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded"
                  ></iframe>
                ) : (
                  <div className="text-center">
                    <p className="mb-3 md:mb-4 text-slate-300 text-sm md:text-base">Preview not available</p>
                    <a 
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 md:px-6 py-2 md:py-3 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors text-sm md:text-base"
                    >
                      Open Video
                    </a>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-slate-300 text-sm md:text-base">Teaching Notes:</h3>
                  <p className="text-slate-300 text-sm md:text-base">{selectedVideo.teachingCue}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-slate-300 text-sm md:text-base">Skill Level:</h3>
                  <Badge className="bg-slate-700 text-slate-300 text-xs md:text-sm">{selectedVideo.skillLevel}</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-slate-300 text-sm md:text-base">Tags:</h3>
                  <div className="flex gap-1 md:gap-2 flex-wrap">
                    {selectedVideo.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-700 text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <AddVideoModal />}
      {showSignupOverlay && <SignupOverlay />}
    </div>
  );
} 
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
  const [activeTab, setActiveTab] = useState('hitting');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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
      const matchesSearch = searchTerm === '' || 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.teachingCue.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSkillLevel = selectedSkillLevel === 'all' || video.skillLevel === selectedSkillLevel;
      
      const matchesTag = selectedTag === 'all' || video.tags?.includes(selectedTag);
      
      const matchesFavorites = !showFavoritesOnly || video.favorite === true;
      
      return matchesSearch && matchesSkillLevel && matchesTag && matchesFavorites;
    });
  };

  // Video card component
  const VideoCard = ({ video }: { video: any }) => {
    const youtubeId = getYouTubeVideoId(video.url);
    
    return (
      <Card className="mb-4 hover:bg-slate-800 cursor-pointer bg-slate-800/50 border-slate-700" onClick={() => setSelectedVideo(video)}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg text-slate-400">{video.title}</CardTitle>
            <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-400/30">
              {video.skillLevel}
            </Badge>
          </div>
          {youtubeId && (
            <img 
              src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
              alt="Video thumbnail"
              className="w-full mt-2 rounded"
            />
          )}
          <div className="text-sm text-gray-400 mt-2">{video.teachingCue}</div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {video.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="bg-slate-700">{tag}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Add Video Modal (Demo version)
  const AddVideoModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-md p-6 text-center">
        <h2 className="text-xl font-bold mb-4 text-slate-400">Sign Up to Save Videos</h2>
        <p className="text-slate-300 mb-6">
          You're using the demo version. Sign up for free to start building your own video library!
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button className="bg-slate-600 hover:bg-slate-700">
              Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-slate-600 text-slate-300">
            Continue Demo
          </Button>
        </div>
      </div>
    </div>
  );

  // Signup Overlay
  const SignupOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-lg p-8 text-center border border-slate-500/20">
        <div className="mb-6">
          <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image src="/logo-small.png" alt="DrillShare" width={40} height={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-400 mb-2">Like what you see?</h2>
          <p className="text-slate-300">Sign up free to create your own library and unlock all features</p>
        </div>
        
        <div className="space-y-4 mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-300">Save unlimited videos</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-300">Custom tags and categories</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
            <span className="text-slate-300">Share with your team</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/auth/signup" className="flex-1">
            <Button className="w-full bg-slate-600 hover:bg-slate-700">
              Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => setShowSignupOverlay(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Keep Exploring Demo
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image src="/logo-small.png" alt="DrillShare" width={120} height={120} className="h-8 w-auto" />
              </Link>
              <div className="bg-slate-500/20 text-slate-400 px-3 py-1 rounded-full text-sm font-medium">
                DEMO MODE
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowAddModal(true)} className="bg-slate-600 hover:bg-slate-700">
                + Add Video
              </Button>
              <Link href="/auth/signup">
                <Button variant="outline" className="border-slate-500 text-slate-400 hover:bg-slate-950">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-slate-800 bg-slate-850">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterInteraction();
                }}
                className="w-64 bg-slate-700 border-slate-600"
              />
            </div>
            
            <Select value={selectedSkillLevel} onValueChange={(value) => {
              setSelectedSkillLevel(value);
              handleFilterInteraction();
            }}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {getAllSkillLevels().map((level: string) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={(value) => {
              setSelectedTag(value);
              handleFilterInteraction();
            }}>
              <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {getAllTags().map((tag: string) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filterInteractions > 0 && (
              <div className="text-sm text-slate-400">
                Filters applied: {filterInteractions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex justify-center gap-4 mb-12">
            <TabsTrigger 
              value="hitting" 
              className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300"
            >
              <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
              Hitting ({getFilteredVideos(sampleVideos.hitting).length})
            </TabsTrigger>
            <TabsTrigger 
              value="pitching" 
              className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300"
            >
              <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
              Pitching ({getFilteredVideos(sampleVideos.pitching).length})
            </TabsTrigger>
            <TabsTrigger 
              value="infield" 
              className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300"
            >
              <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
              Infield ({getFilteredVideos(sampleVideos.infield).length})
            </TabsTrigger>
            <TabsTrigger 
              value="catching" 
              className="min-w-[120px] data-[state=active]:bg-slate-600 data-[state=active]:text-white px-8 font-oswald flex flex-col items-center py-3 text-base rounded-md transition-all duration-200 hover:bg-slate-700/50 text-slate-300"
            >
              <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
              Catching (0)
            </TabsTrigger>
          </TabsList>

          <div className="mt-12">
            {Object.entries(sampleVideos).map(([category, categoryVideos]) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredVideos(categoryVideos as any[]).length > 0 ? (
                    getFilteredVideos(categoryVideos as any[]).map((video: any) => (
                      <VideoCard key={video.id} video={video} />
                    ))
                  ) : (categoryVideos as any[]).length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400">
                      <p className="mb-4">No sample videos in this category yet.</p>
                      <p className="text-sm">Sign up to start adding your own content!</p>
                    </div>
                  ) : (
                    <div className="col-span-full text-center py-12 text-slate-400">
                      <p>No videos match your current filters.</p>
                      <Button
                        variant="outline"
                        className="mt-4 border-slate-600 text-slate-300"
                        onClick={() => {
                          setSearchTerm('');
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
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-400">{selectedVideo.title}</h2>
              <Button variant="ghost" onClick={() => setSelectedVideo(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-slate-700 mb-4 flex flex-col items-center justify-center p-4 rounded">
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
                    <p className="mb-4 text-slate-300">Preview not available</p>
                    <a 
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
                    >
                      Open Video
                    </a>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-slate-300">Teaching Notes:</h3>
                  <p className="text-slate-300">{selectedVideo.teachingCue}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-slate-300">Skill Level:</h3>
                  <Badge className="bg-slate-700 text-slate-300">{selectedVideo.skillLevel}</Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-slate-300">Tags:</h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedVideo.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-700">{tag}</Badge>
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
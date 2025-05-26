'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Clock, Users, Star } from 'lucide-react';

export default function TutorialLibraryPage() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const tutorialVideos = {
    'getting-started': [
      {
        id: 'tutorial-1',
        title: 'Getting Started with DrillShare',
        description: 'Learn the basics of navigating DrillShare and setting up your account',
        duration: '5:30',
        difficulty: 'Beginner',
        thumbnail: '/tutorial-thumbnails/getting-started.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        tags: ['Setup', 'Navigation', 'Basics']
      },
      {
        id: 'tutorial-2',
        title: 'Adding Your First Video',
        description: 'Step-by-step guide to adding YouTube videos to your library',
        duration: '3:45',
        difficulty: 'Beginner',
        thumbnail: '/tutorial-thumbnails/first-video.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        tags: ['Videos', 'Library', 'YouTube']
      },
      {
        id: 'tutorial-3',
        title: 'Understanding Tags and Categories',
        description: 'How to organize your content with effective tagging strategies',
        duration: '4:20',
        difficulty: 'Beginner',
        thumbnail: '/tutorial-thumbnails/tags-categories.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        tags: ['Organization', 'Tags', 'Categories']
      }
    ],
    'collections': [
      {
        id: 'tutorial-4',
        title: 'Creating Your First Collection',
        description: 'Learn how to group related videos into shareable collections',
        duration: '6:15',
        difficulty: 'Intermediate',
        thumbnail: '/tutorial-thumbnails/first-collection.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        tags: ['Collections', 'Organization', 'Sharing']
      },
      {
        id: 'tutorial-5',
        title: 'Sharing Collections with Your Team',
        description: 'How to share collections with players and coaching staff',
        duration: '4:50',
        difficulty: 'Intermediate',
        thumbnail: '/tutorial-thumbnails/sharing-collections.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        tags: ['Sharing', 'Team', 'Collaboration']
      }
    ],
    'player-analysis': [
      {
        id: 'tutorial-6',
        title: 'Player Analysis Basics',
        description: 'Introduction to uploading and analyzing player videos',
        duration: '7:30',
        difficulty: 'Intermediate',
        thumbnail: '/tutorial-thumbnails/player-analysis.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        tags: ['Analysis', 'Players', 'Video Upload']
      },
      {
        id: 'tutorial-7',
        title: 'Advanced Analysis Features',
        description: 'Using advanced tools for detailed player performance analysis',
        duration: '9:45',
        difficulty: 'Advanced',
        thumbnail: '/tutorial-thumbnails/advanced-analysis.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        tags: ['Advanced', 'Analysis', 'Performance']
      }
    ],
    'tips-tricks': [
      {
        id: 'tutorial-8',
        title: 'Power User Tips',
        description: 'Advanced tips and tricks to maximize your DrillShare experience',
        duration: '8:20',
        difficulty: 'Advanced',
        thumbnail: '/tutorial-thumbnails/power-tips.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        tags: ['Tips', 'Advanced', 'Productivity']
      },
      {
        id: 'tutorial-9',
        title: 'Keyboard Shortcuts',
        description: 'Learn time-saving keyboard shortcuts for faster navigation',
        duration: '3:15',
        difficulty: 'Intermediate',
        thumbnail: '/tutorial-thumbnails/shortcuts.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        tags: ['Shortcuts', 'Productivity', 'Navigation']
      }
    ]
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const VideoCard = ({ video }: { video: any }) => (
    <Card 
      className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 cursor-pointer transition-all duration-200 hover:border-slate-600/50"
      onClick={() => setSelectedVideo(video)}
    >
      <CardHeader className="pb-3">
        <div className="aspect-video bg-slate-700 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800"></div>
          <Play className="w-12 h-12 text-slate-300 relative z-10" />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        </div>
        <CardTitle className="text-lg text-slate-100 line-clamp-2">{video.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{video.description}</p>
        <div className="flex items-center justify-between mb-3">
          <Badge className={getDifficultyColor(video.difficulty)}>
            {video.difficulty}
          </Badge>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Clock className="w-3 h-3" />
            {video.duration}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {video.tags.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {tag}
            </Badge>
          ))}
          {video.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              +{video.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <img src="/logo-small.png" alt="DrillShare" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-100">Tutorial Library</h1>
                <p className="text-slate-400">Learn how to master DrillShare's features</p>
              </div>
            </div>
          </div>

          {/* Tutorial Tabs */}
          <Tabs defaultValue="getting-started" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="player-analysis">Player Analysis</TabsTrigger>
              <TabsTrigger value="tips-tricks">Tips & Tricks</TabsTrigger>
            </TabsList>

            {Object.entries(tutorialVideos).map(([category, videos]) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-100">{selectedVideo.title}</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedVideo(null)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="aspect-video bg-slate-700 rounded-lg mb-6">
                  <iframe
                    width="100%"
                    height="100%"
                    src={selectedVideo.videoUrl}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-300">{selectedVideo.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={getDifficultyColor(selectedVideo.difficulty)}>
                      {selectedVideo.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-4 h-4" />
                      {selectedVideo.duration}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {selectedVideo.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 
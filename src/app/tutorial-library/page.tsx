'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Users, Star } from 'lucide-react';

export default function TutorialLibraryPage() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const tutorialVideos = {
    'getting-started': [
      {
        id: 'tutorial-my-library',
        title: 'My Library Overview',
        description: 'Complete walkthrough of the My Library feature and how to organize your content',
        duration: 'TBD', // You can update this with the actual duration
        difficulty: 'Beginner',
        thumbnail: '/thumbnail-1.jpg',
        videoUrl: '/tutorial-videos/Tutorial_myLibrary.mp4'
      },
      {
        id: 'tutorial-1',
        title: 'Getting Started with DrillShare',
        description: 'Learn the basics of navigating DrillShare and setting up your account',
        duration: '5:30',
        difficulty: 'Beginner',
        thumbnail: '/tutorial-thumbnails/getting-started.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      },
      {
        id: 'tutorial-2',
        title: 'Adding Your First Video',
        description: 'Step-by-step guide to adding YouTube videos to your library',
        duration: '3:45',
        difficulty: 'Beginner',
        thumbnail: '/tutorial-thumbnails/first-video.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      },
      {
        id: 'tutorial-3',
        title: 'Understanding Tags and Categories',
        description: 'How to organize your content with effective tagging strategies',
        duration: '4:20',
        difficulty: 'Beginner',
        thumbnail: '/tutorial-thumbnails/tags-categories.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      }
    ],
    'collections': [
      {
        id: 'tutorial-4',
        title: 'Creating Your First Collection',
        description: 'Learn how to group related videos into shareable collections',
        duration: '6:15',
        difficulty: 'Intermediate',
        thumbnail: '/thumbnail-collections.jpg',
        videoUrl: '/tutorial-videos/collectionsTutorial.mp4'
      },
      {
        id: 'tutorial-5',
        title: 'Sharing Collections with Your Team',
        description: 'How to share collections with players and coaching staff',
        duration: '4:50',
        difficulty: 'Intermediate',
        thumbnail: '/tutorial-thumbnails/sharing-collections.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
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
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      },
      {
        id: 'tutorial-7',
        title: 'Advanced Analysis Features',
        description: 'Using advanced tools for detailed player performance analysis',
        duration: '9:45',
        difficulty: 'Advanced',
        thumbnail: '/tutorial-thumbnails/advanced-analysis.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
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
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      },
      {
        id: 'tutorial-9',
        title: 'Keyboard Shortcuts',
        description: 'Learn time-saving keyboard shortcuts for faster navigation',
        duration: '3:15',
        difficulty: 'Intermediate',
        thumbnail: '/tutorial-thumbnails/shortcuts.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      }
    ]
  };

  // Combine all videos from all categories into a single array
  const allTutorialsRaw = Object.values(tutorialVideos).flat();
  const collectionIndex = allTutorialsRaw.findIndex(v => v.videoUrl === '/tutorial-videos/collectionsTutorial.mp4');
  let allTutorials = allTutorialsRaw;
  if (collectionIndex > -1) {
    const [collectionTutorial] = allTutorialsRaw.splice(collectionIndex, 1);
    allTutorials = [allTutorialsRaw[0], collectionTutorial, ...allTutorialsRaw.slice(1)];
  }

  // After defining allTutorials, update the thumbnail for the collections tutorial
  allTutorials = allTutorials.map(tut =>
    tut.videoUrl === '/tutorial-videos/collectionsTutorial.mp4'
      ? { ...tut, thumbnail: '/thumbnail-collections.jpg' }
      : tut
  );

  const VideoCard = ({ video }: { video: any }) => (
    <Card 
      className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 cursor-pointer transition-all duration-200 hover:border-slate-600/50"
      onClick={() => setSelectedVideo(video)}
    >
      <CardHeader className="pb-3">
        <div className="aspect-video bg-slate-700 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
          {video.thumbnail ? (
            <>
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors"></div>
              <Play className="w-12 h-12 text-white absolute z-10 drop-shadow-lg" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800"></div>
              <Play className="w-12 h-12 text-slate-300 relative z-10" />
            </>
          )}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        </div>
        <CardTitle className="text-lg text-slate-100 line-clamp-2">{video.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{video.description}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Clock className="w-3 h-3" />
            {video.duration}
          </div>
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

          {/* Tutorials Grid (no tabs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTutorials.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedVideo.title}</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedVideo(null)}
                    className="text-slate-600 hover:text-slate-800"
                  >
                    ✕
                  </Button>
                </div>
                <div className="aspect-video bg-slate-700 rounded-lg mb-6">
                  {selectedVideo.videoUrl.includes('.mp4') ? (
                    <video
                      width="100%"
                      height="100%"
                      controls
                      className="rounded-lg"
                    >
                      <source src={selectedVideo.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
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
                  )}
                </div>
                <div className="space-y-4">
                  <p className="text-slate-700">{selectedVideo.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-4 h-4" />
                      {selectedVideo.duration}
                    </div>
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
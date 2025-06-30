'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Users, Star } from 'lucide-react';

export default function TutorialLibraryPage() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const tutorialVideos = [
    {
      id: 'tutorial-my-library',
      title: 'My Library Overview',
      description: 'Complete walkthrough of the My Library feature and how to organize your content',
      duration: 'TBD',
      difficulty: 'Beginner',
      thumbnail: '/thumbnail-1.jpg',
      videoUrl: '/tutorial-videos/Tutorial_myLibrary.mp4'
    },
    {
      id: 'tutorial-collections',
      title: 'Creating Your First Collection',
      description: 'Learn how to group related videos into shareable collections',
      duration: '6:15',
      difficulty: 'Intermediate',
      thumbnail: '/thumbnail-collections.jpg',
      videoUrl: '/tutorial-videos/collectionsTutorial.mp4'
    },
    {
      id: 'tutorial-in-action-filmroom',
      title: 'Film Room',
      description: 'See the Film Room in action—analyzing and breaking down player videos.',
      duration: 'TBD',
      difficulty: 'Intermediate',
      thumbnail: '/thumb-filmroom.jpg',
      videoUrl: '/tutorial-videos/InAction-FilmRoom.mp4'
    },
    {
      id: 'tutorial-in-action-practiceplanner',
      title: 'Practice Planner',
      description: 'Watch how to create and organize a practice plan step by step.',
      duration: 'TBD',
      difficulty: 'Intermediate',
      thumbnail: '/thumb-prac.jpg',
      videoUrl: '/tutorial-videos/InAction-PracticePlanner.mp4'
    }
  ];

  const allTutorials = tutorialVideos;

  const VideoCard = ({ video }: { video: any }) => (
    <Card 
      className="bg-white border-slate-200 hover:bg-slate-50 cursor-pointer transition-all duration-200 hover:border-slate-300 font-sans text-[#1a2341]"
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
        <CardTitle className="text-lg text-[#1a2341] font-bold line-clamp-2">{video.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-[#1a2341] text-sm mb-3 line-clamp-2 opacity-80">{video.description}</p>
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
      <div className="min-h-screen" style={{ backgroundColor: '#202236', backgroundImage: "url('/bg-navybaseball.jpg')", backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'top center' }}>
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
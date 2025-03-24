import { VideosByCategory } from '@/types/video';

export const initialVideos: VideosByCategory = {
  hitting: [
    {
      id: 'default-1',
      title: 'Baseball Hitting Instruction - The Modern Swing',
      url: 'https://www.youtube.com/watch?v=SOEdJpoLhXI',
      category: 'hitting',
      skillLevel: 'highLevel',
      teachingCue: 'Learn the mechanics of the modern baseball swing in this detailed video.',
      tags: ['mechanics', 'fundamentals', 'modern swing'],
      favorite: false,
      lastViewed: Date.now(),
      orientation: 'landscape',
      isSample: true,
      userId: 'sample'
    }
  ],
  pitching: [],
  infield: [],
  catching: []
}; 
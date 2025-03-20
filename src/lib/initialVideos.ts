import { VideosByCategory } from '@/types/video';

export const initialVideos: VideosByCategory = {
  hitting: [
    {
      id: 'default-1',
      title: 'How to Make Your Swing Shorter and Quicker',
      url: 'https://www.youtube.com/watch?v=6dfjV84ZN1g',
      category: 'hitting',
      skillLevel: 'highLevel',
      teachingCue: 'longer video on shortening the swing.',
      tags: ['mechanics'],
      favorite: false,
      lastViewed: Date.now(),
      orientation: 'vertical'
    },
    {
      id: 'default-2',
      title: 'Elbow In Palm Up',
      url: 'https://www.facebook.com/100064856274850/videos/1047037899618974',
      category: 'hitting',
      skillLevel: 'littleLeague',
      teachingCue: 'Focus on keeping elbow in with palm up position',
      tags: ['mechanics', 'fundamentals'],
      favorite: false,
      lastViewed: Date.now(),
      orientation: 'vertical'
    },
    {
      id: 'default-3',
      title: 'Load Position - Chest Over Back Foot',
      url: 'https://www.facebook.com/reel/1650842449194914',
      category: 'hitting',
      skillLevel: 'highLevel',
      teachingCue: 'Load is not turn the shoulders...it\'s Chest over back foot',
      tags: ['mechanics', 'load'],
      favorite: false,
      lastViewed: Date.now(),
      orientation: 'vertical'
    }
  ],
  pitching: [
    {
      id: 'default-5',
      title: 'Coil Mechanics',
      url: 'https://www.facebook.com/100064856274850/videos/1047037899618974',
      category: 'pitching',
      skillLevel: 'highLevel',
      teachingCue: 'Not Tall and Fall or drop... Screw Yourself into the ground (COIL)',
      tags: ['mechanics', 'advanced'],
      favorite: false,
      lastViewed: Date.now(),
      orientation: 'vertical'
    },
    {
      id: 'default-6',
      title: 'Whip vs Push Mechanics',
      url: 'https://www.facebook.com/100064856274850/videos/1047037899618974',
      category: 'pitching',
      skillLevel: 'highLevel',
      teachingCue: 'For better velocity Make a Whip, (not a push) - and recoil',
      tags: ['mechanics', 'velocity'],
      favorite: false,
      lastViewed: Date.now(),
      orientation: 'vertical'
    }
  ],
  infield: [],
  catching: []
}; 
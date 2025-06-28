"use client";
import React, { useState } from 'react';
import { ContentCard } from '@/components/ContentCard';
import { Timestamp } from 'firebase/firestore';
import { ContentItem } from '@/types/content';
import { StaffPickCard } from './StaffPickCard';

// Sample static data (add more videos as needed)
const staffPicks: ContentItem[] = [
  {
    id: 'pitching-from-stretch',
    userId: 'uFjSMoXun5NUMw4bDCwfLgocZfl2',
    title: 'Pitching from Stretch',
    description: 'Bend back knee. "Ankle to ankle" movement... or Knee to knee',
    url: 'https://www.youtube.com/watch?v=f8xlvTGAYlo',
    thumbnailUrl: 'https://img.youtube.com/vi/f8xlvTGAYlo/maxresdefault.jpg',
    category: 'pitching',
    skillLevel: 'highLevel',
    tags: ['12u', 'stretch'],
    orientation: 'landscape',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isSample: false,
    favorite: false,
  },
  {
    id: 'right-left-tap-tap',
    userId: 'uFjSMoXun5NUMw4bDCwfLgocZfl2',
    title: 'Right Left Tap Tap',
    description: '3 Drills: RL – TapTap (warm up)',
    url: 'https://www.youtube.com/watch?v=Yc7gxp7FNDA',
    thumbnailUrl: 'https://img.youtube.com/vi/Yc7gxp7FNDA/maxresdefault.jpg',
    category: 'infield',
    skillLevel: 'beginner',
    tags: ['8u'],
    orientation: 'landscape',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isSample: false,
    favorite: false,
  },
  {
    id: 'infield-footwork',
    userId: 'uFjSMoXun5NUMw4bDCwfLgocZfl2',
    title: 'Infield footwork',
    description: 'good sampling of IF work',
    url: 'https://www.youtube.com/watch?v=Qy7zFo7kkLg&t=188s',
    thumbnailUrl: 'https://img.youtube.com/vi/Qy7zFo7kkLg/maxresdefault.jpg',
    category: 'infield',
    skillLevel: 'beginner',
    tags: ['12u'],
    orientation: 'landscape',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isSample: false,
    favorite: false,
  },
  {
    id: 'how-to-pitch-coach-blewett',
    userId: 'uFjSMoXun5NUMw4bDCwfLgocZfl2',
    title: 'How to Pitch (Coach Blewett) - Long Form Lesson',
    description: 'Good longer video on teaching how to pitch.',
    url: 'https://www.youtube.com/watch?v=4NOo7JSK6eA',
    thumbnailUrl: 'https://img.youtube.com/vi/4NOo7JSK6eA/maxresdefault.jpg',
    category: 'pitching',
    skillLevel: 'beginner',
    tags: ['8u'],
    orientation: 'landscape',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isSample: false,
    favorite: false,
  },
  {
    id: 'close-the-book-not-alligator',
    userId: 'uFjSMoXun5NUMw4bDCwfLgocZfl2',
    title: 'Close the BOOK (not aligator)',
    description: 'Close the book is better than alligator. quick hands ready to throw.',
    url: 'https://www.youtube.com/shorts/fJXHvLzSGYM',
    thumbnailUrl: 'https://img.youtube.com/vi/fJXHvLzSGYM/maxresdefault.jpg',
    category: 'infield',
    skillLevel: 'beginner',
    tags: ['8u', '12u'],
    orientation: 'vertical',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isSample: false,
    favorite: false,
  },
  {
    id: 'velocity-cues-high-level',
    userId: 'uFjSMoXun5NUMw4bDCwfLgocZfl2',
    title: 'Velocity Cues - High Level',
    description: 'Cue: "Sit toward the edge of the mound/dirt" Use gravity downward.',
    url: 'https://youtu.be/VWtJ8CDwDS0?si=ZlF0bpjpYeRlKKPz&t=1',
    thumbnailUrl: 'https://img.youtube.com/vi/VWtJ8CDwDS0/maxresdefault.jpg',
    category: 'pitching',
    skillLevel: 'highLevel',
    tags: ['velocity'],
    orientation: 'landscape',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isSample: false,
    favorite: false,
  },
];

const categories = [
  { key: 'all', label: 'All Content' },
  { key: 'hitting', label: 'Hitting' },
  { key: 'infield', label: 'Infield' },
  { key: 'pitching', label: 'Pitching' },
  { key: 'catching', label: 'Catching' },
];

export default function StaffPicksPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  // Placeholder handlers for ContentCard props
  const handleSelect = (content: ContentItem) => {
    window.open(content.url, '_blank');
  };
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const filteredStaffPicks = activeCategory === 'all'
    ? staffPicks
    : staffPicks.filter((video) => video.category === activeCategory);

  return (
    <div
      className="min-h-screen flex justify-center"
      style={{
        backgroundColor: '#202236',
        backgroundImage: 'url(/bg-navybaseball.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
      }}
    >
      <div className="w-full" style={{ maxWidth: 1800 }}>
        <div className="max-w-6xl mx-auto py-10 px-4">
          <img src="/staff-picks.png" alt="Staff Picks" className="mx-auto mb-4 w-full max-w-[700px] h-auto" />
          <p className="text-lg text-center text-slate-300 mb-8">
            Empty video library? Here's a great place to get started.<br />
            We've handpicked some of the best teachers and lessons in the game to help you build your library.
          </p>
          <div className="flex justify-center gap-6 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex flex-col items-center px-6 py-3 rounded-lg font-oswald text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  activeCategory === cat.key
                    ? 'bg-[#1c263b] text-white shadow-lg'
                    : 'hover:bg-slate-700/50 text-slate-300'
                }`}
              >
                <img src="/baseball.png" alt="Baseball" className="w-5 h-5 mb-2 opacity-80" />
                {cat.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredStaffPicks.map((video) => (
              <StaffPickCard
                key={video.id}
                content={video}
                onSelect={handleSelect}
              />
            ))}
          </div>
          {filteredStaffPicks.length === 0 && (
            <div className="text-center text-gray-500 mt-10">No staff picks available for this category.</div>
          )}
        </div>
      </div>
    </div>
  );
} 
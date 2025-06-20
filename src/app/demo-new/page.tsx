'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    id: 'video-library',
    title: 'Video Library',
    description: 'Organize and manage your training videos in one centralized location.',
    videoSrc: '/tutorial-videos/Tutorial_myLibrary.mp4',
    ctaLink: '/content',
  },
  {
    id: 'collections',
    title: 'Collections',
    description: 'Group related videos together and share them with your team.',
    videoSrc: '/tutorial-videos/collectionsTutorial.mp4',
    ctaLink: '/collections',
  },
  {
    id: 'practice-planner',
    title: 'Practice Planner',
    description: 'Create and organize your practice sessions with our intuitive practice planner.',
    videoSrc: '/tutorial-videos/InAction-PracticePlanner.mp4',
    ctaLink: '/practice-planner',
  },
  {
    id: 'film-room',
    title: 'Film Room',
    description: 'Analyze player performance with our advanced video analysis tools.',
    videoSrc: '/tutorial-videos/InAction-FilmRoom.mp4',
    ctaLink: '/film-room',
  }
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#0d162d]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-full max-w-[300px] md:max-w-[400px] mx-auto mb-6">
              <Image
                src="/logo.png"
                alt="DrillShare Logo"
                width={400}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </Link>
          <p className="text-xl text-slate-400 mb-2">
            Get a feel for DrillShare's key features through these video demos.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="bg-slate-500/20 text-slate-400 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              DEMO MODE
            </div>
            <Link href="/auth/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="video-library" className="w-full">
          <TabsList className="w-full justify-start mb-8 bg-slate-800/50">
            {features.map((feature) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id}
                className="flex-1 text-lg py-4 text-slate-400 data-[state=active]:text-white data-[state=active]:bg-green-600"
              >
                {feature.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id}>
              <Card className="bg-white border-slate-200">
                <CardContent className="p-6">
                  <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                    <video
                      src={feature.videoSrc}
                      controls
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to elevate your team's performance?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Sign up now for free and get access to all these features.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-3 px-8">
              SIGN UP FOR FREE
            </Button>
          </Link>
          <div className="mt-6">
            <Link href="/faq">
              <Button variant="ghost" className="text-slate-400 hover:text-slate-300 text-sm">
                Have questions? Check out our FAQ
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
} 
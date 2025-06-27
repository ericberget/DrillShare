'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase } from '@/contexts/FirebaseContext';
import Link from 'next/link';
import { ArrowRight, FileVideo, Upload, User, Settings, Zap, Book, Shield, Check, X, Share2, Eye, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

export default function HomePage() {
  const { user, loading } = useFirebase();
  const router = useRouter();

  // Tutorial video modal state
  const [selectedTutorial, setSelectedTutorial] = useState<null | { title: string; videoUrl: string }>(null);
  // Carousel state
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/content');
    }
  }, [user, loading, router]);

  // Display loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-16 h-16 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is authenticated, don't render the landing page
  if (user) {
    return null;
  }

  // Only use the first tutorial video
  const tutorial = {
    title: 'My Library Overview',
    videoUrl: '/tutorial-videos/Tutorial_myLibrary.mp4',
    thumbnail: '/thumbnail-1.jpg',
    duration: 'TBD',
  };

  return (
    <div className="min-h-screen bg-[#0D1529]">
      {/* Hero Section */}
      <div className="relative min-h-[600px] md:min-h-[700px] bg-[#0D1529]">
        <div className="absolute inset-0 bg-gradient-radial from-slate-800/20 via-transparent to-transparent" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" 
          style={{ backgroundImage: 'url(/bgCoach.jpg)' }} 
        />
        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo above hero text */}
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="DrillShare Logo"
                width={400}
                height={400}
                className="h-10 md:h-14 lg:h-16 w-auto mx-auto"
                priority
              />
            </div>
            <div className="text-lg md:text-2xl font-bold text-white mb-8 md:mb-12 space-y-2 animate-fade-in opacity-0 px-4" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <p>Gather, Organize, and Share Your Baseball Training Videos</p>
            </div>
            <div className="flex gap-4 justify-center mb-12 md:mb-16 animate-fade-in opacity-0 px-4" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              <Link href="/auth/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 transform transition-all duration-200 hover:scale-105">
                  Get Started - It's free <ArrowRight className="ml-2 h-5 md:h-6 w-5 md:w-6" />
                </Button>
              </Link>
            </div>
            
            {/* App Preview Section */}
            <div className="relative animate-fade-in opacity-0 px-4" style={{ marginBottom: "-5% md:-10%", animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              <div className="relative flex justify-center items-center">
                <div
                  className="bg-white rounded-3xl p-2 md:p-6 w-full md:w-[350%] mx-auto cursor-pointer group"
                  style={{ maxWidth: 1800, boxShadow: '0 8px 48px 0 rgba(0,0,0,0.35), 0 1.5px 8px 0 rgba(0,0,0,0.18)' }}
                  onClick={() => setShowVideoModal(true)}
                  tabIndex={0}
                  role="button"
                  aria-label="Play Quick Tour video"
                >
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                    <img
                      src="/ThumbTour.jpg"
                      alt="Quick Tour Preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        className="bg-white/80 hover:bg-white text-emerald-700 rounded-full p-6 shadow-lg transition-all duration-200 group-hover:scale-110"
                        tabIndex={-1}
                        aria-label="Play video"
                      >
                        <Play className="w-14 h-14" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Video Modal Overlay */}
              {showVideoModal && (
                <div
                  className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in"
                  onClick={() => setShowVideoModal(false)}
                  role="dialog"
                  aria-modal="true"
                >
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="absolute top-6 right-8 text-white hover:text-emerald-400 text-4xl font-bold focus:outline-none z-50"
                    aria-label="Close"
                    style={{ zIndex: 100 }}
                  >
                    ×
                  </button>
                  <div
                    className="bg-white animate-smooth-scale-in"
                    style={{ borderRadius: '24px', border: '30px solid white', boxShadow: '0 8px 40px rgba(0,0,0,0.25)', animationDuration: '0.7s' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="aspect-video bg-slate-700 rounded-xl overflow-hidden">
                      <video
                        src="/tutorial-videos/QuickTour.mp4"
                        controls
                        autoPlay
                        className="w-full h-full rounded-xl"
                        style={{ maxHeight: '70vh' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="pt-16 md:pt-24 pb-16 md:pb-20" style={{ backgroundImage: "url('/bg-graph.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-10">
            {/* Text Column */}
            <div className="flex-1 flex flex-col justify-center md:pr-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 md:mb-10 animate-fade-in text-left tracking-tight drop-shadow-lg">Who is DrillShare for?</h2>
              <p className="text-base md:text-lg text-white mb-8 animate-fade-in px-2 text-left leading-relaxed drop-shadow">
                DrillShare is for baseball coaches who love the game and understand the value that comes from sharing knowledge, building a library of drills, and helping players grow. Whether you coach Little League, travel ball, or high school teams, DrillShare is designed for those who want to make practice more effective, keep their team organized, and pass on their passion for baseball.
              </p>
              <div className="flex justify-start">
                <a href="/about">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 text-base md:text-lg flex items-center gap-2 animate-fade-in tracking-tight">
                    Read the Drill Share Origin Story
                  </button>
                </a>
              </div>
            </div>
            {/* Image Column */}
            <div className="flex-1 flex items-center justify-center md:justify-end mt-10 md:mt-0" style={{ minHeight: 320 }}>
              <img
                src="/stackPics.png"
                alt="DrillShare collage"
                className="w-[400px] h-[400px] md:w-[475px] md:h-[475px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <div className="py-32 md:py-48 bg-slate-900/30 relative overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
        >
          <source src="/bg-catch.MOV" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-slate-950/40"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 md:mb-8 leading-relaxed md:leading-loose animate-fade-in px-4"
                style={{ lineHeight: '1.6' }}
            >
              <span className="text-emerald-400">GameChanger</span> is for gamedays.<br />
              <span className="text-emerald-400">DrillShare</span> is for practice days.
            </h2>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 md:py-20" style={{ backgroundImage: "url('/bgGraphGreen.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 animate-fade-in px-4">Spring Training Mode</h2>
            <p className="text-base md:text-lg text-emerald-100 mb-4 animate-fade-in px-4">
              DrillShare is still warming up—new features and improvements are rolling out all the time. If you have ideas or spot something weird, let us know!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white hover:bg-slate-100 text-emerald-700 border border-emerald-700 font-bold text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto hover-scale animate-slide-up stagger-2 transition-all duration-200">
                  Sign Up <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 py-8 md:py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex flex-col items-center md:items-start animate-fade-in">
              <Image
                src="/logo-small.png"
                alt="DrillShare"
                width={600}
                height={72}
                className="h-6 md:h-8 w-auto mb-3 md:mb-2"
              />
              <p className="text-slate-500 text-sm text-center md:text-left italic">Coaching Tools for the love of the game.</p>
            </div>
            <div className="text-slate-400 text-sm text-center animate-fade-in stagger-1">
              © 2024 DrillShare. All rights reserved.
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <Link href="/privacy" className="text-slate-400 hover:text-slate-300 text-sm hover-scale animate-fade-in stagger-2 text-center">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-slate-300 text-sm hover-scale animate-fade-in stagger-3 text-center">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-slate-400 hover:text-slate-300 text-sm hover-scale animate-fade-in stagger-4 text-center">
                Contact
              </Link>
              <Link href="/faq" className="text-slate-400 hover:text-slate-300 text-sm hover-scale animate-fade-in stagger-5 text-center">
                FAQ
              </Link>
              <Link href="/pricing" className="text-slate-400 hover:text-slate-300 text-sm hover-scale animate-fade-in stagger-6 text-center">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
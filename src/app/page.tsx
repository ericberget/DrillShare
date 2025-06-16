'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase } from '@/contexts/FirebaseContext';
import Link from 'next/link';
import { ArrowRight, FileVideo, Upload, User, Settings, Zap, Book, Shield, Check, X, Share2, Eye, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const { user, loading } = useFirebase();
  const router = useRouter();

  // Tutorial video modal state
  const [selectedTutorial, setSelectedTutorial] = useState<null | { title: string; videoUrl: string }>(null);
  // Carousel state
  const [activeIndex, setActiveIndex] = useState(0);

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
              <Link href="/demo">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 transform transition-all duration-200 hover:scale-105">
                  Try the Demo - No Signup Required <ArrowRight className="ml-2 h-5 md:h-6 w-5 md:w-6" />
                </Button>
              </Link>
            </div>
            
            {/* App Preview Section */}
            <div className="relative animate-fade-in opacity-0 px-4" style={{ marginBottom: "-5% md:-10%", animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              <div className="relative">
                <Image
                  src="/ipadSample.png"
                  alt="DrillShare App Interface"
                  width={1560}
                  height={877}
                  className="w-full md:w-[190%] h-auto mx-auto relative z-20"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="pt-16 md:pt-24 pb-16 md:pb-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 md:mb-12 animate-fade-in">What Coaches Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-1">
              <div className="flex items-center mb-4">
                <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-500/20 rounded-full flex items-center justify-center mr-3 md:mr-4">
                  <User className="w-5 md:w-6 h-5 md:h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg md:text-xl">Mike Johnson</h4>
                  <p className="text-slate-400 text-xs md:text-sm">High School Baseball Coach</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm md:text-base">"DrillShare is so simple to use. It just makes it easy to organize my thoughts and ideas, and it's a breeze to communicate with my assistant coaches."</p>
            </div>

            <div className="bg-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-2">
              <div className="flex items-center mb-4">
                <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-500/20 rounded-full flex items-center justify-center mr-3 md:mr-4">
                  <User className="w-5 md:w-6 h-5 md:h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg md:text-xl">Sarah Chen</h4>
                  <p className="text-slate-400 text-xs md:text-sm">Travel Ball Coach</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm md:text-base">"The ability to quickly find and share drills has saved me countless hours. My players love having easy access to their training videos."</p>
            </div>

            <div className="bg-slate-800/50 p-4 md:p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-3">
              <div className="flex items-center mb-4">
                <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-500/20 rounded-full flex items-center justify-center mr-3 md:mr-4">
                  <User className="w-5 md:w-6 h-5 md:h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg md:text-xl">David Rodriguez</h4>
                  <p className="text-slate-400 text-xs md:text-sm">College Assistant Coach</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm md:text-base">"The platform's organization features have made it easy to build a comprehensive library of training content. Highly recommended!"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorials Section */}
      <div 
        className="py-20 relative"
        style={{
          backgroundImage: "url('/bg-5c.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto 100%",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-10 max-w-5xl mx-auto">
            {/* Text Column */}
            <div className="flex-1 flex flex-col justify-center text-center md:text-left md:justify-start md:pr-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 animate-fade-in">Welcome to the DrillShare Beta</h2>
              <p className="text-slate-200 text-base md:text-lg mb-6 animate-fade-in opacity-80">
                <span className="font-semibold text-emerald-300">What is BETA mode?</span> Think of it as spring training for this web app. I'm trying to create something genuinely useful and handy for coaches and players. Features and content are being actively developed and improved. <span className="block mt-2">Your feedback is welcome as we build out the best platform for organizing and sharing baseball training content.</span>
              </p>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 text-lg flex items-center justify-center gap-2 w-full md:w-auto mx-auto md:mx-0 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                Learn More About DrillShare Beta
              </button>
            </div>
            {/* Video Card Column */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                className="w-full max-w-md md:max-w-lg lg:max-w-xl cursor-pointer group relative"
                onClick={() => setSelectedTutorial(tutorial)}
              >
                <div className="aspect-video bg-slate-700 rounded-xl overflow-hidden relative shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-white/80 hover:bg-white text-emerald-700 rounded-full p-4 shadow-lg transition-all duration-200">
                      <Play className="w-10 h-10" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{tutorial.duration}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Video Modal */}
      {selectedTutorial && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTutorial(null)}
        >
          {/* X button outside the modal */}
          <button
            onClick={() => setSelectedTutorial(null)}
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
                src={selectedTutorial.videoUrl}
                controls
                autoPlay
                className="w-full h-full rounded-xl"
                style={{ maxHeight: '70vh' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Problem/Solution Section */}
      <div className="py-24 md:py-32 bg-slate-900/30 relative overflow-hidden">
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
      <div className="py-16 md:py-20 bg-slate-600/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 animate-fade-in px-4">Ready to Get Organized?</h2>
            <p className="text-lg md:text-xl text-slate-300 mb-6 md:mb-8 animate-fade-in stagger-1 px-4">
              Be an early user and help shape DrillShare into the best tool for organizing and sharing training videos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link href="/demo">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto hover-scale animate-slide-up stagger-2">
                  Try the Demo - No Signup Required <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
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
              <p className="text-slate-500 text-sm text-center md:text-left italic">Knowledge shared is knowledge multiplied</p>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase } from '@/contexts/FirebaseContext';
import Link from 'next/link';
import { ArrowRight, FileVideo, Upload, User, Settings, Zap, Book, Shield, Check, X, Share2, Eye } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const { user, loading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
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

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="relative min-h-[600px] bg-slate-950">
        <div className="absolute inset-0 bg-gradient-radial from-slate-800/20 via-transparent to-transparent" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" 
          style={{ backgroundImage: 'url(/bgCoach.jpg)' }} 
        />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <Image
                src="/logo.png"
                alt="DrillShare Logo"
                width={600}
                height={600}
                className="mx-auto"
                priority
              />
            </div>
            <div className="text-2xl font-bold text-white mb-12 space-y-2 animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <p>Gather, Organize, and Share Your Baseball Training Videos</p>
            </div>
            <div className="flex gap-4 justify-center mb-16 animate-fade-in opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              <Link href="/demo">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 transform transition-all duration-200 hover:scale-105">
                  Try the Demo - No Signup Required <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
            
            {/* App Preview Section */}
            <div className="relative animate-fade-in opacity-0" style={{ marginBottom: "-10%", animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              <div className="relative">
                <Image
                  src="/ipadSample.png"
                  alt="DrillShare App Interface"
                  width={1560}
                  height={877}
                  className="w-[190%] h-auto mx-auto relative z-20"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="pt-24 pb-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12 animate-fade-in">What Coaches Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-500/20 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xl">Mike Johnson</h4>
                  <p className="text-slate-400 text-sm">High School Baseball Coach</p>
                </div>
              </div>
              <p className="text-slate-300">"DrillShare has revolutionized how I organize and share training videos with my team. The categorization and tagging system is exactly what I needed."</p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-2">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-500/20 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xl">Sarah Chen</h4>
                  <p className="text-slate-400 text-sm">Travel Ball Coach</p>
                </div>
              </div>
              <p className="text-slate-300">"The ability to quickly find and share drills has saved me countless hours. My players love having easy access to their training videos."</p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-3">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-500/20 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xl">David Rodriguez</h4>
                  <p className="text-slate-400 text-sm">College Assistant Coach</p>
                </div>
              </div>
              <p className="text-slate-300">"The platform's organization features have made it easy to build a comprehensive library of training content. Highly recommended!"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Easy Steps Section */}
      <div className="py-20 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-12 animate-fade-in">It's easy. It's helpful.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center animate-slide-up stagger-1">
                <div className="rounded-full bg-slate-700/30 w-12 h-12 flex items-center justify-center mb-4 hover-scale">
                  <FileVideo className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Paste YouTube Link</h3>
                <p className="text-slate-400 text-sm">Add your training video from YouTube</p>
              </div>
              
              <div className="flex flex-col items-center animate-slide-up stagger-2">
                <div className="rounded-full bg-slate-700/30 w-12 h-12 flex items-center justify-center mb-4 hover-scale">
                  <Settings className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Add Tags & Categories</h3>
                <p className="text-slate-400 text-sm">Organize your content for easy access</p>
              </div>
              
              <div className="flex flex-col items-center animate-slide-up stagger-3">
                <div className="rounded-full bg-slate-700/30 w-12 h-12 flex items-center justify-center mb-4 hover-scale">
                  <Share2 className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Save & Share</h3>
                <p className="text-slate-400 text-sm">Build your drill library and share with your team</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem/Solution Section */}
      <div className="py-32 bg-slate-900/30 relative overflow-hidden">
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-loose animate-fade-in">
              <span className="text-emerald-400">GameChanger</span> is for gamedays.<br />
              <span className="text-emerald-400">DrillShare</span> is for practice days.
            </h2>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-20 bg-slate-600/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6 animate-fade-in">Ready to Build Your Ultimate Drill and Skills Library?</h2>
            <p className="text-xl text-slate-300 mb-8 animate-fade-in stagger-1">Join thousands of coaches who are already using DrillShare to organize and share their training videos.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 w-full sm:w-auto hover-scale animate-slide-up stagger-2">
                  Try the Demo - No Signup Required <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 animate-fade-in">
              <Image
                src="/logo-small.png"
                alt="DrillShare"
                width={32}
                height={32}
                className="h-8 w-auto max-w-[120px]"
              />
              <p className="text-slate-500 text-sm mt-2 italic">Knowledge shared is knowledge multiplied</p>
            </div>
            <div className="text-slate-400 text-sm animate-fade-in stagger-1">
              © 2024 DrillShare. All rights reserved.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-slate-400 hover:text-slate-500 text-sm hover-scale animate-fade-in stagger-2">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-slate-500 text-sm hover-scale animate-fade-in stagger-3">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-slate-400 hover:text-slate-500 text-sm hover-scale animate-fade-in stagger-4">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase } from '@/contexts/FirebaseContext';
import Link from 'next/link';
import { ArrowRight, FileVideo, Upload, User, Settings, Zap, Book, Shield } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const { user, loading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/content');
    }
  }, [user, loading, router]);

  // Display loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is authenticated, don't render the landing page
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative min-h-[600px]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url("/bgCoach.jpg")',
            height: '100%',
            width: '100%'
          }}
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <Image
                src="/logo.png"
                alt="DrillHub Logo"
                width={600}
                height={600}
                className="mx-auto"
                priority
              />
            </div>
            <div className="text-2xl font-bold text-white mb-12 space-y-2 animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <p>Gather, Organize and Share Your Baseball Training Videos</p>
            </div>
            <div className="flex gap-4 justify-center mb-16 animate-fade-in opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              <Link href="/auth/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 transform transition-all duration-200 hover:scale-105">
                  Get Started - It's Free <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
            
            {/* App Preview Section */}
            <div className="relative animate-fade-in opacity-0" style={{ marginBottom: "-35%", animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              <div className="relative">
                <Image
                  src="/ipadSample.png"
                  alt="DrillHub App Interface"
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

      {/* White Section with Green Borders */}
      <div className="relative">
        <div className="h-8 bg-emerald-500" />
        <div className="bg-white pt-[15%] pb-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">It's easy. It's helpful. </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 mt-8">
                <div className="flex flex-col items-center animate-fade-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  <div className="rounded-full bg-emerald-100 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-emerald-600 text-xl font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Paste YouTube Link</h3>
                  <p className="text-slate-600 text-sm">Add your training video from YouTube</p>
                </div>
                
                <div className="flex flex-col items-center animate-fade-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                  <div className="rounded-full bg-emerald-100 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-emerald-600 text-xl font-bold">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Add Tags & Categories</h3>
                  <p className="text-slate-600 text-sm">Organize your content for easy access</p>
                </div>
                
                <div className="flex flex-col items-center animate-fade-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                  <div className="rounded-full bg-emerald-100 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-emerald-600 text-xl font-bold">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Save & Share</h3>
                  <p className="text-slate-600 text-sm">Build your drill library and share with your team</p>
                </div>
              </div>

              <Link href="/auth/signup">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white text-lg px-8 py-6">
                  Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-950 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <Image
                  src="/logo.png"
                  alt="DrillHub"
                  width={120}
                  height={120}
                  className="h-8 w-auto"
                />
              </div>
              <div className="text-slate-400 text-sm">
                © 2024 DrillHub. All rights reserved.
              </div>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-slate-400 hover:text-emerald-500 text-sm">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-slate-400 hover:text-emerald-500 text-sm">
                  Terms of Service
                </Link>
                <Link href="/contact" className="text-slate-400 hover:text-emerald-500 text-sm">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
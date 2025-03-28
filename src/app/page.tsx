'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase } from '@/contexts/FirebaseContext';
import Link from 'next/link';
import { ArrowRight, FileVideo, Upload, User, Settings, Zap, Book, Shield, Check, X, Share2 } from 'lucide-react';
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-[600px]">
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
              <Link href="/auth/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 transform transition-all duration-200 hover:scale-105">
                  Get Started - It's Free <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
            
            {/* App Preview Section */}
            <div className="relative animate-fade-in opacity-0" style={{ marginBottom: "-35%", animationDelay: '0.8s', animationFillMode: 'forwards' }}>
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

      {/* Easy Steps Section - Moved Up */}
      <div className="pt-[15%] pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4 animate-fade-in">It's not complicated. </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 mt-8">
              <div className="flex flex-col items-center animate-slide-up stagger-1">
                <div className="rounded-full bg-emerald-900/30 w-12 h-12 flex items-center justify-center mb-4 hover-scale">
                  <FileVideo className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Paste YouTube Link</h3>
                <p className="text-slate-400 text-sm">Add your training video from YouTube</p>
              </div>
              
              <div className="flex flex-col items-center animate-slide-up stagger-2">
                <div className="rounded-full bg-emerald-900/30 w-12 h-12 flex items-center justify-center mb-4 hover-scale">
                  <Settings className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Add Tags & Categories</h3>
                <p className="text-slate-400 text-sm">Organize your content for easy access</p>
              </div>
              
              <div className="flex flex-col items-center animate-slide-up stagger-3">
                <div className="rounded-full bg-emerald-900/30 w-12 h-12 flex items-center justify-center mb-4 hover-scale">
                  <Share2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Save & Share</h3>
                <p className="text-slate-400 text-sm">Share with your league, players, or coaches</p>
              </div>
            </div>

            <Link href="/auth/signup">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 hover-scale animate-slide-up stagger-2">
                Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section - Moved Down */}
      <div className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12 animate-fade-in">What Coaches Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-emerald-400" />
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
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-emerald-400" />
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
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-emerald-400" />
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

      {/* White Section with Green Borders */}
      <div className="relative">
        <div className="h-8 bg-emerald-500" />
        <div className="pt-[15%] pb-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4 animate-fade-in">It's easy. It's helpful.</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 mt-8">
                <div className="flex flex-col items-center animate-slide-up stagger-1">
                  <div className="rounded-full bg-emerald-900/30 w-12 h-12 flex items-center justify-center mb-4 hover-scale">
                    <FileVideo className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Paste YouTube Link</h3>
                  <p className="text-slate-400 text-sm">Add your training video from YouTube</p>
                </div>
                
                <div className="flex flex-col items-center animate-slide-up stagger-2">
                  <div className="rounded-full bg-emerald-900/30 w-12 h-12 flex items-center justify-center mb-4 hover-scale">
                    <Settings className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Add Tags & Categories</h3>
                  <p className="text-slate-400 text-sm">Organize your content for easy access</p>
                </div>
                
                <div className="flex flex-col items-center animate-slide-up stagger-3">
                  <div className="rounded-full bg-emerald-900/30 w-12 h-12 flex items-center justify-center mb-4 hover-scale">
                    <Share2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Save & Share</h3>
                  <p className="text-slate-400 text-sm">Build your drill library and share with your team</p>
                </div>
              </div>

              <Link href="/auth/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 hover-scale animate-slide-up stagger-2">
                  Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Comparison Section */}
        <div className="py-20 bg-slate-900/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12 animate-fade-in">Why Choose DrillShare?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-left">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mr-4">
                    <Zap className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">DrillShare</h3>
                </div>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center animate-fade-in stagger-1">
                    <Check className="w-5 h-5 text-emerald-400 mr-2" />
                    Instant video organization with smart tagging
                  </li>
                  <li className="flex items-center animate-fade-in stagger-2">
                    <Check className="w-5 h-5 text-emerald-400 mr-2" />
                    Easy sharing with team members
                  </li>
                  <li className="flex items-center animate-fade-in stagger-3">
                    <Check className="w-5 h-5 text-emerald-400 mr-2" />
                    Cross-platform access from any device
                  </li>
                  <li className="flex items-center animate-fade-in stagger-4">
                    <Check className="w-5 h-5 text-emerald-400 mr-2" />
                    Built-in video analysis tools
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-right">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                    <X className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Traditional Methods</h3>
                </div>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center animate-fade-in stagger-1">
                    <X className="w-5 h-5 text-red-400 mr-2" />
                    Manual video organization in folders
                  </li>
                  <li className="flex items-center animate-fade-in stagger-2">
                    <X className="w-5 h-5 text-red-400 mr-2" />
                    Difficult to share and collaborate
                  </li>
                  <li className="flex items-center animate-fade-in stagger-3">
                    <X className="w-5 h-5 text-red-400 mr-2" />
                    Limited to specific devices
                  </li>
                  <li className="flex items-center animate-fade-in stagger-4">
                    <X className="w-5 h-5 text-red-400 mr-2" />
                    No built-in analysis tools
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section - Temporarily Removed
        <div className="py-20 bg-slate-900/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12 animate-fade-in">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-1">
                <h3 className="text-lg font-semibold text-white mb-2">How does DrillShare work?</h3>
                <p className="text-slate-300">Simply paste your YouTube or Facebook video URL, add relevant tags and categories, and DrillShare will automatically organize and store your training videos. You can then easily share them with your team and track player progress.</p>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-2">
                <h3 className="text-lg font-semibold text-white mb-2">Is DrillShare free to use?</h3>
                <p className="text-slate-300">Yes! DrillShare offers a free tier that includes basic video organization and sharing features. We also offer premium features for teams and organizations that need more advanced capabilities.</p>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-3">
                <h3 className="text-lg font-semibold text-white mb-2">What types of videos can I add?</h3>
                <p className="text-slate-300">DrillShare supports videos from YouTube, YouTube Shorts, and Facebook. You can add training videos, game footage, technique demonstrations, and more.</p>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover-lift animate-slide-up stagger-4">
                <h3 className="text-lg font-semibold text-white mb-2">How secure is my content?</h3>
                <p className="text-slate-300">Your content is protected with industry-standard security measures. You have full control over who can access your videos, and all data is encrypted during transmission and storage.</p>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Call to Action Section */}
        <div className="py-20 bg-emerald-600/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-6 animate-fade-in">Ready to Transform Your Baseball Training?</h2>
              <p className="text-xl text-slate-300 mb-8 animate-fade-in stagger-1">Join thousands of coaches who are already using DrillShare to organize and share their training videos.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 w-full sm:w-auto hover-scale animate-slide-up stagger-2">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-950 text-lg px-8 py-6 w-full sm:w-auto hover-scale animate-slide-up stagger-3">
                    Contact Sales
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
                  src="/logo.png"
                  alt="DrillShare"
                  width={120}
                  height={120}
                  className="h-8 w-auto"
                />
              </div>
              <div className="text-slate-400 text-sm animate-fade-in stagger-1">
                © 2024 DrillShare. All rights reserved.
              </div>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-slate-400 hover:text-emerald-500 text-sm hover-scale animate-fade-in stagger-2">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-slate-400 hover:text-emerald-500 text-sm hover-scale animate-fade-in stagger-3">
                  Terms of Service
                </Link>
                <Link href="/contact" className="text-slate-400 hover:text-emerald-500 text-sm hover-scale animate-fade-in stagger-4">
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
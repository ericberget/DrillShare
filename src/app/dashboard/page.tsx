'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase } from '@/contexts/FirebaseContext';
import Link from 'next/link';
import { ArrowRight, FileVideo, Upload, User, Settings, Zap, Book, Shield, LineChart } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useFirebase();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-16 h-16 border-4 border-drillhub-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-drillhub-400">
                Welcome to <span className="text-drillhub-500">DrillHub</span>
              </h1>
              <p className="text-xl text-slate-300 mb-6">
                Your personal platform for baseball training, drill sharing, and player analysis.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-drillhub-600 hover:bg-drillhub-700 text-white"
                  size="lg"
                  onClick={() => router.push('/content')}
                >
                  My Content
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-drillhub-500 text-drillhub-400 hover:bg-drillhub-950"
                  size="lg"
                  onClick={() => router.push('/player-analysis')}
                >
                  Player Analysis
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-80 h-80">
                {/* Baseball icon or logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl text-drillhub-500">⚾</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-drillhub-400">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* My Content Card */}
            <Card className="bg-slate-900/30 border-slate-700/50 hover:border-drillhub-500/30 hover:bg-slate-800/40 transition-all">
              <CardHeader>
                <CardTitle className="text-drillhub-400 flex items-center">
                  <FileVideo className="mr-2 h-5 w-5" /> My Content
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage and browse your uploaded drills and videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Access all your training content, create new drills, and share knowledge.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-drillhub-600 hover:bg-drillhub-700"
                  onClick={() => router.push('/content')}
                >
                  Go to My Content
                </Button>
              </CardFooter>
            </Card>

            {/* Upload Content Card */}
            <Card className="bg-slate-900/30 border-slate-700/50 hover:border-drillhub-500/30 hover:bg-slate-800/40 transition-all">
              <CardHeader>
                <CardTitle className="text-drillhub-400 flex items-center">
                  <Upload className="mr-2 h-5 w-5" /> Upload New
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Share new drills and training content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Create and upload new training materials directly to the platform.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-drillhub-600 hover:bg-drillhub-700"
                  onClick={() => {
                    router.push('/content?action=upload');
                  }}
                >
                  Upload Content
                </Button>
              </CardFooter>
            </Card>

            {/* Player Analysis Card */}
            <Card className="bg-slate-900/30 border-slate-700/50 hover:border-drillhub-500/30 hover:bg-slate-800/40 transition-all">
              <CardHeader>
                <CardTitle className="text-drillhub-400 flex items-center">
                  <LineChart className="mr-2 h-5 w-5" /> Player Analysis
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Analyze player performance videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Upload and analyze player videos for hitting and pitching mechanics.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-drillhub-600 hover:bg-drillhub-700"
                  onClick={() => router.push('/player-analysis')}
                >
                  Go to Player Analysis
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <section className="py-12 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-drillhub-400">Recently Viewed</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* This would be dynamically populated based on user history */}
            <Card className="bg-slate-900/30 border-slate-700/50">
              <div className="aspect-video bg-slate-800 flex items-center justify-center text-slate-600">
                No recent content
              </div>
              <CardContent className="pt-4">
                <h3 className="font-medium text-slate-300">Start exploring content</h3>
                <p className="text-sm text-slate-400 mt-1">Your recently viewed items will appear here</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              className="text-drillhub-400 hover:text-drillhub-300 hover:bg-slate-800"
              onClick={() => router.push('/content')}
            >
              View All Content
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Account & Settings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-drillhub-400">Your Account</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/30 border-slate-700/50 hover:border-drillhub-500/30 hover:bg-slate-800/40 transition-all">
              <CardHeader>
                <CardTitle className="text-drillhub-400 flex items-center">
                  <User className="mr-2 h-5 w-5" /> Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-drillhub-500 flex items-center justify-center text-white font-bold text-xl">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{user.displayName || user.email}</p>
                    <p className="text-sm text-slate-400">Member since {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-700 hover:bg-slate-800"
                  onClick={() => router.push('/profile')}
                >
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-slate-900/30 border-slate-700/50 hover:border-drillhub-500/30 hover:bg-slate-800/40 transition-all">
              <CardHeader>
                <CardTitle className="text-drillhub-400 flex items-center">
                  <Settings className="mr-2 h-5 w-5" /> Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-slate-300 hover:text-drillhub-400 transition-colors">
                    <Shield className="mr-2 h-4 w-4" /> Account Security
                  </li>
                  <li className="flex items-center text-slate-300 hover:text-drillhub-400 transition-colors">
                    <Book className="mr-2 h-4 w-4" /> Subscription & Billing
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-700 hover:bg-slate-800"
                  onClick={() => router.push('/settings')}
                >
                  Manage Settings
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <span className="text-drillhub-500 font-bold text-xl">DrillHub</span>
              <p className="text-slate-400 text-sm mt-1">© {new Date().getFullYear()} DrillHub. All rights reserved.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/help" className="text-slate-400 hover:text-drillhub-400 transition-colors">
                Help Center
              </Link>
              <Link href="/privacy" className="text-slate-400 hover:text-drillhub-400 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-drillhub-400 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 
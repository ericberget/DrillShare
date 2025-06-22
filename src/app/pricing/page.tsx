'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, Zap, Shield, Users, Video, FolderOpen, Share2, Crown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0D1529]">
      {/* Hero Section */}
      <div className="relative pt-20 pb-16 bg-[#0D1529]">
        <div className="absolute inset-0 bg-gradient-radial from-slate-800/20 via-transparent to-transparent" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" 
          style={{ backgroundImage: 'url(/bgCoach.jpg)' }} 
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
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
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              Choose the plan that works best for your coaching needs
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-16 md:py-24 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="relative bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 animate-slide-up stagger-1">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-slate-600/30 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-300" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-white">Free</CardTitle>
                <CardDescription className="text-slate-400 text-lg">
                  Perfect for getting started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">$0</div>
                  <div className="text-slate-400">Forever</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Up to 50 video uploads</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Basic organization tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Share with your team</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Practice planner</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Email support</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-6">
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500 transition-all duration-200">
                    Get Started Free
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Pro Tier */}
            <Card className="relative bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-600/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 animate-slide-up stagger-2 overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                MOST POPULAR
              </div>
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-600/30 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-blue-300" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-white">Pro</CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  For serious coaches and teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">$10</div>
                  <div className="text-slate-400">per month</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Unlimited video uploads</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Advanced organization & collections</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Team collaboration tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Advanced practice planning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Player analysis features</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Priority support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">Early access to new features</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-6">
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg hover:shadow-blue-600/25">
                    Start Pro Trial
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Founding Users Message */}
      <div className="py-16 md:py-20 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border-t border-b border-slate-700/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              🎉 Special Offer for Founding Users
            </h2>
            
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 md:p-10 mb-8">
              <p className="text-lg md:text-xl text-slate-200 mb-6 leading-relaxed">
                <span className="font-semibold text-emerald-300">Everything is FREE during our beta phase!</span> 
                We're building DrillShare with coaches like you in mind, and your early feedback is invaluable to us.
              </p>
              
              <p className="text-base md:text-lg text-slate-300 mb-6 leading-relaxed">
                As a founding user, you'll get access to all Pro features at no cost while we perfect the platform. 
                Your insights and suggestions will help shape DrillShare into the ultimate tool for baseball coaches.
              </p>
              
              <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-lg p-6">
                <p className="text-emerald-200 font-semibold text-lg">
                  🚀 Join us now and help build the future of baseball training organization!
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105">
                  Start Building Your Library
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-200">
                  Try the Demo First
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 md:py-20 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Can I upgrade or downgrade my plan anytime?
                </h3>
                <p className="text-slate-300">
                  Yes! You can change your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  What happens to my videos if I cancel?
                </h3>
                <p className="text-slate-300">
                  Your videos are safe! You can download them anytime, and they'll remain accessible for 30 days after cancellation.
                </p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Is there a team discount available?
                </h3>
                <p className="text-slate-300">
                  Yes! Contact us for custom pricing for teams with 5+ coaches. We offer special rates for larger organizations.
                </p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  How long is the beta phase?
                </h3>
                <p className="text-slate-300">
                  We're committed to keeping everything free until we're confident DrillShare meets all your needs. We'll give plenty of notice before any pricing changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Coaching?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of coaches who are already organizing and sharing their training content more effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105">
                Get Started Today
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-200">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Video, FolderOpen, LineChart, ArrowRight, GraduationCap, Zap } from 'lucide-react';

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function MenuItem({ href, icon, title, description, gradient }: MenuItemProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        <CardContent className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-xl ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white transition-colors font-oswald">
                {title}
              </h3>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-300" />
          </div>
          <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function MainMenu() {
  const menuItems = [
    {
      href: "/content",
      icon: <Video className="w-8 h-8 text-white" />,
      title: "My Video Library",
      description: "Browse, organize, and manage your personal collection of baseball training videos",
      gradient: "bg-gradient-to-br from-blue-600 to-blue-700"
    },
    {
      href: "/collections",
      icon: <FolderOpen className="w-8 h-8 text-white" />,
      title: "Collections",
      description: "Create and share curated sets of training videos with your team, league, or coaching staff",
      gradient: "bg-gradient-to-br from-emerald-600 to-emerald-700"
    },
    {
      href: "/practice-planner",
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Quick Practice Planner",
      description: "Fast, simple practice planning with drag-and-drop drills and station management",
      gradient: "bg-gradient-to-br from-orange-600 to-orange-700"
    },
    {
      href: "/player-analysis",
      icon: <LineChart className="w-8 h-8 text-white" />,
      title: "Player Analysis",
      description: "Upload and analyze individual player videos for hitting, pitching, and fielding mechanics",
      gradient: "bg-gradient-to-br from-purple-600 to-purple-700"
    },
    {
      href: "/tutorial-library",
      icon: <GraduationCap className="w-8 h-8 text-white" />,
      title: "Tutorial Library",
      description: "Access step-by-step tutorials and guides to master DrillShare's features and tools",
      gradient: "bg-gradient-to-br from-indigo-600 to-indigo-700"
    }
  ];

  return (
    <div className="w-full">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-slate-100 mb-4">Choose Your Destination</h2>
        <p className="text-slate-400 text-lg">Select a section to get started with your baseball training content</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {menuItems.map((item, index) => (
          <MenuItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            title={item.title}
            description={item.description}
            gradient={item.gradient}
          />
        ))}
      </div>
    </div>
  );
} 
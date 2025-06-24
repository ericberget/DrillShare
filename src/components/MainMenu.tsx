'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Video, FolderOpen, LineChart, ArrowRight, GraduationCap, Zap, Menu, X } from 'lucide-react';

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  gradient?: string;
  isMobile?: boolean;
  onLinkClick?: () => void;
}

function MenuItem({ href, icon, title, description, gradient, isMobile, onLinkClick }: MenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (isMobile) {
    return (
      <Link
        href={href}
        onClick={onLinkClick}
        className={`flex items-center gap-4 p-4 rounded-lg text-slate-200 transition-colors ${
          isActive ? 'bg-slate-700' : 'hover:bg-slate-800'
        }`}
      >
        <div className={`w-10 h-10 rounded-lg ${gradient} flex items-center justify-center`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 text-white' })}
        </div>
        <span className="text-base font-semibold">{title}</span>
      </Link>
    );
  }
  
  return (
    <Link href={href} className="group">
      <Card className="h-full bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        <CardContent className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-xl ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#2EBFA5] mb-2 group-hover:text-white transition-colors font-oswald">
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      href: "/content",
      icon: <Video />,
      title: "My Video Library",
      description: "Browse, organize, and manage your personal collection of baseball training videos",
      gradient: "bg-gradient-to-br from-blue-600 to-blue-700"
    },
    {
      href: "/collections",
      icon: <FolderOpen />,
      title: "Collections",
      description: "Create and share curated sets of training videos with your team, league, or coaching staff",
      gradient: "bg-gradient-to-br from-emerald-600 to-emerald-700"
    },
    {
      href: "/practice-planner",
      icon: <Zap />,
      title: "Quick Practice Planner",
      description: "Fast, simple practice planning with drag-and-drop drills and station management",
      gradient: "bg-gradient-to-br from-orange-600 to-orange-700"
    },
    {
      href: "/player-analysis",
      icon: <LineChart />,
      title: "Player Analysis",
      description: "Upload and analyze individual player videos for hitting, pitching, and fielding mechanics",
      gradient: "bg-gradient-to-br from-purple-600 to-purple-700"
    },
    {
      href: "/tutorial-library",
      icon: <GraduationCap />,
      title: "Tutorial Library",
      description: "Access step-by-step tutorials and guides to master DrillShare's features and tools",
      gradient: "bg-gradient-to-br from-indigo-600 to-indigo-700"
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-30 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden p-4 border-r border-slate-800`}
      >
        <div className="flex justify-between items-center mb-6">
           <h2 className="font-bold text-lg text-emerald-400">Menu</h2>
           <button onClick={() => setIsMobileMenuOpen(false)}>
             <X className="w-6 h-6" />
           </button>
        </div>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <MenuItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              gradient={item.gradient}
              isMobile={true}
              onLinkClick={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </div>
      </div>
       {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="w-full p-4 md:p-8">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-slate-100 mb-4">Choose Your Destination</h2>
        <p className="text-slate-400 text-lg">Select a section to get started with your baseball training content</p>
      </div>
      
        {/* Desktop Menu: Full Cards */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
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
    </>
  );
} 
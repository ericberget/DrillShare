'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Menu, User, Settings, LogOut, Video, FolderOpen, Home, LineChart, Users, Zap, GraduationCap } from 'lucide-react'
import { useFirebase } from '@/contexts/FirebaseContext'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export function Navbar() {
  const { user, loading } = useFirebase()
  const { signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleProfileClick = () => {
    router.push('/profile')
  }

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navigationItems = [
    {
      href: "/content",
      icon: <Video className="w-6 h-6 text-white" />,
      title: "My Video Library",
      description: "Browse and manage your training videos",
      gradient: "bg-gradient-to-br from-blue-600 to-blue-700"
    },
    {
      href: "/collections",
      icon: <FolderOpen className="w-6 h-6 text-white" />,
      title: "Collections",
      description: "Create and share video collections",
      gradient: "bg-gradient-to-br from-emerald-600 to-emerald-700"
    },
    {
      href: "/practice-planner",
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "Quick Practice Planner",
      description: "Plan and organize your practices",
      gradient: "bg-gradient-to-br from-orange-600 to-orange-700"
    },
    {
      href: "/player-analysis",
      icon: <LineChart className="w-6 h-6 text-white" />,
      title: "Player Analysis",
      description: "Analyze individual player performance",
      gradient: "bg-gradient-to-br from-purple-600 to-purple-700"
    },
    {
      href: "/tutorial-library",
      icon: <GraduationCap className="w-6 h-6 text-white" />,
      title: "Tutorial Library",
      description: "Learn how to use DrillShare",
      gradient: "bg-gradient-to-br from-indigo-600 to-indigo-700"
    }
  ];

  return (
    <>
      <nav className="bg-slate-950/95 border-b border-slate-800/50 backdrop-blur-sm relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {user && !loading && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="group hover:bg-slate-800/50 hover:border-slate-600/50 border border-slate-700/50 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-7 w-7 text-slate-300 group-hover:text-slate-100 transition-colors" />
              </Button>
            )}
            
            {loading ? (
              <div className="h-10 w-10 rounded-full bg-slate-800 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 flex items-center gap-3 px-2 hover:bg-slate-800/50">
                    <span className="text-sm text-slate-300">{user.displayName || 'User'}</span>
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full bg-slate-800 flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-300" />
                      </div>
                      {user.photoURL && (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          className="absolute inset-0 w-full h-full rounded-full object-cover"
                        />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-200">{user.displayName || 'User'}</p>
                      <p className="text-xs leading-none text-slate-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer text-slate-200 hover:bg-slate-800">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile/team')} className="cursor-pointer text-slate-200 hover:bg-slate-800">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Program Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-400 hover:bg-slate-800">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-slate-300 hover:text-slate-100 hover:bg-slate-800/50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Full-Width Navigation Menu */}
      {isMenuOpen && user && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Full-Width Menu */}
          <div className="fixed top-14 left-0 right-0 bg-slate-950/98 backdrop-blur-sm border-b border-slate-800/50 z-50">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 rounded-lg p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-xl ${item.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          {item.icon}
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-white transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
} 
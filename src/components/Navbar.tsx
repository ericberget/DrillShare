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
import { Menu, User, Settings, LogOut, Video, FolderOpen, Home, LineChart, Users, Zap } from 'lucide-react'
import { useFirebase } from '@/contexts/FirebaseContext'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'

export function Navbar() {
  const { user, loading } = useFirebase()
  const { signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleProfileClick = () => {
    router.push('/profile')
  }

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {user && !loading && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="group hover:bg-emerald-600/20 hover:border-emerald-500/50 border border-slate-700/50 transition-colors">
                  <Menu className="h-7 w-7 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/content" className="cursor-pointer">
                    <Video className="mr-2 h-4 w-4" />
                    <span>My Video Library</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/collections" className="cursor-pointer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>Collections</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/practice-planner" className="cursor-pointer">
                    <Zap className="mr-2 h-4 w-4" />
                    <span>Quick Practice Planner</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/player-analysis" className="cursor-pointer">
                    <LineChart className="mr-2 h-4 w-4" />
                    <span>Player Analysis</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {loading ? (
            <div className="h-10 w-10 rounded-full bg-slate-800 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 flex items-center gap-3 px-2 hover:bg-slate-800/50">
                  <span className="text-sm text-slate-400">{user.displayName || 'User'}</span>
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full bg-slate-800 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-400" />
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile/team')} className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Program Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-drillhub-600 hover:bg-drillhub-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 
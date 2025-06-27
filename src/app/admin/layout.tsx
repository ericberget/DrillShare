'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart3, 
  Database, 
  Settings, 
  Users, 
  Home,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';

const adminNavItems = [
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Visitor tracking and site analytics'
  },
  {
    title: 'Demo Data',
    href: '/admin/create-demo-data',
    icon: Database,
    description: 'Manage demo content and sample data'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'User management and permissions'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Site configuration and settings'
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = adminNavItems.find(item => item.href === pathname);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-slate-950">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div> {/* Wrapper for top section */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="p-4">
                <div className="flex flex-col space-y-6">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Card className={`cursor-pointer transition-all duration-200 hover:bg-slate-800 ${
                          isActive ? 'bg-emerald-600/20 border-emerald-600/50' : 'bg-slate-800/50 border-slate-700'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <Icon className={`h-5 w-5 ${
                                isActive ? 'text-emerald-400' : 'text-slate-400'
                              }`} />
                              <div>
                                <div className={`font-medium ${
                                  isActive ? 'text-emerald-400' : 'text-white'
                                }`}>
                                  {item.title}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Back to site */}
            <div className="mt-auto p-4">
              <Link href="/">
                <Button variant="outline" className="w-full border-emerald-700 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:ml-64">
          {/* Top bar */}
          <div className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              {/* Breadcrumbs */}
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Link href="/admin" className="hover:text-white">
                  Admin
                </Link>
                {currentPage && (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-white">{currentPage.title}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
} 
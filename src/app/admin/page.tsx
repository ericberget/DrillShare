'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  Users, 
  Database, 
  Settings, 
  TrendingUp, 
  Eye, 
  Clock, 
  Globe,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { getAnalyticsData } from '@/lib/analytics';

export default function AdminDashboardPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAnalyticsData(7); // Last 7 days
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const adminCards = [
    {
      title: 'Analytics Dashboard',
      description: 'View visitor tracking and site performance metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Demo Data Management',
      description: 'Create and manage demo content for testing',
      icon: Database,
      href: '/admin/create-demo-data',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'User Management',
      description: 'Manage users, permissions, and admin access',
      icon: Users,
      href: '/admin/users',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Site Settings',
      description: 'Configure site-wide settings and preferences',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Manage your site and monitor performance</p>
      </div>

      {/* Quick Stats */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Page Views (7d)</CardTitle>
              <Eye className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analyticsData.totalPageViews?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Sessions (7d)</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analyticsData.totalSessions?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Unique Users (7d)</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analyticsData.uniqueUsers?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Anonymous (7d)</CardTitle>
              <Globe className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {analyticsData.anonymousUsers?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Tools */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="bg-slate-900 border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${card.bgColor}`}>
                          <Icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">
                            {card.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {analyticsData && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Page Views */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Page Views</CardTitle>
                <CardDescription className="text-slate-400">Latest visitor activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analyticsData.recentPageViews?.slice(0, 5).map((pageView: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div>
                        <div className="text-slate-300 font-medium">
                          {pageView.path === '/' ? 'Home' : pageView.path}
                        </div>
                        <div className="text-slate-500 text-sm">
                          {pageView.userEmail || 'Anonymous'} • {pageView.deviceType}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {pageView.browser}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Top Pages (7d)</CardTitle>
                <CardDescription className="text-slate-400">Most visited pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topPages?.slice(0, 5).map((page: any, index: number) => (
                    <div key={page.path} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                          #{index + 1}
                        </Badge>
                        <span className="text-slate-300">
                          {page.path === '/' ? 'Home' : page.path}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-medium">{page.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/analytics">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </Link>
          <Link href="/admin/create-demo-data">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Database className="h-4 w-4 mr-2" />
              Manage Demo Data
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Site
            </Button>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">System Status</CardTitle>
          <CardDescription className="text-slate-400">Current system health and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">Analytics Tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">Database</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">Storage</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, Eye, Clock, TrendingUp, Monitor, Smartphone, Tablet, Globe, Calendar, BarChart3, Activity, Filter, FilterX } from 'lucide-react';
import Link from 'next/link';
import { getAnalyticsData, PageView, UserSession } from '@/lib/analytics';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';

// Helper to format numbers with commas
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

interface AnalyticsData {
  totalPageViews: number;
  totalSessions: number;
  uniqueUsers: number;
  anonymousUsers: number;
  topPages: { path: string; count: number }[];
  deviceCounts: Record<string, number>;
  browserCounts: Record<string, number>;
  dailyData: Record<string, number>;
  recentPageViews: PageView[];
  recentSessions: UserSession[];
  topLocations: { location: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(90);
  const [debugData, setDebugData] = useState<any>(null);
  const [debugging, setDebugging] = useState(false);
  const [hideAdminSessions, setHideAdminSessions] = useState(true);
  const [hideAdminPageViews, setHideAdminPageViews] = useState(true);
  
  const adminEmail = 'berget3333@gmail.com';

  const fetchAnalyticsData = async (days: number) => {
    setLoading(true);
    setError(null);
    try {
      const analyticsData = await getAnalyticsData(days);
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const runDebug = async () => {
    setDebugging(true);
    try {
      const response = await fetch(`/api/debug-analytics?days=${timeRange}`);
      const result = await response.json();
      if (result.success) {
        setDebugData(result.data);
        console.log('🔍 Debug Results:', result.data);
      } else {
        console.error('🔍 Debug Error:', result.error);
      }
    } catch (err) {
      console.error('🔍 Debug Request Error:', err);
    } finally {
      setDebugging(false);
    }
  };

  const refreshData = async () => {
    await fetchAnalyticsData(timeRange);
  };

  // Filter functions
  const getFilteredSessions = (sessions: UserSession[]) => {
    if (!hideAdminSessions) return sessions;
    return sessions.filter(session => session.userEmail !== adminEmail);
  };

  const getFilteredPageViews = (pageViews: PageView[]) => {
    if (!hideAdminPageViews) return pageViews;
    return pageViews.filter(pageView => pageView.userEmail !== adminEmail);
  };

  useEffect(() => {
    fetchAnalyticsData(timeRange);
  }, [timeRange]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const formatPath = (path: string) => {
    if (path === '/') return 'Home';
    return path.charAt(1).toUpperCase() + path.slice(2).replace(/-/g, ' ');
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-slate-950 p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-400">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-slate-400">Track visitor activity and site performance</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setTimeRange(7)}
                variant={timeRange === 7 ? "default" : "outline"}
                size="sm"
              >
                7 days
              </Button>
              <Button
                onClick={() => setTimeRange(30)}
                variant={timeRange === 30 ? "default" : "outline"}
                size="sm"
              >
                30 days
              </Button>
              <Button
                onClick={() => setTimeRange(90)}
                variant={timeRange === 90 ? "default" : "outline"}
                size="sm"
              >
                90 days
              </Button>
            </div>
            <Button
              onClick={runDebug}
              disabled={debugging}
              variant="secondary"
              size="sm"
              className="ml-auto"
            >
              {debugging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Debugging...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Debug Analytics
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert className="mb-6 border-red-500 bg-red-950/50">
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {data && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Total Page Views</CardTitle>
                    <Eye className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{formatNumber(data.totalPageViews)}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Total Sessions</CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{formatNumber(data.totalSessions)}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Unique Users</CardTitle>
                    <Users className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{formatNumber(data.uniqueUsers)}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Anonymous Users</CardTitle>
                    <Globe className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{formatNumber(data.anonymousUsers)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analytics */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-slate-800 border-slate-700">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-600">Overview</TabsTrigger>
                  <TabsTrigger value="pages" className="data-[state=active]:bg-emerald-600">Top Pages</TabsTrigger>
                  <TabsTrigger value="locations" className="data-[state=active]:bg-emerald-600">Locations</TabsTrigger>
                  <TabsTrigger value="devices" className="data-[state=active]:bg-emerald-600">Devices</TabsTrigger>
                  <TabsTrigger value="browsers" className="data-[state=active]:bg-emerald-600">Browsers</TabsTrigger>
                  <TabsTrigger value="recent" className="data-[state=active]:bg-emerald-600">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Top Pages */}
                    <Card className="bg-slate-900 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Top Pages</CardTitle>
                        <CardDescription className="text-slate-400">Most visited pages</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {data.topPages.slice(0, 5).map((page, index) => (
                            <div key={page.path} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                                  #{index + 1}
                                </Badge>
                                <span className="text-slate-300">{formatPath(page.path)}</span>
                              </div>
                              <span className="text-emerald-400 font-medium">{formatNumber(page.count)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Device Breakdown */}
                    <Card className="bg-slate-900 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Device Types</CardTitle>
                        <CardDescription className="text-slate-400">Traffic by device</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(data.deviceCounts).map(([device, count]) => (
                            <div key={device} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getDeviceIcon(device)}
                                <span className="text-slate-300 capitalize">{device}</span>
                              </div>
                              <span className="text-emerald-400 font-medium">{formatNumber(count)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Top Locations */}
                    <Card className="bg-slate-900 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Top Locations</CardTitle>
                        <CardDescription className="text-slate-400">Visitor locations by city</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {data.topLocations.slice(0, 5).map((loc, index) => (
                            <div key={loc.location} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                                  #{index + 1}
                                </Badge>
                                <span className="text-slate-300">{loc.location}</span>
                              </div>
                              <span className="text-emerald-400 font-medium">{formatNumber(loc.count)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="pages" className="space-y-6">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Top Pages</CardTitle>
                      <CardDescription className="text-slate-400">Complete list of most visited pages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.topPages.map((page, index) => (
                          <div key={page.path} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                                #{index + 1}
                              </Badge>
                              <div>
                                <div className="text-slate-300 font-medium">{formatPath(page.path)}</div>
                                <div className="text-slate-500 text-sm">{page.path}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-400 font-medium">{formatNumber(page.count)}</div>
                              <div className="text-slate-500 text-sm">
                                {((page.count / data.totalPageViews) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="locations" className="space-y-6">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">All Locations</CardTitle>
                      <CardDescription className="text-slate-400">Complete list of visitor locations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.topLocations.map((loc, index) => (
                          <div key={loc.location} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                                #{index + 1}
                              </Badge>
                              <div className="text-slate-300 font-medium">{loc.location}</div>
                            </div>
                            <span className="text-emerald-400 font-bold">{formatNumber(loc.count)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="devices" className="space-y-6">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Device Breakdown</CardTitle>
                      <CardDescription className="text-slate-400">Detailed device analytics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(data.deviceCounts).map(([device, count]) => (
                          <div key={device} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getDeviceIcon(device)}
                              <span className="text-slate-300 capitalize font-medium">{device}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-400 font-medium">{formatNumber(count)}</div>
                              <div className="text-slate-500 text-sm">
                                {((count / data.totalPageViews) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="browsers" className="space-y-6">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Browser Analytics</CardTitle>
                      <CardDescription className="text-slate-400">Traffic by browser</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(data.browserCounts).map(([browser, count]) => (
                          <div key={browser} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <span className="text-slate-300 font-medium">{browser}</span>
                            <div className="text-right">
                              <div className="text-emerald-400 font-medium">{formatNumber(count)}</div>
                              <div className="text-slate-500 text-sm">
                                {((count / data.totalPageViews) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recent" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Page Views */}
                    <Card className="bg-slate-900 border-slate-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-white">Recent Page Views</CardTitle>
                            <CardDescription className="text-slate-400">
                              Latest visitor activity
                              {data.recentPageViews && (
                                <span className="ml-2 text-xs">
                                  ({getFilteredPageViews(data.recentPageViews).length}/{data.recentPageViews.length} shown)
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => setHideAdminPageViews(!hideAdminPageViews)}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white"
                          >
                            {hideAdminPageViews ? (
                              <>
                                <Filter className="w-4 h-4 mr-2" />
                                Hide Admin
                              </>
                            ) : (
                              <>
                                <FilterX className="w-4 h-4 mr-2" />
                                Show All
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getFilteredPageViews(data.recentPageViews).length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                              {hideAdminPageViews ? (
                                <>
                                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No non-admin page views found</p>
                                  <p className="text-sm">Click "Show All" to see admin activity</p>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No recent page views</p>
                                </>
                              )}
                            </div>
                          ) : (
                            getFilteredPageViews(data.recentPageViews).map((pageView) => (
                              <div key={pageView.id} className="p-3 bg-slate-800 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-300 font-medium">{formatPath(pageView.path)}</span>
                                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                                    {getDeviceIcon(pageView.deviceType)}
                                  </Badge>
                                </div>
                                <div className="text-slate-500 text-sm space-y-1">
                                  <div>User: {pageView.userEmail || 'Anonymous'}</div>
                                  <div>Browser: {pageView.browser} on {pageView.os}</div>
                                  <div>Time: {formatDate(pageView.timestamp)}</div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Sessions */}
                    <Card className="bg-slate-900 border-slate-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-white">Recent Sessions</CardTitle>
                            <CardDescription className="text-slate-400">
                              Latest user sessions
                              {data.recentSessions && (
                                <span className="ml-2 text-xs">
                                  ({getFilteredSessions(data.recentSessions).length}/{data.recentSessions.length} shown)
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => setHideAdminSessions(!hideAdminSessions)}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white"
                          >
                            {hideAdminSessions ? (
                              <>
                                <Filter className="w-4 h-4 mr-2" />
                                Hide Admin
                              </>
                            ) : (
                              <>
                                <FilterX className="w-4 h-4 mr-2" />
                                Show All
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getFilteredSessions(data.recentSessions).length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                              {hideAdminSessions ? (
                                <>
                                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No non-admin sessions found</p>
                                  <p className="text-sm">Click "Show All" to see admin activity</p>
                                </>
                              ) : (
                                <>
                                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No recent sessions</p>
                                </>
                              )}
                            </div>
                          ) : (
                            getFilteredSessions(data.recentSessions).map((session) => (
                              <div key={session.id} className="p-3 bg-slate-800 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-300 font-medium">
                                    {session.userEmail || 'Anonymous'}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {session.pageViews} views
                                  </Badge>
                                </div>
                                <div className="text-slate-500 text-sm space-y-1">
                                  <div>Device: {session.deviceType} ({session.browser})</div>
                                  <div>Started: {formatDate(session.startTime)}</div>
                                  {session.endTime && (
                                    <div>Ended: {formatDate(session.endTime)}</div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}

          {debugData && (
            <Alert className="mb-6 bg-blue-900 border-blue-700">
              <BarChart3 className="h-4 w-4" />
              <AlertDescription>
                <strong>Debug Results:</strong>
                <div className="mt-2 text-sm space-y-1">
                  <div>Total Sessions: {debugData.totalSessions}</div>
                  <div>Sessions with User ID: {debugData.sessionsWithUserId}</div>
                  <div>Sessions without User ID: {debugData.sessionsWithoutUserId}</div>
                  <div>Unique User IDs: {debugData.uniqueUserIds}</div>
                  <div>Unique Session IDs: {debugData.uniqueSessionIds}</div>
                  <div>Duplicate Sessions: {debugData.duplicateSessionIds}</div>
                  {debugData.sampleSessions && debugData.sampleSessions.length > 0 && (
                    <div className="mt-2">
                      <strong>Sample Sessions:</strong>
                      <div className="mt-1 text-xs font-mono">
                        {debugData.sampleSessions.map((session: any, index: number) => (
                          <div key={index}>
                            {index + 1}. User: {session.userId || 'null'}, Session: {session.sessionId?.substring(0, 8)}..., Email: {session.userEmail || 'null'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </AdminProtectedRoute>
  );
} 
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { Users, Eye, Clock, Globe, Loader2, UserCheck, UserX, Mail, Calendar, Activity, TrendingUp } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: any;
  updatedAt: any;
  isAdmin?: boolean;
  lastSignIn?: any;
  pageViews?: number;
  sessions?: number;
  lastActivity?: any;
}

interface UserAnalytics {
  totalUsers: number;
  adminUsers: number;
  activeUsers: number;
  recentSignups: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics>({
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0,
    recentSignups: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users from Firestore
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);

      const usersData: UserData[] = [];
      usersSnapshot.forEach((doc) => {
        usersData.push({ uid: doc.id, ...doc.data() } as UserData);
      });

      // Fetch analytics for each user
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      // Get page views for each user
      const pageViewsRef = collection(db, 'pageViews');
      const pageViewsQuery = query(
        pageViewsRef,
        where('timestamp', '>=', startDate)
      );
      const pageViewsSnapshot = await getDocs(pageViewsQuery);

      // Get sessions for each user
      const sessionsRef = collection(db, 'userSessions');
      const sessionsQuery = query(
        sessionsRef,
        where('startTime', '>=', startDate)
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);

      // Process analytics data
      const userPageViews: { [key: string]: number } = {};
      const userSessions: { [key: string]: number } = {};
      const userLastActivity: { [key: string]: any } = {};

      pageViewsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId) {
          userPageViews[data.userId] = (userPageViews[data.userId] || 0) + 1;
          if (!userLastActivity[data.userId] || data.timestamp > userLastActivity[data.userId]) {
            userLastActivity[data.userId] = data.timestamp;
          }
        }
      });

      sessionsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId) {
          userSessions[data.userId] = (userSessions[data.userId] || 0) + 1;
        }
      });

      // Combine user data with analytics
      const enrichedUsers = usersData.map(user => ({
        ...user,
        pageViews: userPageViews[user.uid] || 0,
        sessions: userSessions[user.uid] || 0,
        lastActivity: userLastActivity[user.uid] || null
      }));

      // Calculate overall analytics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSignups = enrichedUsers.filter(user => {
        if (!user.createdAt) return false;
        const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        return createdDate >= thirtyDaysAgo;
      }).length;

      const activeUsers = enrichedUsers.filter(user => user.lastActivity).length;

      setUsers(enrichedUsers);
      setAnalytics({
        totalUsers: enrichedUsers.length,
        adminUsers: enrichedUsers.filter(user => user.isAdmin).length,
        activeUsers,
        recentSignups
      });

    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [timeRange]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getActivityStatus = (user: UserData) => {
    if (!user.lastActivity) return 'inactive';
    const lastActivity = user.lastActivity.toDate ? user.lastActivity.toDate() : new Date(user.lastActivity);
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActivity <= 1) return 'active';
    if (daysSinceActivity <= 7) return 'recent';
    return 'inactive';
  };

  const getActivityBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'recent':
        return <Badge className="bg-yellow-600 text-white">Recent</Badge>;
      default:
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-slate-950 p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-slate-400">Loading user data...</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-slate-400">Manage users and view analytics</p>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="flex gap-2">
              {[7, 30, 90].map((days) => (
                <Button
                  key={days}
                  variant={timeRange === days ? 'default' : 'outline'}
                  onClick={() => setTimeRange(days)}
                  className={timeRange === days ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
                >
                  {days} days
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <Alert className="mb-6 border-red-500 bg-red-950/50">
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                <Users className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analytics.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Admin Users</CardTitle>
                <UserCheck className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analytics.adminUsers}</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analytics.activeUsers}</div>
                <p className="text-xs text-slate-500">Last {timeRange} days</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Recent Signups</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analytics.recentSignups}</div>
                <p className="text-xs text-slate-500">Last 30 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Activity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((user) => (
                      <tr key={user.uid} className="hover:bg-slate-800/50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {user.photoURL && (
                              <img 
                                className="h-8 w-8 rounded-full mr-3" 
                                src={user.photoURL} 
                                alt={user.displayName || user.email} 
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-slate-200">
                                {user.displayName || 'Unknown'}
                              </div>
                              <div className="text-sm text-slate-400 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            user.isAdmin 
                              ? "bg-emerald-700 text-emerald-200" 
                              : "bg-slate-700 text-slate-300"
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {getActivityBadge(getActivityStatus(user))}
                            {user.emailVerified && (
                              <Badge variant="outline" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-slate-300">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {user.pageViews || 0} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {user.sessions || 0} sessions
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Last active: {formatDateTime(user.lastActivity)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-slate-300 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminProtectedRoute>
  );
} 
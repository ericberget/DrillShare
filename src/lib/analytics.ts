import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { app } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Initialize analytics
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export interface PageView {
  id?: string;
  path: string;
  title: string;
  userId?: string;
  userEmail?: string;
  userAgent: string;
  referrer: string;
  timestamp: any;
  sessionId: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

export interface UserSession {
  id?: string;
  userId?: string;
  userEmail?: string;
  startTime: any;
  endTime?: any;
  pageViews: number;
  sessionId: string;
  userAgent: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

// Helper function to detect device type
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
};

// Helper function to get browser info
const getBrowserInfo = () => {
  if (typeof window === 'undefined') return { browser: 'Unknown', os: 'Unknown' };
  
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  
  // Detect browser
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';
  
  // Detect OS
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  return { browser, os };
};

// Generate session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Track page view
export const trackPageView = async (
  path: string, 
  title: string, 
  userId?: string, 
  userEmail?: string
) => {
  try {
    // Firebase Analytics
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_title: title,
        page_location: path,
        user_id: userId || 'anonymous'
      });
    }

    // Custom tracking in Firestore
    const sessionId = sessionStorage.getItem('sessionId') || generateSessionId();
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', sessionId);
    }

    const { browser, os } = getBrowserInfo();
    const deviceType = getDeviceType();

    const pageView: Omit<PageView, 'id'> = {
      path,
      title,
      userId,
      userEmail,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      timestamp: serverTimestamp(),
      sessionId,
      deviceType,
      browser,
      os
    };

    // Store in Firestore
    await addDoc(collection(db, 'pageViews'), pageView);

    // Update session
    await updateSession(sessionId, userId, userEmail, deviceType, browser, os);

  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Update or create session
const updateSession = async (
  sessionId: string,
  userId?: string,
  userEmail?: string,
  deviceType?: 'desktop' | 'mobile' | 'tablet',
  browser?: string,
  os?: string
) => {
  try {
    const sessionsRef = collection(db, 'userSessions');
    const q = query(sessionsRef, where('sessionId', '==', sessionId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Create new session
      const session: Omit<UserSession, 'id'> = {
        userId,
        userEmail,
        startTime: serverTimestamp(),
        pageViews: 1,
        sessionId,
        userAgent: navigator.userAgent,
        deviceType: deviceType || getDeviceType(),
        browser: browser || getBrowserInfo().browser,
        os: os || getBrowserInfo().os
      };
      await addDoc(sessionsRef, session);
    } else {
      // Update existing session
      const sessionDoc = querySnapshot.docs[0];
      await updateDoc(sessionDoc.ref, {
        pageViews: (sessionDoc.data().pageViews || 0) + 1,
        endTime: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating session:', error);
  }
};

// Get analytics data for admin dashboard
export const getAnalyticsData = async (days: number = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get page views
    const pageViewsRef = collection(db, 'pageViews');
    const pageViewsQuery = query(
      pageViewsRef,
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'desc')
    );
    const pageViewsSnapshot = await getDocs(pageViewsQuery);

    // Get sessions
    const sessionsRef = collection(db, 'userSessions');
    const sessionsQuery = query(
      sessionsRef,
      where('startTime', '>=', startDate),
      orderBy('startTime', 'desc')
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);

    const pageViews = pageViewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PageView[];

    const sessions = sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserSession[];

    // Calculate metrics
    const totalPageViews = pageViews.length;
    const totalSessions = sessions.length;
    const uniqueUsers = new Set(sessions.map(s => s.userId).filter(Boolean)).size;
    const anonymousUsers = sessions.filter(s => !s.userId).length;

    // Top pages
    const pageCounts = pageViews.reduce((acc: any, pv) => {
      acc[pv.path] = (acc[pv.path] || 0) + 1;
      return acc;
    }, {});

    const topPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Device breakdown
    const deviceCounts = pageViews.reduce((acc: any, pv) => {
      acc[pv.deviceType] = (acc[pv.deviceType] || 0) + 1;
      return acc;
    }, {});

    // Browser breakdown
    const browserCounts = pageViews.reduce((acc: any, pv) => {
      acc[pv.browser] = (acc[pv.browser] || 0) + 1;
      return acc;
    }, {});

    // Daily breakdown
    const dailyData = pageViews.reduce((acc: any, pv) => {
      const date = pv.timestamp?.toDate?.() || new Date();
      const dayKey = date.toISOString().split('T')[0];
      acc[dayKey] = (acc[dayKey] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPageViews,
      totalSessions,
      uniqueUsers,
      anonymousUsers,
      topPages,
      deviceCounts,
      browserCounts,
      dailyData,
      recentPageViews: pageViews.slice(0, 50),
      recentSessions: sessions.slice(0, 50)
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return null;
  }
};

// Set user properties for analytics
export const setUserAnalytics = (userId: string, userEmail: string) => {
  if (analytics) {
    setUserId(analytics, userId);
    setUserProperties(analytics, {
      user_email: userEmail
    });
  }
}; 
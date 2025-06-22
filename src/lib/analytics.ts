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

// Get location data
const getLocationData = async () => {
  try {
    const response = await fetch('/api/analytics/location');
    if (!response.ok) {
      return { ipAddress: 'Unknown', country: 'Unknown', city: 'Unknown' };
    }
    const data = await response.json();
    return {
      ipAddress: data.ip,
      country: data.country,
      city: data.city,
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    return { ipAddress: 'Unknown', country: 'Unknown', city: 'Unknown' };
  }
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
    const locationData = await getLocationData();

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
      os,
      ...locationData,
    };

    // Store in Firestore
    await addDoc(collection(db, 'pageViews'), pageView);

    // Update session
    await updateSession(sessionId, userId, userEmail, deviceType, browser, os, locationData);

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
  os?: string,
  locationData?: { ipAddress?: string; country?: string; city?: string }
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
        os: os || getBrowserInfo().os,
        ...locationData,
      };
      await addDoc(sessionsRef, session);
    } else {
      // Update existing session
      const sessionDoc = querySnapshot.docs[0];
      const updateData: any = {
        pageViews: (sessionDoc.data().pageViews || 0) + 1,
        endTime: serverTimestamp()
      };

      if (userId && !sessionDoc.data().userId) {
        updateData.userId = userId;
        updateData.userEmail = userEmail;
      }
      
      await updateDoc(sessionDoc.ref, updateData);
    }
  } catch (error) {
    console.error('Error updating session:', error);
  }
};

// Get analytics data for admin dashboard
export const getAnalyticsData = async (days: number = 30) => {
  console.log(`Fetching analytics data for the last ${days} days...`);
  
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    console.log(`Querying data since: ${startDate.toISOString()}`);

    // Get page views
    const pageViewsRef = collection(db, 'pageViews');
    const pageViewsQuery = query(
      pageViewsRef,
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'desc')
    );
    const pageViewsSnapshot = await getDocs(pageViewsQuery);
    console.log(`Found ${pageViewsSnapshot.size} page views.`);

    // Get sessions
    const sessionsRef = collection(db, 'userSessions');
    const sessionsQuery = query(
      sessionsRef,
      where('startTime', '>=', startDate),
      orderBy('startTime', 'desc')
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);
    console.log(`Found ${sessionsSnapshot.size} sessions.`);

    if (pageViewsSnapshot.empty && sessionsSnapshot.empty) {
      console.warn('No analytics data found for the selected time range.');
      return {
        totalPageViews: 0,
        totalSessions: 0,
        uniqueUsers: 0,
        anonymousUsers: 0,
        topPages: [],
        deviceCounts: {},
        browserCounts: {},
        topLocations: [],
        dailyData: {},
        recentPageViews: [],
        recentSessions: [],
      };
    }

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
      .sort((a, b) => b.count - a.count);

    // Device counts
    const deviceCounts = sessions.reduce((acc: any, s) => {
      const device = s.deviceType || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    // Browser counts
    const browserCounts = sessions.reduce((acc: any, s) => {
      const browser = s.browser || 'unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    // Location counts
    const locationCounts = sessions.reduce((acc: any, s) => {
      if (s.country && s.city) {
        const location = `${s.city}, ${s.country}`;
        acc[location] = (acc[location] || 0) + 1;
      }
      return acc;
    }, {});
    
    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count: count as number }))
      .sort((a, b) => b.count - a.count);

    // Daily data
    const dailyData = pageViews.reduce((acc: any, pv) => {
      const date = pv.timestamp?.toDate?.() || new Date();
      const dayKey = date.toISOString().split('T')[0];
      acc[dayKey] = (acc[dayKey] || 0) + 1;
      return acc;
    }, {});

    console.log('Successfully processed analytics data.');
    return {
      totalPageViews,
      totalSessions,
      uniqueUsers,
      anonymousUsers,
      topPages,
      deviceCounts,
      browserCounts,
      topLocations,
      dailyData,
      recentPageViews: pageViews.slice(0, 10),
      recentSessions: sessions.slice(0, 10)
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error; // Re-throw the error to be caught by the UI
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
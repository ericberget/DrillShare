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
    // Try to get location from our API first
    const response = await fetch('/api/analytics/location', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      console.warn('Location API returned non-OK status:', response.status);
      return await getFallbackLocation();
    }
    
    const data = await response.json();
    
    // Check if we got valid location data
    if (data.city && data.country && data.city !== 'Unknown' && data.country !== 'Unknown') {
      console.log('Successfully got location data:', data);
      return {
        ipAddress: data.ip || 'Unknown',
        country: data.country,
        city: data.city,
      };
    } else {
      console.warn('Got unknown location from API, trying fallback');
      return await getFallbackLocation();
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
    return await getFallbackLocation();
  }
};

// Fallback location detection using browser APIs and timezone
const getFallbackLocation = async (): Promise<{ ipAddress: string; country: string; city: string }> => {
  try {
    // Try to get location from timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('Detected timezone:', timezone);
    
    // Basic timezone to location mapping
    const timezoneMap: { [key: string]: { country: string; city: string } } = {
      'America/New_York': { country: 'United States', city: 'New York' },
      'America/Chicago': { country: 'United States', city: 'Chicago' },
      'America/Denver': { country: 'United States', city: 'Denver' },
      'America/Los_Angeles': { country: 'United States', city: 'Los Angeles' },
      'America/Phoenix': { country: 'United States', city: 'Phoenix' },
      'Europe/London': { country: 'United Kingdom', city: 'London' },
      'Europe/Paris': { country: 'France', city: 'Paris' },
      'Europe/Berlin': { country: 'Germany', city: 'Berlin' },
      'Asia/Tokyo': { country: 'Japan', city: 'Tokyo' },
      'Asia/Shanghai': { country: 'China', city: 'Shanghai' },
      'Australia/Sydney': { country: 'Australia', city: 'Sydney' },
    };
    
    if (timezone && timezoneMap[timezone]) {
      const location = timezoneMap[timezone];
      console.log('Using timezone-based location:', location);
      return {
        ipAddress: 'Unknown',
        country: location.country,
        city: location.city,
      };
    }
    
    // Try to detect country from language settings
    const language = navigator.language || 'en-US';
    const countryCode = language.split('-')[1];
    
    const countryMap: { [key: string]: { country: string; city: string } } = {
      'US': { country: 'United States', city: 'Unknown City' },
      'GB': { country: 'United Kingdom', city: 'Unknown City' },
      'CA': { country: 'Canada', city: 'Unknown City' },
      'AU': { country: 'Australia', city: 'Unknown City' },
      'DE': { country: 'Germany', city: 'Unknown City' },
      'FR': { country: 'France', city: 'Unknown City' },
      'ES': { country: 'Spain', city: 'Unknown City' },
      'IT': { country: 'Italy', city: 'Unknown City' },
      'JP': { country: 'Japan', city: 'Unknown City' },
      'KR': { country: 'South Korea', city: 'Unknown City' },
    };
    
    if (countryCode && countryMap[countryCode]) {
      const location = countryMap[countryCode];
      console.log('Using language-based location:', location);
      return {
        ipAddress: 'Unknown',
        country: location.country,
        city: location.city,
      };
    }
    
  } catch (error) {
    console.error('Error in fallback location detection:', error);
  }
  
  // Final fallback
  console.log('Using final fallback location');
  return { 
    ipAddress: 'Unknown', 
    country: 'Unknown', 
    city: 'Unknown' 
  };
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
    
    // Expand range to handle potential date issues (look both backwards and forwards)
    const expandedStartDate = new Date();
    expandedStartDate.setDate(expandedStartDate.getDate() - (days * 2)); // Double the range back
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 365); // Look far into future for date issues
    
    console.log(`Querying data since: ${startDate.toISOString()}`);
    console.log(`Expanded start date: ${expandedStartDate.toISOString()}`);
    console.log(`Current date: ${new Date().toISOString()}`);
    console.log(`Future date check: ${futureDate.toISOString()}`);

    // Get page views with expanded date range
    const pageViewsRef = collection(db, 'pageViews');
    const pageViewsQuery = query(
      pageViewsRef,
      where('timestamp', '>=', expandedStartDate),
      orderBy('timestamp', 'desc')
    );
    const pageViewsSnapshot = await getDocs(pageViewsQuery);
    console.log(`Found ${pageViewsSnapshot.size} page views with expanded range.`);

    // Get sessions with expanded date range
    const sessionsRef = collection(db, 'userSessions');
    const sessionsQuery = query(
      sessionsRef,
      where('startTime', '>=', expandedStartDate),
      orderBy('startTime', 'desc')
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);
    console.log(`Found ${sessionsSnapshot.size} sessions with expanded range.`);

    // If still empty, try getting recent data without date filter
    let allPageViews: PageView[] = [];
    let allSessions: UserSession[] = [];
    
    if (pageViewsSnapshot.empty && sessionsSnapshot.empty) {
      console.log('🔍 No data found with date filter, trying without date restrictions...');
      
      // Get recent page views without date filter
      const allPageViewsQuery = query(pageViewsRef, orderBy('timestamp', 'desc'));
      const allPageViewsSnapshot = await getDocs(allPageViewsQuery);
      allPageViews = allPageViewsSnapshot.docs.slice(0, 50).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PageView[];
      
      // Get recent sessions without date filter
      const allSessionsQuery = query(sessionsRef, orderBy('startTime', 'desc'));
      const allSessionsSnapshot = await getDocs(allSessionsQuery);
      allSessions = allSessionsSnapshot.docs.slice(0, 50).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserSession[];
      
      console.log(`Found ${allPageViews.length} recent page views and ${allSessions.length} recent sessions without date filter.`);
    }

    // Use the data we found (either with date filter or without)
    const pageViews = pageViewsSnapshot.empty ? allPageViews : pageViewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PageView[];

    const sessions = sessionsSnapshot.empty ? allSessions : sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserSession[];

    // Log some sample session dates to debug date issues
    if (sessions.length > 0) {
      console.log('🔍 Sample session timestamps:');
      sessions.slice(0, 5).forEach((session, index) => {
        const startTime = session.startTime?.toDate?.() || new Date(session.startTime);
        console.log(`  ${index + 1}. Session ${session.sessionId?.substring(0, 8)}: ${startTime.toISOString()}, User: ${session.userEmail || 'Anonymous'}`);
      });
    }

    if (pageViews.length === 0 && sessions.length === 0) {
      console.warn('No analytics data found even without date restrictions.');
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

    // Log session distribution by user
    console.log('🔍 Session distribution by user:');
    const sessionsByUser = sessions.reduce((acc: any, session) => {
      const userKey = session.userEmail || session.userId || 'Anonymous';
      acc[userKey] = (acc[userKey] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(sessionsByUser)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .forEach(([user, count]) => {
        console.log(`  ${user}: ${count} sessions`);
      });

    // Calculate metrics
    const totalPageViews = pageViews.length;
    const totalSessions = sessions.length;
    
    // Get unique users from both pageViews and sessions
    const userIdsFromPageViews = new Set(pageViews.map(pv => pv.userId).filter(Boolean));
    const userIdsFromSessions = new Set(sessions.map(s => s.userId).filter(Boolean));
    const allUniqueUserIds = new Set([...userIdsFromPageViews, ...userIdsFromSessions]);
    const uniqueUsers = allUniqueUserIds.size;
    
    // Count anonymous activity more comprehensively
    const anonymousPageViews = pageViews.filter(pv => !pv.userId).length;
    const anonymousSessions = sessions.filter(s => !s.userId).length;
    
    // Get unique anonymous sessions by sessionId
    const anonymousSessionIds = new Set(
      sessions
        .filter(s => !s.userId && s.sessionId)
        .map(s => s.sessionId)
    );
    const anonymousUsers = anonymousSessionIds.size;

    console.log(`🔍 Analytics Debug:`);
    console.log(`  - Total Page Views: ${totalPageViews}`);
    console.log(`  - Total Sessions: ${totalSessions}`);
    console.log(`  - Unique User IDs from PageViews: ${userIdsFromPageViews.size}`);
    console.log(`  - Unique User IDs from Sessions: ${userIdsFromSessions.size}`);
    console.log(`  - Combined Unique Users: ${uniqueUsers}`);
    console.log(`  - Anonymous Page Views: ${anonymousPageViews}`);
    console.log(`  - Anonymous Sessions: ${anonymousSessions}`);
    console.log(`  - Unique Anonymous Users: ${anonymousUsers}`);

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
      if (s.country && s.city && s.country !== 'Unknown' && s.city !== 'Unknown') {
        const location = `${s.city}, ${s.country}`;
        acc[location] = (acc[location] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Also count unknown locations separately
    const unknownLocationCount = sessions.filter(s => 
      !s.country || !s.city || s.country === 'Unknown' || s.city === 'Unknown'
    ).length;
    
    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count: count as number }))
      .sort((a, b) => b.count - a.count);

    // Add unknown locations at the end if there are any
    if (unknownLocationCount > 0) {
      topLocations.push({ location: 'Unknown Location', count: unknownLocationCount });
    }

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

// Get user analytics data for admin dashboard
export const getUserAnalyticsData = async (days: number = 30) => {
  console.log(`Fetching user analytics data for the last ${days} days...`);
  
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    console.log(`Querying user data since: ${startDate.toISOString()}`);

    // Get page views
    const pageViewsRef = collection(db, 'pageViews');
    const pageViewsQuery = query(
      pageViewsRef,
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'desc')
    );
    const pageViewsSnapshot = await getDocs(pageViewsQuery);
    console.log(`Found ${pageViewsSnapshot.size} page views for user analytics.`);

    // Get sessions
    const sessionsRef = collection(db, 'userSessions');
    const sessionsQuery = query(
      sessionsRef,
      where('startTime', '>=', startDate),
      orderBy('startTime', 'desc')
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);
    console.log(`Found ${sessionsSnapshot.size} sessions for user analytics.`);

    const pageViews = pageViewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PageView[];

    const sessions = sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserSession[];

    // Aggregate user data
    const userPageViews: { [key: string]: number } = {};
    const userSessions: { [key: string]: number } = {};
    const userLastActivity: { [key: string]: any } = {};
    const userEmails: { [key: string]: string } = {};

    // Process page views
    pageViews.forEach(pv => {
      if (pv.userId) {
        userPageViews[pv.userId] = (userPageViews[pv.userId] || 0) + 1;
        if (pv.userEmail) {
          userEmails[pv.userId] = pv.userEmail;
        }
        if (!userLastActivity[pv.userId] || pv.timestamp > userLastActivity[pv.userId]) {
          userLastActivity[pv.userId] = pv.timestamp;
        }
      }
    });

    // Process sessions
    sessions.forEach(session => {
      if (session.userId) {
        userSessions[session.userId] = (userSessions[session.userId] || 0) + 1;
        if (session.userEmail) {
          userEmails[session.userId] = session.userEmail;
        }
      }
    });

    // Calculate unique users
    const uniqueUsers = new Set([
      ...Object.keys(userPageViews),
      ...Object.keys(userSessions)
    ]).size;

    // Calculate anonymous users (sessions without userId)
    const anonymousUsers = sessions.filter(s => !s.userId).length;

    // Get active users (users with activity in the time range)
    const activeUsers = Object.keys(userLastActivity).length;

    console.log('Successfully processed user analytics data.');
    return {
      totalUniqueUsers: uniqueUsers,
      activeUsers,
      anonymousUsers,
      userPageViews,
      userSessions,
      userLastActivity,
      userEmails,
      totalPageViews: pageViews.length,
      totalSessions: sessions.length,
      recentPageViews: pageViews.slice(0, 10),
      recentSessions: sessions.slice(0, 10)
    };
  } catch (error) {
    console.error('Error fetching user analytics data:', error);
    throw error;
  }
};

// Debug function to investigate user analytics issues
export const debugAnalyticsData = async (days: number = 90) => {
  console.log(`🔍 DEBUG: Fetching analytics data for the last ${days} days...`);
  
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get sessions
    const sessionsRef = collection(db, 'userSessions');
    const sessionsQuery = query(
      sessionsRef,
      where('startTime', '>=', startDate),
      orderBy('startTime', 'desc')
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);

    const sessions = sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserSession[];

    console.log(`🔍 DEBUG: Found ${sessions.length} total sessions`);

    // Analyze userId distribution
    const userIdCounts: { [key: string]: number } = {};
    const sessionIdCounts: { [key: string]: number } = {};
    let sessionsWithUserId = 0;
    let sessionsWithoutUserId = 0;
    let uniqueSessionIds = new Set();
    let uniqueUserIds = new Set();

    sessions.forEach(session => {
      // Count by userId
      if (session.userId) {
        sessionsWithUserId++;
        uniqueUserIds.add(session.userId);
        const userKey = session.userEmail || session.userId;
        userIdCounts[userKey] = (userIdCounts[userKey] || 0) + 1;
      } else {
        sessionsWithoutUserId++;
      }

      // Count by sessionId
      if (session.sessionId) {
        uniqueSessionIds.add(session.sessionId);
        sessionIdCounts[session.sessionId] = (sessionIdCounts[session.sessionId] || 0) + 1;
      }
    });

    console.log(`🔍 DEBUG: Sessions with userId: ${sessionsWithUserId}`);
    console.log(`🔍 DEBUG: Sessions without userId: ${sessionsWithoutUserId}`);
    console.log(`🔍 DEBUG: Unique userIds: ${uniqueUserIds.size}`);
    console.log(`🔍 DEBUG: Unique sessionIds: ${uniqueSessionIds.size}`);

    // Show top users
    console.log(`🔍 DEBUG: Top users by session count:`);
    Object.entries(userIdCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([user, count], index) => {
        console.log(`  ${index + 1}. ${user}: ${count} sessions`);
      });

    // Show sessionId distribution (check for duplicates)
    const duplicateSessionIds = Object.entries(sessionIdCounts)
      .filter(([,count]) => count > 1)
      .sort(([,a], [,b]) => b - a);

    if (duplicateSessionIds.length > 0) {
      console.log(`🔍 DEBUG: Duplicate sessionIds found:`);
      duplicateSessionIds.slice(0, 5).forEach(([sessionId, count]) => {
        console.log(`  ${sessionId}: ${count} sessions`);
      });
    } else {
      console.log(`🔍 DEBUG: No duplicate sessionIds found`);
    }

    // Sample some sessions for inspection
    console.log(`🔍 DEBUG: Sample sessions:`);
    sessions.slice(0, 5).forEach((session, index) => {
      console.log(`  ${index + 1}. userId: ${session.userId || 'null'}, sessionId: ${session.sessionId}, email: ${session.userEmail || 'null'}`);
    });

    return {
      totalSessions: sessions.length,
      sessionsWithUserId,
      sessionsWithoutUserId,
      uniqueUserIds: uniqueUserIds.size,
      uniqueSessionIds: uniqueSessionIds.size,
      userIdCounts,
      duplicateSessionIds: duplicateSessionIds.length,
      sampleSessions: sessions.slice(0, 5).map(s => ({
        userId: s.userId,
        sessionId: s.sessionId,
        userEmail: s.userEmail,
        startTime: s.startTime,
        pageViews: s.pageViews
      }))
    };
  } catch (error) {
    console.error('🔍 DEBUG: Error in debug function:', error);
    throw error;
  }
}; 
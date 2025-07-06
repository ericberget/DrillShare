import { NextRequest, NextResponse } from 'next/server';
import { debugAnalyticsData } from '@/lib/analytics';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get days parameter from query string
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');
    
    console.log(`🔍 DEBUG API: Analyzing analytics data for ${days} days`);
    
    const debugData = await debugAnalyticsData(days);
    
    // Also fetch all sessions without date filter to check for date issues
    console.log('🔍 DEBUG API: Fetching ALL sessions (no date filter)...');
    const allSessionsRef = collection(db, 'userSessions');
    const allSessionsQuery = query(allSessionsRef, orderBy('startTime', 'desc'));
    const allSessionsSnapshot = await getDocs(allSessionsQuery);
    
    const allSessions = allSessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`🔍 DEBUG API: Found ${allSessions.length} total sessions in database`);
    
    // Log sample of all sessions with dates
    if (allSessions.length > 0) {
      console.log('🔍 DEBUG API: Sample of all sessions:');
      allSessions.slice(0, 10).forEach((session: any, index) => {
        const startTime = session.startTime?.toDate?.() || new Date(session.startTime);
        console.log(`  ${index + 1}. ${session.userEmail || 'Anonymous'}: ${startTime.toISOString()}`);
      });
    }
    
    // Also check page views without date filter
    console.log('🔍 DEBUG API: Fetching ALL page views (no date filter)...');
    const allPageViewsRef = collection(db, 'pageViews');
    const allPageViewsQuery = query(allPageViewsRef, orderBy('timestamp', 'desc'));
    const allPageViewsSnapshot = await getDocs(allPageViewsQuery);
    
    const allPageViews = allPageViewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`🔍 DEBUG API: Found ${allPageViews.length} total page views in database`);
    
    return NextResponse.json({
      success: true,
      data: {
        ...debugData,
        allSessionsCount: allSessions.length,
        allPageViewsCount: allPageViews.length,
        sampleAllSessions: allSessions.slice(0, 5).map((s: any) => ({
          userId: s.userId,
          userEmail: s.userEmail,
          sessionId: s.sessionId,
          startTime: s.startTime?.toDate?.()?.toISOString?.() || s.startTime,
          pageViews: s.pageViews
        })),
        sampleAllPageViews: allPageViews.slice(0, 5).map((pv: any) => ({
          userId: pv.userId,
          userEmail: pv.userEmail,
          path: pv.path,
          timestamp: pv.timestamp?.toDate?.()?.toISOString?.() || pv.timestamp,
          sessionId: pv.sessionId
        }))
      },
      message: 'Debug data collected successfully with comprehensive session analysis'
    });
  } catch (error) {
    console.error('🔍 DEBUG API: Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to collect debug data'
    }, { status: 500 });
  }
} 
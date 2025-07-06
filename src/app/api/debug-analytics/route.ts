import { NextRequest, NextResponse } from 'next/server';
import { debugAnalyticsData } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get days parameter from query string
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');
    
    console.log(`🔍 DEBUG API: Analyzing analytics data for ${days} days`);
    
    const debugData = await debugAnalyticsData(days);
    
    return NextResponse.json({
      success: true,
      data: debugData,
      message: 'Debug data collected successfully'
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
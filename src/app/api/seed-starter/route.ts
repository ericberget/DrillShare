import { NextResponse } from 'next/server';
import { seedUserStarterContent } from '@/services/contentService';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'userId is required'
      }, { status: 400 });
    }
    
    console.log(`Manual starter content seeding requested for user: ${userId}`);
    
    await seedUserStarterContent(userId);
    
    return NextResponse.json({
      success: true,
      message: `Successfully added starter videos for user ${userId}`
    });
    
  } catch (error) {
    console.error('Error in manual starter content seeding:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed starter content',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, adminSecret } = await request.json();

    const expectedSecret = process.env.ADMIN_SECRET || 'drillshare-admin-2024';
    if (adminSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // Find user by email using admin SDK
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Check if user is already an admin
    if (userData.isAdmin) {
      return NextResponse.json({ 
        message: 'User is already an admin',
        user: {
          uid: userDoc.id,
          email: userData.email,
          displayName: userData.displayName,
          isAdmin: true
        }
      });
    }

    // Make user an admin
    await userDoc.ref.update({
      isAdmin: true,
      adminGrantedAt: new Date(),
      adminGrantedBy: 'system'
    });

    return NextResponse.json({ 
      success: true,
      message: 'User has been made an admin',
      user: {
        uid: userDoc.id,
        email: userData.email,
        displayName: userData.displayName,
        isAdmin: true
      }
    });

  } catch (error) {
    console.error('Error making user admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
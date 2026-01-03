import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Get user data
    const user = await adminAuth.getUser(uid);
    
    return NextResponse.json({ 
      success: true, 
      uid,
      email: user.email 
    });
    
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}
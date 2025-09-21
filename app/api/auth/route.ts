import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Extract the bearer token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);

  try {
    // Validate the Quick Auth token with Farcaster
    const response = await fetch('https://api.farcaster.xyz/v1/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userData = await response.json();
    
    // Return user data
    return NextResponse.json({
      fid: userData.fid,
      username: userData.username,
      displayName: userData.displayName,
      pfpUrl: userData.pfpUrl,
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

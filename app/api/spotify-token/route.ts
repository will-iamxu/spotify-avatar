import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { getDynamicPrismaClient } from '../../../lib/db-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find the user's Spotify account
    const prisma = await getDynamicPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: { provider: 'spotify' }
        }
      }
    });

    if (!user || !user.accounts.length) {
      return NextResponse.json({ error: 'Spotify account not found' }, { status: 404 });
    }

    const spotifyAccount = user.accounts[0];
    
    // Check if token is expired and refresh if needed
    const now = Date.now();
    const expiresAt = spotifyAccount.expires_at ? spotifyAccount.expires_at * 1000 : 0;
    
    if (expiresAt && now >= expiresAt && spotifyAccount.refresh_token) {
      // Token is expired, refresh it
      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: spotifyAccount.refresh_token,
          }),
        });

        if (response.ok) {
          const tokens = await response.json();
          
          // Update the account with new tokens
          await prisma.account.update({
            where: { id: spotifyAccount.id },
            data: {
              access_token: tokens.access_token,
              expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
              refresh_token: tokens.refresh_token || spotifyAccount.refresh_token,
            },
          });

          return NextResponse.json({ accessToken: tokens.access_token });
        }
      } catch (error) {
        console.error('Error refreshing Spotify token:', error);
      }
    }

    // Return current access token if it's still valid
    if (spotifyAccount.access_token) {
      return NextResponse.json({ accessToken: spotifyAccount.access_token });
    }

    return NextResponse.json({ error: 'No valid access token available' }, { status: 401 });

  } catch (error) {
    console.error('Error fetching Spotify token:', error);
    return NextResponse.json({ error: 'Failed to fetch access token' }, { status: 500 });
  }
}
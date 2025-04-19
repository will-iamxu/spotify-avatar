import { NextRequest, NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // const state = searchParams.get('state'); // Optional: Verify state if you used one

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('Expires In:', expires_in);

    // **Important Security Note:** In a real app, you wouldn't typically send tokens
    // directly to the client like this. You'd usually store them securely
    // server-side (e.g., in an encrypted session cookie or database) and
    // use them in subsequent server-side API calls.
    // For simplicity in this example, we'll redirect and pass the token
    // via query params (NOT RECOMMENDED FOR PRODUCTION).

    // TODO: Implement secure token handling (e.g., session management)
    // For now, redirect to a page where we can use the token client-side (demonstration only)
    const redirectUrl = new URL('/dashboard', request.url); // Or wherever you want to go
    redirectUrl.searchParams.set('access_token', access_token);
    redirectUrl.searchParams.set('refresh_token', refresh_token); // Be extra careful with refresh tokens client-side

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.json({ error: 'Failed to authenticate with Spotify' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

const scopes = [
  'user-read-private',
  'user-read-email',
  'user-top-read', // To get top artists/tracks
  // Add other scopes as needed
];

// Ensure this uses the correct environment variable which now holds the 127.0.0.1 URI
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI, // Reads from .env.local
});

export async function GET() {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'some-state-optional');
  // Redirect the user to the Spotify authorization page
  return NextResponse.redirect(authorizeURL);
}

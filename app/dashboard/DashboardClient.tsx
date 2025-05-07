'use client'; // This component uses client-side hooks

import Image from 'next/image';
// Remove useSearchParams
// import { useSearchParams } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react'; // Import useSession, signIn, signOut
import { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-node';

// Define a type for the artist data we expect
interface Artist {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
    genres: string[];
}

// Define a type for the track data we expect
interface Track {
    id: string;
    name: string;
    artists: { name: string }[];
}

// Initialize the Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
});

export default function DashboardClient() {
    // Use session hook instead of searchParams
    const { data: session, status } = useSession();
    const accessToken = session?.accessToken as string | undefined; // Get token from session

    // Remove searchParams logic
    // const searchParams = useSearchParams();
    // const accessToken = searchParams.get('access_token');

    const [topArtists, setTopArtists] = useState<Artist[]>([]);
    const [topTracks, setTopTracks] = useState<Track[]>([]); // Add state for top tracks
    // Adjust initial loading state based on session status
    const [loading, setLoading] = useState<boolean>(status === 'loading');
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // --- Updated useEffect for fetching Spotify data ---
    useEffect(() => {
        // Only run if authenticated and accessToken is available
        if (status === 'authenticated' && accessToken) {
            spotifyApi.setAccessToken(accessToken);
            setLoading(true);
            setError(null); // Clear previous errors

            Promise.all([
                spotifyApi.getMyTopArtists({ limit: 20, time_range: 'long_term' }),
                spotifyApi.getMyTopTracks({ limit: 10, time_range: 'long_term' }) // Fetch top tracks
            ])
                .then(([artistData, trackData]) => {
                    console.log('Long term top artists:', artistData.body.items);
                    setTopArtists(artistData.body.items as Artist[]);
                    console.log('Long term top tracks:', trackData.body.items);
                    setTopTracks(trackData.body.items as Track[]);
                })
                .catch(err => {
                    console.error('Error fetching top artists:', err);
                    // Check for token refresh error from session
                    if (session?.error === 'RefreshAccessTokenError') {
                        setError('Session expired. Please log in again.');
                        signOut(); // Force sign out if refresh failed
                    } else {
                        setError('Failed to fetch your Spotify data.');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (status === 'unauthenticated') {
            // Handle case where user is not logged in
            setLoading(false);
            setError('Please log in to view your dashboard.');
            // Optionally redirect or show login prompt more prominently
        } else if (status === 'loading') {
            setLoading(true); // Ensure loading is true while session is loading
        }
    }, [status, accessToken, session?.error]); // Depend on session status and token

    // --- Handler for Avatar Generation ---
    const handleGenerateAvatar = async () => {
        // ... (existing handleGenerateAvatar logic) ...
        if ((!topArtists || topArtists.length === 0) && (!topTracks || topTracks.length === 0)) {
            setGenerationError("Cannot generate avatar without Spotify data. Please wait or log in again.");
            return;
        }
        setIsGenerating(true);
        setGenerationError(null);
        setAvatarUrl(null);
        const allGenres = topArtists.flatMap(artist => artist.genres);
        const uniqueGenres = [...new Set(allGenres)].slice(0, 15);
        const artistDataForApi = topArtists.slice(0, 5).map(artist => ({ name: artist.name }));
        const trackDataForApi = topTracks.slice(0, 5).map(track => ({ name: track.name, artists: track.artists.map(a => a.name) }));

        try {
            const response = await fetch('/api/generate-avatar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ genres: uniqueGenres, artists: artistDataForApi, tracks: trackDataForApi }), // Add tracks to API call
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
            if (data.imageUrl) setAvatarUrl(data.imageUrl);
            else throw new Error("Image URL not found in response.");
        } catch (err) {
            console.error("Generation failed:", err);
            setGenerationError(err instanceof Error ? err.message : "An unknown error occurred during generation.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Function to handle download ---
    const handleDownload = () => {
        // ... (existing handleDownload logic) ...
         if (!avatarUrl) return;
        const downloadUrl = `/api/download-avatar?url=${encodeURIComponent(avatarUrl)}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'spotify-avatar.webp';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Render based on session status ---
    if (status === 'loading') {
        // You might want a more specific loading state here,
        // similar to the Suspense fallback but indicating session loading
        return (
            <div className="w-full max-w-lg p-8 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-md text-center">
                <h1 className="text-3xl font-bold mb-6">Generate Your Spotify Avatar</h1>
                <p className="text-blue-300 mb-4">Authenticating...</p>
            </div>
        );
    }

    // --- Return the JSX structure ---
    // This is the same JSX structure previously in page.tsx
    return (
        <div className="w-full max-w-lg p-8 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-md text-center">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold">Spotify Avatar</h1>
                 {/* Add Sign Out Button */}
                 {status === 'authenticated' && (
                     <button
                         onClick={() => signOut({ callbackUrl: '/' })}
                         className="text-sm text-gray-400 hover:text-white border border-gray-600 px-3 py-1 rounded hover:bg-gray-700"
                     >
                         Sign Out
                     </button>
                 )}
            </div>


            {/* Show login prompt if unauthenticated */}
            {status === 'unauthenticated' && (
                 <div className="mt-6 text-center">
                    <p className="text-gray-300 mb-4">Please log in to generate your avatar.</p>
                    <button
                        onClick={() => signIn('spotify')}
                        className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-2 px-5 rounded-lg shadow-md"
                    >
                        Login with Spotify
                    </button>
                 </div>
            )}

            {/* Only show content if authenticated */}
            {status === 'authenticated' && (
                <>
                    {/* Display Spotify Loading/Error State */}
                    {loading && <p className="text-blue-300 mb-4">Loading your Spotify vibes...</p>}
                    {error && (
                        <div className="mb-4 p-3 bg-red-800 bg-opacity-50 rounded-md text-red-200">
                            <p>{error}</p>
                            {/* Don't need login link here if session error forces logout */}
                        </div>
                    )}

                    {/* Avatar Generation Section (only if not loading spotify data and no critical error) */}
                    {!loading && !error && (
                        <div className="mt-4">
                            {/* ... (rest of the avatar display, generation button, download button logic remains the same) ... */}
                             {/* Display Generated Avatar */}
                            {avatarUrl && (
                                <div className="mb-6 transition-opacity duration-500 ease-in-out">
                                    <Image
                                        src={avatarUrl}
                                        alt="Generated AI Avatar"
                                        width={320}
                                        height={320}
                                        className="rounded-lg object-cover mx-auto shadow-lg border-2 border-purple-500"
                                        priority
                                    />
                                    <button
                                        onClick={handleDownload}
                                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 disabled:opacity-50"
                                        disabled={!avatarUrl || isGenerating}
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v6a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Download Avatar
                                    </button>
                                </div>
                            )}

                            {/* Display Generation Loading/Error */}
                            {isGenerating && (
                                <div className="mb-4 flex items-center justify-center space-x-2 text-blue-300">
                                    <svg className="animate-spin h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Generating your avatar... (this may take a minute)</span>
                                </div>
                            )}
                            {generationError && (
                                <p className="text-red-300 bg-red-900 bg-opacity-40 p-2 rounded-md mb-4">
                                    Error: {generationError}
                                </p>
                            )}

                            {/* Generation Button */}
                            {!isGenerating && (
                                <div className="mt-4">
                                    <p className="text-gray-300 mb-4 text-sm">
                                        Ready to see your musical essence visualized?
                                    </p>
                                    <button
                                        onClick={handleGenerateAvatar}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        // Disable button if spotify data is loading, generating, or session is not authenticated
                                        disabled={isGenerating || loading || status !== 'authenticated'}
                                    >
                                        {avatarUrl ? 'Generate Again' : 'Generate Avatar'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
             {/* Removed the old fallback login prompt */}
        </div>
    );
}


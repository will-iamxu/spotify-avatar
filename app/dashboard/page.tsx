'use client'; // Needed for hooks like useSearchParams and useState/useEffect

import Image from 'next/image'; // Import next/image
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-node';

// Define a type for the artist data we expect (still needed for prompt generation)
interface Artist {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
    genres: string[];
}

// Initialize the Spotify API client (can be done outside the component)
// Note: If NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set in .env.local, this might be undefined.
// It's not strictly needed here if only using an existing access token.
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
});

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const accessToken = searchParams.get('access_token');
    const [topArtists, setTopArtists] = useState<Artist[]>([]); // Still needed for data
    const [loading, setLoading] = useState<boolean>(true); // Start loading true
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // --- Updated useEffect for fetching Spotify data ---
    useEffect(() => {
        if (!accessToken) {
            setError('Access token not found. Please log in again.');
            setLoading(false); // Stop loading if no token
            return;
        }
        spotifyApi.setAccessToken(accessToken);
        setLoading(true); // Ensure loading is true when fetching
        setError(null);
        spotifyApi.getMyTopArtists({ limit: 20, time_range: 'long_term' })
            .then(data => {
                console.log('Long term top artists:', data.body.items);
                setTopArtists(data.body.items as Artist[]);
            })
            .catch(err => {
                console.error('Error fetching top artists:', err);
                setError('Failed to fetch your Spotify data. Please try logging in again.');
            })
            .finally(() => {
                setLoading(false); // Stop loading after fetch attempt
            });
    }, [accessToken]);

    // --- Updated Handler for Avatar Generation ---
    const handleGenerateAvatar = async () => {
        if (!topArtists || topArtists.length === 0) {
            setGenerationError("Cannot generate avatar without Spotify data. Please wait or log in again.");
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);
        setAvatarUrl(null);

        const allGenres = topArtists.flatMap(artist => artist.genres);
        const uniqueGenres = [...new Set(allGenres)].slice(0, 15);
        const artistDataForApi = topArtists.slice(0, 15).map(artist => ({ name: artist.name }));

        try {
            const response = await fetch('/api/generate-avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    genres: uniqueGenres,
                    artists: artistDataForApi
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            if (data.imageUrl) {
                setAvatarUrl(data.imageUrl);
            } else {
                throw new Error("Image URL not found in response.");
            }

        } catch (err) {
            console.error("Generation failed:", err);
            setGenerationError(err instanceof Error ? err.message : "An unknown error occurred during generation.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Updated Function to handle download via API proxy ---
    const handleDownload = () => {
        if (!avatarUrl) return;

        // Construct the URL for our backend download proxy route
        const downloadUrl = `/api/download-avatar?url=${encodeURIComponent(avatarUrl)}`;

        // Use a simple anchor link click to initiate the download from our backend
        const link = document.createElement('a');
        link.href = downloadUrl;
        // The 'download' attribute is less critical here as the backend sets Content-Disposition
        // but can still be useful as a fallback suggestion
        link.download = 'spotify-avatar.webp';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Updated & Simplified JSX Structure ---
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            <div className="w-full max-w-lg p-8 bg-gray-800 bg-opacity-70 rounded-xl shadow-2xl backdrop-blur-md text-center"> {/* Increased max-w */}
                <h1 className="text-3xl font-bold mb-6">Generate Your Spotify Avatar</h1>

                {/* Display Spotify Loading/Error State */}
                {loading && <p className="text-blue-300 mb-4">Loading your Spotify vibes...</p>}
                {error && (
                    <div className="mb-4 p-3 bg-red-800 bg-opacity-50 rounded-md text-red-200">
                        <p>{error}</p>
                        <a href="/api/auth/login" className="text-green-400 hover:underline font-semibold mt-2 block">Login Again</a>
                    </div>
                )}

                {/* Avatar Generation Section */}
                {!loading && !error && (
                    <div className="mt-4">
                        {/* Display Generated Avatar - Use next/image */}
                        {avatarUrl && (
                            <div className="mb-6 transition-opacity duration-500 ease-in-out">
                                {/* Replace <img> with <Image /> */}
                                <Image
                                    src={avatarUrl}
                                    alt="Generated AI Avatar"
                                    // width and height are required for next/image
                                    width={320} // Match width class w-80 (80 * 4 = 320)
                                    height={320} // Match height class h-80 (80 * 4 = 320)
                                    className="rounded-lg object-cover mx-auto shadow-lg border-2 border-purple-500"
                                    priority // Optional: Prioritize loading if it's LCP
                                />
                                 {/* Download Button */}
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
                                    disabled={isGenerating || loading || !accessToken} // Disable if loading spotify data, generating, or no token
                                >
                                    {avatarUrl ? 'Generate Again' : 'Generate Avatar'}
                                </button>
                             </div>
                         )}
                    </div>
                )}

                {/* Fallback Login Prompt if no token and not loading/error */}
                {!loading && !error && !accessToken && (
                    <p className="mt-6">Please <a href="/api/auth/login" className="text-green-400 hover:underline font-semibold">log in with Spotify</a> to begin.</p>
                )}
            </div>
        </main>
    );
}


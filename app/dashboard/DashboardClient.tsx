'use client';

import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircleIcon, 
  MusicalNoteIcon, 
  SparklesIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PhotoIcon,
  HeartIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast, { Toaster } from 'react-hot-toast';
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

    // Remove searchParams logic
    // const searchParams = useSearchParams();
    // const accessToken = searchParams.get('access_token');

    const [topArtists, setTopArtists] = useState<Artist[]>([]);
    const [topTracks, setTopTracks] = useState<Track[]>([]); // Add state for top tracks
    // Adjust initial loading state based on session status
    const [loading, setLoading] = useState<boolean>(status === 'loading');
    const [error, setError] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarId, setAvatarId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [packOpening, setPackOpening] = useState<boolean>(false);
    const [showPackAnimation, setShowPackAnimation] = useState<boolean>(false);
    const [userAvatars, setUserAvatars] = useState<Array<{
        id: string;
        status: string;
        createdAt: string;
        signedUrl?: string;
        metadata?: unknown;
    }>>([]);
    const [activeTab, setActiveTab] = useState<'generate' | 'gallery' | 'profile'>('generate');
    const [showStats, setShowStats] = useState(false);
    const [favoriteAvatars, setFavoriteAvatars] = useState<Set<string>>(new Set());

    // --- Updated useEffect for fetching Spotify data ---
    useEffect(() => {
        if (status === 'authenticated') {
            setLoading(true);
            setError(null);
            
            // Fetch Spotify access token from our API
            fetch('/api/spotify-token')
                .then(res => res.json())
                .then(data => {
                    if (data.accessToken) {
                        spotifyApi.setAccessToken(data.accessToken);
                        return fetchSpotifyData();
                    } else {
                        throw new Error('No access token available');
                    }
                })
                .catch(err => {
                    console.error('Error getting Spotify access token:', err);
                    setError('Failed to connect to Spotify. Please try logging in again.');
                    setLoading(false);
                });
        } else if (status === 'unauthenticated') {
            setLoading(false);
            setError('Please log in to view your dashboard.');
        } else if (status === 'loading') {
            setLoading(true);
        }
    }, [status]);

    const fetchSpotifyData = async () => {
        try {
            // Get mix of time ranges for variety - like opening a fresh pack!
            const [mediumArtists, mediumTracks, shortArtists, shortTracks] = await Promise.all([
                spotifyApi.getMyTopArtists({ limit: 12, time_range: 'medium_term' }), // 6 months
                spotifyApi.getMyTopTracks({ limit: 6, time_range: 'medium_term' }),
                spotifyApi.getMyTopArtists({ limit: 8, time_range: 'short_term' }), // 4 weeks - current favorites
                spotifyApi.getMyTopTracks({ limit: 4, time_range: 'short_term' })
            ]);

            // Combine and shuffle for variety
            const allArtists = [...mediumArtists.body.items, ...shortArtists.body.items];
            const allTracks = [...mediumTracks.body.items, ...shortTracks.body.items];
            
            // Remove duplicates and take top selections
            const uniqueArtists = allArtists.filter((artist, index, self) => 
                index === self.findIndex(a => a.id === artist.id)
            ).slice(0, 20);
            
            const uniqueTracks = allTracks.filter((track, index, self) =>
                index === self.findIndex(t => t.id === track.id)
            ).slice(0, 10);
            
            console.log('Mixed timeframe artists:', uniqueArtists);
            setTopArtists(uniqueArtists as Artist[]);
            console.log('Mixed timeframe tracks:', uniqueTracks);
            setTopTracks(uniqueTracks as Track[]);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching top artists:', err);
            setError('Failed to fetch your Spotify data.');
            setLoading(false);
        }
    };

    // Fetch user avatars
    useEffect(() => {
        if (session) {
            fetchUserAvatars();
        }
    }, [session]);

    const fetchUserAvatars = async () => {
        try {
            const response = await fetch('/api/user/avatars');
            if (response.ok) {
                const data = await response.json();
                setUserAvatars(data.avatars || []);
            }
        } catch (error) {
            console.error('Failed to fetch user avatars:', error);
        }
    };

    // --- Handler for Card Pack Opening ---
    const handleOpenPack = async () => {
        if ((!topArtists || topArtists.length === 0) && (!topTracks || topTracks.length === 0)) {
            toast.error("Cannot open pack without Spotify data. Please wait or log in again.");
            return;
        }
        
        // Start pack opening animation
        setPackOpening(true);
        setShowPackAnimation(true);
        setAvatarUrl(null);
        
        // Wait for pack animation then generate
        setTimeout(async () => {
            setIsGenerating(true);
            setPackOpening(false);
            await generateCard();
        }, 2000);
    };

    const generateCard = async () => {
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
            if (data.avatarId && data.imageUrl) {
                setAvatarId(data.avatarId);
                setAvatarUrl(data.imageUrl);
                // Refresh the gallery
                fetchUserAvatars();
                setShowPackAnimation(false);
                toast.success('🎴 New SoundCard revealed!');
            } else {
                throw new Error("Avatar ID or image URL not found in response.");
            }
        } catch (err) {
            console.error("Generation failed:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during generation.";
            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
            setShowPackAnimation(false);
        }
    };

    // --- Function to handle download ---
    const handleDownload = () => {
        if (!avatarId) return;
        const downloadUrl = `/api/download-avatar?id=${encodeURIComponent(avatarId)}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `spotify-avatar-${avatarId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleFavorite = (avatarId: string) => {
        const newFavorites = new Set(favoriteAvatars);
        if (newFavorites.has(avatarId)) {
            newFavorites.delete(avatarId);
        } else {
            newFavorites.add(avatarId);
        }
        setFavoriteAvatars(newFavorites);
    };

    const handleShare = (avatarUrl: string) => {
        if (navigator.share) {
            navigator.share({
                title: 'My Spotify Avatar',
                text: 'Check out my AI-generated Spotify avatar!',
                url: avatarUrl,
            });
        } else {
            navigator.clipboard.writeText(avatarUrl);
            toast.success('Avatar URL copied to clipboard!');
        }
    };

    // --- Render based on session status ---
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Authenticating...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Header */}
                <header className="border-b border-white/10 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <h1 className="text-2xl font-bold text-white">🎵 SoundCard</h1>
                                {session?.user && (
                                    <div className="hidden sm:flex items-center space-x-2 text-gray-300">
                                        <UserCircleIcon className="w-5 h-5" />
                                        <span className="text-sm">Welcome, {session.user.name}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowStats(!showStats)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ChartBarIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-gray-400 hover:text-white text-sm font-medium px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-400 transition-all"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Show login prompt if unauthenticated */}
                {status === 'unauthenticated' && (
                    <div className="flex items-center justify-center min-h-screen">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">Please sign in to continue</h2>
                            <button
                                onClick={() => signIn('spotify')}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
                            >
                                Login with Spotify
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* Main Dashboard Content */}
                {status === 'authenticated' && (
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Tab Navigation */}
                        <div className="flex space-x-1 bg-white/5 p-1 rounded-xl mb-8">
                            {[
                                { id: 'generate', label: 'Open Pack', icon: SparklesIcon },
                                { id: 'gallery', label: 'Collection', icon: PhotoIcon },
                                { id: 'profile', label: 'Profile', icon: UserCircleIcon },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'generate' | 'gallery' | 'profile')}
                                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'generate' && (
                                <motion.div
                                    key="generate"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid lg:grid-cols-2 gap-8"
                                >
                                    {/* Generation Panel */}
                                    <div className="space-y-6">
                                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                                <SparklesIcon className="w-6 h-6 mr-3 text-purple-400" />
                                                🎴 SoundCard Pack
                                            </h2>
                                            
                                            {loading ? (
                                                <div className="text-center py-8">
                                                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                    <p className="text-gray-300">Analyzing your Spotify data...</p>
                                                </div>
                                            ) : error ? (
                                                <div className="text-center py-8">
                                                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
                                                        <p className="text-red-300">{error}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {/* Music Insights */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-white/10">
                                                            <div className="flex items-center mb-2">
                                                                <MusicalNoteIcon className="w-5 h-5 text-purple-400 mr-2" />
                                                                <span className="text-sm text-gray-300">Top Artists</span>
                                                            </div>
                                                            <p className="text-xl font-bold text-white">{topArtists.length}</p>
                                                        </div>
                                                        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-xl border border-white/10">
                                                            <div className="flex items-center mb-2">
                                                                <HeartIcon className="w-5 h-5 text-cyan-400 mr-2" />
                                                                <span className="text-sm text-gray-300">Top Tracks</span>
                                                            </div>
                                                            <p className="text-xl font-bold text-white">{topTracks.length}</p>
                                                        </div>
                                                    </div>

                                                    {/* Pack Opening Button */}
                                                    <button
                                                        onClick={handleOpenPack}
                                                        disabled={isGenerating || packOpening}
                                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                                                    >
                                                        {packOpening ? (
                                                            <>
                                                                <motion.div
                                                                    animate={{ rotateY: [0, 180, 360] }}
                                                                    transition={{ duration: 0.8, repeat: Infinity }}
                                                                    className="text-2xl"
                                                                >
                                                                    🎴
                                                                </motion.div>
                                                                <span>Opening Pack...</span>
                                                            </>
                                                        ) : isGenerating ? (
                                                            <>
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                    className="text-xl"
                                                                >
                                                                    ✨
                                                                </motion.div>
                                                                <span>Crafting Your Card...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <motion.div
                                                                    whileHover={{ rotate: [0, -10, 10, 0] }}
                                                                    transition={{ duration: 0.5 }}
                                                                    className="text-xl"
                                                                >
                                                                    🎴
                                                                </motion.div>
                                                                <span>{avatarUrl ? 'Open New Pack' : 'Open Your First Pack'}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Preview Panel */}
                                    <div className="space-y-6">
                                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                                            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                                <EyeIcon className="w-5 h-5 mr-3 text-cyan-400" />
                                                🎴 Your SoundCard
                                            </h3>
                                            
                                            {avatarUrl ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="space-y-4"
                                                >
                                                    <div className="relative group">
                                                        <Image
                                                            src={avatarUrl}
                                                            alt="Generated Avatar"
                                                            width={400}
                                                            height={400}
                                                            className="w-full rounded-xl shadow-2xl border-2 border-purple-500/30"
                                                            priority
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center space-x-4">
                                                            <button
                                                                onClick={handleDownload}
                                                                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                                            >
                                                                <ArrowDownTrayIcon className="w-6 h-6 text-white" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleShare(avatarUrl)}
                                                                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                                            >
                                                                <ShareIcon className="w-6 h-6 text-white" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleFavorite(avatarId || '')}
                                                                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                                            >
                                                                {favoriteAvatars.has(avatarId || '') ? (
                                                                    <HeartIconSolid className="w-6 h-6 text-red-400" />
                                                                ) : (
                                                                    <HeartIcon className="w-6 h-6 text-white" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center relative overflow-hidden">
                                                    {showPackAnimation ? (
                                                        <motion.div
                                                            initial={{ scale: 0.8, rotateY: 0 }}
                                                            animate={{ 
                                                                scale: [0.8, 1.2, 1],
                                                                rotateY: [0, 180, 360, 540],
                                                            }}
                                                            transition={{ duration: 2, ease: "easeInOut" }}
                                                            className="text-8xl"
                                                        >
                                                            🎴
                                                        </motion.div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <motion.div
                                                                animate={{ 
                                                                    y: [0, -10, 0],
                                                                    rotateZ: [0, 5, -5, 0]
                                                                }}
                                                                transition={{ 
                                                                    duration: 3,
                                                                    repeat: Infinity,
                                                                    ease: "easeInOut"
                                                                }}
                                                                className="text-6xl mb-4"
                                                            >
                                                                🎴
                                                            </motion.div>
                                                            <p className="text-gray-400">Your SoundCard will appear here</p>
                                                            <p className="text-sm text-gray-500 mt-2">Open a pack to reveal your musical identity!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'gallery' && (
                                <motion.div
                                    key="gallery"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                            <PhotoIcon className="w-6 h-6 mr-3 text-cyan-400" />
                                            🎴 Your SoundCard Collection
                                        </h2>
                                        
                                        {userAvatars.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {userAvatars.map((avatar, index) => (
                                                    <motion.div
                                                        key={avatar.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="group relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-400/50 transition-all"
                                                    >
                                                        {avatar.signedUrl && (
                                                            <Image
                                                                src={avatar.signedUrl}
                                                                alt="Avatar"
                                                                width={300}
                                                                height={300}
                                                                className="w-full aspect-square object-cover rounded-lg mb-4"
                                                            />
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-400">
                                                                {new Date(avatar.createdAt).toLocaleDateString()}
                                                            </span>
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => toggleFavorite(avatar.id)}
                                                                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                                                >
                                                                    {favoriteAvatars.has(avatar.id) ? (
                                                                        <HeartIconSolid className="w-4 h-4" />
                                                                    ) : (
                                                                        <HeartIcon className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                                <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <PhotoIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                                <p className="text-gray-400 mb-4">No SoundCards yet</p>
                                                <button
                                                    onClick={() => setActiveTab('generate')}
                                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
                                                >
                                                    🎴 Open Your First Pack
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                                <UserCircleIcon className="w-6 h-6 mr-3 text-purple-400" />
                                                Profile
                                            </h2>
                                            
                                            {session?.user ? (
                                                <div className="space-y-6">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="relative">
                                                            {session.user.image ? (
                                                                <Image
                                                                    src={session.user.image}
                                                                    alt="Profile"
                                                                    width={80}
                                                                    height={80}
                                                                    className="w-20 h-20 rounded-full border-2 border-purple-400"
                                                                />
                                                            ) : (
                                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-purple-400">
                                                                    <UserCircleIcon className="w-12 h-12 text-white" />
                                                                </div>
                                                            )}
                                                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900"></div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-2xl font-bold text-white">{session.user.name || 'Music Lover'}</h3>
                                                            <p className="text-gray-400">{session.user.email}</p>
                                                            <div className="flex items-center mt-2">
                                                                <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-400/30">
                                                                    ♪ Connected to Spotify
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-400/20">
                                                            <p className="text-3xl font-bold text-purple-400">{userAvatars.length}</p>
                                                            <p className="text-sm text-gray-400 mt-1">🎴 SoundCards</p>
                                                        </div>
                                                        <div className="text-center p-4 bg-pink-500/10 rounded-xl border border-pink-400/20">
                                                            <p className="text-3xl font-bold text-pink-400">{favoriteAvatars.size}</p>
                                                            <p className="text-sm text-gray-400 mt-1">Favorites</p>
                                                        </div>
                                                        <div className="text-center p-4 bg-cyan-500/10 rounded-xl border border-cyan-400/20">
                                                            <p className="text-3xl font-bold text-cyan-400">{topArtists.length + topTracks.length}</p>
                                                            <p className="text-sm text-gray-400 mt-1">Music Items</p>
                                                        </div>
                                                    </div>

                                                    {/* Music Summary */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-lg font-semibold text-white">Your Music DNA</h4>
                                                        {topArtists.length > 0 && (
                                                            <div>
                                                                <p className="text-sm text-gray-400 mb-2">Top Artists</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {topArtists.slice(0, 5).map((artist, index) => (
                                                                        <span key={index} className="px-3 py-1 bg-white/10 text-white text-sm rounded-full">
                                                                            {artist.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {topTracks.length > 0 && (
                                                            <div>
                                                                <p className="text-sm text-gray-400 mb-2">Recent Favorites</p>
                                                                <div className="space-y-2">
                                                                    {topTracks.slice(0, 3).map((track, index) => (
                                                                        <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                                                            <div>
                                                                                <p className="text-white text-sm font-medium">{track.name}</p>
                                                                                <p className="text-gray-400 text-xs">{track.artists.map(a => a.name).join(', ')}</p>
                                                                            </div>
                                                                            <MusicalNoteIcon className="w-4 h-4 text-purple-400" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <UserCircleIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                                    <p className="text-gray-400">Loading profile...</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                                <Cog6ToothIcon className="w-6 h-6 mr-3 text-cyan-400" />
                                                Settings
                                            </h2>
                                            
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white">Email Notifications</span>
                                                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                                                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white">Public Gallery</span>
                                                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                                                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </>
    );
}


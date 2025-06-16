import { getDynamicPrismaClient } from './db-dynamic';
import SpotifyWebApi from 'spotify-web-api-node';

interface CachedSpotifyData {
  topArtists: unknown[];
  topTracks: unknown[];
  genres: string[];
  cachedAt: Date;
}

const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days in milliseconds - weekly refresh

export async function getCachedSpotifyData(
  userId: string, 
  spotifyApi: SpotifyWebApi,
  forceRefresh = false
): Promise<CachedSpotifyData> {
  
  const prisma = await getDynamicPrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if we have valid cached data
  const cachedData = user.spotifyData as CachedSpotifyData | null;
  const now = new Date();
  
  if (!forceRefresh && cachedData && cachedData.cachedAt) {
    const cacheAge = now.getTime() - new Date(cachedData.cachedAt).getTime();
    if (cacheAge < CACHE_DURATION) {
      console.log('Using cached Spotify data');
      return cachedData;
    }
  }

  console.log('Fetching fresh Spotify data');
  
  try {
    // Fetch fresh data from Spotify
    const [artistsResponse, tracksResponse] = await Promise.all([
      spotifyApi.getMyTopArtists({ 
        time_range: 'long_term', 
        limit: 20 
      }),
      spotifyApi.getMyTopTracks({ 
        time_range: 'long_term', 
        limit: 10 
      })
    ]);

    const topArtists = artistsResponse.body.items;
    const topTracks = tracksResponse.body.items;
    
    // Extract unique genres
    const allGenres = topArtists.flatMap(artist => artist.genres);
    const genres = [...new Set(allGenres)];

    const freshData: CachedSpotifyData = {
      topArtists,
      topTracks,
      genres,
      cachedAt: now
    };

    // Update cache in database
    await prisma.user.update({
      where: { id: userId },
      data: { 
        spotifyData: JSON.parse(JSON.stringify(freshData)),
        updatedAt: now
      }
    });

    // Log API usage
    await prisma.apiUsage.create({
      data: {
        userId,
        endpoint: 'spotify-data-fetch',
        metadata: {
          artistCount: topArtists.length,
          trackCount: topTracks.length,
          genreCount: genres.length,
          cached: false
        }
      }
    });

    return freshData;

  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    
    // If we have any cached data, return it as fallback
    if (cachedData) {
      console.log('Using stale cached data as fallback');
      return cachedData;
    }
    
    throw error;
  }
}

export async function invalidateSpotifyCache(userId: string): Promise<void> {
  const prisma = await getDynamicPrismaClient();
  await prisma.user.update({
    where: { id: userId },
    data: { 
      spotifyData: {},
      updatedAt: new Date()
    }
  });
}
/**
 * API Route: Generate Avatar Trading Card
 * 
 * This endpoint generates personalized trading cards based on user's Spotify music data.
 * Uses AI to create unique Pokémon-style cards reflecting musical preferences.
 * 
 * @route POST /api/generate-avatar
 * @access Private (requires authentication)
 * 
 * @module api/generate-avatar
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import Replicate from 'replicate';
import { getDynamicPrismaClient } from '../../../lib/db-dynamic';
import { uploadImageToS3, generateAvatarKey, getSignedDownloadUrl } from '../../../lib/s3';
import { replicateApiCall, withRetry } from '../../../lib/retry-utils';
import { rateLimitResponse, checkRateLimit, addRateLimitHeaders } from '../../../lib/rate-limiter';

/**
 * Replicate AI client for image generation
 * Configured with API token from environment variables
 */
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Request body structure for avatar generation
 * 
 * @interface GenerateAvatarRequest
 * @property {string[]} [genres] - User's top music genres
 * @property {Array<{name: string}>} [artists] - User's top artists
 * @property {Array<{name: string, artists: string[]}>} [tracks] - User's top tracks
 */
interface GenerateAvatarRequest {
  genres?: string[];
  artists?: { name: string }[];
  tracks?: { name: string; artists: string[] }[];
}

/**
 * AI model identifier for Recraft V3 image generation
 * High-quality model optimized for trading card artwork
 */
const MODEL_NAME = "recraft-ai/recraft-v3";

/**
 * POST /api/generate-avatar
 * 
 * Generates a personalized trading card based on user's Spotify music data.
 * 
 * @param {NextRequest} request - Request object containing user's music data
 * @returns {NextResponse} Generated avatar data or error response
 * 
 * @example
 * POST /api/generate-avatar
 * Body: {
 *   "genres": ["electronic", "house"],
 *   "artists": [{"name": "Daft Punk"}, {"name": "Justice"}],
 *   "tracks": [{"name": "One More Time", "artists": ["Daft Punk"]}]
 * }
 * 
 * Response: {
 *   "id": "avatar_123",
 *   "imageUrl": "https://signed-url...",
 *   "prompt": "Generated prompt text...",
 *   "status": "COMPLETED"
 * }
 */
export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("REPLICATE_API_TOKEN is not set");
    return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let requestBody: GenerateAvatarRequest;
  try {
    requestBody = await request.json();
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Destructure both genres and artists
  const { genres, artists, tracks } = requestBody; // Add tracks

  // Keep genre check, add optional artist check if needed
  if ((!genres || genres.length === 0) && (!artists || artists.length === 0) && (!tracks || tracks.length === 0)) {
    return NextResponse.json({ error: 'Genres, artists, or tracks are required to generate a prompt' }, { status: 400 });
  }

  // --- Weekly Card Pack System: Randomize selection for variety ---
  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Randomize genre selection (like drawing from a pack)
  const shuffledGenres = genres && genres.length > 0 ? shuffleArray(genres) : [];
  const selectedGenres = shuffledGenres.slice(0, Math.min(3, shuffledGenres.length));
  const topGenres = selectedGenres.join(', ');

  // Randomize artist selection 
  const shuffledArtists = artists && artists.length > 0 ? shuffleArray(artists) : [];
  const selectedArtists = shuffledArtists.slice(0, Math.min(3, shuffledArtists.length));
  const topArtistNames = selectedArtists.map(a => a.name);

  // Randomize track selection
  const shuffledTracks = tracks && tracks.length > 0 ? shuffleArray(tracks) : [];
  const selectedTracks = shuffledTracks.slice(0, Math.min(2, shuffledTracks.length));
  const topTrackInfo = selectedTracks.map(t => `${t.name} by ${t.artists.join(', ')}`);

  // Variety in card styles and themes
  const cardStyles = [
    'Pokémon-style trading card',
    'mystical trading card with ethereal elements',
    'vibrant anime-style trading card',
    'cosmic-themed trading card with galaxy elements',
    'retro-futuristic trading card',
    'holographic trading card with prism effects'
  ];
  
  const creatureTypes = [
    'a unique creature',
    'a mystical being',
    'an elemental spirit', 
    'a cosmic entity',
    'a musical guardian',
    'a harmonic familiar'
  ];

  const selectedStyle = cardStyles[Math.floor(Math.random() * cardStyles.length)];
  const selectedCreature = creatureTypes[Math.floor(Math.random() * creatureTypes.length)];
  
  // Create a prompt for variety
  let prompt = `Create a ${selectedStyle} featuring ${selectedCreature}.`;

  if (topGenres) {
    prompt += ` The creature is inspired by the musical genres: ${topGenres}.`;
  }
  if (topArtistNames.length > 0) {
    prompt += ` Its design and energy should reflect the vibe of artists like ${topArtistNames.join(', ')}.`;
  }
  if (topTrackInfo.length > 0) {
    prompt += ` It also embodies elements from tracks such as ${topTrackInfo.join('; and ')}.`;
  }

  // Generate varied HP values
  const hpValues = [60, 70, 80, 90, 100, 110, 130, 140, 150];
  const selectedHP = hpValues[Math.floor(Math.random() * hpValues.length)];
  
  // Generate attack names and damage based on music
  const attackPrefixes = ['Sonic', 'Rhythm', 'Beat', 'Melody', 'Bass', 'Echo', 'Vibe', 'Harmony'];
  const attackSuffixes = ['Blast', 'Wave', 'Strike', 'Pulse', 'Storm', 'Burst', 'Rush', 'Force'];
  
  const attack1Name = `${attackPrefixes[Math.floor(Math.random() * attackPrefixes.length)]} ${attackSuffixes[Math.floor(Math.random() * attackSuffixes.length)]}`;
  const attack2Name = `${attackPrefixes[Math.floor(Math.random() * attackPrefixes.length)]} ${attackSuffixes[Math.floor(Math.random() * attackSuffixes.length)]}`;
  
  const attack1Damage = [30, 40, 50, 60, 70][Math.floor(Math.random() * 5)];
  const attack2Damage = [80, 90, 100, 110, 120][Math.floor(Math.random() * 5)];

  prompt += ` 

Create a Pokemon-style trading card with this exact layout:

TOP SECTION:
- Creature name in large text at the very top
- "${selectedHP} HP" in the top right corner

MAIN ARTWORK:
- Large central illustration of the creature

BOTTOM SECTION:
- Attack 1: "${attack1Name}" - ${attack1Damage} damage
- Attack 2: "${attack2Name}" - ${attack2Damage} damage
- Small flavor text at the bottom

IMPORTANT: Use standard Pokemon card layout with yellow border. All text must be clearly readable and properly positioned within the card frame. Make sure the creature name fits at the top and HP is visible in the corner.`;

  console.log("Generated Prompt:", prompt);

  try {
    console.log(`Running Replicate model: ${MODEL_NAME}`);
    
    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Replicate API timeout after 50 seconds')), 50000)
    );
    
    // Use retry logic for Replicate API call with timeout
    const output: unknown = await Promise.race([
      replicateApiCall(
        () => replicate.run(
          MODEL_NAME,
          {
            input: {
              prompt: prompt,
              size: "1024x1024",
              num_outputs: 1,
            }
          }
        ),
        'avatar-generation'
      ),
      timeoutPromise
    ]);

    // Log the raw output to understand its structure
    console.log("Replicate Output:", output);

    let imageUrl: string | null = null;



    if (typeof output === 'object' && output !== null && 'output' in output && typeof output.output === 'string') {
        if (output.output.startsWith('http://') || output.output.startsWith('https://')) {
            imageUrl = output.output;
        }
    }
    else if (Array.isArray(output) && output.length > 0 && typeof output[0] === 'string') {
      imageUrl = output[0];
    }
    else if (typeof output === 'string') {
       if (output.startsWith('http://') || output.startsWith('https://')) {
           imageUrl = output; // Assign the string directly
       }
    }

    if (imageUrl) {
      // Find user in database (should exist due to Prisma adapter)
      const prisma = await getDynamicPrismaClient();
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found. Please try logging in again.' },
          { status: 401 }
        );
      }

      // Check rate limit
      const rateLimitCheck = await rateLimitResponse(user.id, 'generate-avatar', user.tier);
      if (rateLimitCheck) {
        return rateLimitCheck;
      }

      // Download the image from Replicate with retry logic
      const imageBuffer = await withRetry(
        async () => {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to download image from Replicate: ${response.status}`);
          }
          return Buffer.from(await response.arrayBuffer());
        },
        { maxAttempts: 3, baseDelay: 2000 }
      );
      
      // Create avatar record with GENERATING status
      const avatar = await prisma.avatar.create({
        data: {
          userId: user.id,
          imageUrl: '', // Will be updated after S3 upload
          prompt,
          status: 'GENERATING',
          metadata: {
            genres: topGenres,
            artists: topArtistNames,
            tracks: topTrackInfo,
            model: MODEL_NAME,
            originalReplicateUrl: imageUrl
          }
        }
      });

      // Upload to S3
      const s3Key = generateAvatarKey(user.id, avatar.id);
      const s3Url = await uploadImageToS3(imageBuffer, s3Key, 'image/png');

      // Update avatar with S3 URL and COMPLETED status
      const updatedAvatar = await prisma.avatar.update({
        where: { id: avatar.id },
        data: {
          imageUrl: s3Url,
          status: 'COMPLETED'
        }
      });

      // Generate signed URL for displaying the image
      const displayUrl = await getSignedDownloadUrl(s3Key);

      // Log API usage
      await prisma.apiUsage.create({
        data: {
          userId: user.id,
          endpoint: 'generate-avatar',
          metadata: {
            model: MODEL_NAME,
            prompt: prompt.substring(0, 500), // Truncate for storage
            s3Key
          }
        }
      });

      // Get updated rate limit info for headers
      const { remainingRequests, resetTime } = await checkRateLimit(user.id, 'generate-avatar', user.tier);
      
      const response = NextResponse.json({ 
        avatarId: updatedAvatar.id,
        imageUrl: displayUrl,
        s3Url: s3Url,
        status: 'completed'
      });

      // Add rate limit headers
      const rules = [
        { windowMs: 60 * 1000, maxRequests: 5, tier: 'FREE' },
        { windowMs: 60 * 1000, maxRequests: 20, tier: 'PRO' },
        { windowMs: 60 * 1000, maxRequests: 100, tier: 'ENTERPRISE' },
      ];
      const rule = rules.find(r => r.tier === user.tier) || rules[0];
      
      return addRateLimitHeaders(response, remainingRequests, resetTime, rule.maxRequests);
    } else {
      // Log the actual output structure when the format is unexpected
      console.error("Unexpected output format from Replicate:", JSON.stringify(output, null, 2));
      return NextResponse.json({ error: 'Failed to parse image URL from Replicate response. Check server logs for output structure.' }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error calling Replicate API:', error);
    let errorMessage = 'Failed to generate avatar.';
    let statusCode = 500;

    if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Avatar generation timed out. Please try again.';
          statusCode = 504;
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please wait before trying again.';
          statusCode = 429;
        } else {
          errorMessage = error.message;
        }
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        errorMessage = `API Error: ${error.message}`;
        console.error('API Error Details:', error);
    }

    // Ensure we always return valid JSON
    try {
      return NextResponse.json({ 
        error: errorMessage,
        code: 'GENERATION_FAILED',
        timestamp: new Date().toISOString()
      }, { status: statusCode });
    } catch {
      // Final fallback if JSON serialization fails
      return new Response(JSON.stringify({ 
        error: 'An unexpected error occurred during avatar generation.',
        code: 'GENERATION_FAILED',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}

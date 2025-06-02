import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import Replicate from 'replicate';
import { prisma } from '../../../lib/db';
import { uploadImageToS3, generateAvatarKey, getSignedDownloadUrl } from '../../../lib/s3';
import { replicateApiCall, withRetry } from '../../../lib/retry-utils';
import { rateLimitResponse, checkRateLimit, addRateLimitHeaders } from '../../../lib/rate-limiter';

// Initialize Replicate client with API token from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Define the expected input structure from the frontend
interface GenerateAvatarRequest {
  genres?: string[];
  artists?: { name: string }[]; // Expect an array of objects with a name property
  tracks?: { name: string; artists: string[] }[]; // Add tracks to the request
}

// Define the specific Replicate model to use (removing version hash as requested)
const MODEL_NAME = "recraft-ai/recraft-v3";

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

  prompt += ` The card should include:
- The creature's name (invent something creative based on the music).
- HP (e.g., 120 HP).
- An illustration of the creature in a dynamic pose, fitting the card frame. Style: vibrant, anime-inspired, trading card art.
- One or two attacks. Name the attacks based on the genres or artists (e.g., 'Synth Wave Burst' or 'Indie Rock Charge'). Include damage numbers (e.g., 60, 100+).
- Weakness and Resistance symbols (optional, can be generic energy types).
- Retreat cost (e.g., 2 energy symbols).
- A short flavor text description at the bottom relating the creature to its musical inspiration.
Layout: Standard Pokémon TCG card layout. Avoid photorealism. Focus on a clean, illustrated trading card look.`;

  console.log("Generated Prompt:", prompt);

  try {
    console.log(`Running Replicate model: ${MODEL_NAME}`);
    // Use retry logic for Replicate API call
    const output: unknown = await replicateApiCall(
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
    );

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
      // Find or create user in database
      let user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
          }
        });
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

    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        errorMessage = `Replicate API Error: ${error.message}`;
        console.error('Replicate Error Details:', error);
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

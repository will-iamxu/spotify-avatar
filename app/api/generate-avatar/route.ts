import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

// Initialize Replicate client with API token from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Define the expected input structure from the frontend
interface GenerateAvatarRequest {
  genres?: string[];
  artists?: { name: string }[]; // Expect an array of objects with a name property
}

// Define the specific Replicate model to use (removing version hash as requested)
const MODEL_NAME = "recraft-ai/recraft-v3";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("REPLICATE_API_TOKEN is not set");
    return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 });
  }

  let requestBody: GenerateAvatarRequest;
  try {
    requestBody = await request.json();
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Destructure both genres and artists
  const { genres, artists } = requestBody;

  // Keep genre check, add optional artist check if needed
  if (!genres || genres.length === 0) {
    return NextResponse.json({ error: 'Genres are required to generate a prompt' }, { status: 400 });
  }

  // --- Updated Prompt Engineering ---
  const topGenres = genres.slice(0, 3).join(', '); // Use top 3 genres for theme
  const topArtistNames = artists && artists.length > 0
    ? artists.slice(0, 3).map(a => a.name) // Use top 3 artists
    : [];

  // Create a prompt for a Pokémon-style trading card
  let prompt = `Create a Pokémon-style trading card featuring a unique creature inspired by the musical genres: ${topGenres}.`;
  if (topArtistNames.length > 0) {
    prompt += ` The creature's design and energy should reflect the vibe of artists like ${topArtistNames.join(', ')}.`;
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
    // Use the model name without the version hash
    const output: unknown = await replicate.run( // Explicitly type output as unknown initially
      MODEL_NAME,
      {
        input: {
          prompt: prompt,
          size: "1024x1024",
          num_outputs: 1,
        }
      }
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
      return NextResponse.json({ imageUrl: imageUrl });
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

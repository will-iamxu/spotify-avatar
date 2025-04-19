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
  const topGenres = genres.slice(0, 5).join(', '); // Use top 5 genres
  const topArtistNames = artists && artists.length > 0
    ? artists.slice(0, 5).map(a => a.name).join(', ') // Use top 5 artists
    : '';

  // Create a prompt focusing on a fictional character/creature
  let prompt = `Create a unique fictional creature that visually embodies the musical essence of these genres: ${topGenres}.`;
  if (topArtistNames) {
    prompt += ` The character's design should feel inspired by the sound and mood of artists like ${topArtistNames}.`;
  }
  // Specify style and avoid realistic portraits
  prompt += ` Style: fantasy illustration, character concept art, vibrant colors, dynamic pose. Avoid photorealism and realistic human portraits. The character should look imaginative and unique, not like a regular person.`;

  console.log("Generated Prompt:", prompt);

  try {
    console.log(`Running Replicate model: ${MODEL_NAME}`);
    // Use the model name without the version hash
    const output = await replicate.run(
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

    // --- Updated Output Handling for Recraft Structure ---
    // Check if output is an object and has an 'output' property which is a string URL
    if (typeof output === 'object' && output !== null && 'output' in output && typeof output.output === 'string') {
        // Basic check if it looks like a URL - improve if needed
        if (output.output.startsWith('http://') || output.output.startsWith('https://')) {
            imageUrl = output.output;
        }
    }
    // Keep the check for array just in case (though less likely now)
    else if (Array.isArray(output) && output.length > 0 && typeof output[0] === 'string') {
      imageUrl = output[0];
    }
    // Keep the check for direct string URL (less likely)
    else if (typeof output === 'string') {
       if (output.startsWith('http://') || output.startsWith('https://')) {
           imageUrl = output;
       }
    }
    // --- End Updated Output Handling ---

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

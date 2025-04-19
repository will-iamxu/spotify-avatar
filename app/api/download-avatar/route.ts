import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
  }

  try {
    // Validate the URL looks like a Replicate URL (basic check)
    if (!imageUrl.startsWith('https://replicate.delivery/')) {
       return NextResponse.json({ error: 'Invalid image URL provided' }, { status: 400 });
    }

    // Fetch the image data from the Replicate URL
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Get the image data as a Blob
    const imageBlob = await imageResponse.blob();

    // Determine filename (can be dynamic if needed)
    const filename = 'spotify-avatar.webp';

    // Create response headers to force download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', imageBlob.type || 'image/webp'); // Use blob type or default

    // Return the image data with download headers
    return new NextResponse(imageBlob, { status: 200, headers });

  } catch (error: unknown) {
    console.error('Error proxying image download:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to download image';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

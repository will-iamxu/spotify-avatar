import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/db';
import { getSignedDownloadUrl } from '../../../lib/s3';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const avatarId = searchParams.get('id');

  if (!avatarId) {
    return NextResponse.json({ error: 'Avatar ID is required' }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the avatar and verify ownership
    const avatar = await prisma.avatar.findFirst({
      where: {
        id: avatarId,
        userId: user.id,
        status: 'COMPLETED'
      }
    });

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar not found or not ready' }, { status: 404 });
    }

    // Extract S3 key from URL (s3://bucket/key format)
    const s3Key = avatar.imageUrl.replace(/^s3:\/\/[^\/]+\//, '');
    
    // Get signed URL for download
    const signedUrl = await getSignedDownloadUrl(s3Key);

    // Fetch the image from S3
    const imageResponse = await fetch(signedUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from S3');
    }

    const imageBlob = await imageResponse.blob();
    const filename = `spotify-avatar-${avatarId}.png`;

    // Log the download
    await prisma.apiUsage.create({
      data: {
        userId: user.id,
        endpoint: 'download-avatar',
        metadata: {
          avatarId,
          s3Key
        }
      }
    });

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', 'image/png');

    return new NextResponse(imageBlob, { status: 200, headers });

  } catch (error: unknown) {
    console.error('Error downloading avatar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to download avatar';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

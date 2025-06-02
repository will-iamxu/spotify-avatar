import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/db';
import { getSignedDownloadUrl } from '../../../../lib/s3';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        avatars: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Limit to last 10 avatars
        },
        _count: {
          select: { avatars: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate signed URLs for avatar images
    const avatarsWithUrls = await Promise.all(
      user.avatars.map(async (avatar) => {
        let signedUrl = null;
        if (avatar.status === 'COMPLETED' && avatar.imageUrl) {
          try {
            const s3Key = avatar.imageUrl.replace(/^s3:\/\/[^\/]+\//, '');
            signedUrl = await getSignedDownloadUrl(s3Key);
          } catch (error) {
            console.error(`Failed to generate signed URL for avatar ${avatar.id}:`, error);
          }
        }
        
        return {
          id: avatar.id,
          status: avatar.status,
          createdAt: avatar.createdAt,
          signedUrl,
          metadata: avatar.metadata
        };
      })
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        usageCount: user.usageCount,
        totalAvatars: user._count.avatars
      },
      avatars: avatarsWithUrls
    });

  } catch (error: unknown) {
    console.error('Error fetching user avatars:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const avatarId = searchParams.get('id');

  if (!avatarId) {
    return NextResponse.json({ error: 'Avatar ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete avatar (this will also remove the S3 file reference)
    const deletedAvatar = await prisma.avatar.deleteMany({
      where: {
        id: avatarId,
        userId: user.id
      }
    });

    if (deletedAvatar.count === 0) {
      return NextResponse.json({ error: 'Avatar not found or not owned by user' }, { status: 404 });
    }

    // Log the deletion
    await prisma.apiUsage.create({
      data: {
        userId: user.id,
        endpoint: 'delete-avatar',
        metadata: { avatarId }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Error deleting avatar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete avatar';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
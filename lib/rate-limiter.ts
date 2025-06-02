import { NextResponse } from 'next/server';
import { prisma } from './db';

interface RateLimitRule {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests in window
  tier?: 'FREE' | 'PRO' | 'ENTERPRISE';
}

const RATE_LIMITS: Record<string, RateLimitRule[]> = {
  'generate-avatar': [
    { windowMs: 60 * 1000, maxRequests: 5, tier: 'FREE' }, // 5 per minute for free
    { windowMs: 60 * 1000, maxRequests: 20, tier: 'PRO' }, // 20 per minute for pro
    { windowMs: 60 * 1000, maxRequests: 100, tier: 'ENTERPRISE' }, // 100 per minute for enterprise
  ],
  'download-avatar': [
    { windowMs: 60 * 1000, maxRequests: 30, tier: 'FREE' }, // 30 per minute for free
    { windowMs: 60 * 1000, maxRequests: 100, tier: 'PRO' },
    { windowMs: 60 * 1000, maxRequests: 500, tier: 'ENTERPRISE' },
  ],
  'spotify-data': [
    { windowMs: 60 * 1000, maxRequests: 10, tier: 'FREE' }, // 10 per minute for all tiers
    { windowMs: 60 * 1000, maxRequests: 10, tier: 'PRO' },
    { windowMs: 60 * 1000, maxRequests: 10, tier: 'ENTERPRISE' },
  ]
};

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  userTier: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE'
): Promise<{ allowed: boolean; remainingRequests: number; resetTime: Date }> {
  
  const rules = RATE_LIMITS[endpoint];
  if (!rules) {
    return { allowed: true, remainingRequests: Infinity, resetTime: new Date() };
  }

  const rule = rules.find(r => r.tier === userTier) || rules[0];
  const windowStart = new Date(Date.now() - rule.windowMs);

  // Count recent requests
  const recentRequests = await prisma.apiUsage.count({
    where: {
      userId,
      endpoint,
      createdAt: {
        gte: windowStart
      }
    }
  });

  const remainingRequests = Math.max(0, rule.maxRequests - recentRequests);
  const allowed = remainingRequests > 0;
  const resetTime = new Date(Date.now() + rule.windowMs);

  return { allowed, remainingRequests, resetTime };
}

export async function rateLimitResponse(
  userId: string,
  endpoint: string,
  userTier: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE'
): Promise<NextResponse | null> {
  
  const { allowed, remainingRequests, resetTime } = await checkRateLimit(userId, endpoint, userTier);
  
  if (!allowed) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        details: {
          endpoint,
          tier: userTier,
          resetTime: resetTime.toISOString()
        }
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMITS[endpoint]?.find(r => r.tier === userTier)?.maxRequests.toString() || '0',
          'X-RateLimit-Remaining': remainingRequests.toString(),
          'X-RateLimit-Reset': Math.ceil(resetTime.getTime() / 1000).toString(),
          'Retry-After': Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString()
        }
      }
    );
  }

  return null; // No rate limit hit
}

export function addRateLimitHeaders(
  response: NextResponse,
  remainingRequests: number,
  resetTime: Date,
  maxRequests: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', remainingRequests.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime.getTime() / 1000).toString());
  
  return response;
}
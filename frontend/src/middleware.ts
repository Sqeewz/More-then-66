import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// In-memory rate limiter (resets when server restarts — good enough for Vercel
// serverless where each cold-start is fresh; for persistent limiting use Redis)
// ---------------------------------------------------------------------------
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now };
}

// Clean up old entries periodically to prevent memory growth
function cleanupStore() {
  const now = Date.now();
  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  });
}


// ---------------------------------------------------------------------------
// Rate limit configurations per endpoint
// ---------------------------------------------------------------------------
const RATE_LIMITS: Record<string, { max: number; windowMs: number; label: string }> = {
  '/api/games/submit':   { max: 5,   windowMs: 60 * 60 * 1000, label: '5 submissions/hour' },
  '/api/games/scrape':   { max: 15,  windowMs: 60 * 1000,       label: '15 scrapes/minute' },
  '/api/upload':         { max: 10,  windowMs: 60 * 60 * 1000, label: '10 uploads/hour' },
  '/api/games/like':     { max: 30,  windowMs: 60 * 1000,       label: '30 likes/minute' },
  '/api/games/view':     { max: 60,  windowMs: 60 * 1000,       label: '60 views/minute' },
  '/api/games':          { max: 120, windowMs: 60 * 1000,       label: '120 requests/minute' },
};

function getIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function matchRateLimit(pathname: string) {
  // Exact match first, then prefix match for parameterized routes
  if (RATE_LIMITS[pathname]) return RATE_LIMITS[pathname];
  if (pathname.includes('/like')) return RATE_LIMITS['/api/games/like'];
  if (pathname.includes('/view')) return RATE_LIMITS['/api/games/view'];
  if (pathname.startsWith('/api/games')) return RATE_LIMITS['/api/games'];
  return null;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Cleanup occasionally (~1% of requests)
  if (Math.random() < 0.01) cleanupStore();

  const ip = getIp(request);
  const config = matchRateLimit(pathname);

  if (config) {
    const key = `${ip}:${pathname}`;
    const result = rateLimit(key, config.max, config.windowMs);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: `คำขอมากเกินไป กรุณารอสักครู่ (Rate limit: ${config.label})`,
          retryAfter: Math.ceil(result.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(result.resetIn / 1000)),
            'X-RateLimit-Limit': String(config.max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil((Date.now() + result.resetIn) / 1000)),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(config.max));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/edge';
import { routing } from '@/lib/i18n/config';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api/auth',
  '/api/v1/auth',
  '/api/v1/health',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
];

// In-memory rate limit map (single-instance; prod needs Redis — fase akhir)
type RateLimitEntry = { count: number; resetAt: number };
const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || entry.resetAt < now) {
    const fresh = { count: 1, resetAt: now + windowMs };
    rateLimitMap.set(key, fresh);
    return { allowed: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }
  entry.count += 1;
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}

function stripLocale(pathname: string): string {
  const segs = pathname.split('/').filter(Boolean);
  if (segs[0] === 'id' || segs[0] === 'en') segs.shift();
  return '/' + segs.join('/');
}

function isPublic(pathname: string): boolean {
  const stripped = stripLocale(pathname);
  return PUBLIC_PATHS.some((p) => stripped === p || stripped.startsWith(p + '/'));
}

function localizeUrl(pathname: string): string {
  const hasLocale = routing.locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return pathname;
  if (pathname === '/') return `/${routing.defaultLocale}`;
  return `/${routing.defaultLocale}${pathname}`;
}

export default auth(async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API auth routes entirely (NextAuth handler)
  if (pathname.startsWith('/api/v1/auth')) return NextResponse.next();
  if (pathname.startsWith('/api/v1/register')) return NextResponse.next();
  // NextAuth built-in routes (signin/error/callback) — must bypass our auth check
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  // Public paths OK
  if (isPublic(pathname)) {
    // Localize page-level public paths
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && pathname !== '/favicon.ico') {
      const url = req.nextUrl.clone();
      const newPath = localizeUrl(pathname);
      if (newPath !== pathname) {
        url.pathname = newPath;
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

  // Rate limit generate endpoint
  if (pathname === '/api/v1/generate' && req.method === 'POST') {
    const session = await auth();
    const userKey = session?.user ? `u:${(session.user as { id?: number }).id ?? 'anon'}` : `ip:${req.headers.get('x-forwarded-for') ?? 'unknown'}`;
    const limit = 10; // 10 req/min per SRS-A15
    const result = checkRateLimit(`gen:${userKey}`, limit, 60_000);
    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: { code: 'RATE_LIMITED', message: 'Terlalu banyak request generate. Coba lagi nanti.', details: { retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000) } },
          traceId: crypto.randomUUID(),
        }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)), 'X-RateLimit-Limit': String(limit), 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)) } },
      );
    }
    const res = NextResponse.next();
    res.headers.set('X-RateLimit-Limit', String(limit));
    res.headers.set('X-RateLimit-Remaining', String(result.remaining));
    res.headers.set('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)));
    return res;
  }

  // Auth required for everything else
  const session = await auth();
  if (!session?.user) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sesi tidak valid' }, traceId: crypto.randomUUID() }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const url = req.nextUrl.clone();
    const localizedLogin = localizeUrl('/login');
    url.pathname = localizedLogin;
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Localize page-level requests
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const url = req.nextUrl.clone();
    const newPath = localizeUrl(pathname);
    if (newPath !== pathname) {
      url.pathname = newPath;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

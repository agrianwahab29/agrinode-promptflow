import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from '@/lib/i18n/config';

const PUBLIC_PATHS = [
  '/',
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

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip NextAuth built-in routes entirely
  if (pathname.startsWith('/api/v1/auth')) return NextResponse.next();
  if (pathname.startsWith('/api/v1/register')) return NextResponse.next();
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  // Public paths
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

  // Auth check — Edge-safe via getToken (jose-based)
  // Dynamic secureCookie: Vercel production (HTTPS) → __Secure- prefix; local HTTP → no prefix
  const proto = req.headers.get('x-forwarded-proto') ?? '';
  const isLocalhost = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1' || req.nextUrl.hostname === '[::1]';
  const isSecure = proto === 'https' && !isLocalhost;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isSecure,
  });

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Sesi tidak valid' }, traceId: crypto.randomUUID() }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const url = req.nextUrl.clone();
    const localizedLogin = localizeUrl('/login');
    url.pathname = localizedLogin;
    // If coming from landing page (/ or /[locale]), send to /generate instead
    const stripped = stripLocale(pathname);
    const callbackUrl = (stripped === '/' || stripped === '')
      ? `/${routing.defaultLocale}/generate`
      : pathname;
    url.searchParams.set('callbackUrl', callbackUrl);
    return NextResponse.redirect(url);
  }

  // Rate limit generate endpoint
  if (pathname === '/api/v1/generate' && req.method === 'POST') {
    const userKey = typeof token.userId === 'number' ? `u:${token.userId}` : `ip:${req.headers.get('x-forwarded-for') ?? 'unknown'}`;
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
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // X-Request-Id for all responses (Web Crypto API — works in Edge runtime)
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  response.headers.set('X-Request-Id', requestId);
  response.headers.set('X-API-Version', '1');

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '0'); // Modern browsers: CSP is better
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    // Allow same-origin and configured origins
    const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
    const isAllowed = !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin);

    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin || request.nextUrl.origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key, X-Request-Id');
      response.headers.set('Access-Control-Max-Age', '86400');
    }

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: response.headers });
    }
  }

  // Body size limit for API routes (10MB)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Request body too large (max 10MB)' },
        { status: 413 }
      );
    }
  }

  // Protect dashboard routes (except login/register)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('oortapi_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

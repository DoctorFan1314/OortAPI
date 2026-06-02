import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, signToken, setTokenCookie, TOKEN_NAME, createSession } from '@/lib/auth';
import { checkIpRateLimit } from '@/lib/rate-limiter';
import type { DBUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per IP per minute
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkIpRateLimit(`login:${ip}`, 5, 60_000);
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      const res = NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
      res.headers.set('Retry-After', String(Math.max(retryAfter, 60)));
      return res;
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DBUser | undefined;
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.enabled) {
      return NextResponse.json({ error: 'Account is disabled. Please contact an administrator.' }, { status: 403 });
    }

    if (!verifyPassword(password, user.password_hash, user.salt)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role, tv: user.token_version || 0 });
    const cookie = setTokenCookie(token);

    // Track session
    const ua = request.headers.get('user-agent') || undefined;
    createSession(user.id, token, ip, ua);

    const { password_hash, salt, ...safeUser } = user;
    const response = NextResponse.json({ user: safeUser });
    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

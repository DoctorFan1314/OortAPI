import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import db from '@/lib/db';
import { hashPassword, generateSalt } from '@/lib/auth';
import { checkIpRateLimit } from '@/lib/rate-limiter';
import type { DBUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rateLimitResult = checkIpRateLimit(`reset-password:${ip}`, 5, 60_000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json({ error: 'Email, token, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DBUser | undefined;
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Parse preferences to extract reset token data
    let preferences: Record<string, unknown> = {};
    try {
      preferences = user.preferences ? JSON.parse(user.preferences) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const storedToken = preferences.reset_token;
    const storedExpires = preferences.reset_token_expires;

    if (!storedToken || !storedExpires) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Check token match (timing-safe)
    const storedBuf = Buffer.from(String(storedToken));
    const providedBuf = Buffer.from(String(token));
    if (storedBuf.length !== providedBuf.length || !timingSafeEqual(storedBuf, providedBuf)) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Check expiry
    if (Date.now() > Number(storedExpires)) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Hash new password
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    // Clear reset token fields from preferences
    delete preferences.reset_token;
    delete preferences.reset_token_expires;

    db.prepare('UPDATE users SET password_hash = ?, salt = ?, preferences = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(passwordHash, salt, JSON.stringify(preferences), user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

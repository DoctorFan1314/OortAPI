import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import db from '@/lib/db';
import type { DBUser } from '@/lib/db';
import { checkIpRateLimit } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rateLimitResult = checkIpRateLimit(`forgot-password:${ip}`, 3, 60_000);
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DBUser | undefined;

    // Always return success to avoid revealing whether the email exists
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate reset token (32 random bytes as hex) and set expiry to 30 minutes
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 30 * 60 * 1000;

    // Parse existing preferences, merge in reset token fields
    let preferences: Record<string, unknown> = {};
    try {
      preferences = user.preferences ? JSON.parse(user.preferences) : {};
    } catch {
      preferences = {};
    }

    preferences.reset_token = resetToken;
    preferences.reset_token_expires = resetTokenExpires;

    db.prepare('UPDATE users SET preferences = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(JSON.stringify(preferences), user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

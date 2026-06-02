import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, generateSalt, verifyPassword } from '@/lib/auth';
import { validateUserFromCookie } from '@/lib/api-gateway';
import type { DBUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const user = auth.user as DBUser;

    if (!verifyPassword(currentPassword, user.password_hash, user.salt)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(newPassword, salt);
    // Increment token_version to invalidate all existing JWTs
    db.prepare('UPDATE users SET password_hash = ?, salt = ?, token_version = COALESCE(token_version, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, salt, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

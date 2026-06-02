import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken, getTokenFromCookie, isTokenVersionValid } from '@/lib/auth';
import type { DBUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromCookie(request.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const user = db.prepare('SELECT token_version FROM users WHERE id = ?').get(payload.userId) as Pick<DBUser, 'token_version'> | undefined;
    if (!user || !isTokenVersionValid(payload, user.token_version || 0)) {
      return NextResponse.json({ error: 'Token invalidated — please log in again' }, { status: 401 });
    }

    const sessions = db.prepare(
      'SELECT id, ip_address, user_agent, created_at, last_active_at FROM sessions WHERE user_id = ? ORDER BY last_active_at DESC'
    ).all(payload.userId) as { id: number; ip_address: string | null; user_agent: string | null; created_at: string; last_active_at: string }[];

    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromCookie(request.headers.get('cookie'));
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const user = db.prepare('SELECT token_version FROM users WHERE id = ?').get(payload.userId) as Pick<DBUser, 'token_version'> | undefined;
    if (!user || !isTokenVersionValid(payload, user.token_version || 0)) {
      return NextResponse.json({ error: 'Token invalidated — please log in again' }, { status: 401 });
    }

    const { sessionId } = await request.json().catch(() => ({}));
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

    // Only allow deleting own sessions
    const result = db.prepare('DELETE FROM sessions WHERE id = ? AND user_id = ?').run(sessionId, payload.userId);
    if (result.changes === 0) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

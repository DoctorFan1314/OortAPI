import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const keyId = parseInt(id);
    if (isNaN(keyId)) {
      return NextResponse.json({ error: 'Invalid key ID' }, { status: 400 });
    }

    // Verify key belongs to user
    const key = db.prepare('SELECT id FROM api_keys WHERE id = ? AND user_id = ?').get(keyId, auth.user.id);
    if (!key) return NextResponse.json({ error: 'Key not found' }, { status: 404 });

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from') || `datetime('now', '-7 days')`;
    const to = searchParams.get('to') || `datetime('now')`;

    const stats = db.prepare(
      `SELECT
         COUNT(*) as calls,
         COALESCE(SUM(cost), 0) as cost,
         COALESCE(SUM(tokens_in + tokens_out), 0) as tokens,
         COALESCE(AVG(CASE WHEN latency_ms > 0 THEN latency_ms END), null) as avg_latency,
         ROUND(CAST(SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) AS FLOAT) / MAX(COUNT(*), 1) * 100, 1) as error_rate
       FROM usage_logs
       WHERE api_key_id = ? AND user_id = ? AND created_at >= ? AND created_at <= ?`
    ).get(keyId, auth.user.id, from, to) as {
      calls: number;
      cost: number;
      tokens: number;
      avg_latency: number | null;
      error_rate: number;
    };

    // Per-model breakdown for this key
    const byModel = db.prepare(
      `SELECT model, COUNT(*) as calls, COALESCE(SUM(cost), 0) as cost, COALESCE(SUM(tokens_in + tokens_out), 0) as tokens
       FROM usage_logs
       WHERE api_key_id = ? AND user_id = ? AND created_at >= ? AND created_at <= ?
       GROUP BY model ORDER BY calls DESC`
    ).all(keyId, auth.user.id, from, to) as Array<{ model: string; calls: number; cost: number; tokens: number }>;

    return NextResponse.json({ ...stats, by_model: byModel });
  } catch (error) {
    console.error('Key stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

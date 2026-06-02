import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();

  try {
    // Check database connectivity
    db.prepare('SELECT 1').get();
    const dbLatency = Date.now() - start;

    // Check channel availability
    const channels = db.prepare('SELECT COUNT(*) as count FROM channels WHERE enabled = 1').get() as { count: number };

    // Check active users (last 24h)
    const activeUsers = db.prepare(
      "SELECT COUNT(DISTINCT user_id) as count FROM usage_logs WHERE created_at > datetime('now', '-1 day')"
    ).get() as { count: number };

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '3.3.5',
      checks: {
        database: { status: 'ok', latency_ms: dbLatency },
        channels: { status: channels.count > 0 ? 'ok' : 'degraded', count: channels.count },
        active_users_24h: activeUsers.count,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}

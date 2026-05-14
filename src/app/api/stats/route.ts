import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalCalls = (db.prepare('SELECT COUNT(*) as count FROM usage_logs').get() as { count: number }).count;
    const totalModels = (db.prepare('SELECT COUNT(DISTINCT model_name) as count FROM model_rates WHERE enabled = 1').get() as { count: number }).count;

    // Success rate (last 24h)
    const recent = db.prepare(
      "SELECT COUNT(*) as total, SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as ok FROM usage_logs WHERE created_at > datetime('now', '-1 day')"
    ).get() as { total: number; ok: number };
    const uptime = recent.total > 0 ? ((recent.ok / recent.total) * 100).toFixed(1) : '99.9';

    // Average latency (last 24h)
    const latency = db.prepare(
      "SELECT AVG(latency_ms) as avg_ms FROM usage_logs WHERE success = 1 AND created_at > datetime('now', '-1 day')"
    ).get() as { avg_ms: number | null };
    const avgLatency = latency.avg_ms ? Math.round(latency.avg_ms) : 200;

    return NextResponse.json({
      totalCalls,
      totalModels,
      uptime: `${uptime}%`,
      avgLatency: `${avgLatency}ms`,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({
      totalCalls: 0,
      totalModels: 0,
      uptime: '99.9%',
      avgLatency: '200ms',
    });
  }
}

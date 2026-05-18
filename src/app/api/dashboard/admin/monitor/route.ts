import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Overall stats for last 24 hours
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_calls,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_calls,
        SUM(cost) as total_cost,
        SUM(tokens_in + tokens_out) as total_tokens,
        MIN(created_at) as earliest,
        MAX(created_at) as latest
      FROM usage_logs
      WHERE created_at >= datetime('now', '-24 hours')
    `).get() as {
      total_calls: number;
      failed_calls: number;
      total_cost: number | null;
      total_tokens: number | null;
      earliest: string | null;
      latest: string | null;
    };

    const totalCalls = stats.total_calls || 0;
    const failedCalls = stats.failed_calls || 0;
    const errorRate = totalCalls > 0 ? (failedCalls / totalCalls) * 100 : 0;

    // Calculate QPS: total calls / time range in seconds
    // If we have data, use actual time span; otherwise default to 86400 (24h)
    let timeRangeSeconds = 86400;
    if (stats.earliest && stats.latest) {
      const earliest = new Date(stats.earliest + 'Z').getTime();
      const latest = new Date(stats.latest + 'Z').getTime();
      const span = Math.max(1, Math.round((latest - earliest) / 1000));
      // Use at least 60 seconds to avoid spikes from very short ranges
      timeRangeSeconds = Math.max(span, 60);
    }
    const qps = totalCalls / timeRangeSeconds;

    // Percentile latency using subquery with ORDER BY + LIMIT
    // p50 = median
    const p50Row = db.prepare(`
      SELECT latency_ms FROM usage_logs
      WHERE created_at >= datetime('now', '-24 hours') AND latency_ms IS NOT NULL
      ORDER BY latency_ms ASC
      LIMIT 1 OFFSET (
        SELECT CAST(COUNT(*) / 2 AS INTEGER) FROM usage_logs
        WHERE created_at >= datetime('now', '-24 hours') AND latency_ms IS NOT NULL
      )
    `).get() as { latency_ms: number } | undefined;

    const p50Latency = p50Row?.latency_ms ?? 0;

    // p95 latency
    const p95Row = db.prepare(`
      SELECT latency_ms FROM usage_logs
      WHERE created_at >= datetime('now', '-24 hours') AND latency_ms IS NOT NULL
      ORDER BY latency_ms ASC
      LIMIT 1 OFFSET (
        SELECT CAST(COUNT(*) * 0.95 AS INTEGER) FROM usage_logs
        WHERE created_at >= datetime('now', '-24 hours') AND latency_ms IS NOT NULL
      )
    `).get() as { latency_ms: number } | undefined;

    const p95Latency = p95Row?.latency_ms ?? 0;

    // Per-provider stats by joining usage_logs with channels
    const providers = db.prepare(`
      SELECT
        c.type as provider,
        COUNT(*) as calls,
        SUM(CASE WHEN u.success = 0 THEN 1 ELSE 0 END) as failed_calls,
        AVG(u.latency_ms) as avg_latency
      FROM usage_logs u
      JOIN channels c ON u.channel_id = c.id
      WHERE u.created_at >= datetime('now', '-24 hours')
      GROUP BY c.type
      ORDER BY calls DESC
    `).all() as Array<{
      provider: string;
      calls: number;
      failed_calls: number;
      avg_latency: number | null;
    }>;

    const providerStats = providers.map(p => ({
      provider: p.provider,
      calls: p.calls,
      error_rate: p.calls > 0 ? parseFloat(((p.failed_calls / p.calls) * 100).toFixed(2)) : 0,
      avg_latency: Math.round(p.avg_latency || 0),
    }));

    return NextResponse.json({
      qps: parseFloat(qps.toFixed(2)),
      error_rate: parseFloat(errorRate.toFixed(2)),
      p50_latency: Math.round(p50Latency),
      p95_latency: Math.round(p95Latency),
      total_calls_24h: totalCalls,
      total_cost_24h: stats.total_cost || 0,
      total_tokens_24h: stats.total_tokens || 0,
      providers: providerStats,
    });
  } catch (error) {
    console.error('Admin monitor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const userId = auth.user.id;
    const range = request.nextUrl.searchParams.get('range') || '7d';
    const groupBy = request.nextUrl.searchParams.get('group_by') || 'day'; // 'day' or 'hour'

    const daysBack = range === '30d' ? 30 : range === '14d' ? 14 : 7;
    const dateFilter = `-${daysBack} days`;

    // Model consumption by day (for stacked bar chart)
    const modelByDay = db.prepare(`
      SELECT
        DATE(created_at) as date,
        model,
        COUNT(*) as calls,
        SUM(cost) as cost,
        SUM(tokens_in + tokens_out) as tokens,
        SUM(tokens_in - tokens_in_cache) as tokens_in_noncached,
        SUM(tokens_in_cache) as tokens_in_cache,
        SUM(tokens_out) as tokens_out
      FROM usage_logs
      WHERE user_id = ? AND created_at >= DATE('now', ?)
      GROUP BY DATE(created_at), model
      ORDER BY date ASC
    `).all(userId, dateFilter) as Array<{ date: string; model: string; calls: number; cost: number; tokens: number; tokens_in_noncached: number; tokens_in_cache: number; tokens_out: number }>;

    // If groupBy=hour, get hourly breakdown for last 24 hours
    let modelByHour: Array<{ hour: string; model: string; calls: number; cost: number; tokens: number }> = [];
    if (groupBy === 'hour') {
      modelByHour = db.prepare(`
        SELECT
          strftime('%H:00', created_at) as hour,
          model,
          COUNT(*) as calls,
          SUM(cost) as cost,
          SUM(tokens_in + tokens_out) as tokens,
          SUM(tokens_in - tokens_in_cache) as tokens_in_noncached,
          SUM(tokens_in_cache) as tokens_in_cache,
          SUM(tokens_out) as tokens_out
        FROM usage_logs
        WHERE user_id = ? AND created_at >= datetime('now', '-24 hours')
        GROUP BY strftime('%H:00', created_at), model
        ORDER BY hour ASC
      `).all(userId) as Array<{ hour: string; model: string; calls: number; cost: number; tokens: number; tokens_in_noncached: number; tokens_in_cache: number; tokens_out: number }>;
    }

    // Per-model latency & error rate
    const modelStats = db.prepare(`
      SELECT model,
        AVG(CASE WHEN latency_ms > 0 THEN latency_ms END) as avg_latency,
        ROUND(CAST(SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) AS FLOAT) / MAX(COUNT(*), 1) * 100, 1) as error_rate
      FROM usage_logs
      WHERE user_id = ? AND created_at >= DATE('now', ?)
      GROUP BY model ORDER BY avg_latency DESC
    `).all(userId, dateFilter) as Array<{ model: string; avg_latency: number | null; error_rate: number }>;

    // Call distribution by model (for pie chart)
    const modelDistribution = db.prepare(`
      SELECT
        model,
        COUNT(*) as calls,
        SUM(cost) as cost,
        SUM(tokens_in + tokens_out) as tokens,
        SUM(tokens_in - tokens_in_cache) as tokens_in_noncached,
        SUM(tokens_in_cache) as tokens_in_cache,
        SUM(tokens_out) as tokens_out
      FROM usage_logs
      WHERE user_id = ? AND created_at >= DATE('now', ?)
      GROUP BY model
      ORDER BY calls DESC
    `).all(userId, dateFilter) as Array<{ model: string; calls: number; cost: number; tokens: number; tokens_in_noncached: number; tokens_in_cache: number; tokens_out: number }>;

    // Daily trend (for line chart)
    const dailyTrend = db.prepare(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as calls,
        SUM(cost) as cost,
        SUM(tokens_in + tokens_out) as tokens,
        AVG(latency_ms) as avg_latency,
        SUM(tokens_in - tokens_in_cache) as tokens_in_noncached,
        SUM(tokens_in_cache) as tokens_in_cache,
        SUM(tokens_out) as tokens_out
      FROM usage_logs
      WHERE user_id = ? AND created_at >= DATE('now', ?)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(userId, dateFilter) as Array<{ date: string; calls: number; cost: number; tokens: number; avg_latency: number | null; tokens_in_noncached: number; tokens_in_cache: number; tokens_out: number }>;

    // RPM & TPM (requests per minute, tokens per minute) — last hour
    const lastHourStats = db.prepare(`
      SELECT
        COUNT(*) as calls,
        SUM(tokens_in + tokens_out) as tokens
      FROM usage_logs
      WHERE user_id = ? AND created_at >= datetime('now', '-1 hour')
    `).get(userId) as { calls: number; tokens: number };

    // Cache analytics
    const cacheStats = db.prepare(`
      SELECT
        SUM(tokens_in_cache) as total_cache_hits,
        SUM(tokens_in - tokens_in_cache) as total_non_cached,
        CASE WHEN SUM(tokens_in) > 0 THEN ROUND(CAST(SUM(tokens_in_cache) AS FLOAT) / SUM(tokens_in) * 100, 1) ELSE 0 END as cache_hit_rate
      FROM usage_logs
      WHERE user_id = ? AND created_at >= DATE('now', ?)
    `).get(userId, dateFilter) as { total_cache_hits: number; total_non_cached: number; cache_hit_rate: number };

    // Previous period comparison
    const prevDateFilter = `-${daysBack * 2} days`;
    const prevPeriod = range === '7d' ? db.prepare(`
      SELECT COUNT(*) as calls, SUM(cost) as cost, SUM(tokens_in + tokens_out) as tokens
      FROM usage_logs WHERE user_id = ? AND created_at >= DATE('now', ?) AND created_at < DATE('now', ?)
    `).get(userId, prevDateFilter, dateFilter) as { calls: number; cost: number; tokens: number }
    : null;

    // Historical total
    const totalStats = db.prepare(`
      SELECT
        COUNT(*) as total_calls,
        SUM(cost) as total_cost,
        SUM(tokens_in + tokens_out) as total_tokens,
        SUM(tokens_in - tokens_in_cache) as tokens_in_noncached,
        SUM(tokens_in_cache) as tokens_in_cache,
        SUM(tokens_out) as tokens_out
      FROM usage_logs
      WHERE user_id = ?
    `).get(userId) as { total_calls: number; total_cost: number; total_tokens: number; tokens_in_noncached: number; tokens_in_cache: number; tokens_out: number };

    return NextResponse.json({
      model_by_day: modelByDay,
      model_by_hour: modelByHour,
      model_distribution: modelDistribution,
      model_stats: modelStats,
      daily_trend: dailyTrend,
      rpm: lastHourStats.calls || 0,
      tpm: lastHourStats.tokens || 0,
      cache: {
        cache_hit_rate: cacheStats.cache_hit_rate || 0,
        total_cache_hits: cacheStats.total_cache_hits || 0,
        total_non_cached: cacheStats.total_non_cached || 0,
      },
      prev_period: prevPeriod || null,
      total: {
        calls: totalStats.total_calls || 0,
        cost: totalStats.total_cost || 0,
        tokens: totalStats.total_tokens || 0,
        tokens_in_noncached: totalStats.tokens_in_noncached || 0,
        tokens_in_cache: totalStats.tokens_in_cache || 0,
        tokens_out: totalStats.tokens_out || 0,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

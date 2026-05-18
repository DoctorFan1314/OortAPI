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

    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayStats = db.prepare(`
      SELECT
        COUNT(*) as total_calls,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_calls,
        SUM(cost) as total_cost,
        SUM(tokens_in + tokens_out) as total_tokens,
        AVG(latency_ms) as avg_latency
      FROM usage_logs
      WHERE user_id = ? AND DATE(created_at) = ?
    `).get(userId, today) as Record<string, number | null>;

    // Active API keys count
    const activeKeys = db.prepare('SELECT COUNT(*) as count FROM api_keys WHERE user_id = ? AND enabled = 1').get(userId) as { count: number };

    // This month's stats
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStats = db.prepare(`
      SELECT
        COUNT(*) as total_calls,
        SUM(cost) as total_cost,
        SUM(tokens_in + tokens_out) as total_tokens,
        SUM(tokens_in - tokens_in_cache - tokens_cache_creation) as tokens_in_noncached,
        SUM(tokens_in_cache) as tokens_in_cache,
        SUM(tokens_cache_creation) as tokens_cache_creation,
        SUM(tokens_out) as tokens_out
      FROM usage_logs
      WHERE user_id = ? AND created_at >= ?
    `).get(userId, monthStart.toISOString()) as Record<string, number | null>;

    // Recent 7 days usage for chart
    const dailyUsage = db.prepare(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as calls,
        SUM(cost) as cost,
        SUM(tokens_in + tokens_out) as tokens
      FROM usage_logs
      WHERE user_id = ? AND created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all(userId) as Array<{ date: string; calls: number; cost: number; tokens: number }>;

    // Top models
    const topModels = db.prepare(`
      SELECT model, COUNT(*) as calls, SUM(cost) as cost
      FROM usage_logs
      WHERE user_id = ? AND created_at >= DATE('now', '-30 days')
      GROUP BY model
      ORDER BY calls DESC
      LIMIT 5
    `).all(userId) as Array<{ model: string; calls: number; cost: number }>;

    return NextResponse.json({
      today: {
        calls: todayStats?.total_calls || 0,
        success_rate: todayStats?.total_calls ? Math.round(((todayStats.success_calls || 0) / todayStats.total_calls) * 100) : 0,
        cost: todayStats?.total_cost || 0,
        tokens: todayStats?.total_tokens || 0,
        avg_latency: Math.round(todayStats?.avg_latency || 0),
      },
      month: {
        calls: monthStats?.total_calls || 0,
        cost: monthStats?.total_cost || 0,
        tokens: monthStats?.total_tokens || 0,
        tokens_in_noncached: monthStats?.tokens_in_noncached || 0,
        tokens_in_cache: monthStats?.tokens_in_cache || 0,
        tokens_cache_creation: monthStats?.tokens_cache_creation || 0,
        tokens_out: monthStats?.tokens_out || 0,
      },
      active_keys: activeKeys.count,
      daily_usage: dailyUsage,
      top_models: topModels,
      balance: auth.user.balance,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

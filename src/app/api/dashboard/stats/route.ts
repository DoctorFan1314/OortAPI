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
    const tzOffset = parseInt(request.nextUrl.searchParams.get('tz') || '0');

    // Today's stats (timezone-adjusted)
    const today = new Date().toISOString().split('T')[0];
    const todayStats = db.prepare(`
      SELECT
        COUNT(*) as total_calls,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_calls,
        SUM(CASE WHEN deduction_source = 'balance' THEN cost ELSE 0 END) as total_cost,
        SUM(tokens_in + tokens_out) as total_tokens,
        AVG(latency_ms) as avg_latency
      FROM usage_logs
      WHERE user_id = ? AND DATE(created_at, ?) = ?
    `).get(userId, `${tzOffset} minutes`, today) as Record<string, number | null>;

    // Active API keys count
    const activeKeys = db.prepare('SELECT COUNT(*) as count FROM api_keys WHERE user_id = ? AND enabled = 1').get(userId) as { count: number };

    const monthStats = db.prepare(`
      SELECT
        COUNT(*) as total_calls,
        SUM(CASE WHEN deduction_source = 'balance' THEN cost ELSE 0 END) as total_cost,
        SUM(CASE WHEN deduction_source = 'credits' THEN credits_used ELSE 0 END) as total_credits,
        SUM(tokens_in + tokens_out) as total_tokens,
        SUM(tokens_in - tokens_in_cache - tokens_cache_creation) as tokens_in_noncached,
        SUM(tokens_in_cache) as tokens_in_cache,
        SUM(tokens_cache_creation) as tokens_cache_creation,
        SUM(tokens_out) as tokens_out
      FROM usage_logs
      WHERE user_id = ? AND DATE(created_at, ?) >= DATE('now', 'start of month', ?)
    `).get(userId, `${tzOffset} minutes`, `${tzOffset} minutes`) as Record<string, number | null>;

    // Yesterday's stats (for comparison, timezone-adjusted)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdayStats = db.prepare(`
      SELECT
        COUNT(*) as total_calls,
        SUM(CASE WHEN deduction_source = 'balance' THEN cost ELSE 0 END) as total_cost,
        SUM(tokens_in + tokens_out) as total_tokens
      FROM usage_logs
      WHERE user_id = ? AND DATE(created_at, ?) = ?
    `).get(userId, `${tzOffset} minutes`, yesterday) as Record<string, number | null>;

    // Last month's stats (for comparison)
    const lastMonthStart = new Date();
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(1);
    lastMonthEnd.setHours(0, 0, 0, 0);
    const lastMonthStats = db.prepare(`
      SELECT COUNT(*) as total_calls, SUM(CASE WHEN deduction_source = 'balance' THEN cost ELSE 0 END) as total_cost, SUM(tokens_in + tokens_out) as total_tokens
      FROM usage_logs
      WHERE user_id = ? AND created_at >= ? AND created_at < ?
    `).get(userId, lastMonthStart.toISOString(), lastMonthEnd.toISOString()) as Record<string, number | null>;

    // Recent 7 days usage for chart (timezone-adjusted)
    const dailyUsage = db.prepare(`
      SELECT
        DATE(created_at, ?) as date,
        COUNT(*) as calls,
        SUM(CASE WHEN deduction_source = 'balance' THEN cost ELSE 0 END) as cost,
        SUM(tokens_in + tokens_out) as tokens
      FROM usage_logs
      WHERE user_id = ? AND created_at >= DATE('now', '-7 days', ?)
      GROUP BY DATE(created_at, ?)
      ORDER BY date ASC
    `).all(`${tzOffset} minutes`, userId, `${tzOffset} minutes`, `${tzOffset} minutes`) as Array<{ date: string; calls: number; cost: number; tokens: number }>;

    // Top models (timezone-adjusted)
    const topModels = db.prepare(`
      SELECT model, COUNT(*) as calls, SUM(CASE WHEN deduction_source = 'balance' THEN cost ELSE 0 END) as cost
      FROM usage_logs
      WHERE user_id = ? AND created_at >= DATE('now', '-30 days', ?)
      GROUP BY model
      ORDER BY calls DESC
      LIMIT 5
    `).all(userId, `${tzOffset} minutes`) as Array<{ model: string; calls: number; cost: number }>;

    // Cache savings (Feature 15)
    const cacheData = db.prepare(`
      SELECT
        SUM(ul.tokens_in_cache) as tokens_saved,
        SUM(ul.tokens_in) as total_input_tokens,
        CASE WHEN SUM(ul.tokens_in) > 0
          THEN ROUND(CAST(SUM(ul.tokens_in_cache) AS FLOAT) / SUM(ul.tokens_in) * 100, 1)
          ELSE 0
        END as cache_hit_pct
      FROM usage_logs ul
      WHERE ul.user_id = ? AND ul.created_at >= DATE('now', 'start of month')
    `).get(userId) as { tokens_saved: number | null; total_input_tokens: number | null; cache_hit_pct: number };

    const costSavedData = db.prepare(`
      SELECT
        COALESCE(SUM(ul.tokens_in_cache * (COALESCE(mr.input_rate, 0) - COALESCE(mr.cache_rate, 0)) / 1000000), 0) as cost_saved,
        COALESCE(SUM(ul.tokens_in * COALESCE(mr.input_rate, 0) / 1000000), 0) as cost_without_cache
      FROM usage_logs ul
      LEFT JOIN model_rates mr ON ul.model = mr.model_name
      WHERE ul.user_id = ? AND ul.created_at >= DATE('now', 'start of month') AND ul.success = 1
    `).get(userId) as { cost_saved: number; cost_without_cache: number };

    const cacheSavings = {
      tokens_saved: cacheData.tokens_saved || 0,
      cache_hit_pct: cacheData.cache_hit_pct || 0,
      cost_saved: costSavedData.cost_saved || 0,
      cost_avoided_pct: costSavedData.cost_without_cache > 0
        ? ((costSavedData.cost_saved || 0) / costSavedData.cost_without_cache * 100).toFixed(1)
        : '0',
      cache_hit_tokens: cacheData.tokens_saved || 0,
      non_cached_tokens: (cacheData.total_input_tokens || 0) - (cacheData.tokens_saved || 0),
    };

    return NextResponse.json({
      today: {
        calls: todayStats?.total_calls || 0,
        success_rate: todayStats?.total_calls ? Math.round(((todayStats.success_calls || 0) / todayStats.total_calls) * 100) : 0,
        cost: todayStats?.total_cost || 0,
        tokens: todayStats?.total_tokens || 0,
        avg_latency: Math.round(todayStats?.avg_latency || 0),
      },
      yesterday: {
        calls: yesterdayStats?.total_calls || 0,
        cost: yesterdayStats?.total_cost || 0,
        tokens: yesterdayStats?.total_tokens || 0,
      },
      month: {
        calls: monthStats?.total_calls || 0,
        cost: monthStats?.total_cost || 0,
        credits: monthStats?.total_credits || 0,
        tokens: monthStats?.total_tokens || 0,
        tokens_in_noncached: monthStats?.tokens_in_noncached || 0,
        tokens_in_cache: monthStats?.tokens_in_cache || 0,
        tokens_cache_creation: monthStats?.tokens_cache_creation || 0,
        tokens_out: monthStats?.tokens_out || 0,
      },
      last_month: {
        calls: lastMonthStats?.total_calls || 0,
        cost: lastMonthStats?.total_cost || 0,
        tokens: lastMonthStats?.total_tokens || 0,
      },
      active_keys: activeKeys.count,
      daily_usage: dailyUsage,
      top_models: topModels,
      balance: auth.user.balance,
      cache_savings: cacheSavings,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

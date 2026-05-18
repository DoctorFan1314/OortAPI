import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateApiKey, validateUserFromCookie } from '@/lib/api-gateway';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Support both API key auth and cookie auth (for dashboard)
    const authHeader = request.headers.get('authorization');
    let userId: number;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const auth = validateApiKey(authHeader);
      if (!auth.valid || !auth.user) {
        return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
      }
      userId = auth.user.id;
    } else {
      const auth = validateUserFromCookie(request.headers.get('cookie'));
      if (!auth.valid || !auth.user) {
        return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
      }
      userId = auth.user.id;
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50')), 100);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));
    const model = searchParams.get('model');
    const status = searchParams.get('status'); // 'success' or 'failed'
    const from = searchParams.get('from'); // ISO date string
    const to = searchParams.get('to'); // ISO date string
    const format = searchParams.get('format'); // 'csv' or default JSON
    const keyId = searchParams.get('key_id'); // API key ID filter

    const conditions: string[] = ['user_id = ?'];
    const params: unknown[] = [userId];

    if (model) {
      conditions.push('model LIKE ?');
      params.push(`%${model}%`);
    }
    if (status === 'success') {
      conditions.push('success = 1');
    } else if (status === 'failed') {
      conditions.push('success = 0');
    }
    if (from) {
      conditions.push('created_at >= ?');
      params.push(from);
    }
    if (to) {
      // Add one day to include all records on the 'to' date
      conditions.push("created_at < date(?, '+1 day')");
      params.push(to);
    }
    if (keyId) {
      conditions.push('u.api_key_id = ?');
      params.push(parseInt(keyId));
    }

    const whereClause = conditions.join(' AND ');

    // For CSV export, allow larger limit
    const effectiveLimit = format === 'csv' ? Math.min(parseInt(searchParams.get('limit') || '10000'), 10000) : limit;
    const effectiveOffset = format === 'csv' ? 0 : offset;

    const logs = db.prepare(
      `SELECT u.id, u.model, u.tokens_in, u.tokens_out, u.tokens_in_cache, u.tokens_cache_creation,
              u.cost, u.credits_used, u.deduction_source, u.latency_ms, u.success, u.cached, u.created_at, u.channel_id, u.multiplier, u.api_key_id,
              c.name as channel_name,
              k.name as key_name,
              m.input_rate, m.output_rate, m.cache_rate, m.cache_creation_rate, m.credit_rate
       FROM usage_logs u
       LEFT JOIN channels c ON u.channel_id = c.id
       LEFT JOIN api_keys k ON u.api_key_id = k.id
       LEFT JOIN model_rates m ON u.model = m.model_name
       WHERE ${whereClause} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, effectiveLimit, effectiveOffset);

    const total = db.prepare(`SELECT COUNT(*) as count FROM usage_logs WHERE ${whereClause}`).get(...params) as { count: number };

    // Aggregate stats across all matching records (not just current page)
    const agg = db.prepare(
      `SELECT COALESCE(SUM(tokens_in + tokens_out), 0) as total_tokens,
              COALESCE(SUM(cost), 0) as total_cost,
              COUNT(*) as total_calls
       FROM usage_logs WHERE ${whereClause}`
    ).get(...params) as { total_tokens: number; total_cost: number; total_calls: number };

    // Daily trend (only for JSON, not CSV)
    let dailyTrend: Array<{ date: string; calls: number; cost: number; tokens: number }> = [];
    if (format !== 'csv') {
      dailyTrend = db.prepare(
        `SELECT DATE(created_at) as date,
                COUNT(*) as calls,
                COALESCE(SUM(cost), 0) as cost,
                COALESCE(SUM(tokens_in + tokens_out), 0) as tokens
         FROM usage_logs WHERE ${whereClause}
         GROUP BY DATE(created_at) ORDER BY date ASC`
      ).all(...params) as typeof dailyTrend;
    }

    // CSV export
    if (format === 'csv') {
      const headers = ['id', 'model', 'tokens_in', 'tokens_out', 'tokens_in_cache', 'tokens_cache_creation', 'cost', 'credits_used', 'deduction_source', 'latency_ms', 'success', 'cached', 'created_at', 'channel_name', 'multiplier'];
      const rows = (logs as Record<string, unknown>[]).map(row =>
        headers.map(h => {
          const v = row[h];
          if (v === null || v === undefined) return '';
          const s = String(v);
          return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="usage-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      object: 'list',
      data: logs,
      total: total.count,
      total_tokens: agg.total_tokens,
      total_cost: agg.total_cost,
      total_calls: agg.total_calls,
      daily_trend: dailyTrend,
      has_more: offset + limit < total.count,
    });
  } catch (error) {
    console.error('Usage logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

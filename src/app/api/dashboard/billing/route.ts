import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';
import type { DBBillingRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const format = searchParams.get('format');

    const conditions: string[] = ['user_id = ?'];
    const params: unknown[] = [auth.user.id];
    if (type) { conditions.push('type = ?'); params.push(type); }
    if (from) { conditions.push('created_at >= ?'); params.push(from); }
    if (to) { conditions.push("created_at < date(?, '+1 day')"); params.push(to); }
    const where = conditions.join(' AND ');

    // Monthly cost trend (current & previous months)
    const monthlyTrend = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as cost
      FROM billing_records WHERE user_id = ? AND amount < 0
      GROUP BY month ORDER BY month DESC LIMIT 12
    `).all(auth.user.id) as Array<{ month: string; cost: number }>;

    const totalRow = db.prepare(`SELECT COUNT(*) as cnt FROM billing_records WHERE ${where}`).get(...params) as { cnt: number };
    const total = totalRow.cnt;

    // CSV export
    if (format === 'csv') {
      const rows = db.prepare(
        `SELECT id, type, amount, description, balance_after, created_at FROM billing_records WHERE ${where} ORDER BY created_at DESC LIMIT 10000`
      ).all(...params) as DBBillingRecord[];
      const headers = ['id', 'type', 'amount', 'description', 'balance_after', 'created_at'];
      const csv = [headers.join(','), ...rows.map(r =>
        headers.map(h => {
          const v = (r as unknown as Record<string, unknown>)[h];
          if (v == null) return '';
          const s = String(v);
          return s.includes(',') ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(',')
      )].join('\n');
      return new NextResponse(csv, {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="billing-${new Date().toISOString().slice(0, 10)}.csv"` },
      });
    }

    const records = db.prepare(
      `SELECT id, amount, type, description, balance_after, created_at FROM billing_records WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset) as DBBillingRecord[];

    return NextResponse.json({ records, total, has_more: offset + records.length < total, monthly_trend: monthlyTrend });
  } catch (error) {
    console.error('Billing records error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

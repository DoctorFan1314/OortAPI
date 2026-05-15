import { NextRequest, NextResponse } from 'next/server';
import { validateUserFromCookie } from '@/lib/api-gateway';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const action = searchParams.get('action');
    const targetType = searchParams.get('target_type');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (action) {
      conditions.push('a.action LIKE ?');
      params.push(`%${action}%`);
    }
    if (targetType) {
      conditions.push('a.target_type = ?');
      params.push(targetType);
    }
    if (from) {
      conditions.push('a.created_at >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push("a.created_at < date(?, '+1 day')");
      params.push(to);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const logs = db.prepare(
      `SELECT a.*, u.email as admin_email FROM audit_log a
       LEFT JOIN users u ON a.admin_id = u.id
       ${whereClause}
       ORDER BY a.created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    const total = (db.prepare(`SELECT COUNT(*) as count FROM audit_log a ${whereClause}`).get(...params) as { count: number }).count;

    return NextResponse.json({ logs, total, has_more: offset + logs.length < total, page });
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

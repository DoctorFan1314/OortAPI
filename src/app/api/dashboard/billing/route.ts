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

    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '20'), 100);
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    const totalRow = db.prepare('SELECT COUNT(*) as cnt FROM billing_records WHERE user_id = ?').get(auth.user.id) as { cnt: number };
    const total = totalRow.cnt;

    const records = db.prepare(
      'SELECT id, amount, type, description, balance_after, created_at FROM billing_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(auth.user.id, limit, offset) as DBBillingRecord[];

    return NextResponse.json({ records, total, has_more: offset + records.length < total });
  } catch (error) {
    console.error('Billing records error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

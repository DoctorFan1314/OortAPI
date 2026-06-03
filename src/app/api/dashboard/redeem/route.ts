import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';
import { logAdminAction } from '@/lib/billing-engine';
import { randomBytes } from 'crypto';
import type { DBRedeemCode } from '@/lib/db';

export const dynamic = 'force-dynamic';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(8);
  let code = 'RC-';
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const offset = (page - 1) * limit;

    const whereClause = search ? 'WHERE rc.code LIKE ?' : '';
    const countParams = search ? [`%${search}%`] : [];
    const total = (db.prepare(`SELECT COUNT(*) as count FROM redeem_codes rc ${whereClause}`).get(...countParams) as { count: number }).count;
    const codes = db.prepare(
      `SELECT rc.*, sp.display_name as plan_display_name, sp.monthly_credits as plan_monthly_credits
       FROM redeem_codes rc
       LEFT JOIN subscription_plans sp ON rc.plan_id = sp.id
       ${whereClause}
       ORDER BY rc.created_at DESC LIMIT ? OFFSET ?`
    ).all(...countParams, limit, offset) as (DBRedeemCode & { plan_display_name?: string; plan_monthly_credits?: number })[];

    return NextResponse.json({ codes, total, page, limit, has_more: offset + codes.length < total });
  } catch (error) {
    console.error('Redeem codes list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { count, amount, maxUses, expiresAt, codeType, planId, billingCycle, durationMonths } = await request.json();

    const type = codeType || 'balance';

    if (type === 'balance' && (!amount || amount <= 0)) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }
    if (type === 'subscription' && !planId) {
      return NextResponse.json({ error: 'Plan ID is required for subscription codes' }, { status: 400 });
    }

    const codeCount = Math.min(100, Math.max(1, count || 1));
    const uses = Math.max(1, maxUses || 1);
    const generated: string[] = [];

    const insert = db.prepare(
      'INSERT INTO redeem_codes (code, amount, code_type, plan_id, billing_cycle, duration_months, max_uses, created_by, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const txn = db.transaction(() => {
      for (let i = 0; i < codeCount; i++) {
        let code = generateCode();
        let attempts = 0;
        while (db.prepare('SELECT id FROM redeem_codes WHERE code = ?').get(code) && attempts < 10) {
          code = generateCode();
          attempts++;
        }
        insert.run(code, amount || 0, type, planId || null, billingCycle || 'monthly', durationMonths || 1, uses, auth.user!.id, expiresAt || null);
        generated.push(code);
      }
    });
    txn();

    logAdminAction(auth.user.id, 'create_redeem_codes', 'redeem', undefined, `${generated.length} codes, type=${type}, amount=${amount || 0}`, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

    return NextResponse.json({ codes: generated, count: generated.length, amount, maxUses: uses, codeType: type });
  } catch (error) {
    console.error('Redeem code create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id, ids, enabled } = await request.json();

    // Batch toggle
    if (Array.isArray(ids) && ids.length > 0) {
      const validIds = ids.filter((i: unknown) => Number.isInteger(i));
      if (validIds.length === 0) return NextResponse.json({ error: 'No valid IDs' }, { status: 400 });
      const placeholders = validIds.map(() => '?').join(',');
      db.prepare(`UPDATE redeem_codes SET enabled = ? WHERE id IN (${placeholders})`).run(enabled ? 1 : 0, ...validIds);
      logAdminAction(auth.user.id, 'batch_toggle_redeem', 'redeem', undefined, `${validIds.length} codes, enabled=${enabled}`, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());
      return NextResponse.json({ success: true, updated: validIds.length });
    }

    if (!id) return NextResponse.json({ error: 'Code id is required' }, { status: 400 });

    db.prepare('UPDATE redeem_codes SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redeem code update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id, ids } = await request.json();

    // Batch delete
    if (Array.isArray(ids) && ids.length > 0) {
      const validIds = ids.filter((i: unknown) => Number.isInteger(i));
      if (validIds.length === 0) return NextResponse.json({ error: 'No valid IDs' }, { status: 400 });
      const placeholders = validIds.map(() => '?').join(',');
      db.prepare(`DELETE FROM redeem_codes WHERE id IN (${placeholders})`).run(...validIds);
      logAdminAction(auth.user.id, 'batch_delete_redeem', 'redeem', undefined, `${validIds.length} codes`, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());
      return NextResponse.json({ success: true, deleted: validIds.length });
    }

    if (!id) return NextResponse.json({ error: 'Code id is required' }, { status: 400 });

    db.prepare('DELETE FROM redeem_codes WHERE id = ?').run(id);

    logAdminAction(auth.user.id, 'delete_redeem_code', 'redeem', id, undefined, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Redeem code delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';
import { addBalance, deductBalance, logAdminAction } from '@/lib/billing-engine';
import { generateSalt, hashPassword } from '@/lib/auth';
import type { DBUser, DBSubscriptionPlan } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // User detail endpoint
    if (action === 'detail') {
      const userId = parseInt(searchParams.get('id') || '0', 10);
      if (!userId) return NextResponse.json({ error: 'id required' }, { status: 400 });

      const user = db.prepare('SELECT id, email, username, balance, role, enabled, avatar, created_at, updated_at FROM users WHERE id = ?').get(userId) as Omit<DBUser, 'password_hash' | 'salt' | 'bio' | 'preferences'> | undefined;
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      // Usage stats
      const stats = db.prepare(
        `SELECT COUNT(*) as total_calls, SUM(tokens_in + tokens_out) as total_tokens, SUM(cost) as total_cost, SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_calls
         FROM usage_logs WHERE user_id = ?`
      ).get(userId) as { total_calls: number; total_tokens: number; total_cost: number; success_calls: number };

      // Top models
      const topModels = db.prepare(
        `SELECT model, COUNT(*) as calls, SUM(tokens_in + tokens_out) as tokens FROM usage_logs WHERE user_id = ? GROUP BY model ORDER BY calls DESC LIMIT 5`
      ).all(userId) as { model: string; calls: number; tokens: number }[];

      // 7-day trend
      const trend = db.prepare(
        `SELECT date(created_at) as day, COUNT(*) as calls, SUM(cost) as cost FROM usage_logs WHERE user_id = ? AND created_at >= datetime('now', '-7 days') GROUP BY date(created_at) ORDER BY day`
      ).all(userId) as { day: string; calls: number; cost: number }[];

      // API keys
      const keys = db.prepare(
        'SELECT id, name, enabled, total_calls, last_used_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC'
      ).all(userId) as { id: number; name: string; enabled: number; total_calls: number; last_used_at: string | null }[];

      // Subscription
      const subscription = db.prepare(
        `SELECT us.*, sp.display_name as plan_display_name, sp.name as plan_name FROM user_subscriptions us JOIN subscription_plans sp ON us.plan_id = sp.id WHERE us.user_id = ? AND us.status = 'active' ORDER BY us.created_at DESC LIMIT 1`
      ).get(userId) as Record<string, unknown> | undefined;

      // Recent activity (last 20 calls)
      const recentActivity = db.prepare(
        `SELECT model, tokens_in, tokens_out, cost, success, latency_ms, created_at
         FROM usage_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`
      ).all(userId) as { model: string; tokens_in: number; tokens_out: number; cost: number; success: number; latency_ms: number | null; created_at: string }[];

      return NextResponse.json({ user, stats, topModels, trend, keys, subscription: subscription || null, recentActivity });
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (search) {
      where += ' AND (email LIKE ? OR username LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role && (role === 'admin' || role === 'user')) {
      where += ' AND role = ?';
      params.push(role);
    }

    const total = (db.prepare(`SELECT COUNT(*) as count FROM users ${where}`).get(...params) as { count: number }).count;
    const users = db.prepare(
      `SELECT id, email, username, balance, role, enabled, avatar, created_at, updated_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset) as Omit<DBUser, 'password_hash' | 'salt' | 'bio' | 'preferences'>[];

    // Fetch subscriptions for all users in one query
    const userIds = users.map(u => u.id);
    const subscriptions = userIds.length > 0 ? db.prepare(
      `SELECT us.user_id, us.id as sub_id, us.status, us.credits_remaining, us.credits_total, us.billing_cycle, us.current_period_end,
              sp.display_name as plan_display_name, sp.name as plan_name
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id IN (${userIds.map(() => '?').join(',')}) AND us.status = 'active'
       ORDER BY us.created_at DESC`
    ).all(...userIds) as { user_id: number; sub_id: number; status: string; credits_remaining: number; credits_total: number; billing_cycle: string; current_period_end: string; plan_display_name: string; plan_name: string }[] : [];

    const subMap = new Map<number, typeof subscriptions[0]>();
    for (const s of subscriptions) { if (!subMap.has(s.user_id)) subMap.set(s.user_id, s); }

    const usersWithSubs = users.map(u => ({
      ...u,
      subscription: subMap.get(u.id) || null,
    }));

    return NextResponse.json({ users: usersWithSubs, total, page, limit, has_more: offset + users.length < total });
  } catch (error) {
    console.error('Users list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ids, role, enabled, addBalance: addAmt, deductBalance: deductAmt, resetPassword, giftSubscription, cancelSubscription, addCredits } = body;

    // Batch operations
    if (Array.isArray(ids) && ids.length > 0) {
      const validIds = ids.filter((i: unknown) => Number.isInteger(i) && i !== auth.user!.id);
      if (validIds.length === 0) return NextResponse.json({ error: 'No valid IDs' }, { status: 400 });
      const placeholders = validIds.map(() => '?').join(',');

      if (enabled !== undefined) {
        db.prepare(`UPDATE users SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`).run(enabled ? 1 : 0, ...validIds);
        logAdminAction(auth.user.id, 'batch_update_users', 'user', undefined, `${validIds.length} users, enabled=${enabled}`, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());
        return NextResponse.json({ success: true, updated: validIds.length });
      }

      if (addAmt !== undefined) {
        const amt = Number(addAmt);
        if (typeof amt !== 'number' || isNaN(amt) || amt <= 0 || amt > 1_000_000) {
          return NextResponse.json({ error: 'addBalance must be a positive number within limit' }, { status: 400 });
        }
        let success = 0;
        for (const uid of validIds) {
          const result = addBalance(uid, amt, 'gift', `Admin batch credited by ${auth.user.email}`);
          if (result.success) success++;
        }
        logAdminAction(auth.user.id, 'batch_grant_balance', 'user', undefined, `${success}/${validIds.length} users, +$${amt}`, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());
        return NextResponse.json({ success: true, updated: success, total: validIds.length });
      }

      return NextResponse.json({ error: 'Batch operation requires enabled or addBalance' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DBUser | undefined;
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from disabling/demoting themselves
    if (id === auth.user.id) {
      if (enabled === 0) {
        return NextResponse.json({ error: 'Cannot disable yourself' }, { status: 400 });
      }
      if (role === 'user') {
        return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
      }
    }

    // Update role
    if (role && (role === 'admin' || role === 'user')) {
      db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, id);
    }

    // Update enabled
    if (enabled !== undefined) {
      db.prepare('UPDATE users SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(enabled ? 1 : 0, id);
    }

    // Add balance
    if (addAmt !== undefined) {
      const amt = Number(addAmt);
      if (typeof amt !== 'number' || isNaN(amt) || amt <= 0) {
        return NextResponse.json({ error: 'addBalance must be a positive number' }, { status: 400 });
      }
      if (amt > 1_000_000) {
        return NextResponse.json({ error: 'addBalance exceeds maximum limit' }, { status: 400 });
      }
      const result = addBalance(id, amt, 'gift', `Admin credited by ${auth.user.email}`);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }

    // Deduct balance
    if (deductAmt !== undefined) {
      const amt = Number(deductAmt);
      if (typeof amt !== 'number' || isNaN(amt) || amt <= 0) {
        return NextResponse.json({ error: 'deductBalance must be a positive number' }, { status: 400 });
      }
      const result = deductBalance(id, amt, `Admin deducted by ${auth.user.email}`);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }

    // Reset password
    let newPassword: string | undefined;
    if (resetPassword === true) {
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      const bytes = new Uint8Array(12);
      crypto.getRandomValues(bytes);
      newPassword = Array.from(bytes, b => chars[b % chars.length]).join('');
      const salt = generateSalt();
      const passwordHash = hashPassword(newPassword, salt);
      db.prepare('UPDATE users SET password_hash = ?, salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, salt, id);
    }

    // Gift subscription
    if (giftSubscription && giftSubscription.planId) {
      const plan = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(giftSubscription.planId) as DBSubscriptionPlan | undefined;
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      // Cancel any existing active subscription
      db.prepare("UPDATE user_subscriptions SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND status = 'active'").run(id);
      const credits = giftSubscription.credits || plan.monthly_credits;
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      db.prepare(
        "INSERT INTO user_subscriptions (user_id, plan_id, billing_cycle, status, credits_remaining, credits_total, current_period_start, current_period_end, is_first_purchase, auto_renew) VALUES (?, ?, 'monthly', 'active', ?, ?, datetime('now'), ?, 0, 0)"
      ).run(id, plan.id, credits, credits, periodEnd.toISOString());
    }

    // Cancel subscription
    if (cancelSubscription === true) {
      db.prepare("UPDATE user_subscriptions SET status = 'cancelled', auto_renew = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND status = 'active'").run(id);
    }

    // Add credits to existing subscription
    if (addCredits && typeof addCredits === 'number' && addCredits > 0) {
      const activeSub = db.prepare("SELECT id, credits_remaining, credits_total FROM user_subscriptions WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(id) as { id: number; credits_remaining: number; credits_total: number } | undefined;
      if (activeSub) {
        db.prepare('UPDATE user_subscriptions SET credits_remaining = credits_remaining + ?, credits_total = credits_total + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(addCredits, addCredits, activeSub.id);
      } else {
        return NextResponse.json({ error: 'No active subscription to add credits to' }, { status: 400 });
      }
    }

    const updated = db.prepare('SELECT id, email, username, balance, role, enabled, avatar, created_at, updated_at FROM users WHERE id = ?').get(id);
    // Only return password in response once — admin must copy it immediately
    const response: Record<string, unknown> = { user: updated };
    if (newPassword) response.newPassword = newPassword;

    // Audit log
    const actions: string[] = [];
    if (role) actions.push(`role=${role}`);
    if (enabled !== undefined) actions.push(`enabled=${enabled}`);
    if (addAmt) actions.push(`+balance=${addAmt}`);
    if (deductAmt) actions.push(`-balance=${deductAmt}`);
    if (resetPassword) actions.push('reset_password');
    if (giftSubscription) actions.push(`gift_sub=${giftSubscription}`);
    if (cancelSubscription) actions.push('cancel_sub');
    if (addCredits) actions.push(`+credits=${addCredits}`);
    logAdminAction(auth.user.id, 'update_user', 'user', id, actions.join(', '), request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

    return NextResponse.json(response);
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 });
    }

    if (id === auth.user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    const target = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // CASCADE handles api_keys, usage_logs, billing_records
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    logAdminAction(auth.user.id, 'delete_user', 'user', id, undefined, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

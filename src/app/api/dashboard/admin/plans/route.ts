import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';
import type { DBSubscriptionPlan } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const action = request.nextUrl.searchParams.get('action');

    if (action === 'stats') {
      // Per-plan statistics
      const plans = db.prepare('SELECT id, name, display_name, monthly_price, yearly_price, monthly_credits FROM subscription_plans ORDER BY tier ASC').all() as { id: number; name: string; display_name: string; monthly_price: number; yearly_price: number; monthly_credits: number }[];

      const stats = plans.map(plan => {
        const subs = db.prepare(
          "SELECT COUNT(*) as count, SUM(credits_total - credits_remaining) as credits_used FROM user_subscriptions WHERE plan_id = ? AND status = 'active'"
        ).get(plan.id) as { count: number; credits_used: number | null };
        const monthlyRevenue = subs.count * plan.monthly_price;
        const creditsUsageRate = plan.monthly_credits > 0 && subs.credits_used
          ? (subs.credits_used / (subs.count * plan.monthly_credits)) * 100
          : 0;
        return {
          plan_id: plan.id,
          plan_name: plan.display_name,
          active_subs: subs.count,
          monthly_revenue: monthlyRevenue,
          credits_used: subs.credits_used || 0,
          credits_usage_rate: Math.min(100, Math.round(creditsUsageRate)),
        };
      });

      // Total stats
      const totalSubs = db.prepare("SELECT COUNT(*) as count FROM user_subscriptions WHERE status = 'active'").get() as { count: number };
      const totalRevenue = stats.reduce((s, st) => s + st.monthly_revenue, 0);

      return NextResponse.json({ stats, total_subs: totalSubs.count, total_monthly_revenue: totalRevenue });
    }

    const plans = db.prepare(
      'SELECT * FROM subscription_plans ORDER BY tier ASC'
    ).all() as DBSubscriptionPlan[];

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Failed to fetch plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name, display_name, tagline, tier, monthly_price, yearly_price,
      monthly_credits, first_purchase_discount = 0.3, overage_rate_multiplier = 1.0,
      max_concurrency = 10, route_priority = 'standard', off_peak_discount = 0,
      support_level = 'community', popular = 0, currency = 'CNY',
    } = body;

    if (!name || !display_name || !tier || monthly_price == null || yearly_price == null || !monthly_credits) {
      return NextResponse.json({ error: 'Missing required fields: name, display_name, tier, monthly_price, yearly_price, monthly_credits' }, { status: 400 });
    }

    const result = db.prepare(
      `INSERT INTO subscription_plans (name, display_name, tagline, tier, monthly_price, yearly_price, currency, monthly_credits, first_purchase_discount, overage_rate_multiplier, max_concurrency, route_priority, off_peak_discount, support_level, popular)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(name, display_name, tagline || null, tier, monthly_price, yearly_price, currency, monthly_credits, first_purchase_discount, overage_rate_multiplier, max_concurrency, route_priority, off_peak_discount, support_level, popular ? 1 : 0);

    const plan = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(result.lastInsertRowid) as DBSubscriptionPlan;
    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Failed to create plan:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'Plan id is required' }, { status: 400 });
    }

    const allowedFields = [
      'name', 'display_name', 'tagline', 'tier', 'monthly_price', 'yearly_price',
      'currency', 'monthly_credits', 'first_purchase_discount', 'overage_rate_multiplier',
      'max_concurrency', 'route_priority', 'off_peak_discount', 'support_level',
      'enabled', 'popular',
    ];

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(key === 'enabled' || key === 'popular' ? (value ? 1 : 0) : value);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    // Read old credits before UPDATE
    let oldCredits: number | undefined;
    if (fields.monthly_credits !== undefined) {
      const oldPlan = db.prepare('SELECT monthly_credits FROM subscription_plans WHERE id = ?').get(id) as { monthly_credits: number } | undefined;
      oldCredits = oldPlan?.monthly_credits;
    }

    db.prepare(`UPDATE subscription_plans SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Sync active subscriptions if monthly_credits changed
    if (fields.monthly_credits !== undefined && oldCredits !== undefined) {
      const newCredits = Number(fields.monthly_credits);
      db.prepare(
        `UPDATE user_subscriptions SET credits_remaining = MAX(0, credits_remaining + (? - credits_total)), credits_total = ?, updated_at = CURRENT_TIMESTAMP WHERE plan_id = ? AND status = 'active'`
      ).run(newCredits, newCredits, id);
    }

    const plan = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(id) as DBSubscriptionPlan | undefined;
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Failed to update plan:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Plan id is required' }, { status: 400 });
    }

    const activeCount = db.prepare("SELECT COUNT(*) as count FROM user_subscriptions WHERE plan_id = ? AND status = 'active'").get(id) as { count: number };
    if (activeCount.count > 0) {
      return NextResponse.json({ error: 'Cannot delete plan with active subscriptions' }, { status: 400 });
    }

    const result = db.prepare('DELETE FROM subscription_plans WHERE id = ?').run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete plan:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}

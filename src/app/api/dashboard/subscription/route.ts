import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';
import { dispatchWebhook } from '@/lib/billing-engine';
import type { DBUserSubscription, DBSubscriptionPlan } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const subscriptions = db.prepare(
      `SELECT us.*, sp.name as plan_name, sp.display_name as plan_display_name, sp.tier as plan_tier, sp.monthly_credits as plan_monthly_credits,
              sp.overage_rate_multiplier as plan_overage_rate_multiplier, sp.support_level as plan_support_level,
              sp.monthly_price as plan_monthly_price, sp.yearly_price as plan_yearly_price, sp.currency as plan_currency
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = ?
       ORDER BY us.created_at DESC`
    ).all(auth.user.id) as (DBUserSubscription & { plan_name: string; plan_display_name: string; plan_tier: number; plan_monthly_credits: number; plan_overage_rate_multiplier: number; plan_support_level: string; plan_monthly_price: number; plan_yearly_price: number; plan_currency: string })[];

    // Sync credits_total with current plan credits for active subscriptions
    for (const sub of subscriptions) {
      if (sub.status === 'active' && sub.credits_total !== sub.plan_monthly_credits) {
        const diff = sub.plan_monthly_credits - sub.credits_total;
        db.prepare('UPDATE user_subscriptions SET credits_total = ?, credits_remaining = MAX(0, credits_remaining + ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(sub.plan_monthly_credits, diff, sub.id);
        sub.credits_total = sub.plan_monthly_credits;
        sub.credits_remaining = Math.max(0, sub.credits_remaining + diff);
      }
    }

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription_id, action } = body;

    if (!subscription_id || !action) {
      return NextResponse.json({ error: 'subscription_id and action are required' }, { status: 400 });
    }

    const sub = db.prepare(
      "SELECT * FROM user_subscriptions WHERE id = ? AND user_id = ? AND status = 'active'"
    ).get(subscription_id, auth.user.id) as DBUserSubscription | undefined;

    if (!sub) {
      return NextResponse.json({ error: 'Active subscription not found' }, { status: 404 });
    }

    if (action === 'cancel') {
      // Calculate prorated refund based on remaining days
      const plan = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(sub.plan_id) as DBSubscriptionPlan | undefined;
      let refundAmount = 0;
      if (plan) {
        const now = new Date();
        const periodEnd = new Date(sub.current_period_end);
        const periodStart = new Date(sub.current_period_start);
        const totalDays = Math.max(1, (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
        const remainingDays = Math.max(0, (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const remainingRatio = remainingDays / totalDays;

        const currentPrice = sub.billing_cycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
        const exchangeRateSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'exchange_rate'").get() as { value: string } | undefined;
        const rate = parseFloat(exchangeRateSetting?.value || '7.3');
        const priceInUSD = plan.currency === 'CNY' ? currentPrice / rate : currentPrice;
        refundAmount = Math.round(priceInUSD * remainingRatio * 100) / 100;
      }

      const userId = auth.user!.id;
      // Refund and cancel in a transaction
      const txn = db.transaction(() => {
        if (refundAmount > 0) {
          db.prepare('UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(refundAmount, userId);
          const updated = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number };
          db.prepare('INSERT INTO billing_records (user_id, amount, type, description, balance_after) VALUES (?, ?, ?, ?, ?)').run(
            userId, refundAmount, 'refund', `Subscription cancellation refund (${sub.billing_cycle})`, updated.balance
          );
        }
        db.prepare("UPDATE user_subscriptions SET status = 'cancelled', auto_renew = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(subscription_id);
      });
      txn();

      dispatchWebhook('subscription.cancelled', {
        user_id: userId,
        subscription_id,
        refund: refundAmount,
      });

      return NextResponse.json({
        success: true,
        refund: refundAmount,
      });
    }

    if (action === 'toggle_auto_renew') {
      const newAutoRenew = sub.auto_renew ? 0 : 1;
      db.prepare(
        'UPDATE user_subscriptions SET auto_renew = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(newAutoRenew, subscription_id);

      return NextResponse.json({ success: true, auto_renew: newAutoRenew === 1 });
    }

    if (action === 'upgrade' || action === 'downgrade') {
      const { plan_id } = body;
      if (!plan_id) return NextResponse.json({ error: 'plan_id is required' }, { status: 400 });
      if (plan_id === sub.plan_id) return NextResponse.json({ error: 'Already on this plan' }, { status: 400 });

      const newPlan = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(plan_id) as DBSubscriptionPlan | undefined;
      if (!newPlan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

      // Calculate prorated credits from remaining days
      const now = new Date();
      const periodEnd = new Date(sub.current_period_end);
      const periodStart = new Date(sub.current_period_start);
      const totalDays = Math.max(1, (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.max(0, (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const proratedCredits = Math.round((sub.credits_remaining / totalDays) * remainingDays);

      // Cancel old subscription
      db.prepare("UPDATE user_subscriptions SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(sub.id);

      // Create new subscription with prorated credits
      const newCredits = newPlan.monthly_credits + proratedCredits;
      const newPeriodEnd = new Date(now);
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

      db.prepare(
        "INSERT INTO user_subscriptions (user_id, plan_id, billing_cycle, status, credits_remaining, credits_total, current_period_start, current_period_end, is_first_purchase, auto_renew) VALUES (?, ?, 'monthly', 'active', ?, ?, datetime('now'), ?, 0, ?)"
      ).run(auth.user.id, plan_id, newCredits, newPlan.monthly_credits, newPeriodEnd.toISOString(), sub.auto_renew);

      return NextResponse.json({
        success: true,
        message: `Plan ${action === 'upgrade' ? 'upgraded' : 'downgraded'} successfully`,
        prorated_credits: proratedCredits,
        new_plan: newPlan.display_name,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

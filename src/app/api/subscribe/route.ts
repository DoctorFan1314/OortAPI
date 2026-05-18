import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { validateUserFromCookie } from '@/lib/api-gateway';
import { deductBalance } from '@/lib/billing-engine';
import type { DBSubscriptionPlan, DBUserSubscription } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = validateUserFromCookie(request.headers.get('cookie'));
    if (!auth.valid || !auth.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = auth.user;
    const body = await request.json();
    const { plan_id, billing_cycle = 'monthly' } = body;

    if (!plan_id) {
      return NextResponse.json({ error: 'plan_id is required' }, { status: 400 });
    }

    if (!['monthly', 'yearly'].includes(billing_cycle)) {
      return NextResponse.json({ error: 'billing_cycle must be monthly or yearly' }, { status: 400 });
    }

    // Get exchange rate for CNY plan conversion
    const exchangeRateSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'exchange_rate'").get() as { value: string } | undefined;
    const exchangeRate = parseFloat(exchangeRateSetting?.value || '7.3');

    // Fetch the target plan
    const plan = db.prepare(
      'SELECT * FROM subscription_plans WHERE id = ? AND enabled = 1'
    ).get(plan_id) as DBSubscriptionPlan | undefined;

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found or disabled' }, { status: 404 });
    }

    // Check existing active subscription
    const activeSub = db.prepare(
      `SELECT us.*, sp.tier as plan_tier, sp.monthly_price as plan_monthly_price, sp.yearly_price as plan_yearly_price
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = ? AND us.status = 'active'`
    ).get(user.id) as (DBUserSubscription & { plan_tier: number; plan_monthly_price: number; plan_yearly_price: number }) | undefined;

    // Same plan - block
    if (activeSub && activeSub.plan_id === plan_id) {
      return NextResponse.json({ error: 'You already have an active subscription to this plan' }, { status: 409 });
    }

    // Check if this is user's first subscription ever
    const prevSub = db.prepare(
      'SELECT id FROM user_subscriptions WHERE user_id = ? LIMIT 1'
    ).get(user.id);
    const isFirstPurchase = !prevSub;

    let finalPrice: number;
    let action: string;

    if (activeSub) {
      // Upgrade or downgrade - prorated pricing
      const now = new Date();
      const periodEnd = new Date(activeSub.current_period_end);
      const periodStart = new Date(activeSub.current_period_start);
      const totalMs = periodEnd.getTime() - periodStart.getTime();
      const remainingMs = Math.max(0, periodEnd.getTime() - now.getTime());
      const remainingRatio = remainingMs / totalMs;

      // Current plan's remaining value
      const currentPrice = activeSub.billing_cycle === 'yearly' ? activeSub.plan_yearly_price : activeSub.plan_monthly_price;
      const remainingValue = currentPrice * remainingRatio;

      // New plan's price for remaining period
      const newBasePrice = billing_cycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
      const newValue = newBasePrice * remainingRatio;

      // Difference
      const diff = newValue - remainingValue;

      // Check downgrade: if user has consumed more than new plan's monthly credits, block
      if (diff < 0) {
        const consumedCredits = activeSub.credits_total - activeSub.credits_remaining;
        if (consumedCredits > plan.monthly_credits) {
          return NextResponse.json({
            error: `Cannot downgrade: you have used ${consumedCredits.toLocaleString()} credits, which exceeds the ${plan.display_name} plan limit of ${plan.monthly_credits.toLocaleString()} credits. Please wait for the next billing cycle or choose a higher tier plan.`,
            consumed: consumedCredits,
            limit: plan.monthly_credits,
          }, { status: 409 });
        }
      }

      if (diff > 0) {
        // Upgrade - charge difference
        if (user.balance < diff) {
          return NextResponse.json({
            error: 'Insufficient balance for upgrade',
            required: diff,
            available: user.balance,
          }, { status: 402 });
        }
        finalPrice = diff;
        action = 'upgrade';
      } else if (diff < 0) {
        // Downgrade - refund difference (credit to balance)
        finalPrice = 0;
        action = 'downgrade';
        // Add refund to balance
        db.prepare('UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(Math.abs(diff), user.id);
        db.prepare('INSERT INTO billing_records (user_id, amount, type, description, balance_after) VALUES (?, ?, ?, ?, ?)').run(
          user.id, Math.abs(diff), 'refund', `Downgrade refund: ${activeSub.plan_tier ? 'previous' : ''} → ${plan.display_name}`, user.balance + Math.abs(diff)
        );
      } else {
        finalPrice = 0;
        action = 'switch';
      }

      // Cancel old subscription
      db.prepare("UPDATE user_subscriptions SET status = 'cancelled', auto_renew = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(activeSub.id);

    } else {
      // New subscription
      const basePrice = billing_cycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
      const discount = isFirstPurchase ? plan.first_purchase_discount : 0;
      // Convert plan price to USD (balance is stored in USD)
      const priceInUSD = plan.currency === 'CNY' ? basePrice / exchangeRate : basePrice;
      finalPrice = priceInUSD * (1 - discount);
      action = 'new';

      if (user.balance < finalPrice) {
        return NextResponse.json({
          error: 'Insufficient balance',
          required: finalPrice,
          available: user.balance,
        }, { status: 402 });
      }
    }

    // Deduct balance if needed
    if (finalPrice > 0) {
      const deductResult = deductBalance(user.id, finalPrice, `Subscription: ${plan.display_name} (${billing_cycle})${isFirstPurchase ? ' - First purchase discount' : ''}`);
      if (!deductResult.success) {
        return NextResponse.json({ error: deductResult.error || 'Payment failed' }, { status: 402 });
      }
    }

    // Calculate period dates
    const now = new Date();
    const periodStart = now.toISOString();
    const periodEnd = new Date(now.getTime() + (billing_cycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

    // Calculate credits for new subscription
    // For upgrades/switches: carry over consumed credits (don't give full reset)
    let newCreditsRemaining = plan.monthly_credits;
    if (activeSub) {
      const consumedCredits = activeSub.credits_total - activeSub.credits_remaining;
      newCreditsRemaining = Math.max(0, plan.monthly_credits - consumedCredits);
    }

    // Create subscription
    const result = db.prepare(
      `INSERT INTO user_subscriptions (user_id, plan_id, billing_cycle, status, credits_remaining, credits_total, current_period_start, current_period_end, is_first_purchase)
       VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?)`
    ).run(user.id, plan_id, billing_cycle, newCreditsRemaining, plan.monthly_credits, periodStart, periodEnd, isFirstPurchase ? 1 : 0);

    const subscription = db.prepare(
      'SELECT * FROM user_subscriptions WHERE id = ?'
    ).get(result.lastInsertRowid) as DBUserSubscription;

    return NextResponse.json({
      subscription,
      action,
      charged: finalPrice,
      discount_applied: isFirstPurchase && action === 'new' ? plan.first_purchase_discount : 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

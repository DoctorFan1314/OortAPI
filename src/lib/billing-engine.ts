import db from './db';
import type { DBBillingRecord, DBUsageLog, DBUserSubscription, DBSubscriptionPlan } from './db';

export interface BillingResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

export function deductBalance(userId: number, amount: number, description: string): BillingResult {
  const txn = db.transaction(() => {
    // Atomic: only deduct if sufficient balance (prevents TOCTOU race)
    const result = db.prepare('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?').run(amount, userId, amount);
    if (result.changes === 0) {
      const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number } | undefined;
      if (!user) return { success: false, error: 'User not found' };
      return { success: false, error: 'Insufficient balance', newBalance: user.balance };
    }
    const updated = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number };
    db.prepare('INSERT INTO billing_records (user_id, amount, type, description, balance_after) VALUES (?, ?, ?, ?, ?)').run(userId, -amount, 'deduct', description, updated.balance);
    return { success: true, newBalance: updated.balance };
  });
  return txn();
}

export function addBalance(userId: number, amount: number, type: 'recharge' | 'refund' | 'gift', description: string): BillingResult {
  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number } | undefined;
  if (!user) return { success: false, error: 'User not found' };

  const txn = db.transaction(() => {
    // Atomic: use SQL arithmetic to prevent TOCTOU race on concurrent recharges
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, userId);
    const updated = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number };
    db.prepare('INSERT INTO billing_records (user_id, amount, type, description, balance_after) VALUES (?, ?, ?, ?, ?)').run(userId, amount, type, description, updated.balance);
  });
  txn();

  const updated = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number };
  return { success: true, newBalance: updated.balance };
}

export function getEffectiveMultiplier(model: string): { multiplier: number; type: string; description: string } {
  // 1. Check time-based multiplier
  const timeSettings = db.prepare('SELECT * FROM time_multiplier_settings WHERE id = 1 AND enabled = 1').get() as {
    day_start: string;
    day_end: string;
    day_rate: number;
    night_rate: number;
    timezone: string;
  } | undefined;

  if (timeSettings) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timeSettings.timezone,
    });
    const currentTime = formatter.format(now);
    // Handle overnight ranges (e.g. 22:00-06:00): use OR logic when start > end
    const isOvernight = timeSettings.day_start > timeSettings.day_end;
    const isDay = isOvernight
      ? (currentTime >= timeSettings.day_start || currentTime <= timeSettings.day_end)
      : (currentTime >= timeSettings.day_start && currentTime <= timeSettings.day_end);

    return {
      multiplier: isDay ? timeSettings.day_rate : timeSettings.night_rate,
      type: 'time',
      description: isDay ? `Day rate (${timeSettings.day_start}-${timeSettings.day_end})` : `Night rate (${timeSettings.day_end}-${timeSettings.day_start})`
    };
  }

  // 2. Check regular multiplier
  const regular = db.prepare('SELECT multiplier, description FROM multiplier_rules WHERE model_name = ? AND enabled = 1').get(model) as {
    multiplier: number;
    description: string | null;
  } | undefined;

  if (regular) {
    return {
      multiplier: regular.multiplier,
      type: 'regular',
      description: regular.description || 'Model specific'
    };
  }

  // 3. Default
  return { multiplier: 1.0, type: 'default', description: 'Standard rate' };
}

export function calculateCost(
  model: string,
  tokensIn: number,
  tokensOut: number,
  tokensInCache: number = 0,
): number {
  const rate = db.prepare('SELECT input_rate, output_rate, cache_rate FROM model_rates WHERE model_name = ? AND enabled = 1').get(model) as { input_rate: number; output_rate: number; cache_rate: number } | undefined;

  if (!rate) {
    return (tokensIn * 0.001 + tokensOut * 0.002) / 1000;
  }

  // Input(non-cached): charged at input_rate
  // Input(cache hit): charged at cache_rate
  // Output: charged at output_rate
  return Math.max(0, tokensIn - tokensInCache) * rate.input_rate / 1000
       + tokensInCache * rate.cache_rate / 1000
       + tokensOut * rate.output_rate / 1000;
}

export function logUsage(data: {
  userId: number;
  apiKeyId?: number;
  channelId?: number;
  model: string;
  tokensIn: number;
  tokensOut: number;
  tokensInCache?: number;
  tokensCacheCreation?: number;
  cost: number;
  creditsUsed?: number;
  deductionSource?: string;
  latencyMs?: number;
  success: boolean;
  errorMessage?: string;
  cached?: boolean;
  multiplier?: number;
  isStream?: boolean;
  requestSizeBytes?: number;
}) {
  db.prepare(
    'INSERT INTO usage_logs (user_id, api_key_id, channel_id, model, tokens_in, tokens_out, tokens_in_cache, tokens_cache_creation, cost, credits_used, deduction_source, latency_ms, success, error_message, cached, multiplier, is_stream, request_size_bytes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    data.userId, data.apiKeyId ?? null, data.channelId ?? null, data.model,
    data.tokensIn, data.tokensOut, data.tokensInCache ?? 0, data.tokensCacheCreation ?? 0,
    data.cost, data.creditsUsed ?? 0, data.deductionSource ?? 'balance', data.latencyMs ?? null,
    data.success ? 1 : 0, data.errorMessage ?? null, data.cached ? 1 : 0, data.multiplier ?? 1.0,
    data.isStream ? 1 : 0, data.requestSizeBytes ?? 0
  );
}

// --- Subscription Credits functions ---

export interface SubscriptionInfo {
  subscription: DBUserSubscription;
  plan: DBSubscriptionPlan;
}

export function getActiveSubscription(userId: number): SubscriptionInfo | null {
  const sub = db.prepare(
    "SELECT * FROM user_subscriptions WHERE user_id = ? AND status = 'active' AND current_period_end > datetime('now') ORDER BY created_at DESC LIMIT 1"
  ).get(userId) as DBUserSubscription | undefined;

  if (!sub) return null;

  const plan = db.prepare(
    'SELECT * FROM subscription_plans WHERE id = ?'
  ).get(sub.plan_id) as DBSubscriptionPlan | undefined;

  if (!plan) return null;

  return { subscription: sub, plan };
}

export interface DeductCreditsResult {
  success: boolean;
  source: 'credits' | 'balance' | 'blocked';
  creditsRemaining?: number;
  newBalance?: number;
  overageMultiplier?: number;
  error?: string;
}

export function calculateCredits(model: string, tokensIn: number, tokensOut: number, tokensInCache: number = 0): number {
  const rate = db.prepare('SELECT credit_rate FROM model_rates WHERE model_name = ? AND enabled = 1').get(model) as { credit_rate: number } | undefined;
  const creditRate = rate?.credit_rate ?? 1.0;
  // Cache hits charged at 50% discount (matching OpenAI's 0.5x cache ratio)
  const adjustedIn = (tokensIn - tokensInCache) + tokensInCache * 0.5;
  return Math.ceil(Math.max(0, adjustedIn + tokensOut) * creditRate);
}

export function deductCreditsOrBalance(
  userId: number,
  model: string,
  cost: number,
  description: string,
  tokensIn: number = 0,
  tokensOut: number = 0,
  tokensInCache: number = 0,
): DeductCreditsResult {
  const subInfo = getActiveSubscription(userId);

  if (subInfo) {
    const { subscription, plan } = subInfo;

    // Calculate credits based on token count * credit_rate (1 token = 1 credit by default)
    const creditsCost = calculateCredits(model, tokensIn, tokensOut, tokensInCache);

    if (subscription.credits_remaining >= creditsCost) {
      // Sufficient credits — atomic deduct with balance check (prevents TOCTOU race)
      const result = db.prepare(
        'UPDATE user_subscriptions SET credits_remaining = credits_remaining - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND credits_remaining >= ?'
      ).run(creditsCost, subscription.id, creditsCost);

      if (result.changes === 0) {
        // Credits were consumed between check and update — fall through to balance
        const freshSub = db.prepare('SELECT credits_remaining FROM user_subscriptions WHERE id = ?').get(subscription.id) as { credits_remaining: number };
        return deductCreditsOrBalance_fallback(userId, plan, subscription, freshSub.credits_remaining, cost, description, creditsCost);
      }

      // Log subscription usage
      db.prepare(
        'INSERT INTO subscription_usage_logs (subscription_id, user_id, model, credits_used, source) VALUES (?, ?, ?, ?, ?)'
      ).run(subscription.id, userId, model, creditsCost, 'credits');

      const updatedSub = db.prepare('SELECT credits_remaining FROM user_subscriptions WHERE id = ?').get(subscription.id) as { credits_remaining: number };

      return { success: true, source: 'credits', creditsRemaining: updatedSub.credits_remaining };
    }

    // Insufficient credits — fall back to balance with overage multiplier
    const overageMultiplier = plan.overage_rate_multiplier;
    const overageCost = cost * overageMultiplier;

    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number } | undefined;
    if (!user || user.balance < overageCost) {
      return { success: false, source: 'blocked', error: 'Credits exhausted and insufficient balance', overageMultiplier };
    }

    const deductResult = deductBalance(userId, overageCost, `${description} (overage, ${plan.name} x${overageMultiplier})`);
    if (!deductResult.success) {
      return { success: false, source: 'blocked', error: deductResult.error, overageMultiplier };
    }

    // Log subscription usage
    db.prepare(
      'INSERT INTO subscription_usage_logs (subscription_id, user_id, model, credits_used, source) VALUES (?, ?, ?, ?, ?)'
    ).run(subscription.id, userId, model, 0, 'balance');

    return { success: true, source: 'balance', newBalance: deductResult.newBalance, overageMultiplier };
  }

  // No subscription — pure balance deduction
  const deductResult = deductBalance(userId, cost, description);
  if (!deductResult.success) {
    return { success: false, source: 'blocked', error: deductResult.error };
  }

  return { success: true, source: 'balance', newBalance: deductResult.newBalance };
}

// Fallback when credits race condition detected: re-check and use balance if needed
function deductCreditsOrBalance_fallback(
  userId: number,
  plan: DBSubscriptionPlan,
  subscription: DBUserSubscription,
  creditsRemaining: number,
  cost: number,
  description: string,
  creditsCost: number,
): DeductCreditsResult {
  if (creditsRemaining >= creditsCost) {
    // Another request freed up credits — retry with atomic check
    const result = db.prepare(
      'UPDATE user_subscriptions SET credits_remaining = credits_remaining - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND credits_remaining >= ?'
    ).run(creditsCost, subscription.id, creditsCost);
    if (result.changes > 0) {
      db.prepare('INSERT INTO subscription_usage_logs (subscription_id, user_id, model, credits_used, source) VALUES (?, ?, ?, ?, ?)').run(subscription.id, userId, 'unknown', creditsCost, 'credits');
      const updatedSub = db.prepare('SELECT credits_remaining FROM user_subscriptions WHERE id = ?').get(subscription.id) as { credits_remaining: number };
      return { success: true, source: 'credits', creditsRemaining: updatedSub.credits_remaining };
    }
  }

  // Fall back to balance with overage multiplier
  const overageMultiplier = plan.overage_rate_multiplier;
  const overageCost = cost * overageMultiplier;
  const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(userId) as { balance: number } | undefined;
  if (!user || user.balance < overageCost) {
    return { success: false, source: 'blocked', error: 'Credits exhausted and insufficient balance', overageMultiplier };
  }
  const deductResult = deductBalance(userId, overageCost, `${description} (overage, ${plan.name} x${overageMultiplier})`);
  if (!deductResult.success) {
    return { success: false, source: 'blocked', error: deductResult.error, overageMultiplier };
  }
  db.prepare('INSERT INTO subscription_usage_logs (subscription_id, user_id, model, credits_used, source) VALUES (?, ?, ?, ?, ?)').run(subscription.id, userId, 'unknown', 0, 'balance');
  return { success: true, source: 'balance', newBalance: deductResult.newBalance, overageMultiplier };
}

// --- Audit Log ---

export function logAdminAction(adminId: number, action: string, targetType?: string, targetId?: number, details?: string, ip?: string) {
  db.prepare(
    'INSERT INTO audit_log (admin_id, action, target_type, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(adminId, action, targetType || null, targetId || null, details || null, ip || null);
}

export function getAuditLogs(page: number = 1, limit: number = 50): { logs: unknown[]; total: number; has_more: boolean } {
  const offset = (page - 1) * limit;
  const logs = db.prepare(
    `SELECT a.*, u.email as admin_email FROM audit_log a
     LEFT JOIN users u ON a.admin_id = u.id
     ORDER BY a.created_at DESC LIMIT ? OFFSET ?`
  ).all(limit, offset);
  const total = (db.prepare('SELECT COUNT(*) as count FROM audit_log').get() as { count: number }).count;
  return { logs, total, has_more: offset + logs.length < total };
}

// --- Subscription Auto-Renew ---

export function processAutoRenewals(): { renewed: number; failed: number } {
  const expired = db.prepare(
    `SELECT us.*, sp.monthly_credits, sp.monthly_price, sp.yearly_price, sp.name as plan_name
     FROM user_subscriptions us
     JOIN subscription_plans sp ON us.plan_id = sp.id
     WHERE us.auto_renew = 1 AND us.status = 'active' AND us.current_period_end <= datetime('now')`
  ).all() as (DBUserSubscription & { monthly_credits: number; monthly_price: number; yearly_price: number; plan_name: string })[];

  let renewed = 0;
  let failed = 0;

  for (const sub of expired) {
    try {
      const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(sub.user_id) as { balance: number } | undefined;
      if (!user) { failed++; continue; }

      const renewCost = sub.billing_cycle === 'yearly' ? sub.yearly_price : sub.monthly_price;

      if (user.balance < renewCost) {
        // Insufficient balance — mark as expired
        db.prepare("UPDATE user_subscriptions SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(sub.id);
        failed++;
        continue;
      }

      // Deduct balance and renew
      const txn = db.transaction(() => {
        db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(renewCost, sub.user_id);

        const newStart = new Date().toISOString();
        const newEnd = new Date(Date.now() + (sub.billing_cycle === 'yearly' ? 365 : 30) * 86400000).toISOString();

        db.prepare(
          `UPDATE user_subscriptions SET
            credits_remaining = ?, credits_total = ?,
            current_period_start = ?, current_period_end = ?,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).run(sub.monthly_credits, sub.monthly_credits, newStart, newEnd, sub.id);

        const updated = db.prepare('SELECT balance FROM users WHERE id = ?').get(sub.user_id) as { balance: number };
        db.prepare('INSERT INTO billing_records (user_id, amount, type, description, balance_after) VALUES (?, ?, ?, ?, ?)').run(
          sub.user_id, -renewCost, 'deduct', `Subscription renewal: ${sub.plan_name} (${sub.billing_cycle})`, updated.balance
        );
      });
      txn();
      renewed++;
    } catch {
      failed++;
    }
  }

  return { renewed, failed };
}

// --- Webhook Dispatch ---

export function dispatchWebhook(event: string, payload: Record<string, unknown>) {
  try {
    const hooks = db.prepare(
      "SELECT * FROM webhooks WHERE enabled = 1 AND events LIKE ?"
    ).all(`%${event}%`) as { id: number; url: string; secret: string }[];

    for (const hook of hooks) {
      // Fire-and-forget — don't await
      const body = JSON.stringify({ event, timestamp: new Date().toISOString(), payload });
      const { createHmac } = require('crypto');
      const signature = createHmac('sha256', hook.secret).update(body).digest('hex');

      fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': `sha256=${signature}`,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      }).catch(() => { /* silently ignore delivery failures */ });
    }
  } catch { /* ignore */ }
}

// --- Subscription Expiry Check ---

export function checkExpiringSubscriptions() {
  try {
    // Find subscriptions expiring in 3 days
    const expiring = db.prepare(
      `SELECT us.*, u.email, sp.display_name as plan_display_name
       FROM user_subscriptions us
       JOIN users u ON us.user_id = u.id
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.status = 'active' AND us.auto_renew = 0
       AND us.current_period_end BETWEEN datetime('now') AND datetime('now', '+3 days')`
    ).all() as (Record<string, unknown> & { email: string; plan_display_name: string })[];

    for (const sub of expiring) {
      dispatchWebhook('subscription.expiring', {
        user_id: sub.user_id,
        email: sub.email,
        plan: sub.plan_display_name,
        expires_at: sub.current_period_end,
        credits_remaining: sub.credits_remaining,
      });
    }

    return expiring.length;
  } catch { return 0; }
}

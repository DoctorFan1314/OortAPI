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
    const isDay = currentTime >= timeSettings.day_start && currentTime <= timeSettings.day_end;

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
  cached: boolean = false,
  tokensInCache: number = 0,
  tokensCacheCreation: number = 0,
): number {
  const rate = db.prepare('SELECT input_rate, output_rate, cache_rate, cache_creation_rate FROM model_rates WHERE model_name = ? AND enabled = 1').get(model) as { input_rate: number; output_rate: number; cache_rate: number; cache_creation_rate: number } | undefined;

  if (!rate) {
    // Default rate if model not found
    return (tokensIn * 0.001 + tokensOut * 0.002) / 1000;
  }

  // Non-cached input tokens: charged at full input_rate
  const nonCachedIn = tokensIn - tokensInCache - tokensCacheCreation;
  const inputCost = Math.max(0, nonCachedIn) * rate.input_rate / 1000;

  // Cache hit tokens: charged at cache_rate
  const cacheHitCost = tokensInCache * rate.cache_rate / 1000;

  // Cache creation tokens: use cache_creation_rate if set, else fallback to 1.25x input_rate
  const cacheCreateRate = rate.cache_creation_rate > 0 ? rate.cache_creation_rate : rate.input_rate * 1.25;
  const cacheCreationCost = tokensCacheCreation * cacheCreateRate / 1000;

  // Output tokens: always at output_rate
  const outputCost = tokensOut * rate.output_rate / 1000;

  return inputCost + cacheHitCost + cacheCreationCost + outputCost;
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
}) {
  db.prepare(
    'INSERT INTO usage_logs (user_id, api_key_id, channel_id, model, tokens_in, tokens_out, tokens_in_cache, tokens_cache_creation, cost, credits_used, deduction_source, latency_ms, success, error_message, cached, multiplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    data.userId, data.apiKeyId ?? null, data.channelId ?? null, data.model,
    data.tokensIn, data.tokensOut, data.tokensInCache ?? 0, data.tokensCacheCreation ?? 0,
    data.cost, data.creditsUsed ?? 0, data.deductionSource ?? 'balance', data.latencyMs ?? null,
    data.success ? 1 : 0, data.errorMessage ?? null, data.cached ? 1 : 0, data.multiplier ?? 1.0
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

export function calculateCredits(model: string, tokensIn: number, tokensOut: number, tokensInCache: number = 0, tokensCacheCreation: number = 0): number {
  const rate = db.prepare('SELECT credit_rate FROM model_rates WHERE model_name = ? AND enabled = 1').get(model) as { credit_rate: number } | undefined;
  const creditRate = rate?.credit_rate ?? 1.0;
  const totalTokens = tokensIn + tokensOut;
  return Math.ceil(totalTokens * creditRate);
}

export function deductCreditsOrBalance(
  userId: number,
  model: string,
  cost: number,
  description: string,
  tokensIn: number = 0,
  tokensOut: number = 0,
  tokensInCache: number = 0,
  tokensCacheCreation: number = 0,
): DeductCreditsResult {
  const subInfo = getActiveSubscription(userId);

  if (subInfo) {
    const { subscription, plan } = subInfo;

    // Calculate credits based on token count * credit_rate (1 token = 1 credit by default)
    const creditsCost = calculateCredits(model, tokensIn, tokensOut, tokensInCache, tokensCacheCreation);

    if (subscription.credits_remaining >= creditsCost) {
      // Sufficient credits — deduct from subscription
      db.prepare(
        'UPDATE user_subscriptions SET credits_remaining = credits_remaining - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(creditsCost, subscription.id);

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

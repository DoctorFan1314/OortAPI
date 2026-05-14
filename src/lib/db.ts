import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { mkdirSync } from 'fs';
import { join } from 'path';

// Lazy singleton — only created at runtime, not during build
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'oortapi.db');
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });

  _db = new Database(DB_PATH, { verbose: process.env.NODE_ENV === 'development' ? console.log : undefined });

  // Enable WAL mode for better concurrent read performance
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // Run migrations FIRST so existing databases have new columns before schema INSERTs
  const migrations = [
    'ALTER TABLE usage_logs ADD COLUMN tokens_in_cache INTEGER DEFAULT 0',
    'ALTER TABLE usage_logs ADD COLUMN tokens_cache_creation INTEGER DEFAULT 0',
    'ALTER TABLE users ADD COLUMN enabled INTEGER DEFAULT 1',
    'ALTER TABLE model_rates ADD COLUMN cache_creation_rate REAL DEFAULT 0',
    'ALTER TABLE usage_logs ADD COLUMN multiplier REAL DEFAULT 1.0',
    'ALTER TABLE model_rates ADD COLUMN credit_rate REAL NOT NULL DEFAULT 1.0',
    'ALTER TABLE usage_logs ADD COLUMN credits_used INTEGER DEFAULT 0',
    'ALTER TABLE usage_logs ADD COLUMN deduction_source TEXT DEFAULT \'balance\'',
    'ALTER TABLE redeem_codes ADD COLUMN code_type TEXT NOT NULL DEFAULT \'balance\'',
    'ALTER TABLE redeem_codes ADD COLUMN plan_id INTEGER',
    'ALTER TABLE redeem_codes ADD COLUMN billing_cycle TEXT DEFAULT \'monthly\'',
    'ALTER TABLE redeem_codes ADD COLUMN duration_months INTEGER DEFAULT 1',
    'ALTER TABLE subscription_plans ADD COLUMN currency TEXT NOT NULL DEFAULT \'CNY\'',
  ];
  for (const sql of migrations) {
    try {
      _db.exec(sql);
    } catch (e: unknown) {
      // Only ignore "duplicate column" errors; re-throw anything else
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('duplicate column') && !msg.includes('already exists')) {
        console.error(`Migration failed: ${sql}`, e);
      }
    }
  }

  // Initialize schema (CREATE TABLE IF NOT EXISTS + INSERTs now work with all columns)
  const schema = readFileSync(join(process.cwd(), 'src', 'lib', 'schema.sql'), 'utf-8');
  _db.exec(schema);

  // Seed/update default subscription plans on every startup
  try {
    // Use INSERT OR REPLACE with explicit IDs to handle both new and existing DBs
    // First ensure the 4 default plans exist with correct pricing
    const defaultPlans = [
      { name: 'spark', display_name: 'Lite', tagline: '尝鲜入门', tier: 1, monthly_price: 9, yearly_price: 92, monthly_credits: 9000000, first_purchase_discount: 0.23, overage_rate_multiplier: 1.0, max_concurrency: 10, route_priority: 'standard', off_peak_discount: 0.8, support_level: 'community', popular: 0 },
      { name: 'flare', display_name: 'Standard', tagline: '适合进阶用户', tier: 2, monthly_price: 29, yearly_price: 296, monthly_credits: 30000000, first_purchase_discount: 0.23, overage_rate_multiplier: 0.95, max_concurrency: 30, route_priority: 'priority', off_peak_discount: 0.8, support_level: 'email', popular: 0 },
      { name: 'pulse', display_name: 'Pro', tagline: '适合专业开发者', tier: 3, monthly_price: 79, yearly_price: 806, monthly_credits: 85000000, first_purchase_discount: 0.23, overage_rate_multiplier: 0.85, max_concurrency: 100, route_priority: 'ultra', off_peak_discount: 0.8, support_level: 'priority', popular: 1 },
      { name: 'nova', display_name: 'Max', tagline: '适合编程开发发烧友', tier: 4, monthly_price: 199, yearly_price: 2030, monthly_credits: 220000000, first_purchase_discount: 0.23, overage_rate_multiplier: 0.75, max_concurrency: 500, route_priority: 'exclusive', off_peak_discount: 0.8, support_level: 'dedicated', popular: 0 },
    ];

    // Delete any duplicates (keep lowest ID per name), then upsert
    _db.exec(`DELETE FROM subscription_plans WHERE id NOT IN (SELECT MIN(id) FROM subscription_plans GROUP BY name)`);

    const upsert = _db.prepare(`INSERT INTO subscription_plans (name, display_name, tagline, tier, monthly_price, yearly_price, monthly_credits, first_purchase_discount, overage_rate_multiplier, max_concurrency, route_priority, off_peak_discount, support_level, popular)
      VALUES (@name, @display_name, @tagline, @tier, @monthly_price, @yearly_price, @monthly_credits, @first_purchase_discount, @overage_rate_multiplier, @max_concurrency, @route_priority, @off_peak_discount, @support_level, @popular)
      ON CONFLICT(name) DO UPDATE SET display_name=excluded.display_name, tagline=excluded.tagline, tier=excluded.tier, monthly_price=excluded.monthly_price, yearly_price=excluded.yearly_price, monthly_credits=excluded.monthly_credits, first_purchase_discount=excluded.first_purchase_discount, overage_rate_multiplier=excluded.overage_rate_multiplier, max_concurrency=excluded.max_concurrency, route_priority=excluded.route_priority, off_peak_discount=excluded.off_peak_discount, support_level=excluded.support_level, popular=excluded.popular`);

    for (const plan of defaultPlans) {
      upsert.run(plan);
    }

    // Ensure plan_models bindings exist
    const planIds = _db.prepare('SELECT id, name FROM subscription_plans').all() as { id: number; name: string }[];
    const planIdMap: Record<string, number> = {};
    for (const p of planIds) planIdMap[p.name] = p.id;

    _db.exec('DELETE FROM plan_models');
    const insertModel = _db.prepare('INSERT INTO plan_models (plan_id, model_name, enabled) VALUES (?, ?, 1)');
    const modelBindings: [string, string][] = [
      ['spark', 'gpt-4o-mini'], ['spark', 'deepseek-chat'], ['spark', 'gemini-2.0-flash'], ['spark', 'gpt-3.5-turbo'],
      ['flare', 'gpt-4o'], ['flare', 'claude-3-5-sonnet-20241022'], ['flare', 'claude-3-5-haiku-20241022'], ['flare', 'deepseek-reasoner'], ['flare', 'gemini-1.5-pro'], ['flare', 'qwen-max'],
      ['pulse', 'gpt-4-turbo'], ['pulse', 'claude-3-opus-20240229'],
    ];
    for (const [planName, model] of modelBindings) {
      if (planIdMap[planName]) insertModel.run(planIdMap[planName], model);
    }
  } catch (e) {
    console.error('Plan seed error:', e);
  }

  return _db;
}

// Proxy that lazily initializes the database on first property access
const db = new Proxy({} as Database.Database, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(realDb);
    }
    return value;
  },
});

export default db;

// Helper types for database rows
export interface DBUser {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  salt: string;
  balance: number;
  role: 'user' | 'admin';
  avatar: string | null;
  bio: string | null;
  preferences: string;
  enabled: number;
  created_at: string;
  updated_at: string;
}

export interface DBApiKey {
  id: number;
  user_id: number;
  key_value: string;
  name: string;
  permissions: string;
  rate_limit: number;
  enabled: number;
  created_at: string;
  last_used_at: string | null;
  total_calls: number;
}

export interface DBChannel {
  id: number;
  name: string;
  type: string;
  api_key_encrypted: string;
  base_url: string | null;
  weight: number;
  enabled: number;
  models: string;
  model_mapping: string;
  status: string;
  priority: number;
  fail_count: number;
  last_fail_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBModelRate {
  id: number;
  model_name: string;
  display_name: string;
  provider: string;
  input_rate: number;
  output_rate: number;
  cache_rate: number;
  cache_creation_rate: number;
  credit_rate: number;
  enabled: number;
  created_at: string;
}

export interface DBUsageLog {
  id: number;
  user_id: number;
  api_key_id: number | null;
  channel_id: number | null;
  model: string;
  tokens_in: number;
  tokens_out: number;
  tokens_in_cache: number;
  tokens_cache_creation: number;
  cost: number;
  credits_used: number;
  deduction_source: string;
  latency_ms: number | null;
  success: number;
  error_message: string | null;
  cached: number;
  created_at: string;
}

export interface DBBillingRecord {
  id: number;
  user_id: number;
  amount: number;
  type: 'recharge' | 'deduct' | 'refund' | 'gift';
  description: string | null;
  balance_after: number | null;
  created_at: string;
}

export interface DBRedeemCode {
  id: number;
  code: string;
  amount: number;
  code_type: 'balance' | 'subscription';
  plan_id: number | null;
  billing_cycle: string;
  duration_months: number;
  enabled: number;
  max_uses: number;
  current_uses: number;
  created_by: number;
  created_at: string;
  expires_at: string | null;
}

export interface DBSubscriptionPlan {
  id: number;
  name: string;
  display_name: string;
  tagline: string | null;
  tier: number;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  monthly_credits: number;
  first_purchase_discount: number;
  overage_rate_multiplier: number;
  max_concurrency: number;
  route_priority: string;
  off_peak_discount: number;
  support_level: string;
  enabled: number;
  popular: number;
  created_at: string;
  updated_at: string;
}

export interface DBPlanModel {
  id: number;
  plan_id: number;
  model_name: string;
  enabled: number;
}

export interface DBUserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled' | 'paused';
  credits_remaining: number;
  credits_total: number;
  current_period_start: string;
  current_period_end: string;
  is_first_purchase: number;
  auto_renew: number;
  created_at: string;
  updated_at: string;
}

export interface DBSubscriptionUsageLog {
  id: number;
  subscription_id: number;
  user_id: number;
  model: string;
  tokens_in: number;
  tokens_out: number;
  credits_used: number;
  source: 'credits' | 'balance';
  created_at: string;
}

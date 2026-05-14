-- OortAPI Database Schema
-- SQLite database for API relay platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  balance REAL DEFAULT 0.0,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  avatar TEXT,
  bio TEXT,
  preferences TEXT DEFAULT '{"theme":"system","language":"zh"}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  key_value TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  permissions TEXT DEFAULT '{"models":["*"]}',
  rate_limit INTEGER DEFAULT 60,
  enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME,
  total_calls INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Channels table (AI service provider connections)
CREATE TABLE IF NOT EXISTS channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  base_url TEXT,
  weight REAL DEFAULT 1.0,
  enabled INTEGER DEFAULT 1,
  models TEXT DEFAULT '[]',
  model_mapping TEXT DEFAULT '{}',
  status TEXT DEFAULT 'unknown' CHECK(status IN ('unknown', 'online', 'offline', 'rate_limited')),
  priority INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  last_fail_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Model rates table
CREATE TABLE IF NOT EXISTS model_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  provider TEXT,
  input_rate REAL NOT NULL DEFAULT 0,
  output_rate REAL NOT NULL DEFAULT 0,
  cache_rate REAL DEFAULT 0,
  cache_creation_rate REAL DEFAULT 0,
  credit_rate REAL NOT NULL DEFAULT 1.0,
  enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  api_key_id INTEGER,
  channel_id INTEGER,
  model TEXT NOT NULL,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  tokens_in_cache INTEGER DEFAULT 0,
  tokens_cache_creation INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  deduction_source TEXT DEFAULT 'balance',
  latency_ms INTEGER,
  success INTEGER DEFAULT 1,
  error_message TEXT,
  cached INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Billing records table
CREATE TABLE IF NOT EXISTS billing_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('recharge', 'deduct', 'refund', 'gift')),
  description TEXT,
  balance_after REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Redeem codes table
CREATE TABLE IF NOT EXISTS redeem_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  code_type TEXT NOT NULL DEFAULT 'balance' CHECK(code_type IN ('balance', 'subscription')),
  plan_id INTEGER,
  billing_cycle TEXT DEFAULT 'monthly',
  duration_months INTEGER DEFAULT 1,
  enabled INTEGER DEFAULT 1,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- Multiplier rules table (per-model multiplier)
CREATE TABLE IF NOT EXISTS multiplier_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT NOT NULL,
  multiplier REAL NOT NULL DEFAULT 1.0,
  enabled INTEGER DEFAULT 1,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(model_name)
);

-- Time-based multiplier settings (global config)
CREATE TABLE IF NOT EXISTS time_multiplier_settings (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  day_start TEXT DEFAULT '08:00',
  day_end TEXT DEFAULT '22:00',
  day_rate REAL DEFAULT 1.0,
  night_rate REAL DEFAULT 0.5,
  timezone TEXT DEFAULT 'Asia/Shanghai',
  enabled INTEGER DEFAULT 0
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,          -- 'spark', 'flare', 'pulse', 'nova'
  display_name TEXT NOT NULL,       -- 'Spark 火花'
  tagline TEXT,                     -- '点燃你的 AI 之旅'
  tier INTEGER NOT NULL,            -- 1, 2, 3, 4 (排序用)
  monthly_price REAL NOT NULL,      -- 月付价格
  yearly_price REAL NOT NULL,       -- 年付价格
  currency TEXT NOT NULL DEFAULT 'CNY', -- 价格货币 CNY/USD
  monthly_credits INTEGER NOT NULL, -- 每月 Credits 额度
  first_purchase_discount REAL DEFAULT 0.3, -- 首购折扣 (0.3 = 7折)
  overage_rate_multiplier REAL DEFAULT 1.0, -- 超出费率系数
  max_concurrency INTEGER DEFAULT 10,       -- 最大并发
  route_priority TEXT DEFAULT 'standard',   -- standard/priority/ultra/exclusive
  off_peak_discount REAL DEFAULT 0,         -- 非高峰折扣 (0.2 = 8折, 仅Nova)
  support_level TEXT DEFAULT 'community',   -- community/email/priority/dedicated
  enabled INTEGER DEFAULT 1,
  popular INTEGER DEFAULT 0,        -- 是否显示 "Most Popular" 标签
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Plan-Model binding table
CREATE TABLE IF NOT EXISTS plan_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL,
  model_name TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
  UNIQUE(plan_id, model_name)
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_id INTEGER NOT NULL,
  billing_cycle TEXT NOT NULL CHECK(billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled', 'paused')),
  credits_remaining INTEGER NOT NULL,
  credits_total INTEGER NOT NULL,
  current_period_start DATETIME NOT NULL,
  current_period_end DATETIME NOT NULL,
  is_first_purchase INTEGER DEFAULT 1,
  auto_renew INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- Subscription usage logs table
CREATE TABLE IF NOT EXISTS subscription_usage_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  model TEXT NOT NULL,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  source TEXT NOT NULL CHECK(source IN ('credits', 'balance')), -- 扣费来源
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_value ON api_keys(key_value);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_model ON usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_usage_logs_channel ON usage_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_created ON usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_billing_records_user ON billing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_records_user_created ON billing_records(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_channels_type ON channels(type);
CREATE INDEX IF NOT EXISTS idx_channels_enabled ON channels(enabled);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON redeem_codes(code);
CREATE INDEX IF NOT EXISTS idx_multiplier_rules_model ON multiplier_rules(model_name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_tier ON subscription_plans(tier);
CREATE INDEX IF NOT EXISTS idx_plan_models_plan ON plan_models(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_logs_user ON subscription_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_logs_sub ON subscription_usage_logs(subscription_id);

-- Default system settings
INSERT OR IGNORE INTO system_settings (key, value) VALUES
  ('site_name', 'OortAPI'),
  ('registration_enabled', 'true'),
  ('default_rate_limit', '60'),
  ('default_balance', '10.0'),
  ('maintenance_mode', 'false'),
  ('currency', 'USD'),
  ('exchange_rate', '7.3'),
  ('timezone', 'Asia/Shanghai');

-- Default model rates (popular models)
INSERT OR IGNORE INTO model_rates (model_name, display_name, provider, input_rate, output_rate, cache_rate, cache_creation_rate) VALUES
  ('gpt-4o', 'GPT-4o', 'openai', 0.0025, 0.01, 0.00125, 0.003125),
  ('gpt-4o-mini', 'GPT-4o Mini', 'openai', 0.00015, 0.0006, 0.000075, 0.0001875),
  ('gpt-4-turbo', 'GPT-4 Turbo', 'openai', 0.01, 0.03, 0.005, 0.0125),
  ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'openai', 0.0005, 0.0015, 0.00025, 0.000625),
  ('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'anthropic', 0.003, 0.015, 0.0015, 0.00375),
  ('claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 'anthropic', 0.001, 0.005, 0.0005, 0.00125),
  ('claude-3-opus-20240229', 'Claude 3 Opus', 'anthropic', 0.015, 0.075, 0.0075, 0.01875),
  ('deepseek-chat', 'DeepSeek Chat', 'deepseek', 0.00014, 0.00028, 0.00007, 0.000175),
  ('deepseek-reasoner', 'DeepSeek Reasoner', 'deepseek', 0.00055, 0.00219, 0.000275, 0.0006875),
  ('gemini-2.0-flash', 'Gemini 2.0 Flash', 'google', 0.0001, 0.0004, 0.00005, 0.000125),
  ('gemini-1.5-pro', 'Gemini 1.5 Pro', 'google', 0.00125, 0.005, 0.000625, 0.0015625),
  ('qwen-max', 'Qwen Max', 'alibaba', 0.0016, 0.0064, 0.0008, 0.002);

-- Subscription plans and plan_models are seeded by db.ts migration (not here)

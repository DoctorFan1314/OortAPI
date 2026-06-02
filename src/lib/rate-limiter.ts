import db from './db';

// In-memory cache for fast lookups (synced to SQLite periodically)
const cache = new Map<string, { count: number; windowStart: number }>();

// Cleanup old entries periodically
let cleanupTimer: ReturnType<typeof setInterval> | null = null;
if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, val] of cache) {
      if (val.windowStart + 60_000 < now) cache.delete(key);
    }
    // Also clean stale DB entries older than 5 minutes
    try {
      db.prepare("DELETE FROM rate_limit_counters WHERE window_start < ?").run(now - 300_000);
    } catch { /* table may not exist yet */ }
  }, 60_000);
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}

function getWindowStart(windowMs: number): number {
  return Math.floor(Date.now() / windowMs) * windowMs;
}

function loadFromDb(key: string, windowMs: number): { count: number; windowStart: number } | null {
  try {
    const row = db.prepare('SELECT count, window_start FROM rate_limit_counters WHERE key = ?').get(key) as { count: number; window_start: number } | undefined;
    if (!row) return null;
    const windowStart = getWindowStart(windowMs);
    // If the stored window is stale, return null (will reset)
    if (row.window_start < windowStart) return null;
    return { count: row.count, windowStart: row.window_start };
  } catch {
    return null;
  }
}

function saveToDb(key: string, count: number, windowStart: number) {
  try {
    db.prepare(
      'INSERT INTO rate_limit_counters (key, count, window_start, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET count = excluded.count, window_start = excluded.window_start, updated_at = CURRENT_TIMESTAMP'
    ).run(key, count, windowStart);
  } catch { /* table may not exist yet */ }
}

export function checkRateLimit(keyId: number, limit: number): RateLimitResult {
  const key = `apikey:${keyId}`;
  const windowMs = 60_000; // 1 minute window
  const windowStart = getWindowStart(windowMs);
  const resetAt = windowStart + windowMs;

  // Check in-memory cache first
  let entry = cache.get(key);
  if (!entry || entry.windowStart < windowStart) {
    // Cache miss or stale — try loading from DB
    const dbEntry = loadFromDb(key, windowMs);
    entry = dbEntry || { count: 0, windowStart };
    cache.set(key, entry);
  }

  entry.count++;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, limit, resetAt };
  }

  // Persist to DB every 5 increments or on first increment
  if (entry.count === 1 || entry.count % 5 === 0) {
    saveToDb(key, entry.count, windowStart);
  }

  return { allowed: true, remaining: Math.max(0, limit - entry.count), limit, resetAt };
}

// IP-based rate limiting for auth endpoints
export function checkIpRateLimit(ip: string, limit: number, windowMs: number = 60_000): RateLimitResult {
  const key = `ip:${ip}`;
  const windowStart = getWindowStart(windowMs);
  const resetAt = windowStart + windowMs;

  let entry = cache.get(key);
  if (!entry || entry.windowStart < windowStart) {
    const dbEntry = loadFromDb(key, windowMs);
    entry = dbEntry || { count: 0, windowStart };
    cache.set(key, entry);
  }

  entry.count++;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, limit, resetAt };
  }

  if (entry.count === 1 || entry.count % 5 === 0) {
    saveToDb(key, entry.count, windowStart);
  }

  return { allowed: true, remaining: Math.max(0, limit - entry.count), limit, resetAt };
}

// Global rate limit for the entire system
export function checkGlobalRateLimit(): RateLimitResult {
  const setting = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('default_rate_limit') as { value: string } | undefined;
  const limit = setting ? parseInt(setting.value) : 1000;
  return checkRateLimit(0, limit); // key 0 = global
}

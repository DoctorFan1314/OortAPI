import db from './db';
import type { DBChannel } from './db';

const FAIL_THRESHOLD = 3;
const RECOVERY_TIME_MS = 5 * 60 * 1000; // 5 minutes
const LATENCY_CACHE_TTL = 30 * 1000; // 30 seconds

interface LatencyStat { channel_id: number; avg_latency: number; request_count: number }
let latencyCache: { stats: LatencyStat[]; expiresAt: number } | null = null;

export interface ChannelSelection {
  channel: DBChannel;
  model: string; // actual model name after mapping
}

export function selectChannel(requestedModel: string): ChannelSelection | null {
  // Get all enabled channels
  const channels = db.prepare(
    'SELECT * FROM channels WHERE enabled = 1 ORDER BY priority DESC'
  ).all() as DBChannel[];

  if (channels.length === 0) return null;

  // Filter channels that support the requested model
  const eligible = channels.filter(ch => {
    const models: string[] = JSON.parse(ch.models || '[]');
    if (models.length === 0) return true; // empty = supports all
    return models.includes(requestedModel) || models.includes('*');
  });

  if (eligible.length === 0) return null;

  // Filter out channels that have failed too many times (unless recovery time passed)
  const now = Date.now();
  const available = eligible.filter(ch => {
    if (ch.fail_count < FAIL_THRESHOLD) return true;
    if (ch.last_fail_at && now - new Date(ch.last_fail_at).getTime() > RECOVERY_TIME_MS) {
      db.prepare('UPDATE channels SET fail_count = 0 WHERE id = ?').run(ch.id);
      return true;
    }
    return false;
  });

  if (available.length === 0) return null;

  // Get recent latency stats (cached for 30s)
  const now2 = Date.now();
  if (!latencyCache || now2 >= latencyCache.expiresAt) {
    const freshStats = db.prepare(
      `SELECT channel_id, AVG(latency_ms) as avg_latency, COUNT(*) as request_count
       FROM usage_logs
       WHERE created_at > datetime('now', '-1 hour')
       GROUP BY channel_id`
    ).all() as LatencyStat[];
    latencyCache = { stats: freshStats, expiresAt: now2 + LATENCY_CACHE_TTL };
  }
  const statsMap = new Map(latencyCache.stats.map(s => [s.channel_id, s]));

  // Weighted selection with latency boost
  const scored = available.map(ch => {
    const stats = statsMap.get(ch.id);
    let effectiveWeight = ch.weight;
    if (stats && stats.request_count >= 3) {
      // Boost channels with lower latency (clamp between 0.5x and 2x)
      const avgLatency = stats.avg_latency;
      const medianLatency = 2000; // 2s baseline
      const latencyFactor = Math.max(0.5, Math.min(2, medianLatency / avgLatency));
      effectiveWeight = Math.round(ch.weight * latencyFactor);
    }
    return { channel: ch, effectiveWeight: Math.max(1, effectiveWeight) };
  });

  const totalWeight = scored.reduce((sum, s) => sum + s.effectiveWeight, 0);
  let random = Math.random() * totalWeight;
  for (const { channel: ch, effectiveWeight } of scored) {
    random -= effectiveWeight;
    if (random <= 0) {
      const mapping: Record<string, string> = JSON.parse(ch.model_mapping || '{}');
      const actualModel = mapping[requestedModel] || requestedModel;
      return { channel: ch, model: actualModel };
    }
  }

  // Fallback to first available
  const ch = available[0];
  const mapping: Record<string, string> = JSON.parse(ch.model_mapping || '{}');
  return { channel: ch, model: mapping[requestedModel] || requestedModel };
}

export function reportChannelFailure(channelId: number, errorMessage: string) {
  const isRateLimited = errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit');
  const status = isRateLimited ? 'rate_limited' : 'offline';
  db.prepare(
    'UPDATE channels SET fail_count = fail_count + 1, last_fail_at = CURRENT_TIMESTAMP, status = CASE WHEN fail_count + 1 >= ? THEN ? ELSE status END WHERE id = ?'
  ).run(FAIL_THRESHOLD, status, channelId);

  // Log health change
  const ch = db.prepare('SELECT fail_count FROM channels WHERE id = ?').get(channelId) as { fail_count: number } | undefined;
  if (ch) {
    try {
      db.prepare(
        'INSERT INTO channel_health_log (channel_id, status, fail_count, details) VALUES (?, ?, ?, ?)'
      ).run(channelId, status, ch.fail_count, errorMessage.slice(0, 500));
    } catch { /* table may not exist yet */ }
  }
}

export function reportChannelSuccess(channelId: number) {
  db.prepare(
    'UPDATE channels SET fail_count = 0, status = ? WHERE id = ?'
  ).run('online', channelId);

  // Log health recovery
  try {
    db.prepare(
      'INSERT INTO channel_health_log (channel_id, status, fail_count) VALUES (?, ?, 0)'
    ).run(channelId, 'online');
  } catch { /* table may not exist yet */ }
}

export function getChannels(): DBChannel[] {
  return db.prepare('SELECT * FROM channels ORDER BY priority DESC, created_at DESC').all() as DBChannel[];
}

export function getAvailableModels(): string[] {
  const rates = db.prepare('SELECT model_name, display_name, provider FROM model_rates WHERE enabled = 1').all() as { model_name: string; display_name: string; provider: string }[];
  return rates.map(r => r.model_name);
}

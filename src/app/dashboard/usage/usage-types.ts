"use client";

export interface UsageLog {
  id: number;
  model: string;
  tokens_in: number;
  tokens_out: number;
  tokens_in_cache: number;
  cost: number;
  credits_used: number;
  deduction_source: string;
  credit_rate: number | null;
  latency_ms: number | null;
  success: number;
  cached: number;
  created_at: string;
  multiplier: number | null;
  channel_name: string | null;
  key_name: string | null;
  api_key_id: number | null;
  input_rate: number | null;
  output_rate: number | null;
  cache_rate: number | null;
}

export interface DailyTrend {
  date: string;
  calls: number;
  cost: number;
  tokens: number;
  tokens_in_noncached: number;
  tokens_in_cache: number;
  tokens_out: number;
}

export interface UsageSummary {
  total_calls: number;
  total_tokens: number;
  total_cost: number;
  total_tokens_in_noncached: number;
  total_tokens_in_cache: number;
  total_tokens_out: number;
  total_credits_used?: number;
}

export function formatRate(rate: number | null | undefined, symbol: string, exchangeRate: number): string {
  if (rate == null || rate === 0) return "-";
  const value = symbol === "¥" ? rate * exchangeRate : rate;
  return `${symbol}${value.toFixed(4)}/1M tokens`;
}

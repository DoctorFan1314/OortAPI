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

export const LABELS = {
  zh: {
    title: "调用日志",
    model: "模型",
    channel: "渠道",
    tokensIn: "输入(未命中缓存)Tokens",
    tokensOut: "输出 Tokens",
    tokensInCache: "输入(命中缓存)Tokens",
    tokens: "总 Tokens",
    cost: "费用",
    latency: "延迟",
    status: "状态",
    success: "成功",
    failed: "失败",
    multiplier: "倍率",
    details: "详情",
    noLogs: "暂无调用记录",
    time: "时间",
    totalCalls: "总调用次数",
    totalTokens: "总 Tokens",
    totalCost: "总花费",
    inputCost: "输入费用",
    outputCost: "输出费用",
    cacheReadCost: "输入(命中缓存)费用",
    costBreakdown: "费用明细",
    noChannel: "无渠道",
    formula: "计算公式",
    nonCachedTokens: "非缓存输入",
    total: "合计",
    noRateData: "未找到模型费率，使用默认费率",
    notes: "备注",
    subUser: "套餐用户",
    balanceUser: "余额扣费",
    showing: "显示",
    prev: "上一页",
    next: "下一页",
    filterModel: "按模型筛选",
    filterStatus: "状态",
    all: "全部",
    dateFrom: "开始日期",
    dateTo: "结束日期",
    clearFilters: "清除筛选",
    exportCSV: "导出 CSV",
    filterBtn: "筛选",
    apiKey: "API Key",
    allKeys: "所有 Key",
    trend: "趋势",
    byCost: "费用",
    byTokens: "Token",
    byCalls: "调用",
  },
  en: {
    title: "Call Logs",
    model: "Model",
    channel: "Channel",
    tokensIn: "Input(non-cached)Tokens",
    tokensOut: "Output Tokens",
    tokensInCache: "Input(cache hit)Tokens",
    tokens: "Total Tokens",
    cost: "Cost",
    latency: "Latency",
    status: "Status",
    success: "Success",
    failed: "Failed",
    multiplier: "Multiplier",
    details: "Details",
    noLogs: "No usage logs yet",
    time: "Time",
    totalCalls: "Total Calls",
    totalTokens: "Total Tokens",
    totalCost: "Total Cost",
    inputCost: "Input Cost",
    outputCost: "Output Cost",
    cacheReadCost: "Input(cache hit)Cost",
    costBreakdown: "Cost Breakdown",
    noChannel: "No channel",
    formula: "Formula",
    nonCachedTokens: "Non-cached Input",
    total: "Total",
    noRateData: "Model rate not found, using default rate",
    notes: "Notes",
    subUser: "Subscription",
    balanceUser: "Balance",
    showing: "Showing",
    prev: "Previous",
    next: "Next",
    filterModel: "Filter by model",
    filterStatus: "Status",
    all: "All",
    dateFrom: "From",
    dateTo: "To",
    clearFilters: "Clear filters",
    exportCSV: "Export CSV",
    filterBtn: "Filter",
    apiKey: "API Key",
    allKeys: "All Keys",
    trend: "Trend",
    byCost: "Cost",
    byTokens: "Tokens",
    byCalls: "Calls",
  },
};

export function formatRate(rate: number | null | undefined, symbol: string, exchangeRate: number): string {
  if (rate == null || rate === 0) return "-";
  const value = symbol === "¥" ? rate * exchangeRate : rate;
  return `${symbol}${value.toFixed(4)}/1M tokens`;
}

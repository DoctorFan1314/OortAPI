"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fragment, useEffect, useState, useMemo } from "react";
import { Activity, Coins, DollarSign, X, Search, Download, Filter, BarChart3 } from "lucide-react";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface UsageLog {
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

interface DailyTrend {
  date: string;
  calls: number;
  cost: number;
  tokens: number;
  tokens_in_noncached: number;
  tokens_in_cache: number;
  tokens_out: number;
}

interface UsageSummary {
  total_calls: number;
  total_tokens: number;
  total_cost: number;
  total_tokens_in_noncached: number;
  total_tokens_in_cache: number;
  total_tokens_out: number;
  total_credits_used?: number;
}

const LABELS = {
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

function formatRate(rate: number | null | undefined, symbol: string, exchangeRate: number): string {
  if (rate == null || rate === 0) return "-";
  const value = symbol === "¥" ? rate * exchangeRate : rate;
  return `${symbol}${value.toFixed(4)}/1M tokens`;
}

export default function UsagePage() {
  const { lang } = useI18n();
  const { currency, exchangeRate, formatPrice, symbol } = useCurrency();
  useEffect(() => { document.title = `${lang === "zh" ? "调用日志" : "Call Logs"} — OortAPI`; }, [lang]);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [summary, setSummary] = useState<UsageSummary>({ total_calls: 0, total_tokens: 0, total_cost: 0, total_tokens_in_noncached: 0, total_tokens_in_cache: 0, total_tokens_out: 0 });
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [isCreditsUser, setIsCreditsUser] = useState(false);
  const [chartMetric, setChartMetric] = useState<"cost" | "tokens" | "calls">("cost");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  // Input state (form fields) — does NOT trigger API calls
  const [inputModel, setInputModel] = useState("");
  const [inputStatus, setInputStatus] = useState("");
  const [inputFrom, setInputFrom] = useState("");
  const [inputTo, setInputTo] = useState("");
  const [inputKeyId, setInputKeyId] = useState("");
  // Applied filter state — triggers API calls only when "Filter" button is clicked
  const [filterModel, setFilterModel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterKeyId, setFilterKeyId] = useState("");
  // API keys for filter dropdown
  const [apiKeys, setApiKeys] = useState<{ id: number; name: string }[]>([]);
  const [sortKey, setSortKey] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const t = LABELS[lang];

  useEffect(() => {
    fetch("/api/dashboard/keys", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.keys) setApiKeys(d.keys); })
      .catch(() => {});
  }, []);

  const applyFilters = () => {
    setFilterModel(inputModel);
    setFilterStatus(inputStatus);
    setFilterFrom(inputFrom);
    setFilterTo(inputTo);
    setFilterKeyId(inputKeyId);
    setPage(1);
  };

  const clearFilters = () => {
    setInputModel("");
    setInputStatus("");
    setInputFrom("");
    setInputTo("");
    setInputKeyId("");
    setFilterModel("");
    setFilterStatus("");
    setFilterFrom("");
    setFilterTo("");
    setFilterKeyId("");
    setPage(1);
  };

  const hasActiveFilters = filterModel || filterStatus || filterFrom || filterTo || filterKeyId;

  const chartOption = useMemo(() => {
    if (dailyTrend.length === 0) return null;
    const dates = dailyTrend.map(d => d.date);
    const values = dailyTrend.map(d => {
      if (chartMetric === "cost") return +(d.cost * exchangeRate).toFixed(4);
      if (chartMetric === "tokens") return d.tokens;
      return d.calls;
    });
    const color = chartMetric === "cost" ? "#8b5cf6" : chartMetric === "tokens" ? "#22c55e" : "#3b82f6";
    const label = chartMetric === "cost" ? (currency === "CNY" ? "¥" : "$") : "";
    return {
      tooltip: {
        trigger: "axis" as const,
        formatter: (params: { axisValue: string; value: number; dataIndex: number }[]) => {
          const p = params[0];
          const day = chartMetric === "tokens" ? dailyTrend[p.dataIndex] : null;
          if (!day || chartMetric !== "tokens") {
            return `${p.axisValue}<br/>${label}${typeof p.value === "number" ? p.value.toLocaleString() : p.value}`;
          }
          let html = `<div style="font-size:12px;font-weight:600;white-space:nowrap">${day.date}</div>`;
          if (day.tokens_in_noncached > 0) html += `<div style="font-size:11px;white-space:nowrap"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#3b82f6;margin-right:4px"></span>${lang === "zh" ? "输入(未命中缓存)" : "Input(non-cached)"}: ${day.tokens_in_noncached.toLocaleString()}</div>`;
          if (day.tokens_in_cache > 0) html += `<div style="font-size:11px;white-space:nowrap"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#22c55e;margin-right:4px"></span>${lang === "zh" ? "输入(命中缓存)" : "Input(cache hit)"}: ${day.tokens_in_cache.toLocaleString()}</div>`;
          if (day.tokens_out > 0) html += `<div style="font-size:11px;white-space:nowrap"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#f97316;margin-right:4px"></span>${lang === "zh" ? "输出" : "Output"}: ${day.tokens_out.toLocaleString()}</div>`;
          return html;
        },
      },
      grid: { left: 60, right: 20, top: 10, bottom: 30 },
      xAxis: { type: "category" as const, data: dates, axisLabel: { fontSize: 11 } },
      yAxis: { type: "value" as const, axisLabel: { fontSize: 11, formatter: (v: number) => label + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v) } },
      series: [{ type: "bar" as const, data: values, itemStyle: { color, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 32 }],
    };
  }, [dailyTrend, chartMetric, exchangeRate, currency, lang]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const parts = [`limit=50&offset=${(page - 1) * 50}`];
    if (filterModel) parts.push(`model=${encodeURIComponent(filterModel)}`);
    if (filterStatus) parts.push(`status=${filterStatus}`);
    if (filterFrom) parts.push(`from=${filterFrom}`);
    if (filterTo) parts.push(`to=${filterTo}`);
    if (filterKeyId) parts.push(`key_id=${filterKeyId}`);
    const url = `/api/v1/billing/usage?${parts.join('&')}`;

    fetch(url, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then(d => {
        const data = d.data || [];
        setLogs(data);
        setTotal(d.total || 0);
        setSummary({
          total_calls: d.total_calls || 0,
          total_tokens: d.total_tokens || 0,
          total_cost: d.total_cost || 0,
          total_tokens_in_noncached: d.total_tokens_in_noncached || 0,
          total_tokens_in_cache: d.total_tokens_in_cache || 0,
          total_tokens_out: d.total_tokens_out || 0,
          total_credits_used: d.total_credits_used || 0,
        });
        setDailyTrend(d.daily_trend || []);
        setLoading(false);
      })
      .catch(() => {
        setError(lang === "zh" ? "加载数据失败" : "Failed to load data");
        setLogs([]);
        setLoading(false);
      });
  }, [page, filterModel, filterStatus, filterFrom, filterTo, filterKeyId]);

  // Check subscription status: no subscription → show cost, has subscription → show credits
  useEffect(() => {
    fetch("/api/dashboard/subscription", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const hasActive = d.subscriptions?.some((s: { status: string }) => s.status === 'active');
        if (hasActive) {
          setIsCreditsUser(true);
          setChartMetric("tokens");
        } else {
          setIsCreditsUser(false);
        }
      })
      .catch(() => {});
  }, []);

  const formatTokens = (n: number) => {
    return n.toLocaleString();
  };

  // Format cost with higher precision for line items
  const formatCostDisplay = (usd: number) => formatPrice(usd, 4);

  // Render detailed cost breakdown for a log entry
  const renderBreakdown = (log: UsageLog) => {
    const isCredits = log.deduction_source === 'credits';
    const inputRate = log.input_rate ?? 0.001;
    const outputRate = log.output_rate ?? 0.002;
    const cacheRate = log.cache_rate ?? 0;
    const creditRate = log.credit_rate ?? 1.0;
    const mult = log.multiplier ?? 1.0;
    const totalTokens = log.tokens_in + log.tokens_out;

    if (isCredits) {
      // Subscription user — show credits breakdown (cache hits at 50% discount)
      const CACHE_DISCOUNT = 0.5;
      const creditsUsed = Math.ceil(Math.max(0, log.tokens_in - log.tokens_in_cache + log.tokens_in_cache * CACHE_DISCOUNT + log.tokens_out) * creditRate);
      return (
        <div className="text-xs space-y-3 font-mono">
          <p className="font-semibold text-sm">{lang === "zh" ? "额度明细" : "Credits Breakdown"}</p>
          <div className="text-muted-foreground space-y-0.5">
            <p>{lang === "zh" ? "Credit 倍率" : "Credit Rate"}: 1 token = {creditRate} credits</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{lang === "zh" ? "输入(未命中缓存)Tokens" : "Input(non-cached)Tokens"}: {(log.tokens_in - log.tokens_in_cache).toLocaleString()} × {creditRate}</span>
              <span>= {((log.tokens_in - log.tokens_in_cache) * creditRate).toLocaleString()} credits</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{lang === "zh" ? "输入(命中缓存)Tokens" : "Input(cache hit)Tokens"}: {log.tokens_in_cache.toLocaleString()} × {creditRate} × {CACHE_DISCOUNT}</span>
              <span>= {(log.tokens_in_cache * creditRate * CACHE_DISCOUNT).toLocaleString()} credits</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{lang === "zh" ? "输出 Tokens" : "Output Tokens"}: {log.tokens_out.toLocaleString()} × {creditRate}</span>
              <span>= {(log.tokens_out * creditRate).toLocaleString()} credits</span>
            </div>
          </div>
          <div className="border-t border-border/30 pt-1">
            <div className="flex justify-between gap-4 font-semibold text-sm">
              <span>{lang === "zh" ? "总计消耗" : "Total Credits Used"}</span>
              <span className="text-amber-400">{creditsUsed.toLocaleString()} credits</span>
            </div>
            <p className="text-emerald-500 text-[11px] mt-1">{lang === "zh" ? "套餐用户，不扣余额" : "Subscription user — no balance charged"}</p>
          </div>
        </div>
      );
    }

    // Non-subscription user — show dollar breakdown
    const nonCachedIn = Math.max(0, log.tokens_in - log.tokens_in_cache);
    const inputCost = nonCachedIn * inputRate / 1000000;
    const cacheHitCost = log.tokens_in_cache * cacheRate / 1000000;
    const outputCost = log.tokens_out * outputRate / 1000000;
    const baseCost = inputCost + cacheHitCost + outputCost;
    const finalCost = baseCost * mult;
    const rateSource = log.input_rate != null ? "" : ` (${t.noRateData})`;

    return (
      <div className="text-xs space-y-3 font-mono">
        <p className="font-semibold text-sm">{t.costBreakdown}</p>
        <div className="text-muted-foreground space-y-0.5">
          <p>{lang === "zh" ? "模型费率" : "Model Rates"}{rateSource}:</p>
          <p className="pl-3">{lang === "zh" ? "输入(未命中缓存)" : "Input(non-cached)"} = {formatRate(inputRate, symbol, exchangeRate)}</p>
          <p className="pl-3">{lang === "zh" ? "输入(命中缓存)" : "Input(cache hit)"} = {formatRate(cacheRate, symbol, exchangeRate)}</p>
          <p className="pl-3">{lang === "zh" ? "输出" : "Output"} = {formatRate(outputRate, symbol, exchangeRate)}</p>
        </div>
        <div className="space-y-1">
          {nonCachedIn > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.inputCost}: {nonCachedIn.toLocaleString()} × {(symbol === "¥" ? inputRate * exchangeRate : inputRate).toFixed(4)} / 1M</span>
              <span>= {formatCostDisplay(inputCost)}</span>
            </div>
          )}
          {log.tokens_in_cache > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.cacheReadCost}: {log.tokens_in_cache.toLocaleString()} × {(symbol === "¥" ? cacheRate * exchangeRate : cacheRate).toFixed(4)} / 1M</span>
              <span>= {formatCostDisplay(cacheHitCost)}</span>
            </div>
          )}
          {log.tokens_out > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t.outputCost}: {log.tokens_out.toLocaleString()} × {(symbol === "¥" ? outputRate * exchangeRate : outputRate).toFixed(4)} / 1M</span>
              <span>= {formatCostDisplay(outputCost)}</span>
            </div>
          )}
        </div>
        <div className="border-t border-border/30 pt-1 space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{lang === "zh" ? "小计 (base cost)" : "Subtotal (base cost)"}</span>
            <span>= {formatCostDisplay(baseCost)}</span>
          </div>
          {mult !== 1.0 && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">× {lang === "zh" ? "倍率" : "Multiplier"}: {mult.toFixed(2)}x</span>
              <span></span>
            </div>
          )}
          <div className="flex justify-between gap-4 font-semibold text-sm">
            <span>{t.total}</span>
            <span>= {formatCostDisplay(finalCost)}</span>
          </div>
        </div>
      </div>
    );
  };

  const sortedLogs = [...logs].sort((a, b) => {
    if (sortKey === 'total') {
      const aTotal = a.tokens_in + a.tokens_out;
      const bTotal = b.tokens_in + b.tokens_out;
      return sortDir === 'asc' ? aTotal - bTotal : bTotal - aTotal;
    }
    if (sortKey === 'created_at') {
      const aDate = new Date(a.created_at + 'Z').getTime();
      const bDate = new Date(b.created_at + 'Z').getTime();
      return sortDir === 'asc' ? aDate - bDate : bDate - aDate;
    }
    const aVal = a[sortKey as keyof UsageLog];
    const bVal = b[sortKey as keyof UsageLog];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.title}</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t.totalCalls}</p>
              <p className="text-xl font-bold font-mono">{summary.total_calls.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-md bg-green-500/10">
                <Coins className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-xs text-muted-foreground">{t.totalTokens}</span>
            </div>
            <p className="text-xl font-bold font-mono mb-1">{formatTokens(summary.total_tokens)}</p>
            <div className="space-y-0.5 text-[11px] text-muted-foreground border-t border-border/20 pt-1.5">
              {summary.total_tokens_in_noncached > 0 && (
                <div className="flex justify-between"><span><span className="text-blue-400">■</span> {lang === "zh" ? "输入(未命中缓存)" : "Input(non-cached)"}</span><span className="font-mono">{formatTokens(summary.total_tokens_in_noncached)}</span></div>
              )}
              {summary.total_tokens_in_cache > 0 && (
                <div className="flex justify-between"><span><span className="text-emerald-400">■</span> {lang === "zh" ? "输入(命中缓存)" : "Input(cache hit)"}</span><span className="font-mono">{formatTokens(summary.total_tokens_in_cache)}</span></div>
              )}
              {summary.total_tokens_out > 0 && (
                <div className="flex justify-between"><span><span className="text-orange-400">■</span> {lang === "zh" ? "输出" : "Output"}</span><span className="font-mono">{formatTokens(summary.total_tokens_out)}</span></div>
              )}
            </div>
          </CardContent>
        </Card>
        {isCreditsUser && summary.total_credits_used ? (
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-500/10">
                <Coins className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "zh" ? "已消耗额度" : "Credits Used"}</p>
                <p className="text-xl font-bold font-mono">{summary.total_credits_used.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-red-500/10">
                <DollarSign className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.totalCost}</p>
                <p className="text-xl font-bold font-mono">{formatPrice(summary.total_cost)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trend chart */}
      {chartOption && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />{t.trend}
              </CardTitle>
              <div className="flex gap-1">
                {(["cost", "tokens", "calls"] as const)
                  .filter(m => !isCreditsUser || m !== "cost")
                  .map(m => (
                    <button key={m} onClick={() => setChartMetric(m)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${chartMetric === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      {m === "cost" ? t.byCost : m === "tokens" ? t.byTokens : t.byCalls}
                    </button>
                  ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ReactECharts option={chartOption} style={{ height: 220 }} opts={{ renderer: "svg" }} />
          </CardContent>
        </Card>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 p-3 bg-muted/30 rounded-lg">
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs text-muted-foreground block mb-1">{t.filterModel}</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <input value={inputModel} onChange={e => setInputModel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') applyFilters(); }}
              placeholder="gpt-4o" className="w-full pl-8 pr-3 py-1.5 bg-background rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
          </div>
        </div>
        <div className="w-32">
          <label className="text-xs text-muted-foreground block mb-1">{t.filterStatus}</label>
          <select value={inputStatus} onChange={e => setInputStatus(e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none">
            <option value="">{t.all}</option>
            <option value="success">{t.success}</option>
            <option value="failed">{t.failed}</option>
          </select>
        </div>
        <div className="w-40">
          <label className="text-xs text-muted-foreground block mb-1">{t.apiKey}</label>
          <select value={inputKeyId} onChange={e => setInputKeyId(e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none">
            <option value="">{t.allKeys}</option>
            {apiKeys.map(k => (
              <option key={k.id} value={k.id}>{k.name || `Key #${k.id}`}</option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <label className="text-xs text-muted-foreground block mb-1">{t.dateFrom}</label>
          <input type="date" value={inputFrom} onChange={e => setInputFrom(e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="w-36">
          <label className="text-xs text-muted-foreground block mb-1">{t.dateTo}</label>
          <input type="date" value={inputTo} onChange={e => setInputTo(e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none" />
        </div>
        <button onClick={applyFilters}
          className="h-8 px-4 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" />{t.filterBtn}
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground border border-border/50 rounded-md hover:bg-muted transition-colors">
            {t.clearFilters}
          </button>
        )}
        <button onClick={() => {
          const params = [
            'format=csv',
            filterModel ? `model=${encodeURIComponent(filterModel)}` : '',
            filterStatus ? `status=${filterStatus}` : '',
            filterFrom ? `from=${filterFrom}` : '',
            filterTo ? `to=${filterTo}` : '',
            filterKeyId ? `key_id=${filterKeyId}` : '',
          ].filter(Boolean).join('&');
          window.open(`/api/v1/billing/usage?${params}`, '_blank');
        }}
          className="h-8 px-3 text-xs border border-border/50 rounded-md hover:bg-muted transition-colors flex items-center gap-1.5 ml-auto">
          <Download className="h-3.5 w-3.5" />{t.exportCSV}
        </button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <button onClick={applyFilters} className="text-xs text-primary hover:underline">{lang === "zh" ? "重试" : "Retry"}</button>
            </div>
          ) : loading && logs.length === 0 ? (
            <div className="animate-pulse space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-4 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-4 bg-muted rounded w-12" />
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-4 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-4 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-12" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{hasActiveFilters ? (lang === "zh" ? "无匹配记录，请调整筛选条件" : "No matching records. Adjust your filters.") : t.noLogs}</div>
          ) : (
            <>{loading && logs.length > 0 && <div className="h-1 bg-primary/20 rounded-full overflow-hidden mb-2"><div className="h-full bg-primary animate-pulse rounded-full" style={{width: '30%'}} /></div>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium sticky left-0 bg-background z-10">{t.channel}</th>
                    <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">{t.model}</th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => { setSortKey('tokens_in'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                      {t.tokensIn}{sortKey === 'tokens_in' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => { setSortKey('tokens_in_cache'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                      {t.tokensInCache}{sortKey === 'tokens_in_cache' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => { setSortKey('tokens_out'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                      {t.tokensOut}{sortKey === 'tokens_out' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => { setSortKey('total'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                      {t.tokens}{sortKey === 'total' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </th>
                    <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">{t.multiplier}</th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => { setSortKey('cost'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                      {t.cost}{sortKey === 'cost' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </th>
                    <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">{t.details}</th>
                    <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">{t.notes}</th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => { setSortKey('latency_ms'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                      {t.latency}{sortKey === 'latency_ms' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </th>
                    <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">{t.status}</th>
                    <th scope="col" className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => { setSortKey('created_at'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                      {t.time}{sortKey === 'created_at' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.map((log) => (
                    <Fragment key={log.id}>
                    <tr className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-2 px-3 text-xs text-muted-foreground sticky left-0 bg-card z-10">{log.channel_name || t.noChannel}</td>
                      <td className="py-2 px-3 font-mono text-xs">{log.model}</td>
                      <td className="py-2 px-3 text-right font-mono">{Math.max(0, log.tokens_in - log.tokens_in_cache).toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono">{log.tokens_in_cache > 0 ? log.tokens_in_cache.toLocaleString() : "0"}</td>
                      <td className="py-2 px-3 text-right font-mono">{log.tokens_out.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-mono">{(log.tokens_in + log.tokens_out).toLocaleString()}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-mono">
                          {(log.multiplier ?? 1.0).toFixed(2)}x
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {log.deduction_source === 'credits' ? (
                          <span className="text-emerald-500">$0.00</span>
                        ) : (
                          formatCostDisplay(log.cost)
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          {t.details}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {log.deduction_source === 'credits' ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{t.subUser}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{t.balanceUser}</span>
                        )}
                      </td>
                      <td className={`py-2 px-3 text-right font-mono ${log.latency_ms ? (log.latency_ms < 1000 ? "text-green-500" : log.latency_ms < 5000 ? "text-yellow-500" : "text-red-500") : ""}`}>{log.latency_ms ? `${log.latency_ms}ms` : "-"}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${log.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                          {log.success ? t.success : t.failed}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-xs text-muted-foreground">{new Date(log.created_at + "Z").toLocaleString()}</td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="border-b border-border/20 bg-muted/20">
                        <td colSpan={13} className="px-6 py-4">
                          <div className="flex justify-end mb-2">
                            <button onClick={() => setExpandedId(null)}
                              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                              aria-label={lang === "zh" ? "关闭" : "Close"}>
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          {renderBreakdown(log)}
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            </>)}
          {/* Pagination */}
          {(page > 1 || total > 50) && (
            <div className="flex items-center justify-between pt-3 border-t border-border/20">
              <span className="text-xs text-muted-foreground">
                {t.showing} {logs.length} / {total}
              </span>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <button onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80">
                    {t.prev}
                  </button>
                )}
                {page * 50 < total && (
                  <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80">
                    {t.next}
                  </button>
                )}
                <span className="text-xs text-muted-foreground mx-1">|</span>
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  {lang === "zh" ? "跳转" : "Go to"}
                  <input type="number" min={1} max={Math.ceil(total / 50) || 1}
                    onKeyDown={e => { if (e.key === 'Enter') { const max = Math.ceil(total / 50) || 1; const v = Math.min(Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1), max); setPage(v); } }}
                    className="w-12 h-7 px-1 rounded border border-border/50 bg-background text-xs text-center focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

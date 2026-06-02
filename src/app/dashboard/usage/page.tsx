"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { useToast } from "@/contexts/toast-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Activity, Coins, DollarSign, BarChart3, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { UsageLog, DailyTrend, UsageSummary } from "./usage-types";
import { FilterBar } from "./filter-bar";
import { LogTable } from "./log-table";
import { TrendChart } from "./trend-chart";
import { ChartErrorBoundary } from "@/components/shared/chart-error-boundary";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function UsagePage() {
  const { lang, t } = useI18n();
  const L = t.dashboard;
  const { formatPrice } = useCurrency();
  useEffect(() => { document.title = `${lang === "zh" ? "调用日志" : "Call Logs"} — OortAPI`; }, [lang]);

  // Data state
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [summary, setSummary] = useState<UsageSummary>({ total_calls: 0, total_tokens: 0, total_cost: 0, total_tokens_in_noncached: 0, total_tokens_in_cache: 0, total_tokens_out: 0 });
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [modelStats, setModelStats] = useState<Array<{ model: string; cost: number; credits_used: number; tokens_in: number; tokens_out: number; tokens_in_cache: number }>>([]);
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
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultFrom = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [inputFrom, setInputFrom] = useState(defaultFrom);
  const [inputTo, setInputTo] = useState(todayStr);
  const [inputKeyId, setInputKeyId] = useState("");

  // Applied filter state — triggers API calls only when "Filter" button is clicked
  const [filterModel, setFilterModel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState(defaultFrom);
  const [filterApplied, setFilterApplied] = useState(false);
  const [filterTo, setFilterTo] = useState(todayStr);
  const [filterKeyId, setFilterKeyId] = useState("");

  // API keys & models for filter dropdowns
  const [apiKeys, setApiKeys] = useState<{ id: number; name: string }[]>([]);
  const [filterModels, setFilterModels] = useState<string[]>([]);

  // Sort state
  const [sortKey, setSortKey] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Fetch API keys and models
  useEffect(() => {
    fetch("/api/dashboard/keys", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.keys) setApiKeys(d.keys); })
      .catch((e) => console.warn("Failed to load keys:", e));
    fetch("/api/v1/models")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setFilterModels(d.data.map((m: { id: string }) => m.id).sort()); })
      .catch((e) => console.warn("Failed to load models:", e));
  }, []);

  const { toast: showToast } = useToast();

  // Filter handlers
  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case "model": setInputModel(value); break;
      case "status": setInputStatus(value); break;
      case "from": setInputFrom(value); break;
      case "to": setInputTo(value); break;
      case "keyId": setInputKeyId(value); break;
    }
  };

  const applyFilters = () => {
    if (inputFrom && inputTo && inputFrom > inputTo) {
      showToast(lang === "zh" ? "开始日期不能晚于结束日期" : "Start date cannot be after end date", "error");
      return;
    }
    setFilterModel(inputModel);
    setFilterStatus(inputStatus);
    setFilterFrom(inputFrom);
    setFilterTo(inputTo);
    setFilterKeyId(inputKeyId);
    setPage(1);
    setFilterApplied(true);
  };

  const clearFilters = () => {
    setInputModel("");
    setInputStatus("");
    setInputFrom(defaultFrom);
    setInputTo(todayStr);
    setInputKeyId("");
    setFilterModel("");
    setFilterStatus("");
    setFilterFrom(defaultFrom);
    setFilterTo(todayStr);
    setFilterKeyId("");
    setPage(1);
    setFilterApplied(false);
  };

  const hasActiveFilters = filterApplied;

  // Sort handler
  const handleSort = (field: string) => {
    if (sortKey === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(field);
      setSortDir("asc");
    }
  };

  // Toggle expand handler
  const handleToggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // Fetch usage data
  useEffect(() => {
    setLoading(true);
    setError(null);
    const tzOffset = -new Date().getTimezoneOffset(); // e.g., -480 for UTC+8
    const parts = [`limit=50&offset=${(page - 1) * 50}&tz=${tzOffset}`];
    if (filterModel) parts.push(`model=${encodeURIComponent(filterModel)}`);
    if (filterStatus) parts.push(`status=${filterStatus}`);
    if (filterFrom) parts.push(`from=${filterFrom}`);
    if (filterTo) parts.push(`to=${filterTo}`);
    if (filterKeyId) parts.push(`key_id=${filterKeyId}`);
    const url = `/api/v1/billing/usage?${parts.join("&")}`;

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
        const trend = d.daily_trend || [];
        setDailyTrend([...trend].reverse());
        setModelStats(d.model_stats || []);
        setLoading(false);
      })
      .catch(() => {
        setError(lang === "zh" ? "加载数据失败" : "Failed to load data");
        setLogs([]);
        setLoading(false);
      });
  }, [page, filterModel, filterStatus, filterFrom, filterTo, filterKeyId]);

  // Detect credit user from usage data (more reliable than subscription check)
  useEffect(() => {
    if (logs.length > 0) {
      const hasCredits = logs.some((l: UsageLog & { deduction_source?: string }) => l.deduction_source === "credits");
      if (hasCredits) {
        setIsCreditsUser(true);
        setChartMetric("tokens");
      }
    }
  }, [logs]);

  const formatTokens = (n: number) => n.toLocaleString();

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">{L.title}</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{L.totalCalls}</p>
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
              <span className="text-xs text-muted-foreground">{L.totalTokens}</span>
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
        {isCreditsUser ? (
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-500/10">
                <Coins className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "zh" ? "已消耗额度" : "Credits Used"}</p>
                <p className="text-xl font-bold font-mono">{(summary.total_credits_used || 0).toLocaleString()}</p>
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
                <p className="text-xs text-muted-foreground">{L.totalCost}</p>
                <p className="text-xl font-bold font-mono">{formatPrice(summary.total_cost)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Date range warning */}
      {filterFrom && filterTo && ((new Date(filterTo).getTime() - new Date(filterFrom).getTime()) / 86400000) > 60 && (
        <div className="text-xs text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {lang === "zh" ? "数据范围超过 60 天，趋势仅显示最近 60 天的数据" : "Range exceeds 60 days. Trend shows the last 60 days only."}
        </div>
      )}

      {/* Trend chart */}
      <TrendChart
        trendData={dailyTrend}
        metric={chartMetric}
        onMetricChange={(m) => setChartMetric(m)}
        isCreditsUser={isCreditsUser}
      />

      {/* Cost & Tokens by model charts */}
      {modelStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />{isCreditsUser
                  ? (lang === "zh" ? "额度按模型分布" : "Credits by Model")
                  : (lang === "zh" ? "费用按模型分布" : "Cost by Model")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartErrorBoundary>
                <ReactECharts option={(() => {
                  const warmColors = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#ec4899", "#d946ef", "#a855f7", "#8b5cf6", "#f43f5e", "#fb923c", "#facc15"];
                  const items = modelStats.map(m => ({ name: m.model, value: isCreditsUser ? m.credits_used : m.cost })).filter(x => x.value > 0);
                  items.sort((a, b) => b.value - a.value);
                  const top = items.slice(0, 10);
                  const other = items.slice(10).reduce((s, x) => s + x.value, 0);
                  const data = top.map(({ name, value }, i) => ({ name, value, itemStyle: { color: warmColors[i % warmColors.length] } }));
                  if (other > 0) data.push({ name: lang === "zh" ? "其他" : "Other", value: other, itemStyle: { color: "#94a3b8" } });
                  return {
                    color: warmColors,
                    legend: { type: "scroll", bottom: 0, textStyle: { fontSize: 10 }, pageTextStyle: { fontSize: 9 } },
                    tooltip: {
                      trigger: "item", formatter: (p: { name: string; value: number }) => {
                        const val = isCreditsUser ? `${p.value.toLocaleString()} credits` : formatPrice(p.value);
                        return `${p.name}: ${val}`;
                      }
                    },
                    series: [{ type: "pie", radius: ["28%", "55%"], center: ["50%", "45%"], data, label: { show: false }, emphasis: { label: { show: true, fontSize: 10 } }, itemStyle: { borderRadius: 4 } }],
                  };
                })()} style={{ width: "100%" }} className="min-h-[220px] md:min-h-[280px]" opts={{ renderer: "svg" }} />
              </ChartErrorBoundary>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />{lang === "zh" ? "Token 按模型分布" : "Tokens by Model"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartErrorBoundary>
                <ReactECharts option={(() => {
                  const coolColors = ["#3b82f6", "#06b6d4", "#22c55e", "#10b981", "#14b8a6", "#0ea5e9", "#6366f1", "#2dd4bf", "#34d399", "#60a5fa", "#67e8f9"];
                  const items = modelStats.map(m => ({
                    name: m.model,
                    total: m.tokens_in + m.tokens_out,
                    noncached: m.tokens_in - m.tokens_in_cache,
                    cache_hit: m.tokens_in_cache,
                    output: m.tokens_out,
                  })).filter(x => x.total > 0);
                  items.sort((a, b) => b.total - a.total);
                  const top = items.slice(0, 10);
                  const otherTotal = items.slice(10).reduce((s, x) => s + x.total, 0);
                  const data = top.map(({ name, total }, i) => ({ name, value: total, itemStyle: { color: coolColors[i % coolColors.length] } }));
                  if (otherTotal > 0) data.push({ name: lang === "zh" ? "其他" : "Other", value: otherTotal, itemStyle: { color: "#94a3b8" } });
                  const detailMap = Object.fromEntries(top.map(x => [x.name, x]));
                  return {
                    color: coolColors,
                    legend: { type: "scroll", bottom: 0, textStyle: { fontSize: 10 }, pageTextStyle: { fontSize: 9 } },
                    tooltip: {
                      trigger: "item", formatter: (p: { name: string; value: number; percent?: number }) => {
                        const d = detailMap[p.name];
                        if (d) {
                          return `${p.name}<br/>  ${p.value.toLocaleString()} tokens<br/>  ■ ${lang === "zh" ? "输入(未命中缓存)" : "Input(non-cached)"}: ${d.noncached.toLocaleString()}<br/>  ■ ${lang === "zh" ? "输入(命中缓存)" : "Input(cache hit)"}: ${d.cache_hit.toLocaleString()}<br/>  ■ ${lang === "zh" ? "输出" : "Output"}: ${d.output.toLocaleString()}`;
                        }
                        return `${p.name}: ${p.value.toLocaleString()} tokens`;
                      }
                    },
                    series: [{ type: "pie", radius: ["28%", "55%"], center: ["50%", "45%"], data, label: { show: false }, emphasis: { label: { show: true, fontSize: 10 } }, itemStyle: { borderRadius: 4 } }],
                  };
                })()} style={{ width: "100%" }} className="min-h-[220px] md:min-h-[280px]" opts={{ renderer: "svg" }} />
              </ChartErrorBoundary>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter bar */}
      <FilterBar
        models={filterModels}
        keys={apiKeys}
        inputModel={inputModel}
        inputStatus={inputStatus}
        inputKeyId={inputKeyId}
        inputFrom={inputFrom}
        inputTo={inputTo}
        onInputChange={handleInputChange}
        onApply={applyFilters}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
        lang={lang}
        filterModel={filterModel}
        filterStatus={filterStatus}
        filterFrom={filterFrom}
        filterTo={filterTo}
        filterKeyId={filterKeyId}
      />

      {/* Log table */}
      <LogTable
        logs={logs}
        total={total}
        page={page}
        sortField={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        expandedId={expandedId}
        onToggleExpand={handleToggleExpand}
        onPageChange={setPage}
        loading={loading}
        error={error}
        hasActiveFilters={hasActiveFilters}
        onRetry={applyFilters}
      />
    </div>
  );
}

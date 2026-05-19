"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { BarChart3, TrendingUp, PieChart as PieIcon } from "lucide-react";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface ModelByDay {
  date: string;
  model: string;
  calls: number;
  cost: number;
  tokens: number;
  tokens_in_noncached: number;
  tokens_in_cache: number;
  tokens_cache_creation: number;
  tokens_out: number;
}

interface ModelByHour {
  hour: string;
  model: string;
  calls: number;
  cost: number;
  tokens: number;
  tokens_in_noncached: number;
  tokens_in_cache: number;
  tokens_cache_creation: number;
  tokens_out: number;
}

interface ModelDistribution {
  model: string;
  calls: number;
  cost: number;
  tokens: number;
}

interface DailyTrend {
  date: string;
  calls: number;
  cost: number;
  tokens: number;
  avg_latency: number | null;
}

interface AnalyticsData {
  model_by_day: ModelByDay[];
  model_by_hour: ModelByHour[];
  model_distribution: ModelDistribution[];
  daily_trend: DailyTrend[];
  rpm: number;
  tpm: number;
  total: { calls: number; cost: number; tokens: number; tokens_in_noncached: number; tokens_in_cache: number; tokens_cache_creation: number; tokens_out: number };
  cache?: { cache_hit_rate: number; total_cache_hits: number; total_non_cached: number };
  prev_period?: { calls: number; cost: number; tokens: number } | null;
  model_stats?: Array<{ model: string; avg_latency: number | null; error_rate: number }>;
}

const LABELS = {
  zh: {
    modelConsumption: "资源使用",
    callTrend: "调用趋势",
    callDistribution: "调用分布",
    byDay: "按天",
    byHour: "按小时",
    calls: "调用次数",
    cost: "花费",
    noData: "暂无数据",
    yAxisUnit: "tokens",
  },
  en: {
    modelConsumption: "Resource Usage",
    callTrend: "Call Trend",
    callDistribution: "Call Distribution",
    byDay: "Daily",
    byHour: "Hourly",
    calls: "Calls",
    cost: "Cost",
    noData: "No data yet",
    yAxisUnit: "tokens",
  },
};

const MODEL_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7",
  "#e11d48", "#0ea5e9", "#84cc16", "#eab308", "#6366f1",
];

/** Generate last N date strings (YYYY-MM-DD) ending with today */
function generateDateSlots(days: number): string[] {
  const slots: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    slots.push(d.toISOString().slice(0, 10));
  }
  return slots;
}

/** Generate 24 hour slots (HH:00) */
function generateHourSlots(): string[] {
  return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0") + ":00");
}

export function ModelAnalytics() {
  const { lang } = useI18n();
  const { formatPrice, exchangeRate, symbol } = useCurrency();
  const t = LABELS[lang];

  const [range, setRange] = useState<7 | 14 | 30>(7);
  const [timeMode, setTimeMode] = useState<"day" | "hour">("day");

  const groupBy = timeMode === "hour" ? "hour" : "day";
  const r = timeMode === "hour" ? "7d" : `${range}d`;
  const { data, isLoading } = useSWR<AnalyticsData>(
    `/api/dashboard/analytics?range=${r}&group_by=${groupBy}`,
    dashboardSWRConfig,
  );

  // Unique model list
  const models = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.model_by_day.forEach(d => set.add(d.model));
    data.model_by_hour.forEach(d => set.add(d.model));
    data.model_distribution.forEach(d => set.add(d.model));
    return Array.from(set);
  }, [data]);

  // Stable color map per model
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    models.forEach((m, i) => { map[m] = MODEL_COLORS[i % MODEL_COLORS.length]; });
    return map;
  }, [models]);

  // Build complete slots (always show full range, fill 0 for missing data)
  // Returns both tokens (for bar chart) and calls (for trend line)
  const timeSource = useMemo(() => {
    if (timeMode === "hour") {
      const slots = generateHourSlots();
      const source = data?.model_by_hour || [];
      const byModelTokens: Record<string, Record<string, number>> = {};
      const byModelCalls: Record<string, Record<string, number>> = {};
      const byModelBreakdown: Record<string, Record<string, { inNoncached: number; inCache: number; cacheCreate: number; out: number }>> = {};
      source.forEach(d => {
        if (!byModelTokens[d.model]) byModelTokens[d.model] = {};
        if (!byModelCalls[d.model]) byModelCalls[d.model] = {};
        if (!byModelBreakdown[d.model]) byModelBreakdown[d.model] = {};
        byModelTokens[d.model][d.hour] = d.tokens;
        byModelCalls[d.model][d.hour] = d.calls;
        byModelBreakdown[d.model][d.hour] = { inNoncached: d.tokens_in_noncached || 0, inCache: d.tokens_in_cache || 0, cacheCreate: d.tokens_cache_creation || 0, out: d.tokens_out || 0 };
      });
      return { slots, byModelTokens, byModelCalls, byModelBreakdown };
    }
    const slots = generateDateSlots(range);
    const source = data?.model_by_day || [];
    const byModelTokens: Record<string, Record<string, number>> = {};
    const byModelCalls: Record<string, Record<string, number>> = {};
    const byModelBreakdown: Record<string, Record<string, { inNoncached: number; inCache: number; cacheCreate: number; out: number }>> = {};
    source.forEach(d => {
      if (!byModelTokens[d.model]) byModelTokens[d.model] = {};
      if (!byModelCalls[d.model]) byModelCalls[d.model] = {};
      if (!byModelBreakdown[d.model]) byModelBreakdown[d.model] = {};
      byModelTokens[d.model][d.date] = d.tokens;
      byModelCalls[d.model][d.date] = d.calls;
      byModelBreakdown[d.model][d.date] = { inNoncached: d.tokens_in_noncached || 0, inCache: d.tokens_in_cache || 0, cacheCreate: d.tokens_cache_creation || 0, out: d.tokens_out || 0 };
    });
    return { slots, byModelTokens, byModelCalls, byModelBreakdown };
  }, [data, timeMode, range]);

  // Format x-axis labels
  const xLabels = useMemo(() => {
    if (timeMode === "hour") {
      return timeSource.slots.map(s => s.slice(0, 5)); // "00"
    }
    return timeSource.slots.map(s => s.slice(5)); // "01-15"
  }, [timeSource.slots, timeMode]);

  // ======== Stacked Bar Chart (Tokens) ========
  const stackedBarOption = useMemo(() => {
    const { slots, byModelTokens, byModelBreakdown } = timeSource;
    const series = models.map(model => ({
      name: model,
      type: "bar" as const,
      stack: "total",
      emphasis: { focus: "series" as const },
      itemStyle: { color: colorMap[model] },
      data: slots.map(slot => byModelTokens[model]?.[slot] || 0),
    }));
    const fmt = (n: number) => n.toLocaleString();
    return {
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        formatter: (params: { seriesName: string; dataIndex: number }[]) => {
          const slot = slots[params[0]?.dataIndex ?? 0];
          if (!slot) return "";
          let html = `<div style="font-size:12px;font-weight:600;margin-bottom:4px;white-space:nowrap">${slot}</div>`;
          for (const p of params) {
            const val = byModelTokens[p.seriesName]?.[slot] || 0;
            const color = (colorMap as Record<string, string>)[p.seriesName] || "#888";
            html += `<div style="font-size:12px;font-weight:500;margin-top:3px;white-space:nowrap"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color};margin-right:4px"></span> ${p.seriesName}: ${fmt(val)} tokens</div>`;
            const brk = byModelBreakdown[p.seriesName]?.[slot];
            if (brk) {
              if (brk.inNoncached > 0) html += `<div style="font-size:11px;padding-left:16px;color:#888;white-space:nowrap">${lang === "zh" ? "输入(未命中缓存)" : "Input(non-cached)"}: ${fmt(brk.inNoncached)}</div>`;
              if (brk.inCache > 0) html += `<div style="font-size:11px;padding-left:16px;color:#888;white-space:nowrap">${lang === "zh" ? "输入(命中缓存)" : "Input(cache hit)"}: ${fmt(brk.inCache)}</div>`;
              if (brk.out > 0) html += `<div style="font-size:11px;padding-left:16px;color:#888;white-space:nowrap">${lang === "zh" ? "输出" : "Output"}: ${fmt(brk.out)}</div>`;
            }
          }
          return html;
        },
        extraCssText: "max-width:800px;white-space:nowrap;overflow:visible",
      },
      legend: { type: "scroll" as const, bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 70, right: 20, top: 20, bottom: 60 },
      xAxis: { type: "category" as const, data: xLabels, axisLabel: { fontSize: 11 } },
      yAxis: {
        type: "value" as const,
        name: t.yAxisUnit || undefined,
        nameTextStyle: { fontSize: 11, color: "hsl(var(--muted-foreground))" },
        axisLabel: { fontSize: 11 },
      },
      series,
    };
  }, [timeSource, models, colorMap, xLabels, t.yAxisUnit, lang]);

  // ======== Trend Line Chart (Calls, per-model, same colors as bar) ========
  const trendOption = useMemo(() => {
    const { slots, byModelCalls } = timeSource;
    const series = models.map(model => ({
      name: model,
      type: "line" as const,
      smooth: true,
      showSymbol: false,
      itemStyle: { color: colorMap[model] },
      areaStyle: { color: colorMap[model] + "18" },
      data: slots.map(slot => byModelCalls[model]?.[slot] || 0),
    }));
    return {
      tooltip: { trigger: "axis" as const },
      legend: { type: "scroll" as const, bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 60, right: 20, top: 20, bottom: 60 },
      xAxis: { type: "category" as const, data: xLabels, axisLabel: { fontSize: 11 } },
      yAxis: {
        type: "value" as const,
        name: lang === "zh" ? "次" : "",
        nameTextStyle: { fontSize: 11, color: "hsl(var(--muted-foreground))" },
        axisLabel: { fontSize: 11 },
      },
      series,
    };
  }, [timeSource, models, colorMap, xLabels, lang]);
  const costOption = useMemo(() => {
    if (!data?.daily_trend?.length) return {};
    const dates = data.daily_trend.map(d => d.date);
    const costData = data.daily_trend.map(d => +(d.cost * exchangeRate).toFixed(4));
    const callsData = data.daily_trend.map(d => d.calls);
    return {
      tooltip: { trigger: "axis" as const },
      legend: { data: [lang === "zh" ? "费用" : "Cost", lang === "zh" ? "调用" : "Calls"], bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 60, right: 20, top: 10, bottom: 40 },
      xAxis: { type: "category" as const, data: dates, axisLabel: { fontSize: 11 } },
      yAxis: [
        { type: "value" as const, name: symbol, axisLabel: { fontSize: 11 } },
        { type: "value" as const, name: lang === "zh" ? "次数" : "Calls", axisLabel: { fontSize: 11 } },
      ],
      series: [
        { name: lang === "zh" ? "费用" : "Cost", type: "bar", data: costData, itemStyle: { color: "#8b5cf6", borderRadius: [4, 4, 0, 0] }, barMaxWidth: 24 },
        { name: lang === "zh" ? "调用" : "Calls", type: "line", yAxisIndex: 1, data: callsData, smooth: true, lineStyle: { color: "#22c55e", width: 2 }, itemStyle: { color: "#22c55e" } },
      ],
    };
  }, [data, exchangeRate, symbol, lang]);

  const pieOption = useMemo(() => {
    if (!data?.model_distribution?.length) return {};
    return {
      tooltip: {
        trigger: "item" as const,
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${p.name}: ${p.value} (${p.percent}%)`,
      },
      legend: {
        orient: "horizontal" as const,
        bottom: 0,
        left: "center",
        type: "scroll" as const,
        textStyle: { fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 12,
        pageTextStyle: { fontSize: 11 },
      },
      series: [{
        type: "pie",
        radius: ["35%", "65%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "hsl(var(--card))", borderWidth: 2 },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          fontSize: 10,
          lineHeight: 14,
        },
        labelLine: {
          show: true,
          length: 12,
          length2: 8,
          smooth: true,
        },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: "bold" },
        },
        data: data.model_distribution.map(d => ({
          name: d.model,
          value: d.calls,
          itemStyle: { color: colorMap[d.model] },
        })),
      }],
    };
  }, [data, colorMap]);

  if (isLoading && !data) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-6"><div className="h-64 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold">{t.modelConsumption}</h2>
        <div className="flex gap-2">
          {/* Range selector — only visible in day mode */}
          {timeMode === "day" && (
            <div className="flex bg-muted rounded-lg p-0.5">
              {([7, 14, 30] as const).map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    range === r
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          )}
          {/* Granularity selector */}
          <div className="flex bg-muted rounded-lg p-0.5">
            <button onClick={() => setTimeMode("day")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeMode === "day"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              {t.byDay}
            </button>
            <button onClick={() => setTimeMode("hour")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeMode === "hour"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              {t.byHour}
            </button>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {data?.total && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">{lang === "zh" ? "总调用" : "Total Calls"}</p>
                <p className="text-lg font-bold font-mono">{data.total.calls.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-xs text-muted-foreground">{lang === "zh" ? "总 Tokens" : "Total Tokens"}</p>
              </div>
              <p className="text-lg font-bold font-mono mb-1">{data.total.tokens.toLocaleString()}</p>
              <div className="text-[10px] space-y-0.5 text-muted-foreground border-t border-border/20 pt-1.5">
                {data.total.tokens_in_noncached > 0 && (
                  <div className="flex justify-between"><span><span className="text-blue-400">■</span> {lang === "zh" ? "输入(未命中缓存)" : "Input(non-cached)"}</span><span className="font-mono">{data.total.tokens_in_noncached.toLocaleString()}</span></div>
                )}
                {data.total.tokens_in_cache > 0 && (
                  <div className="flex justify-between"><span><span className="text-emerald-400">■</span> {lang === "zh" ? "输入(命中缓存)" : "Input(cache hit)"}</span><span className="font-mono">{data.total.tokens_in_cache.toLocaleString()}</span></div>
                )}
                {data.total.tokens_out > 0 && (
                  <div className="flex justify-between"><span><span className="text-orange-400">■</span> {lang === "zh" ? "输出" : "Output"}</span><span className="font-mono">{data.total.tokens_out.toLocaleString()}</span></div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">{t.cost}</p>
                <p className="text-lg font-bold font-mono">
                  {formatPrice(data.total.cost)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts grid: bar + pie */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />{t.modelConsumption}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={stackedBarOption} style={{ height: 360 }} opts={{ renderer: "canvas" }} notMerge />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="h-4 w-4" />{t.callDistribution}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.model_distribution?.length ? (
              <ReactECharts option={pieOption} style={{ height: 360 }} opts={{ renderer: "canvas" }} notMerge />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">{t.noData}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend line chart — same time filter, per-model colors */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />{t.callTrend}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={trendOption} style={{ height: 300 }} opts={{ renderer: "canvas" }} notMerge />
        </CardContent>
      </Card>

      {/* Cost chart + Cache rate */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />{lang === "zh" ? "消费趋势" : "Cost Trend"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={costOption} style={{ height: 300 }} opts={{ renderer: "canvas" }} notMerge />
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="h-4 w-4" />{lang === "zh" ? "缓存命中率" : "Cache Rate"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[300px]">
            {data?.cache ? (
              <div className="text-center">
                <div className="text-5xl font-bold font-mono text-emerald-400">{data.cache.cache_hit_rate}%</div>
                <p className="text-xs text-muted-foreground mt-2">{lang === "zh" ? "周期内缓存命中率" : "Period cache hit rate"}</p>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{lang === "zh" ? "命中" : "Hit"}: <span className="font-mono text-foreground">{data.cache.total_cache_hits.toLocaleString()}</span></span>
                  <span>{lang === "zh" ? "未命中" : "Miss"}: <span className="font-mono text-foreground">{data.cache.total_non_cached.toLocaleString()}</span></span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{lang === "zh" ? "暂无数据" : "No data"}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Model latency & error rate cards */}
      {data?.model_stats && data.model_stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />{lang === "zh" ? "模型延迟对比" : "Model Latency"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.model_stats.filter(m => m.avg_latency != null).slice(0, 8).map(m => (
                  <div key={m.model} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-muted-foreground truncate flex-1 max-w-[150px]">{m.model}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((m.avg_latency || 0) / 50, 100)}%` }} />
                    </div>
                    <span className="font-mono w-16 text-right">{Math.round(m.avg_latency || 0)}ms</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-red-500" />{lang === "zh" ? "模型错误率" : "Error Rate"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.model_stats.map(m => (
                  <div key={m.model} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-muted-foreground truncate flex-1 max-w-[150px]">{m.model}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.error_rate > 5 ? "bg-red-500" : m.error_rate > 1 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(m.error_rate * 5, 100)}%` }} />
                    </div>
                    <span className={`font-mono w-12 text-right ${m.error_rate > 5 ? "text-red-500" : m.error_rate > 1 ? "text-yellow-500" : "text-green-500"}`}>
                      {m.error_rate}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

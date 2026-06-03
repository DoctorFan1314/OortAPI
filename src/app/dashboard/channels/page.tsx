"use client";

import { useI18n } from "@/contexts/i18n-context";
import { ChannelCard } from "@/components/dashboard/channel-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity, CheckCircle, AlertTriangle, XCircle,
  GitBranch, Search, Server, RefreshCw, Layers, ArrowRight,
} from "lucide-react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { useMemo, useState } from "react";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { ChartErrorBoundary } from "@/components/shared/chart-error-boundary";
import ReactECharts from "@/components/shared/lazy-echarts";

/* ---------- types ---------- */

interface HealthSummary {
  channel_id: number; name: string; status: string; fail_count: number;
  last_fail_at: string | null; total_calls_24h: number;
  success_rate_24h: number | null; avg_latency_24h: number | null; total_cost_24h: number;
}

interface Channel {
  id: number; name: string; type: string; weight: number; enabled: number;
  models: string; status: string; priority: number; fail_count: number; last_fail_at: string | null;
}

interface ModelItem { id: string; owned_by: string; display_name: string; }

/* ---------- constants ---------- */

const PIE_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1",
  "#14b8a6", "#e11d48", "#a855f7", "#0ea5e9", "#d946ef",
];

const LABELS = {
  zh: {
    title: "渠道管理", subtitle: "管理上游 API 渠道、监控健康状态、查看路由分布",
    totalChannels: "渠道总数", online: "在线", offline: "离线",
    avgSuccessRate: "成功率", avgLatency: "延迟", totalCalls24h: "24h 调用",
    routingTitle: "路由分析", routingDesc: "调用分布与模型映射",
    pieTitle: "调用分布", mapTitle: "模型路由", mapDesc: "模型 → 渠道映射关系",
    searchModels: "搜索模型...", noModels: "暂无模型数据",
    model: "模型", provider: "提供商", channels: "渠道", routing: "路由",
    channelSettings: "渠道设置", channelSettingsDesc: "添加、编辑、删除上游渠道",
    lastUpdated: "刷新", refresh: "刷新",
    noChannels: "暂无渠道", noChannelsDesc: "添加第一个渠道开始使用",
    cost24h: "24h 费用",
  },
  en: {
    title: "Channel Management", subtitle: "Manage upstream API channels, monitor health, view routing distribution",
    totalChannels: "Total Channels", online: "Online", offline: "Offline",
    avgSuccessRate: "Success Rate", avgLatency: "Latency", totalCalls24h: "24h Calls",
    routingTitle: "Routing Analytics", routingDesc: "Distribution & model mapping",
    pieTitle: "Call Distribution", mapTitle: "Model Routing", mapDesc: "Model → Channel mapping",
    searchModels: "Search models...", noModels: "No model data",
    model: "Model", provider: "Provider", channels: "Channels", routing: "Routing",
    channelSettings: "Channel Settings", channelSettingsDesc: "Add, edit, and delete upstream channels",
    lastUpdated: "Refresh", refresh: "Refresh",
    noChannels: "No channels", noChannelsDesc: "Add your first channel to get started",
    cost24h: "24h Cost",
  },
};

/* ---------- model routing card ---------- */

function ModelRoutingCard({ modelRows, modelSearch, setModelSearch, mapExpanded, setMapExpanded, t, lang }: {
  modelRows: { modelId: string; provider: string; channels: { name: string; priority: number; weight: number; status: string }[]; channelCount: number }[];
  modelSearch: string; setModelSearch: (v: string) => void;
  mapExpanded: boolean; setMapExpanded: (v: boolean) => void;
  t: typeof LABELS.zh; lang: string;
}) {
  const visibleRows = mapExpanded ? modelRows : modelRows.slice(0, 12);
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4" /> {t.mapTitle}
            <Badge variant="secondary" className="text-[10px] font-mono">{modelRows.length}</Badge>
          </CardTitle>
          <div className="relative w-44">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input type="text" value={modelSearch} onChange={e => setModelSearch(e.target.value)}
              placeholder={t.searchModels}
              className="w-full h-7 pl-7 pr-2 rounded-md border border-input bg-background text-xs focus:border-primary focus:outline-none" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {modelRows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{t.noModels}</div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_5rem_2fr] gap-2 px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/20">
              <span>{t.model}</span><span className="text-center">{t.channels}</span><span>{t.routing}</span>
            </div>
            <div className="divide-y divide-border/10">
              {visibleRows.map((row) => (
                <div key={row.modelId} className="grid grid-cols-[1fr_5rem_2fr] gap-2 px-2 py-2 hover:bg-muted/30 items-center">
                  <div className="min-w-0">
                    <p className="text-xs font-mono truncate" title={row.modelId}>{row.modelId}</p>
                    <Badge variant="secondary" className="text-[9px] mt-0.5">{row.provider}</Badge>
                  </div>
                  <span className="text-center text-xs font-mono">{row.channelCount}</span>
                  <div className="flex flex-wrap gap-1">
                    {row.channels.map((ch) => (
                      <span key={ch.name} className={cn(
                        "inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border font-mono",
                        ch.status === "online"
                          ? "border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400"
                          : "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400",
                      )} title={`P${ch.priority} / W${ch.weight}`}>
                        {ch.name}
                        <span className="text-muted-foreground/60">P{ch.priority}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {modelRows.length > 12 && (
              <button onClick={() => setMapExpanded(!mapExpanded)}
                className="w-full mt-2 py-1.5 text-xs text-primary hover:underline flex items-center justify-center gap-1">
                {mapExpanded
                  ? (lang === "zh" ? "收起" : "Show less")
                  : (lang === "zh" ? `展开全部 ${modelRows.length} 个模型` : `Show all ${modelRows.length} models`)}
                <ArrowRight className={cn("h-3 w-3 transition-transform", mapExpanded && "rotate-90")} />
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------- page ---------- */

export default function ChannelsPage() {
  const { lang } = useI18n();
  const t = LABELS[lang];
  const { resolvedTheme } = useTheme();
  const [modelSearch, setModelSearch] = useState("");
  const [mapExpanded, setMapExpanded] = useState(false);

  /* fetch data */
  const { data: healthData, error: healthError, isLoading: healthLoading, mutate: refreshHealth } = useSWR<{ health: HealthSummary[] }>(
    "/api/dashboard/channels?action=health", dashboardSWRConfig,
  );
  const { data: channelsData } = useSWR<{ channels: Channel[] }>(
    "/api/dashboard/channels", dashboardSWRConfig,
  );
  const { data: modelsData } = useSWR<{ data: ModelItem[] }>(
    "/api/v1/models", dashboardSWRConfig,
  );

  /* merged channels */
  const mergedChannels = useMemo(() => {
    const channels = channelsData?.channels || [];
    const healthMap = new Map((healthData?.health || []).map(h => [h.channel_id, h]));
    return channels.map(ch => {
      const h = healthMap.get(ch.id);
      return {
        ...ch,
        modelsParsed: (() => { try { return JSON.parse(ch.models || "[]") as string[]; } catch { return []; } })(),
        total_calls_24h: h?.total_calls_24h ?? 0,
        success_rate_24h: h?.success_rate_24h ?? null,
        avg_latency_24h: h?.avg_latency_24h ?? null,
        total_cost_24h: h?.total_cost_24h ?? 0,
        live_status: h?.status ?? ch.status,
      };
    });
  }, [channelsData, healthData]);

  /* model mapping */
  const modelChannelMap = useMemo(() => {
    const map = new Map<string, { channels: { name: string; priority: number; weight: number; status: string }[]; provider: string }>();
    const models = modelsData?.data || [];
    const providerMap = new Map(models.map(m => [m.id, m.owned_by]));
    for (const ch of mergedChannels) {
      const parsed = ch.modelsParsed;
      const modelIds = parsed.length === 0 || parsed.includes("*") ? models.map(m => m.id) : parsed;
      for (const modelId of modelIds) {
        if (!map.has(modelId)) map.set(modelId, { channels: [], provider: providerMap.get(modelId) || ch.type });
        const entry = map.get(modelId)!;
        if (!entry.channels.some(c => c.name === ch.name)) {
          entry.channels.push({ name: ch.name, priority: ch.priority, weight: ch.weight, status: ch.live_status });
        }
      }
    }
    for (const entry of map.values()) entry.channels.sort((a, b) => b.priority - a.priority || b.weight - a.weight);
    return map;
  }, [mergedChannels, modelsData]);

  /* filtered model rows */
  const modelRows = useMemo(() => {
    let rows = [...modelChannelMap.entries()].map(([modelId, entry]) => ({
      modelId, provider: entry.provider, channels: entry.channels, channelCount: entry.channels.length,
    }));
    if (modelSearch.trim()) {
      const q = modelSearch.toLowerCase();
      rows = rows.filter(r => r.modelId.toLowerCase().includes(q) || r.provider.toLowerCase().includes(q));
    }
    return rows.sort((a, b) => b.channelCount - a.channelCount);
  }, [modelChannelMap, modelSearch]);

  const visibleModelRows = mapExpanded ? modelRows : modelRows.slice(0, 12);

  /* pie chart */
  const isDark = resolvedTheme === "dark";
  const pieOption = useMemo(() => {
    const health = healthData?.health || [];
    const withCalls = health.filter(h => h.total_calls_24h > 0);
    if (withCalls.length === 0) return null;
    return {
      tooltip: {
        trigger: "item" as const,
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${p.name}<br/>${lang === "zh" ? "调用" : "Calls"}: ${p.value.toLocaleString()} (${p.percent}%)`,
      },
      legend: { show: false },
      series: [{
        type: "pie" as const,
        radius: ["52%", "78%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: isDark ? "#09090b" : "#ffffff", borderWidth: 2 },
        label: { show: true, fontSize: 10, color: isDark ? "#a1a1aa" : "#71717a", formatter: "{b}\n{d}%" },
        labelLine: { length: 8, length2: 12 },
        emphasis: { label: { fontSize: 12, fontWeight: "bold" as const } },
        data: withCalls.map((h, i) => ({
          name: h.name, value: h.total_calls_24h,
          itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length] },
        })),
      }],
    };
  }, [healthData, isDark, lang]);

  /* stats */
  const health = healthData?.health || [];
  const totalChannels = health.length;
  const onlineCount = health.filter(h => h.status === "online").length;
  const offlineCount = totalChannels - onlineCount;
  const totalCalls = health.reduce((s, h) => s + h.total_calls_24h, 0);
  const totalCost = health.reduce((s, h) => s + h.total_cost_24h, 0);
  const ratesWithData = health.filter(h => h.success_rate_24h !== null);
  const avgRate = ratesWithData.length > 0 ? ratesWithData.reduce((s, h) => s + h.success_rate_24h!, 0) / ratesWithData.length : null;
  const latenciesWithData = health.filter(h => h.avg_latency_24h !== null);
  const avgLatency = latenciesWithData.length > 0 ? Math.round(latenciesWithData.reduce((s, h) => s + h.avg_latency_24h!, 0) / latenciesWithData.length) : null;

  const statCards = [
    { icon: <Server className="h-4 w-4" />, color: "text-blue-500", bg: "bg-blue-500/10", label: t.totalChannels, value: String(totalChannels), sub: `${onlineCount} ${t.online}` },
    { icon: <CheckCircle className="h-4 w-4" />, color: "text-green-500", bg: "bg-green-500/10", label: t.avgSuccessRate, value: avgRate !== null ? `${avgRate.toFixed(1)}%` : "—", warn: avgRate !== null && avgRate < 95 },
    { icon: <Activity className="h-4 w-4" />, color: "text-amber-500", bg: "bg-amber-500/10", label: t.avgLatency, value: avgLatency !== null ? `${avgLatency}ms` : "—", warn: avgLatency !== null && avgLatency > 1000 },
    { icon: <Activity className="h-4 w-4" />, color: "text-purple-500", bg: "bg-purple-500/10", label: t.totalCalls24h, value: totalCalls.toLocaleString() },
    { icon: <Layers className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10", label: t.cost24h, value: `$${totalCost.toFixed(2)}` },
    { icon: <GitBranch className="h-4 w-4" />, color: "text-sky-500", bg: "bg-sky-500/10", label: lang === "zh" ? "路由模型" : "Routed Models", value: String(modelChannelMap.size) },
  ];

  /* ─── render ─── */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6" /> {t.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refreshHealth()} className="gap-1.5 shrink-0" aria-label={t.refresh}>
          <RefreshCw className="h-3.5 w-3.5" /> {t.refresh}
        </Button>
      </div>

      {/* Stats */}
      {healthLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card animate-pulse"><CardContent className="p-3"><div className="h-12 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      ) : healthError ? (
        <Card className="glass-card border-destructive/30"><CardContent className="p-4 text-center">
          <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
          <p className="text-sm text-muted-foreground">{lang === "zh" ? "健康数据加载失败" : "Failed to load health data"}</p>
          <button onClick={() => refreshHealth()} className="text-xs text-primary hover:underline mt-1">{lang === "zh" ? "重试" : "Retry"}</button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {statCards.map((card) => (
            <Card key={card.label} className="glass-card">
              <CardContent className="p-3 flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${card.bg} shrink-0`}>
                  <span className={card.color}>{card.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground leading-tight truncate">{card.label}</p>
                  <p className={`text-base font-bold font-mono leading-tight ${card.warn ? "text-amber-500" : ""}`}>{card.value}</p>
                  {card.sub && <p className="text-[10px] text-muted-foreground/60">{card.sub}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Channel CRUD */}
      <ChannelCard lang={lang} />

      {/* Routing Analytics */}
      <div className="flex items-center gap-2 mt-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{t.routingTitle}</h2>
        <span className="text-xs text-muted-foreground/60">· {t.routingDesc}</span>
      </div>

      {/* Pie chart + model map: 2-col when pie has data, full-width when not */}
      {pieOption ? (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" /> {t.pieTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex items-center justify-center">
                <ChartErrorBoundary title={t.pieTitle}>
                  <ReactECharts option={pieOption} style={{ width: "100%" }} className="min-h-[250px] md:min-h-[300px]" opts={{ renderer: "svg" }} />
                </ChartErrorBoundary>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <ModelRoutingCard modelRows={modelRows} modelSearch={modelSearch} setModelSearch={setModelSearch} mapExpanded={mapExpanded} setMapExpanded={setMapExpanded} t={t} lang={lang} />
          </div>
        </div>
      ) : (
        <ModelRoutingCard modelRows={modelRows} modelSearch={modelSearch} setModelSearch={setModelSearch} mapExpanded={mapExpanded} setMapExpanded={setMapExpanded} t={t} lang={lang} />
      )}
    </div>
  );
}

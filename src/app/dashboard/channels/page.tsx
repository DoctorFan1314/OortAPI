"use client";

import { useI18n } from "@/contexts/i18n-context";
import { ChannelCard } from "@/components/dashboard/channel-card";
import { RoutingPieChart } from "@/components/dashboard/routing-pie-chart";
import { ModelChannelMap } from "@/components/dashboard/model-channel-map";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle, AlertTriangle, XCircle, GitBranch } from "lucide-react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { useMemo } from "react";

/* ---------- types ---------- */

interface HealthSummary {
  channel_id: number;
  name: string;
  status: string;
  fail_count: number;
  last_fail_at: string | null;
  total_calls_24h: number;
  success_rate_24h: number | null;
  avg_latency_24h: number | null;
  total_cost_24h: number;
}

interface Channel {
  id: number;
  name: string;
  type: string;
  weight: number;
  enabled: number;
  models: string;
  status: string;
  priority: number;
  fail_count: number;
  last_fail_at: string | null;
}

interface ModelItem {
  id: string;
  owned_by: string;
  display_name: string;
}

const LABELS = {
  zh: {
    title: "渠道管理",
    totalChannels: "渠道总数",
    online: "在线",
    offline: "离线",
    avgSuccessRate: "平均成功率",
    avgLatency: "平均延迟",
    totalCalls24h: "24h 调用",
    routingTitle: "路由分析",
    routingDesc: "渠道路由分布与模型映射关系",
  },
  en: {
    title: "Channel Management",
    totalChannels: "Total Channels",
    online: "Online",
    offline: "Offline",
    avgSuccessRate: "Avg Success Rate",
    avgLatency: "Avg Latency",
    totalCalls24h: "24h Calls",
    routingTitle: "Routing Analytics",
    routingDesc: "Channel routing distribution and model mapping",
  },
};

export default function ChannelsPage() {
  const { lang } = useI18n();
  const t = LABELS[lang];

  /* fetch all data */
  const { data: healthData, error: healthError, isLoading: healthLoading, mutate: refreshHealth } = useSWR<{ health: HealthSummary[] }>(
    "/api/dashboard/channels?action=health",
    dashboardSWRConfig,
  );

  const { data: channelsData } = useSWR<{ channels: Channel[] }>(
    "/api/dashboard/channels",
    dashboardSWRConfig,
  );

  const { data: modelsData } = useSWR<{ data: ModelItem[] }>(
    "/api/v1/models",
    dashboardSWRConfig,
  );

  /* build merged channel list: config + health */
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

  /* model -> channel mapping */
  const modelChannelMap = useMemo(() => {
    const map = new Map<string, { channels: { name: string; priority: number; weight: number; status: string }[]; provider: string }>();
    const models = modelsData?.data || [];
    const providerMap = new Map(models.map(m => [m.id, m.owned_by]));

    for (const ch of mergedChannels) {
      const parsed = ch.modelsParsed;
      const modelIds = parsed.length === 0 || parsed.includes("*")
        ? models.map(m => m.id)
        : parsed;

      for (const modelId of modelIds) {
        if (!map.has(modelId)) {
          map.set(modelId, { channels: [], provider: providerMap.get(modelId) || ch.type });
        }
        const entry = map.get(modelId)!;
        if (!entry.channels.some(c => c.name === ch.name)) {
          entry.channels.push({ name: ch.name, priority: ch.priority, weight: ch.weight, status: ch.live_status });
        }
      }
    }

    for (const entry of map.values()) {
      entry.channels.sort((a, b) => b.priority - a.priority || b.weight - a.weight);
    }

    return map;
  }, [mergedChannels, modelsData]);

  /* health stats */
  const health = healthData?.health || [];
  const totalChannels = health.length;
  const onlineCount = health.filter(h => h.status === "online").length;
  const offlineCount = health.filter(h => h.status === "offline").length;
  const totalCalls = health.reduce((s, h) => s + h.total_calls_24h, 0);
  const ratesWithData = health.filter(h => h.success_rate_24h !== null);
  const avgRate = ratesWithData.length > 0
    ? ratesWithData.reduce((s, h) => s + h.success_rate_24h!, 0) / ratesWithData.length
    : null;
  const latenciesWithData = health.filter(h => h.avg_latency_24h !== null);
  const avgLatency = latenciesWithData.length > 0
    ? Math.round(latenciesWithData.reduce((s, h) => s + h.avg_latency_24h!, 0) / latenciesWithData.length)
    : null;

  const statCards = [
    { icon: <Activity className="h-4 w-4" />, color: "text-blue-500", bg: "bg-blue-500/10", label: t.totalChannels, value: totalChannels },
    { icon: <CheckCircle className="h-4 w-4" />, color: "text-green-500", bg: "bg-green-500/10", label: t.online, value: onlineCount },
    { icon: <XCircle className="h-4 w-4" />, color: "text-red-500", bg: "bg-red-500/10", label: t.offline, value: offlineCount },
    { icon: <Activity className="h-4 w-4" />, color: "text-purple-500", bg: "bg-purple-500/10", label: t.totalCalls24h, value: totalCalls.toLocaleString() },
    { icon: <CheckCircle className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10", label: t.avgSuccessRate, value: avgRate !== null ? `${avgRate.toFixed(1)}%` : "-", warn: avgRate !== null && avgRate < 95 },
    { icon: <AlertTriangle className="h-4 w-4" />, color: "text-amber-500", bg: "bg-amber-500/10", label: t.avgLatency, value: avgLatency !== null ? `${avgLatency}ms` : "-", warn: avgLatency !== null && avgLatency > 1000 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <h1 className="text-2xl font-bold">{t.title}</h1>

      {/* Health overview cards */}
      {healthLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 bg-muted rounded w-12" />
                  <div className="h-5 bg-muted rounded w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : healthError ? (
        <Card className="glass-card border-destructive/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">{lang === "zh" ? "健康数据加载失败" : "Failed to load health data"}</p>
            <button onClick={() => refreshHealth()} className="text-xs text-primary hover:underline mt-1">{lang === "zh" ? "重试" : "Retry"}</button>
          </CardContent>
        </Card>
      ) : totalChannels > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {statCards.map((card) => (
            <Card key={card.label} className="glass-card">
              <CardContent className="p-3 flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <span className={card.color}>{card.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{card.label}</p>
                  <p className={`text-lg font-bold font-mono leading-tight ${card.warn ? "text-amber-500" : ""}`}>{card.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Channel CRUD */}
      <ChannelCard lang={lang} />

      {/* Routing Analytics */}
      <div className="flex items-center gap-2 mt-2">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground">{t.routingTitle}</h2>
        <span className="text-xs text-muted-foreground/60">· {t.routingDesc}</span>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <RoutingPieChart healthData={healthData} lang={lang} />
        <ModelChannelMap modelChannelMap={modelChannelMap} lang={lang} />
      </div>
    </div>
  );
}

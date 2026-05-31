"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Route,
  Server,
  GitBranch,
  Search,
  RefreshCw,
  Activity,
  Layers,
} from "lucide-react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/* ---------- types ---------- */

interface Channel {
  id: number;
  name: string;
  type: string;
  weight: number;
  enabled: number;
  models: string;      // JSON string
  status: string;
  priority: number;
  fail_count: number;
  last_fail_at: string | null;
}

interface ChannelHealth {
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

interface ModelItem {
  id: string;
  owned_by: string;
  display_name: string;
}

/* ---------- helpers ---------- */

function successRateColor(rate: number | null): string {
  if (rate === null) return "text-muted-foreground";
  if (rate >= 99) return "text-green-500";
  if (rate >= 95) return "text-yellow-500";
  return "text-red-500";
}

function successRateBgColor(rate: number | null): string {
  if (rate === null) return "bg-muted/50";
  if (rate >= 99) return "bg-green-500/10";
  if (rate >= 95) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

function latencyColor(ms: number | null): string {
  if (ms === null) return "text-muted-foreground";
  if (ms < 500) return "text-green-500";
  if (ms < 2000) return "text-yellow-500";
  return "text-red-500";
}

function latencyBgColor(ms: number | null): string {
  if (ms === null) return "bg-muted/50";
  if (ms < 500) return "bg-green-500/10";
  if (ms < 2000) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

const PIE_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1",
  "#14b8a6", "#e11d48", "#a855f7", "#0ea5e9", "#d946ef",
];

/* ---------- page ---------- */

export default function RoutingPage() {
  const { lang } = useI18n();
  const { resolvedTheme } = useTheme();

  const [lastUpdated, setLastUpdated] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [channelSearch, setChannelSearch] = useState("");
  const [sortField, setSortField] = useState<
    "total_calls_24h" | "success_rate_24h" | "avg_latency_24h" | "weight" | "priority" | ""
  >("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  /* fetch data */
  const { data: channelsData, isLoading: channelsLoading, mutate: mutateChannels } = useSWR<{ channels: Channel[] }>(
    "/api/dashboard/channels",
    dashboardSWRConfig,
  );

  const { data: healthData, isLoading: healthLoading, mutate: mutateHealth } = useSWR<{ health: ChannelHealth[] }>(
    "/api/dashboard/channels?action=health",
    dashboardSWRConfig,
  );

  const { data: modelsData, isLoading: modelsLoading } = useSWR<{ data: ModelItem[] }>(
    "/api/v1/models",
    dashboardSWRConfig,
  );

  const isLoading = channelsLoading || healthLoading || modelsLoading;

  useEffect(() => {
    if (channelsData || healthData) {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [channelsData, healthData]);

  const refresh = () => {
    mutateChannels();
    mutateHealth();
  };

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

  /* model → channel mapping */
  const modelChannelMap = useMemo(() => {
    const map = new Map<string, { channels: { name: string; priority: number; weight: number; status: string }[]; provider: string }>();
    const models = modelsData?.data || [];

    // Build provider lookup from models data
    const providerMap = new Map(models.map(m => [m.id, m.owned_by]));

    for (const ch of mergedChannels) {
      const parsed = ch.modelsParsed;
      const modelIds = parsed.length === 0
        ? models.map(m => m.id) // wildcard: show all models
        : parsed.includes("*")
          ? models.map(m => m.id)
          : parsed;

      for (const modelId of modelIds) {
        if (!map.has(modelId)) {
          map.set(modelId, { channels: [], provider: providerMap.get(modelId) || ch.type });
        }
        const entry = map.get(modelId)!;
        // deduplicate channels by name
        if (!entry.channels.some(c => c.name === ch.name)) {
          entry.channels.push({
            name: ch.name,
            priority: ch.priority,
            weight: ch.weight,
            status: ch.live_status,
          });
        }
      }
    }

    // sort channels within each model by priority desc, then weight desc
    for (const entry of map.values()) {
      entry.channels.sort((a, b) => b.priority - a.priority || b.weight - a.weight);
    }

    return map;
  }, [mergedChannels, modelsData]);

  /* filtered + sorted model rows */
  const modelRows = useMemo(() => {
    let rows = [...modelChannelMap.entries()].map(([modelId, entry]) => ({
      modelId,
      provider: entry.provider,
      channels: entry.channels,
      channelCount: entry.channels.length,
    }));

    if (modelSearch.trim()) {
      const q = modelSearch.toLowerCase();
      rows = rows.filter(r => r.modelId.toLowerCase().includes(q) || r.provider.toLowerCase().includes(q));
    }

    return rows.sort((a, b) => b.channelCount - a.channelCount);
  }, [modelChannelMap, modelSearch]);

  /* filtered + sorted channel health rows */
  const channelRows = useMemo(() => {
    let rows = mergedChannels.filter(ch => ch.enabled === 1);

    if (channelSearch.trim()) {
      const q = channelSearch.toLowerCase();
      rows = rows.filter(ch => ch.name.toLowerCase().includes(q) || ch.type.toLowerCase().includes(q));
    }

    if (sortField) {
      rows = [...rows].sort((a, b) => {
        const aVal = a[sortField] ?? 0;
        const bVal = b[sortField] ?? 0;
        return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }

    return rows;
  }, [mergedChannels, channelSearch, sortField, sortDir]);

  const toggleSort = (field: "total_calls_24h" | "success_rate_24h" | "avg_latency_24h" | "weight" | "priority") => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  /* pie chart: routing distribution by call count */
  const pieOption = useMemo(() => {
    const health = healthData?.health || [];
    const withCalls = health.filter(h => h.total_calls_24h > 0);
    if (withCalls.length === 0) return null;

    const isDark = resolvedTheme === "dark";

    return {
      tooltip: {
        trigger: "item" as const,
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${p.name}<br/>${lang === "zh" ? "调用" : "Calls"}: ${p.value.toLocaleString()} (${p.percent}%)`,
      },
      legend: {
        orient: "vertical" as const,
        right: 10,
        top: "center",
        textStyle: { color: isDark ? "#a1a1aa" : "#71717a", fontSize: 11 },
        type: "scroll" as const,
      },
      series: [{
        type: "pie" as const,
        radius: ["40%", "70%"],
        center: ["35%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: isDark ? "#09090b" : "#ffffff", borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: "bold" as const },
        },
        data: withCalls.map((h, i) => ({
          name: h.name,
          value: h.total_calls_24h,
          itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length] },
        })),
      }],
    };
  }, [healthData, resolvedTheme, lang]);

  /* summary stats */
  const totalChannels = mergedChannels.filter(ch => ch.enabled === 1).length;
  const onlineChannels = mergedChannels.filter(ch => ch.enabled === 1 && ch.live_status === "online").length;
  const totalModels = modelChannelMap.size;
  const totalCalls24h = (healthData?.health || []).reduce((sum, h) => sum + h.total_calls_24h, 0);

  /* ---------- render ---------- */

  if (isLoading && !channelsData && !healthData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Route className="h-6 w-6" />
          {lang === "zh" ? "智能路由" : "Smart Routing"}
        </h1>
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </div>
    );
  }

  if (!channelsData && !healthData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Route className="h-6 w-6" />
          {lang === "zh" ? "智能路由" : "Smart Routing"}
        </h1>
        <div className="text-center py-8 text-muted-foreground text-sm">
          {lang === "zh" ? "暂无路由数据" : "No routing data yet"}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: <Server className="h-4 w-4 text-blue-500" />,
      iconBg: "bg-blue-500/10",
      label: lang === "zh" ? "总渠道" : "Channels",
      value: String(totalChannels),
      desc: lang === "zh" ? `${onlineChannels} 在线` : `${onlineChannels} online`,
    },
    {
      icon: <Layers className="h-4 w-4 text-green-500" />,
      iconBg: "bg-green-500/10",
      label: lang === "zh" ? "可用模型" : "Models",
      value: totalModels.toLocaleString(),
      desc: lang === "zh" ? "通过路由暴露" : "Exposed via routing",
    },
    {
      icon: <Activity className="h-4 w-4 text-yellow-500" />,
      iconBg: "bg-yellow-500/10",
      label: lang === "zh" ? "24h 调用" : "24h Calls",
      value: totalCalls24h.toLocaleString(),
      desc: lang === "zh" ? "全部渠道合计" : "All channels combined",
    },
    {
      icon: <GitBranch className="h-4 w-4 text-purple-500" />,
      iconBg: "bg-purple-500/10",
      label: lang === "zh" ? "在线率" : "Uptime",
      value: totalChannels > 0 ? `${Math.round((onlineChannels / totalChannels) * 100)}%` : "-",
      desc: lang === "zh" ? "渠道可用性" : "Channel availability",
    },
  ];

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Route className="h-6 w-6" />
          {lang === "zh" ? "智能路由" : "Smart Routing"}
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        </h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              {lang === "zh" ? "上次更新" : "Last updated"}: {lastUpdated}
            </span>
          )}
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-input bg-background text-xs hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {lang === "zh" ? "刷新" : "Refresh"}
          </button>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <Card key={card.label} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-md", card.iconBg)}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-xl font-bold font-mono">{card.value}</p>
                <p className="text-[11px] text-muted-foreground">{card.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* routing distribution pie chart */}
      {pieOption && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {lang === "zh" ? "路由调用分布" : "Routing Distribution"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ReactECharts option={pieOption} style={{ height: 280 }} opts={{ renderer: "svg" }} />
          </CardContent>
        </Card>
      )}

      {/* channel health table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-5 w-5" />
            {lang === "zh" ? "渠道健康概览" : "Channel Health Overview"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-3 w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={channelSearch}
              onChange={e => setChannelSearch(e.target.value)}
              placeholder={lang === "zh" ? "搜索渠道..." : "Search channels..."}
              className="w-full h-8 pl-8 pr-3 rounded-md border border-input bg-background text-xs focus:border-primary focus:outline-none"
            />
          </div>
          {channelRows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {lang === "zh" ? "暂无渠道数据" : "No channel data"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">
                      {lang === "zh" ? "渠道名称" : "Channel Name"}
                    </th>
                    <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">
                      {lang === "zh" ? "类型" : "Provider"}
                    </th>
                    <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">
                      {lang === "zh" ? "状态" : "Status"}
                    </th>
                    <th
                      scope="col"
                      className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => toggleSort("success_rate_24h")}
                    >
                      {lang === "zh" ? "成功率 (24h)" : "Success Rate (24h)"}
                      {sortIndicator("success_rate_24h")}
                    </th>
                    <th
                      scope="col"
                      className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => toggleSort("avg_latency_24h")}
                    >
                      {lang === "zh" ? "平均延迟 (24h)" : "Avg Latency (24h)"}
                      {sortIndicator("avg_latency_24h")}
                    </th>
                    <th
                      scope="col"
                      className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => toggleSort("weight")}
                    >
                      {lang === "zh" ? "权重" : "Weight"}
                      {sortIndicator("weight")}
                    </th>
                    <th
                      scope="col"
                      className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => toggleSort("priority")}
                    >
                      {lang === "zh" ? "优先级" : "Priority"}
                      {sortIndicator("priority")}
                    </th>
                    <th
                      scope="col"
                      className="text-right py-2 px-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground select-none"
                      onClick={() => toggleSort("total_calls_24h")}
                    >
                      {lang === "zh" ? "24h 调用" : "24h Calls"}
                      {sortIndicator("total_calls_24h")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {channelRows.map((ch) => (
                    <tr key={ch.id} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-2 px-3 font-mono text-xs">{ch.name}</td>
                      <td className="py-2 px-3">
                        <Badge variant="secondary" className="text-[11px] font-mono">
                          {ch.type}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge
                          variant={ch.live_status === "online" ? "default" : "destructive"}
                          className={cn(
                            "text-[11px]",
                            ch.live_status === "online"
                              ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20"
                              : "",
                          )}
                        >
                          {ch.live_status === "online"
                            ? (lang === "zh" ? "在线" : "Online")
                            : (lang === "zh" ? "离线" : "Offline")}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-mono",
                            successRateBgColor(ch.success_rate_24h),
                            successRateColor(ch.success_rate_24h),
                          )}
                        >
                          {ch.success_rate_24h !== null ? `${ch.success_rate_24h.toFixed(1)}%` : "-"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-mono",
                            latencyBgColor(ch.avg_latency_24h),
                            latencyColor(ch.avg_latency_24h),
                          )}
                        >
                          {ch.avg_latency_24h !== null ? `${ch.avg_latency_24h}ms` : "-"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{ch.weight}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs">{ch.priority}</td>
                      <td className="py-2 px-3 text-right font-mono">{ch.total_calls_24h.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* model → channel mapping table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            {lang === "zh" ? "模型 → 渠道路由" : "Model → Channel Routing"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-3 w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={modelSearch}
              onChange={e => setModelSearch(e.target.value)}
              placeholder={lang === "zh" ? "搜索模型..." : "Search models..."}
              className="w-full h-8 pl-8 pr-3 rounded-md border border-input bg-background text-xs focus:border-primary focus:outline-none"
            />
          </div>
          {modelRows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {lang === "zh" ? "暂无模型数据" : "No model data"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">
                      {lang === "zh" ? "模型" : "Model"}
                    </th>
                    <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">
                      {lang === "zh" ? "提供商" : "Provider"}
                    </th>
                    <th scope="col" className="text-center py-2 px-3 text-muted-foreground font-medium">
                      {lang === "zh" ? "可用渠道" : "Channels"}
                    </th>
                    <th scope="col" className="text-left py-2 px-3 text-muted-foreground font-medium">
                      {lang === "zh" ? "渠道路由 (优先级 → 权重)" : "Channel Routing (Priority → Weight)"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {modelRows.map((row) => (
                    <tr key={row.modelId} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-2 px-3 font-mono text-xs max-w-[260px] truncate" title={row.modelId}>
                        {row.modelId}
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="secondary" className="text-[11px]">
                          {row.provider}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{row.channelCount}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1.5">
                          {row.channels.map((ch) => (
                            <span
                              key={ch.name}
                              className={cn(
                                "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-mono",
                                ch.status === "online"
                                  ? "border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400"
                                  : "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400",
                              )}
                              title={`Priority: ${ch.priority}, Weight: ${ch.weight}`}
                            >
                              {ch.name}
                              <span className="text-muted-foreground">
                                P{ch.priority}/{ch.weight}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

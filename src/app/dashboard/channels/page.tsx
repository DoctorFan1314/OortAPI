"use client";

import { useI18n } from "@/contexts/i18n-context";
import { ChannelCard } from "@/components/dashboard/channel-card";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

interface HealthSummary {
  channel_id: number;
  name: string;
  status: string;
  fail_count: number;
  total_calls_24h: number;
  success_rate_24h: number | null;
  avg_latency_24h: number | null;
}

const LABELS = {
  zh: {
    title: "渠道管理",
    overview: "健康概览",
    totalChannels: "渠道总数",
    online: "在线",
    offline: "离线",
    avgSuccessRate: "平均成功率",
    avgLatency: "平均延迟",
    totalCalls24h: "24h 总调用",
  },
  en: {
    title: "Channel Management",
    overview: "Health Overview",
    totalChannels: "Total Channels",
    online: "Online",
    offline: "Offline",
    avgSuccessRate: "Avg Success Rate",
    avgLatency: "Avg Latency",
    totalCalls24h: "24h Total Calls",
  },
};

export default function ChannelsPage() {
  const { lang } = useI18n();
  const t = LABELS[lang];
  const { data: healthData, error: healthError, isLoading: healthLoading, mutate: refreshHealth } = useSWR<{ health: HealthSummary[] }>(
    "/api/dashboard/channels?action=health",
    dashboardSWRConfig
  );

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {t.title}
      </h1>

      {/* Health overview cards */}
      {healthLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-3 flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-muted" />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">{t.totalChannels}</p>
                <p className="text-lg font-bold font-mono">{totalChannels}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">{t.online}</p>
                <p className="text-lg font-bold font-mono text-green-500">{onlineCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">{t.offline}</p>
                <p className="text-lg font-bold font-mono text-red-500">{offlineCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">{t.totalCalls24h}</p>
                <p className="text-lg font-bold font-mono">{totalCalls.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">{t.avgSuccessRate}</p>
                <p className={`text-lg font-bold font-mono ${avgRate !== null && avgRate >= 95 ? "text-green-500" : avgRate !== null && avgRate >= 80 ? "text-yellow-500" : "text-red-500"}`}>
                  {avgRate !== null ? `${avgRate.toFixed(1)}%` : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">{t.avgLatency}</p>
                <p className="text-lg font-bold font-mono">{avgLatency !== null ? `${avgLatency}ms` : "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <ChannelCard lang={lang} />
    </div>
  );
}

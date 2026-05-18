"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  Clock,
  Zap,
  PhoneCall,
  DollarSign,
  Coins,
  Server,
} from "lucide-react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

interface MonitorData {
  qps: number;
  error_rate: number;
  p50_latency: number;
  p95_latency: number;
  total_calls_24h: number;
  total_cost_24h: number;
  total_tokens_24h: number;
  providers: Array<{
    provider: string;
    calls: number;
    error_rate: number;
    avg_latency: number;
  }>;
}

const LABELS = {
  zh: {
    title: "系统监控",
    qps: "QPS",
    qpsDesc: "每秒请求数 (24h)",
    errorRate: "错误率",
    errorRateDesc: "失败请求占比 (24h)",
    p50: "P50 延迟",
    p50Desc: "中位延迟",
    p95: "P95 延迟",
    p95Desc: "95th 分位延迟",
    totalCalls: "总调用",
    totalCallsDesc: "过去 24 小时",
    totalCost: "总费用",
    totalCostDesc: "过去 24 小时",
    totalTokens: "总 Tokens",
    totalTokensDesc: "过去 24 小时",
    providerHealth: "渠道健康",
    provider: "渠道类型",
    calls: "调用次数",
    avgLatency: "平均延迟",
    noData: "暂无监控数据",
    loading: "加载中...",
  },
  en: {
    title: "System Monitor",
    qps: "QPS",
    qpsDesc: "Queries per second (24h)",
    errorRate: "Error Rate",
    errorRateDesc: "Failed request ratio (24h)",
    p50: "P50 Latency",
    p50Desc: "Median latency",
    p95: "P95 Latency",
    p95Desc: "95th percentile latency",
    totalCalls: "Total Calls",
    totalCallsDesc: "Last 24 hours",
    totalCost: "Total Cost",
    totalCostDesc: "Last 24 hours",
    totalTokens: "Total Tokens",
    totalTokensDesc: "Last 24 hours",
    providerHealth: "Provider Health",
    provider: "Provider",
    calls: "Calls",
    avgLatency: "Avg Latency",
    noData: "No monitoring data yet",
    loading: "Loading...",
  },
};

function errorRateColor(rate: number): string {
  if (rate < 1) return "text-green-500";
  if (rate < 5) return "text-yellow-500";
  return "text-red-500";
}

function latencyColor(ms: number): string {
  if (ms < 500) return "text-green-500";
  if (ms < 2000) return "text-yellow-500";
  return "text-red-500";
}

function errorRateBgColor(rate: number): string {
  if (rate < 1) return "bg-green-500/10";
  if (rate < 5) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

function latencyBgColor(ms: number): string {
  if (ms < 500) return "bg-green-500/10";
  if (ms < 2000) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

export default function MonitorPage() {
  const { lang } = useI18n();
  const { formatPrice } = useCurrency();
  const t = LABELS[lang];

  const { data, isLoading } = useSWR<MonitorData>(
    "/api/dashboard/admin/monitor",
    dashboardSWRConfig,
  );

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          {t.title}
        </h1>
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          {t.title}
        </h1>
        <div className="text-center py-8 text-muted-foreground text-sm">
          {t.noData}
        </div>
      </div>
    );
  }

  const formatTokens = (n: number) => n.toLocaleString();

  const statCards = [
    {
      icon: <Zap className="h-4 w-4 text-yellow-500" />,
      iconBg: "bg-yellow-500/10",
      label: t.qps,
      value: data.qps.toFixed(2),
      desc: t.qpsDesc,
    },
    {
      icon: <AlertTriangle className={`h-4 w-4 ${errorRateColor(data.error_rate)}`} />,
      iconBg: errorRateBgColor(data.error_rate),
      label: t.errorRate,
      value: `${data.error_rate.toFixed(2)}%`,
      valueColor: errorRateColor(data.error_rate),
      desc: t.errorRateDesc,
    },
    {
      icon: <Clock className={`h-4 w-4 ${latencyColor(data.p50_latency)}`} />,
      iconBg: latencyBgColor(data.p50_latency),
      label: t.p50,
      value: `${data.p50_latency}ms`,
      valueColor: latencyColor(data.p50_latency),
      desc: t.p50Desc,
    },
    {
      icon: <Clock className={`h-4 w-4 ${latencyColor(data.p95_latency)}`} />,
      iconBg: latencyBgColor(data.p95_latency),
      label: t.p95,
      value: `${data.p95_latency}ms`,
      valueColor: latencyColor(data.p95_latency),
      desc: t.p95Desc,
    },
    {
      icon: <PhoneCall className="h-4 w-4 text-blue-500" />,
      iconBg: "bg-blue-500/10",
      label: t.totalCalls,
      value: data.total_calls_24h.toLocaleString(),
      desc: t.totalCallsDesc,
    },
    {
      icon: <DollarSign className="h-4 w-4 text-red-500" />,
      iconBg: "bg-red-500/10",
      label: t.totalCost,
      value: formatPrice(data.total_cost_24h),
      desc: t.totalCostDesc,
    },
    {
      icon: <Coins className="h-4 w-4 text-green-500" />,
      iconBg: "bg-green-500/10",
      label: t.totalTokens,
      value: formatTokens(data.total_tokens_24h),
      desc: t.totalTokensDesc,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Activity className="h-6 w-6" />
        {t.title}
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <Card key={card.label} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-md ${card.iconBg}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p
                  className={`text-xl font-bold font-mono ${card.valueColor || ""}`}
                >
                  {card.value}
                </p>
                <p className="text-[11px] text-muted-foreground">{card.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider health table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-5 w-5" />
            {t.providerHealth}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.providers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t.noData}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                      {t.provider}
                    </th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                      {t.calls}
                    </th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                      {t.errorRate}
                    </th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">
                      {t.avgLatency}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.providers.map((p) => (
                    <tr
                      key={p.provider}
                      className="border-b border-border/20 hover:bg-muted/30"
                    >
                      <td className="py-2 px-3 font-mono text-xs">
                        {p.provider}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {p.calls.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-mono ${errorRateBgColor(p.error_rate)} ${errorRateColor(p.error_rate)}`}
                        >
                          {p.error_rate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-mono ${latencyBgColor(p.avg_latency)} ${latencyColor(p.avg_latency)}`}
                        >
                          {p.avg_latency}ms
                        </span>
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

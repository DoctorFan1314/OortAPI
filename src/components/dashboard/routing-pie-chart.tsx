"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const PIE_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1",
  "#14b8a6", "#e11d48", "#a855f7", "#0ea5e9", "#d946ef",
];

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

interface RoutingPieChartProps {
  healthData?: { health: ChannelHealth[] };
  lang: string;
}

export function RoutingPieChart({ healthData, lang }: RoutingPieChartProps) {
  const { resolvedTheme } = useTheme();

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

  if (!pieOption) return null;

  return (
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
  );
}

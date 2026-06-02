"use client";

import useSWR from "swr";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/i18n-context";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { Gauge, Zap, Clock, Info } from "lucide-react";
import { ChartErrorBoundary } from "@/components/shared/chart-error-boundary";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface LatencyItem {
  date: string;
  avg_ttft: number;
  avg_itl: number;
}

function StatBox({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: string; unit: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold font-mono flex items-baseline gap-1">
          {value}
          <span className="text-[10px] text-muted-foreground font-normal">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export function LatencyMetrics({ lang }: { lang: "zh" | "en" }) {
  const { data, isLoading } = useSWR<{ latency_trend: LatencyItem[] }>(
    "/api/dashboard/analytics?range=30d&group_by=day",
    dashboardSWRConfig
  );

  const trend = data?.latency_trend || [];

  if (isLoading || trend.length === 0) return null;

  const last = trend[trend.length - 1];
  const avgTtft = trend.reduce((s, d) => s + d.avg_ttft, 0) / trend.length;
  const avgItl = trend.reduce((s, d) => s + d.avg_itl, 0) / trend.length;

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
      borderWidth: 1,
      textStyle: { color: "var(--foreground)", fontSize: 11 },
      formatter: (params: Array<{ seriesName: string; value: number; axisValueLabel: string }>) => {
        let html = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValueLabel}</div>`;
        for (const p of params) {
          const dotColor = p.seriesName.includes("TTFT") || p.seriesName.includes("首字") ? "#3b82f6" : "#22c55e";
          html += `<div style="display:flex;justify-content:space-between;gap:16px;font-size:12px">
            <span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};margin-right:6px"></span>${p.seriesName}</span>
            <span style="font-weight:500;font-family:monospace">${p.value} ms</span>
          </div>`;
        }
        return html;
      },
    },
    legend: {
      data: [
        { name: "TTFT", icon: "circle" },
        { name: "ITL", icon: "diamond" },
      ],
      textStyle: { color: "var(--muted-foreground)", fontSize: 11 },
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
    },
    grid: { left: 45, right: 16, top: 16, bottom: 35 },
    xAxis: {
      type: "category",
      data: trend.map((d) => d.date.slice(5)),
      axisLabel: { color: "var(--muted-foreground)", fontSize: 9 },
      axisLine: { lineStyle: { color: "var(--border)", opacity: 0.3 } },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      name: "ms",
      nameTextStyle: { color: "var(--muted-foreground)", fontSize: 9 },
      axisLabel: { color: "var(--muted-foreground)", fontSize: 9 },
      splitLine: { lineStyle: { color: "var(--border)", opacity: 0.12, type: "solid" } },
      axisTick: { show: false },
    },
    series: [
      {
        name: "TTFT",
        type: "line",
        smooth: true,
        data: trend.map((d) => d.avg_ttft),
        lineStyle: { width: 2.5, color: "#3b82f6" },
        itemStyle: { color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.2)" },
              { offset: 1, color: "rgba(59, 130, 246, 0.01)" },
            ],
          },
        },
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        emphasis: { focus: "series" },
      },
      {
        name: "ITL",
        type: "line",
        smooth: true,
        data: trend.map((d) => d.avg_itl),
        lineStyle: { width: 2.5, color: "#22c55e" },
        itemStyle: { color: "#22c55e" },
        areaStyle: {
          color: {
            type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(34, 197, 94, 0.15)" },
              { offset: 1, color: "rgba(34, 197, 94, 0.005)" },
            ],
          },
        },
        symbol: "diamond",
        symbolSize: 5,
        showSymbol: false,
        emphasis: { focus: "series" },
      },
    ],
  };

  return (
    <Card className="glass-card border-t-2 border-t-blue-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center">
            <Gauge className="h-4 w-4 text-primary" />
          </div>
          {lang === "zh" ? "流式延迟监控" : "Streaming Latency"}
          <span className="text-[10px] text-muted-foreground font-mono ml-auto">30d</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <StatBox
            icon={<Zap className="h-4 w-4 text-blue-500" />}
            label={lang === "zh" ? "TTFT 首字延迟" : "TTFT"}
            value={last.avg_ttft.toFixed(1)}
            unit="ms"
            color="bg-blue-500/10"
          />
          <StatBox
            icon={<Clock className="h-4 w-4 text-emerald-500" />}
            label={lang === "zh" ? "ITL 吐字间隔" : "ITL"}
            value={last.avg_itl.toFixed(1)}
            unit="ms"
            color="bg-emerald-500/10"
          />
        </div>
        <ChartErrorBoundary title={lang === "zh" ? "流式延迟" : "Streaming Latency"}>
          <ReactECharts option={option} style={{ width: "100%" }} className="min-h-[160px] md:min-h-[200px]" opts={{ renderer: "canvas" }} notMerge />
        </ChartErrorBoundary>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50 border-t border-border/30 pt-2">
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>TTFT</span>
          </span>
          <span>{lang === "zh" ? "首 Token 到达时间，越低响应越快" : "Time to first token — lower is better"}</span>
          <span className="w-px h-3 bg-border/30" />
          <span className="flex items-center gap-1">ITL</span>
          <span>{lang === "zh" ? "Token 平均吐字间隔，越低吞吐越高" : "Inter-token latency — lower = higher throughput"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

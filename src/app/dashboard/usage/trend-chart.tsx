"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { DailyTrend } from "./usage-types";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface TrendChartProps {
  trendData: DailyTrend[];
  metric: "cost" | "tokens" | "calls";
  onMetricChange: (m: "cost" | "tokens" | "calls") => void;
  isCreditsUser: boolean;
}

export function TrendChart({ trendData, metric, onMetricChange, isCreditsUser }: TrendChartProps) {
  const { lang, t } = useI18n();
  const L = t.dashboard;
  const { currency, exchangeRate } = useCurrency();

  const chartOption = useMemo(() => {
    if (trendData.length === 0) return null;
    const dates = trendData.map(d => d.date);
    const values = trendData.map(d => {
      if (metric === "cost") return +(d.cost * exchangeRate).toFixed(4);
      if (metric === "tokens") return d.tokens;
      return d.calls;
    });
    const color = metric === "cost" ? "#8b5cf6" : metric === "tokens" ? "#22c55e" : "#3b82f6";
    const label = metric === "cost" ? (currency === "CNY" ? "¥" : "$") : "";
    return {
      tooltip: {
        trigger: "axis" as const,
        formatter: (params: { axisValue: string; value: number; dataIndex: number }[]) => {
          const p = params[0];
          const day = metric === "tokens" ? trendData[p.dataIndex] : null;
          if (!day || metric !== "tokens") {
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
  }, [trendData, metric, exchangeRate, currency, lang]);

  if (!chartOption) return null;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />{L.trend}
          </CardTitle>
          <div className="flex gap-1">
            {(["cost", "tokens", "calls"] as const)
              .filter(m => !isCreditsUser || m !== "cost")
              .map(m => (
                <button key={m} onClick={() => onMetricChange(m)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${metric === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {m === "cost" ? L.byCost : m === "tokens" ? L.byTokens : L.byCalls}
                </button>
              ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ReactECharts option={chartOption} style={{ height: 220 }} opts={{ renderer: "svg" }} />
      </CardContent>
    </Card>
  );
}

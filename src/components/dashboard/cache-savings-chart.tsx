"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { ChartErrorBoundary } from "@/components/shared/chart-error-boundary";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface CacheSavingsProps {
  tokensSaved: number;
  costSaved: number;
  costAvoidedPct: string;
  cacheHitTokens: number;
  nonCachedTokens: number;
  cacheHitPct: number;
  formatPrice: (n: number) => string;
  lang: "zh" | "en";
}

export function CacheSavingsChart(props: CacheSavingsProps) {
  const { tokensSaved, costSaved, costAvoidedPct, cacheHitTokens, nonCachedTokens, cacheHitPct, formatPrice, lang } = props;

  const donutOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
      textStyle: { color: "var(--foreground)", fontSize: 11 },
      formatter: (p: { name: string; value: number; percent: number }) =>
        `${p.name}: ${p.value.toLocaleString()} (${p.percent}%)`,
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "75%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: "var(--border)",
          borderWidth: 1,
        },
        label: {
          show: true,
          position: "center",
          formatter: `{green|${cacheHitPct}%}\n{gray|${lang === "zh" ? "缓存命中" : "Cached"}}`,
          rich: {
            green: { fontSize: 18, fontWeight: "bold", color: "#22c55e", lineHeight: 24 },
            gray: { fontSize: 10, color: "#888", lineHeight: 14 },
          },
        },
        labelLine: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: "bold" },
        },
        data: [
          {
            value: cacheHitTokens || 0,
            name: lang === "zh" ? "缓存命中" : "Cache Hits",
            itemStyle: { color: "#22c55e" },
          },
          {
            value: nonCachedTokens || 1,
            name: lang === "zh" ? "未命中缓存" : "Non-Cached",
            itemStyle: { color: "#4b5563" },
          },
        ],
      },
    ],
  };

  return (
    <Card className="glass-card border-emerald-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Coins className="h-4 w-4 text-emerald-400" />
          {lang === "zh" ? "本月缓存 ROI" : "MTD Cache ROI"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartErrorBoundary title={lang === "zh" ? "缓存 ROI" : "Cache ROI"}>
          <ReactECharts option={donutOption} style={{ width: "100%" }} className="min-h-[150px] md:min-h-[180px]" opts={{ renderer: "canvas" }} notMerge />
        </ChartErrorBoundary>
        <div className="mt-2 space-y-2 text-xs">
          <div className="flex items-center justify-between bg-emerald-500/5 rounded-lg px-3 py-2">
            <span className="text-muted-foreground">{lang === "zh" ? "节省 Tokens" : "Tokens Saved"}</span>
            <span className="font-mono font-semibold text-emerald-400 drop-shadow-[0_0_6px_rgba(0,255,65,0.25)]">
              {tokensSaved.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between bg-emerald-500/5 rounded-lg px-3 py-2">
            <span className="text-muted-foreground">{lang === "zh" ? "节省费用" : "Cost Saved"}</span>
            <span className="font-mono font-semibold text-emerald-400 drop-shadow-[0_0_6px_rgba(0,255,65,0.25)]">
              {formatPrice(costSaved)}
            </span>
          </div>
          <div className="flex items-center justify-between bg-emerald-500/5 rounded-lg px-3 py-2">
            <span className="text-muted-foreground">{lang === "zh" ? "避免支出" : "Cost Avoided"}</span>
            <span className="font-mono font-semibold text-emerald-400 drop-shadow-[0_0_6px_rgba(0,255,65,0.25)]">
              {costAvoidedPct}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

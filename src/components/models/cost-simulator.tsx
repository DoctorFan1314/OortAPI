"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/i18n-context";
import { Calculator, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface ModelPrice {
  model_name: string;
  input_rate: number;
  output_rate: number;
  display_name: string | null;
}

interface CostSimulatorProps {
  models: ModelPrice[];
  exchangeRate: number;
  currency: "USD" | "CNY";
  formatPrice: (usd: number, decimals?: number) => string;
}

export function CostSimulator({ models, exchangeRate, currency, formatPrice }: CostSimulatorProps) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [dailyCalls, setDailyCalls] = useState(1000);
  const [avgInput, setAvgInput] = useState(2000);
  const [avgOutput, setAvgOutput] = useState(500);

  const projected = useMemo(() => {
    const DAYS = 30;
    return models
      .map((m) => {
        const monthly =
          dailyCalls * DAYS *
          (avgInput * m.input_rate / 1000000 + avgOutput * m.output_rate / 1000000);
        return { name: m.display_name || m.model_name, cost: monthly };
      })
      .filter((m) => m.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 15);
  }, [models, dailyCalls, avgInput, avgOutput]);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
      textStyle: { color: "var(--foreground)", fontSize: 11 },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const p = params[0];
        return `${p.name}<br/>${lang === "zh" ? "月费" : "Monthly"}: ${currency === "CNY" ? "¥" : "$"}${(currency === "CNY" ? p.value * exchangeRate : p.value).toFixed(2)}`;
      },
    },
    grid: { left: 120, right: 20, top: 10, bottom: 20 },
    xAxis: {
      type: "value",
      axisLabel: {
        color: "var(--muted-foreground)",
        fontSize: 9,
        formatter: (v: number) => (currency === "CNY" ? `¥${(v * exchangeRate).toFixed(0)}` : `$${v.toFixed(0)}`),
      },
      splitLine: { lineStyle: { color: "var(--border)", opacity: 0.4 } },
    },
    yAxis: {
      type: "category",
      data: projected.map((p) => p.name).reverse(),
      axisLabel: { color: "var(--foreground)", fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        data: projected.map((p) => p.cost).reverse(),
        barWidth: "60%",
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: "linear",
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: "#6366f1" },
              { offset: 1, color: "#a855f7" },
            ],
          },
        },
      },
    ],
  };

  const Slider = ({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
          className="w-20 h-6 px-1.5 rounded border border-input bg-background text-[11px] font-mono text-right"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full"
      />
    </div>
  );

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 shadow-lg z-50 rounded-full h-10 px-4"
        >
          <Calculator className="h-4 w-4 mr-1.5" />
          {lang === "zh" ? "费用估算" : "Cost Simulator"}
        </Button>
      )}
      {open && (
        <Card className="fixed bottom-6 right-6 w-96 shadow-2xl z-50 border-primary/20 max-h-[80vh] overflow-y-auto">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              {lang === "zh" ? "消费估算器" : "Cost Simulator"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={cn("text-[10px] px-2 py-1 rounded font-medium", currency === "USD" ? "bg-sky-500/10 text-sky-500" : "bg-amber-500/10 text-amber-500")}>
              {lang === "zh" ? "当前计价" : "Pricing"}: {currency === "USD" ? "$ USD" : "¥ CNY"} · {lang === "zh" ? "汇率" : "Rate"}: {exchangeRate}
            </div>
            <Slider label={lang === "zh" ? "每日调用次数" : "Daily Calls"} value={dailyCalls} onChange={setDailyCalls} min={0} max={100000} step={100} />
            <Slider label={lang === "zh" ? "平均输入 Tokens" : "Avg Input Tokens"} value={avgInput} onChange={setAvgInput} min={0} max={128000} step={100} />
            <Slider label={lang === "zh" ? "平均输出 Tokens" : "Avg Output Tokens"} value={avgOutput} onChange={setAvgOutput} min={0} max={128000} step={100} />
            <div className="text-center text-xs text-muted-foreground">
              {lang === "zh" ? "Top 15 模型月度预估" : "Top 15 Monthly Projection"}
            </div>
            <ReactECharts option={option} style={{ height: Math.min(projected.length * 24 + 40, 400) }} opts={{ renderer: "canvas" }} notMerge />
          </CardContent>
        </Card>
      )}
    </>
  );
}

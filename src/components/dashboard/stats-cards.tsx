"use client";

import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/contexts/currency-context";
import { Wallet, TrendingDown, Activity, Coins, Gauge, Cpu } from "lucide-react";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

interface StatsData {
  today: {
    calls: number;
    success_rate: number;
    cost: number;
    tokens: number;
    avg_latency: number;
  };
  month: {
    calls: number;
    cost: number;
    tokens: number;
  };
  active_keys: number;
  balance: number;
  daily_usage: Array<{ date: string; calls: number; cost: number; tokens: number }>;
}

const LABELS = {
  zh: {
    balance: "当前余额",
    totalCost: "历史消耗",
    totalCalls: "请求次数",
    totalTokens: "Token 总量",
    rpm: "平均 RPM",
    tpm: "平均 TPM",
    monthlyCalls: "本月调用",
    monthlyCost: "本月花费",
    monthlyTokens: "本月 Tokens",
  },
  en: {
    balance: "Balance",
    totalCost: "Total Spent",
    totalCalls: "Total Requests",
    totalTokens: "Total Tokens",
    rpm: "Avg RPM",
    tpm: "Avg TPM",
    monthlyCalls: "Monthly Calls",
    monthlyCost: "Monthly Cost",
    monthlyTokens: "Monthly Tokens",
  },
};

export function StatsCards({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const { data: stats } = useSWR<StatsData>("/api/dashboard/stats", dashboardSWRConfig);
  const { currency, exchangeRate, symbol } = useCurrency();
  const t = LABELS[lang];

  const formatCost = (usd: number) => {
    if (currency === "CNY") return `¥${(usd * exchangeRate).toFixed(2)}`;
    return `$${usd.toFixed(2)}`;
  };

  const formatTokens = (n: number) => {
    return n.toLocaleString();
  };

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-4">
              <div className="h-3 bg-muted rounded w-16 mb-2" />
              <div className="h-7 bg-muted rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate approximate RPM/TPM from daily usage average
  const totalDaysWithUsage = stats.daily_usage?.filter(d => d.calls > 0).length || 1;
  const avgDailyCalls = (stats.month?.calls || 0) / Math.max(totalDaysWithUsage, 1);
  const avgDailyTokens = (stats.month?.tokens || 0) / Math.max(totalDaysWithUsage, 1);
  const avgRPM = (avgDailyCalls / 1440).toFixed(2); // 1440 min/day
  const avgTPM = Math.round(avgDailyTokens / 1440);

  const cards = [
    { icon: Wallet, label: t.balance, value: formatCost(stats.balance), color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
    { icon: TrendingDown, label: t.totalCost, value: formatCost(stats.month?.cost || 0), color: "text-red-500", bgColor: "bg-red-500/10" },
    { icon: Activity, label: t.monthlyCalls, value: (stats.month?.calls || 0).toLocaleString(), color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { icon: Coins, label: t.monthlyTokens, value: formatTokens(stats.month?.tokens || 0), color: "text-green-500", bgColor: "bg-green-500/10" },
    { icon: Gauge, label: t.rpm, value: avgRPM, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { icon: Cpu, label: t.tpm, value: formatTokens(avgTPM), color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <Card key={i} className="glass-card overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-md ${card.bgColor}`}>
                <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <div className="text-xl font-bold font-mono">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

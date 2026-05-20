"use client";

import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/contexts/currency-context";
import { Wallet, TrendingDown, Activity, Coins, Gauge, Cpu } from "lucide-react";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { DeltaBadge } from "@/components/shared/delta-badge";

interface StatsData {
  today: {
    calls: number;
    success_rate: number;
    cost: number;
    tokens: number;
    avg_latency: number;
  };
  yesterday: {
    calls: number;
    cost: number;
    tokens: number;
  };
  month: {
    calls: number;
    cost: number;
    tokens: number;
    tokens_in_noncached: number;
    tokens_in_cache: number;
    tokens_cache_creation: number;
    tokens_out: number;
  };
  last_month: {
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
    tokensInput: "输入 Token",
    tokensInputNonCached: "输入(未命中缓存)",
    tokensCacheHit: "输入(命中缓存)",
    tokensOutput: "输出",
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
    tokensInput: "Input Tokens",
    tokensInputNonCached: "Input(non-cached)",
    tokensCacheHit: "Input(cache hit)",
    tokensOutput: "Output",
  },
};

export function StatsCards({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const { data: stats } = useSWR<StatsData>("/api/dashboard/stats", dashboardSWRConfig);
  const { currency, exchangeRate, symbol, formatPrice } = useCurrency();
  const t = LABELS[lang];

  const formatTokens = (n: number) => {
    return n.toLocaleString();
  };

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-muted/30 animate-pulse">
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

  // Compute deltas
  const costDelta = stats.last_month?.cost ? ((stats.month.cost - stats.last_month.cost) / stats.last_month.cost * 100).toFixed(1) : null;
  const callsDelta = stats.last_month?.calls ? ((stats.month.calls - stats.last_month.calls) / stats.last_month.calls * 100).toFixed(1) : null;
  const todayCostDelta = stats.yesterday?.cost && stats.today.cost ? ((stats.today.cost - stats.yesterday.cost) / stats.yesterday.cost * 100).toFixed(1) : null;

  const cards = [
    { icon: Wallet, label: t.balance, value: formatPrice(stats.balance), color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
    { icon: TrendingDown, label: t.monthlyCost, value: formatPrice(stats.month?.cost || 0), color: "text-red-500", bgColor: "bg-red-500/10", delta: costDelta },
    { icon: Activity, label: t.monthlyCalls, value: (stats.month?.calls || 0).toLocaleString(), color: "text-blue-500", bgColor: "bg-blue-500/10", delta: callsDelta },
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
              {'delta' in card && card.delta && <DeltaBadge delta={card.delta} reverse={card.label === t.monthlyCost} />}
            </div>
            <div className="text-xl font-bold font-mono">{card.value}</div>
          </CardContent>
        </Card>
      ))}

      {/* Token breakdown card */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-green-500/10">
              <Coins className="h-3.5 w-3.5 text-green-500" />
            </div>
            <span className="text-xs text-muted-foreground">{t.monthlyTokens}</span>
          </div>
          <div className="text-xl font-bold font-mono mb-2">{formatTokens(stats.month?.tokens || 0)}</div>
          <div className="space-y-1 text-xs border-t border-border/20 pt-2">
            {stats.month.tokens_in_noncached > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground"><span className="text-blue-400">■</span> {t.tokensInputNonCached}</span>
                <span className="font-mono">{formatTokens(stats.month.tokens_in_noncached)}</span>
              </div>
            )}
            {stats.month.tokens_in_cache > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground"><span className="text-emerald-400">■</span> {t.tokensCacheHit}</span>
                <span className="font-mono">{formatTokens(stats.month.tokens_in_cache)}</span>
              </div>
            )}
            {stats.month.tokens_out > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground"><span className="text-orange-400">■</span> {t.tokensOutput}</span>
                <span className="font-mono">{formatTokens(stats.month.tokens_out)}</span>
              </div>
            )}
            {stats.month.tokens_in_cache > 0 && stats.month.tokens > 0 && (
              <div className="flex justify-between pt-1 border-t border-border/10 mt-1">
                <span className="text-muted-foreground">{lang === "zh" ? "缓存命中率" : "Cache Hit Rate"}</span>
                <span className="font-mono text-emerald-400">{((stats.month.tokens_in_cache / stats.month.tokens) * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { BillingHistory } from "@/components/dashboard/billing-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Wallet, Plus, Gift, Loader2, RefreshCw, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { useState, useMemo } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { useTheme } from "@/contexts/theme-context";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface UsageAggregate {
  total_cost: number;
  month_cost?: number;
  last_month_cost?: number;
}


export default function BillingPage() {
  const { lang, t } = useI18n();
  const L = t.dashboard;
  const { currency, setCurrency, symbol, exchangeRate, formatPrice } = useCurrency();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [refreshingBalance, setRefreshingBalance] = useState(false);

  async function handleRedeem() {
    setRedeemError("");
    if (!redeemCode.trim()) return;
    setRedeemLoading(true);
    try {
      const res = await fetch("/api/v1/billing/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: redeemCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(`${L.redeemSuccess} +${symbol}${data.amount?.toFixed(2) ?? "0.00"}`, "success");
        setRedeemOpen(false);
        setRedeemCode("");
        refreshUser();
      } else {
        setRedeemError(data.error || L.operationFailed);
      }
    } catch {
      setRedeemError(L.networkError);
    }
    setRedeemLoading(false);
  }

  // Fetch monthly usage data for forecast and trend
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
  const thisMonthEnd = now.toISOString().slice(0, 10);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);

  const { data: thisMonthData } = useSWR<UsageAggregate>(
    `/api/v1/billing/usage?from=${monthStart}&to=${thisMonthEnd}&limit=1`,
    dashboardSWRConfig,
  );
  const { data: lastMonthData } = useSWR<UsageAggregate>(
    `/api/v1/billing/usage?from=${lastMonthStart}&to=${lastMonthEnd}&limit=1`,
    dashboardSWRConfig,
  );

  const thisMonthCost = thisMonthData?.total_cost || 0;
  const lastMonthCost = lastMonthData?.total_cost || 0;

  // Calculate projected monthly spend
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const projectedCost = daysPassed > 0 ? (thisMonthCost / daysPassed) * daysInMonth : 0;
  const costDelta = lastMonthCost > 0 ? ((thisMonthCost - lastMonthCost) / lastMonthCost * 100).toFixed(1) : null;

  // 30-day daily cost trend
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  const { data: dailyUsageData } = useSWR<{ data?: Array<{ cost: number; created_at: string }> }>(
    `/api/v1/billing/usage?from=${thirtyDaysAgo}&to=${today}&limit=10000`,
    dashboardSWRConfig,
  );

  // Aggregate individual log entries into daily cost totals
  const dailyCostTrend = useMemo(() => {
    const logs = dailyUsageData?.data;
    if (!logs || logs.length === 0) return null;
    const dayMap: Record<string, number> = {};
    logs.forEach((log) => {
      const day = log.created_at.slice(0, 10);
      dayMap[day] = (dayMap[day] || 0) + (log.cost || 0);
    });
    const entries = Object.entries(dayMap)
      .map(([date, cost]) => ({ date, cost: +(cost * exchangeRate).toFixed(4) }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return entries.length > 0 ? entries : null;
  }, [dailyUsageData, exchangeRate]);

  // ECharts option for 30-day spending trend
  const trendChartOption = useMemo(() => {
    if (!dailyCostTrend) return null;
    const dates = dailyCostTrend.map((d) => d.date);
    const values = dailyCostTrend.map((d) => d.cost);
    const isDark = resolvedTheme === "dark";
    return {
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: isDark ? "#1e1e2e" : "#ffffff",
        borderColor: isDark ? "#333" : "#e5e7eb",
        textStyle: { color: isDark ? "#e0e0e0" : "#1a1a1a", fontSize: 12 },
        formatter: (params: { axisValue: string; value: number }[]) => {
          const p = params[0];
          return `${p.axisValue}<br/>${symbol}${p.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
        },
      },
      grid: { left: 55, right: 16, top: 10, bottom: 28 },
      xAxis: {
        type: "category" as const,
        data: dates,
        axisLabel: {
          fontSize: 11,
          color: isDark ? "#999" : "#666",
          formatter: (v: string) => v.slice(5),
        },
        axisLine: { lineStyle: { color: isDark ? "#444" : "#d1d5db" } },
      },
      yAxis: {
        type: "value" as const,
        axisLabel: {
          fontSize: 11,
          color: isDark ? "#999" : "#666",
          formatter: (v: number) => symbol + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : String(v)),
        },
        splitLine: { lineStyle: { color: isDark ? "#333" : "#e5e7eb" } },
      },
      series: [
        {
          type: "bar" as const,
          data: values,
          itemStyle: {
            color: "#8b5cf6",
            borderRadius: [4, 4, 0, 0],
          },
          barMaxWidth: 28,
        },
      ],
    };
  }, [dailyCostTrend, resolvedTheme, symbol]);

  const [showRedeemTooltip, setShowRedeemTooltip] = useState(false);

  async function handleRefreshBalance() {
    setRefreshingBalance(true);
    await refreshUser();
    setRefreshingBalance(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{L.title}</h1>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                {L.balance}
                <button
                  onClick={handleRefreshBalance}
                  disabled={refreshingBalance}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                  aria-label={lang === "zh" ? "刷新余额" : "Refresh balance"}
                >
                  {refreshingBalance ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
              <div className="text-4xl font-bold font-mono">{formatPrice(user?.balance || 0)}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setRedeemOpen(true)}>
                <Gift className="h-4 w-4" />
                {L.redeem}
              </Button>
              <div className="relative" onMouseEnter={() => setShowRedeemTooltip(true)} onMouseLeave={() => setShowRedeemTooltip(false)}>
                <Button className="gap-2" disabled>
                  <Plus className="h-4 w-4" />
                  {L.recharge}
                </Button>
                {showRedeemTooltip && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-popover border border-border text-xs text-muted-foreground whitespace-nowrap shadow-lg z-10">
                    {lang === "zh" ? "请使用兑换码充值" : "Please use redeem codes to add balance"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spend forecast & monthly trend */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">{lang === "zh" ? "本月已消费" : "Month-to-Date Spend"}</span>
              {costDelta && <DeltaBadge delta={costDelta} reverse />}
            </div>
            <div className="text-2xl font-bold font-mono">{formatPrice(thisMonthCost)}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {lang === "zh" ? `上月 ${formatPrice(lastMonthCost)}` : `Last month ${formatPrice(lastMonthCost)}`}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">{lang === "zh" ? "预计月消费" : "Projected Monthly Spend"}</span>
            </div>
            <div className="text-2xl font-bold font-mono">{formatPrice(projectedCost)}</div>
            <div className="mt-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((thisMonthCost / (projectedCost || 1)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "zh"
                  ? `基于 ${daysPassed}/${daysInMonth} 天的消耗速率`
                  : `Based on ${daysPassed}/${daysInMonth} days consumption rate`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Spending Trend */}
      {trendChartOption && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {lang === "zh" ? "最近 30 天消费趋势" : "30-Day Spending Trend"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ReactECharts option={trendChartOption} style={{ height: 220 }} opts={{ renderer: "svg" }} />
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-base text-green-500">{L.free}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-3">
            <p className="text-sm text-muted-foreground">{L.freeDesc}</p>
            <Link href="/token-plan"><Button variant="outline" size="sm" className="w-full">{lang === "zh" ? "查看套餐" : "View Plans"}</Button></Link>
          </CardContent>
        </Card>
        <Card className="glass-card border-primary/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base text-primary">{L.pro}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-3">
            <p className="text-sm text-muted-foreground">{L.proDesc}</p>
            <Link href="/token-plan"><Button size="sm" className="w-full">{lang === "zh" ? "订阅套餐" : "Subscribe"}</Button></Link>
          </CardContent>
        </Card>
        <Card className="glass-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-base text-yellow-500">{L.enterprise}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-3">
            <p className="text-sm text-muted-foreground">{L.enterpriseDesc}</p>
            <a href="mailto:support@oortapi.com"><Button variant="outline" size="sm" className="w-full">{lang === "zh" ? "联系我们" : "Contact Us"}</Button></a>
          </CardContent>
        </Card>
      </div>

      <BillingHistory lang={lang} />

      {/* Redeem Dialog */}
      <Dialog open={redeemOpen} onOpenChange={(open) => { if (!open) { setRedeemOpen(false); setRedeemCode(""); setRedeemError(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" />{L.redeemTitle}</DialogTitle>
            <DialogDescription>{L.redeemDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-foreground mb-1.5 block">{L.code}</label>
              <Input
                placeholder="RC-XXXXXXXX"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRedeem(); } }}
                className="bg-secondary border-border font-mono"
              />
            </div>
            {redeemError && <p className="text-sm text-red-400">{redeemError}</p>}
            <p className="text-[11px] text-muted-foreground">{lang === "zh" ? "兑换码将自动转换为大写" : "Codes are auto-capitalized"}</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setRedeemOpen(false); setRedeemCode(""); setRedeemError(""); }}>{L.cancel}</Button>
              <Button onClick={handleRedeem} disabled={redeemLoading || !redeemCode.trim()}>
                {redeemLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : L.redeemBtn}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { Wallet, Plus, Gift, Loader2, RefreshCw, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

interface UsageAggregate {
  total_cost: number;
  month_cost?: number;
  last_month_cost?: number;
}

const LABELS = {
  zh: { title: "账单中心", balance: "当前余额", recharge: "充值", pricing: "定价说明", free: "免费层", freeDesc: "注册赠送 $10 余额", pro: "按量付费", proDesc: "按实际 Token 用量扣费", enterprise: "企业定制", enterpriseDesc: "联系客服获取专属方案", redeem: "兑换码", redeemTitle: "使用兑换码", redeemDesc: "输入兑换码为账户充值", code: "兑换码", redeemBtn: "兑换", cancel: "取消", redeemSuccess: "兑换成功！", redeemAmount: "充值金额", newBalance: "新余额" },
  en: { title: "Billing", balance: "Current Balance", recharge: "Recharge", pricing: "Pricing", free: "Free Tier", freeDesc: "$10 bonus on registration", pro: "Pay as you go", proDesc: "Charged by actual token usage", enterprise: "Enterprise", enterpriseDesc: "Contact us for custom plans", redeem: "Redeem Code", redeemTitle: "Redeem Code", redeemDesc: "Enter a redeem code to add balance", code: "Code", redeemBtn: "Redeem", cancel: "Cancel", redeemSuccess: "Redeemed successfully!", redeemAmount: "Amount", newBalance: "New Balance" },
};

export default function BillingPage() {
  const { lang } = useI18n();
  const { currency, setCurrency, symbol, exchangeRate, formatPrice } = useCurrency();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const t = LABELS[lang];
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
        toast(`${t.redeemSuccess} +${symbol}${data.amount.toFixed(2)}`, "success");
        setRedeemOpen(false);
        setRedeemCode("");
        refreshUser();
      } else {
        setRedeemError(data.error || "Redeem failed");
      }
    } catch {
      setRedeemError("Network error");
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

  const [showRedeemTooltip, setShowRedeemTooltip] = useState(false);

  async function handleRefreshBalance() {
    setRefreshingBalance(true);
    await refreshUser();
    setRefreshingBalance(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.title}</h1>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                {t.balance}
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
                {t.redeem}
              </Button>
              <div className="relative" onMouseEnter={() => setShowRedeemTooltip(true)} onMouseLeave={() => setShowRedeemTooltip(false)}>
                <Button className="gap-2" disabled>
                  <Plus className="h-4 w-4" />
                  {t.recharge}
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

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-base text-green-500">{t.free}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t.freeDesc}</p>
            <Link href="/token-plan"><Button variant="outline" size="sm" className="w-full">{lang === "zh" ? "查看套餐" : "View Plans"}</Button></Link>
          </CardContent>
        </Card>
        <Card className="glass-card border-primary/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base text-primary">{t.pro}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t.proDesc}</p>
            <Link href="/token-plan"><Button size="sm" className="w-full">{lang === "zh" ? "订阅套餐" : "Subscribe"}</Button></Link>
          </CardContent>
        </Card>
        <Card className="glass-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-base text-yellow-500">{t.enterprise}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t.enterpriseDesc}</p>
            <a href="mailto:support@oortapi.com"><Button variant="outline" size="sm" className="w-full">{lang === "zh" ? "联系我们" : "Contact Us"}</Button></a>
          </CardContent>
        </Card>
      </div>

      <BillingHistory lang={lang} />

      {/* Redeem Dialog */}
      <Dialog open={redeemOpen} onOpenChange={(open) => { if (!open) { setRedeemOpen(false); setRedeemCode(""); setRedeemError(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" />{t.redeemTitle}</DialogTitle>
            <DialogDescription>{t.redeemDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.code}</label>
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
              <Button variant="outline" onClick={() => { setRedeemOpen(false); setRedeemCode(""); setRedeemError(""); }}>{t.cancel}</Button>
              <Button onClick={handleRedeem} disabled={redeemLoading || !redeemCode.trim()}>
                {redeemLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.redeemBtn}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

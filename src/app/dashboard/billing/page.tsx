"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { BillingHistory } from "@/components/dashboard/billing-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Wallet, Plus, Gift, Loader2 } from "lucide-react";
import { useState } from "react";

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
        toast(`${t.redeemSuccess} +$${data.amount.toFixed(2)}`, "success");
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.title}</h1>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">{t.balance}</div>
              <div className="text-4xl font-bold font-mono">{formatPrice(user?.balance || 0)}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setRedeemOpen(true)}>
                <Gift className="h-4 w-4" />
                {t.redeem}
              </Button>
              <Button className="gap-2" disabled title={lang === "zh" ? "即将上线，请使用兑换码充值" : "Coming soon. Use redeem codes for now."}>
                <Plus className="h-4 w-4" />
                {t.recharge}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-green-500">{t.free}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t.freeDesc}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-primary/50">
          <CardHeader>
            <CardTitle className="text-base text-primary">{t.pro}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t.proDesc}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base text-yellow-500">{t.enterprise}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t.enterpriseDesc}</p>
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

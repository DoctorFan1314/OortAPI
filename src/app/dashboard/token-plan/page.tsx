"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SubscriptionCard } from "@/components/shared/subscription-card";
import { Sparkles, XCircle, CheckCircle, AlertTriangle, Copy, CheckCheck, Key, Globe, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  billing_cycle: "monthly" | "yearly";
  status: "active" | "expired" | "cancelled" | "paused";
  credits_remaining: number;
  credits_total: number;
  current_period_start: string;
  current_period_end: string;
  is_first_purchase: number;
  auto_renew: number;
  created_at: string;
  plan_name: string;
  plan_display_name: string;
  plan_monthly_credits: number;
  plan_overage_rate_multiplier: number;
  plan_support_level: string;
  plan_monthly_price: number;
  plan_yearly_price: number;
  plan_currency: string;
}

interface ApiKey {
  id: number;
  name: string;
  key_value: string;
  enabled: number;
  total_calls: number;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: { zh: string; en: string } }> = {
  active: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", label: { zh: "生效中", en: "Active" } },
  expired: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", label: { zh: "已过期", en: "Expired" } },
  cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: { zh: "已取消", en: "Cancelled" } },
  paused: { icon: AlertTriangle, color: "text-zinc-400", bg: "bg-zinc-500/10", label: { zh: "已暂停", en: "Paused" } },
};

export default function TokenPlanDashboard() {
  return (
    <AuthGuard>
      <TokenPlanContent />
    </AuthGuard>
  );
}

function TokenPlanContent() {
  const { lang, t: i18n } = useI18n();
  const L = i18n.dashboard;
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [plans, setPlans] = useState<{ id: number; name: string; display_name: string; monthly_credits: number; monthly_price: number; tier: number }[]>([]);
  const [upgradePlanId, setUpgradePlanId] = useState<number>(0);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // SWR: fetch subscription, keys, and plans
  const { data: subData, isLoading: subLoading, mutate: mutateSub } = useSWR<{ subscriptions: Subscription[] }>("/api/dashboard/subscription", dashboardSWRConfig);
  const { data: keysData, isLoading: keysLoading } = useSWR<{ keys: ApiKey[] }>("/api/dashboard/keys", dashboardSWRConfig);
  const { data: plansData, isLoading: plansLoading } = useSWR<{ plans: typeof plans }>("/api/plans", dashboardSWRConfig);

  const loading = subLoading || keysLoading || plansLoading;

  // Derive local state from SWR data
  useEffect(() => {
    if (subData) setSubscriptions(subData.subscriptions || []);
  }, [subData]);
  useEffect(() => {
    if (keysData) setApiKeys(keysData.keys || []);
  }, [keysData]);
  useEffect(() => {
    if (plansData) setPlans(plansData.plans || []);
  }, [plansData]);

  async function handleCancel(subscriptionId: number) {
    setCancelTarget(subscriptionId);
  }

  async function confirmCancel() {
    if (cancelTarget === null) return;
    setActionLoading(cancelTarget);
    try {
      const res = await fetch("/api/dashboard/subscription", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscription_id: cancelTarget, action: "cancel" }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(prev => prev.map(s => s.id === cancelTarget ? { ...s, status: "cancelled" as const, auto_renew: 0 } : s));
        if (data.refund > 0) {
          showToast(lang === "zh" ? "订阅已取消，剩余金额已退还到余额" : "Cancelled. Remaining balance refunded.", "success");
        } else {
          showToast(lang === "zh" ? "订阅已取消" : "Subscription cancelled", "success");
        }
      }
    } catch { showToast(L.networkError, "error"); } finally { setActionLoading(null); setCancelTarget(null); }
  }

  async function handleToggleAutoRenew(subscriptionId: number) {
    setActionLoading(subscriptionId);
    try {
      const res = await fetch("/api/dashboard/subscription", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscription_id: subscriptionId, action: "toggle_auto_renew" }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(prev => prev.map(s => s.id === subscriptionId ? { ...s, auto_renew: data.auto_renew ? 1 : 0 } : s));
      }
    } catch { showToast(L.networkError, "error"); } finally { setActionLoading(null); }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement("textarea"); ta.value = text;
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    });
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  }

  async function handleChangePlan() {
    if (!activeSub || !upgradePlanId || upgradePlanId === activeSub.plan_id) return;
    setUpgradeLoading(true);
    try {
      const selectedPlan = plans.find(p => p.id === upgradePlanId);
      const isUpgrade = (selectedPlan?.tier || 0) > (plans.find(p => p.id === activeSub.plan_id)?.tier || 0);
      const res = await fetch("/api/dashboard/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscription_id: activeSub.id, action: isUpgrade ? "upgrade" : "downgrade", plan_id: upgradePlanId }),
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh subscriptions via SWR
        await mutateSub();
        setUpgradeOpen(false);
      } else {
        showToast(data.error || "Plan change failed", "error");
      }
    } catch { showToast(L.networkError, "error"); } finally { setUpgradeLoading(false); }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr + "Z").toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
  }

  const activeSub = subscriptions.find((s) => s.status === "active");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const modelTierLabel = (name: string) => {
    const map: Record<string, { zh: string; en: string }> = {
      spark: { zh: "基础模型", en: "Basic Models" },
      flare: { zh: "高级模型", en: "Advanced Models" },
      pulse: { zh: "旗舰模型", en: "Flagship Models" },
      nova: { zh: "全部模型", en: "All Models" },
    };
    return map[name]?.[lang] || name;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6"><h1 className="text-xl font-bold text-foreground">{L.title}</h1></div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : !activeSub ? (
        <Card><CardContent className="p-10 text-center">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">{L.noSub}</h3>
          <p className="text-sm text-muted-foreground mb-5">{L.noSubDesc}</p>
          <Link href="/token-plan"><Button>{L.browsePlans}</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {/* Plan Name Card — VIP Style */}
          <SubscriptionCard
            plan={{
              id: activeSub.plan_id,
              name: activeSub.plan_name,
              display_name: activeSub.plan_display_name,
              tagline: null,
              tier: 0,
              monthly_price: activeSub.plan_monthly_price,
              yearly_price: activeSub.plan_yearly_price,
              currency: activeSub.plan_currency,
              monthly_credits: activeSub.plan_monthly_credits,
              popular: 0,
              support_level: activeSub.plan_support_level,
              route_priority: "standard",
            }}
            lang={lang}
            variant="current"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${activeSub.status === 'active' ? 'bg-emerald-500/15 border border-emerald-500/20' : STATUS_CONFIG[activeSub.status]?.bg}`}>
                  {(() => { const I = STATUS_CONFIG[activeSub.status]?.icon || CheckCircle; return <I className={`h-3.5 w-3.5 ${activeSub.status === 'active' ? 'text-emerald-400' : STATUS_CONFIG[activeSub.status]?.color}`} />; })()}
                  <span className={`text-xs font-medium ${activeSub.status === 'active' ? 'text-emerald-400' : STATUS_CONFIG[activeSub.status]?.color}`}>{STATUS_CONFIG[activeSub.status]?.label[lang]}</span>
                </div>
                <span className="text-xs text-muted-foreground">{L.validUntil} {formatDate(activeSub.current_period_end)}</span>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={!!activeSub.auto_renew} onChange={() => handleToggleAutoRenew(activeSub.id)} disabled={actionLoading === activeSub.id} className="rounded border-border" />
                {L.autoRenew}
              </label>
            </div>
          </SubscriptionCard>

          {/* Usage */}
          <Card><CardContent className="p-5">
            <h3 className="text-sm font-medium text-foreground mb-3">{L.usage}</h3>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">{activeSub.credits_remaining.toLocaleString()} <span className="text-xs">credits</span> / {activeSub.credits_total.toLocaleString()} <span className="text-xs">credits</span></span>
              <span className="font-medium text-foreground">{activeSub.credits_total > 0 ? ((1 - activeSub.credits_remaining / activeSub.credits_total) * 100).toFixed(1) : 0}% {L.used}</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${activeSub.credits_total > 0 ? ((activeSub.credits_total - activeSub.credits_remaining) / activeSub.credits_total) * 100 : 0}%` }} />
            </div>
          </CardContent></Card>

          {/* API Key */}
          <Card><CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3"><Key className="h-4 w-4 text-amber-400" /><h3 className="text-sm font-medium text-foreground">{L.apiKey}</h3></div>
            <p className="text-xs text-muted-foreground mb-3">{L.quickStart}</p>
            {apiKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {lang === "zh" ? "暂无 API Key，请先创建。" : "No API Key yet. Create one first."}{" "}
                <Link href="/dashboard/keys" className="text-primary hover:underline">{lang === "zh" ? "前往管理" : "Go to API Keys"}</Link>
              </p>
            ) : (
              <div className="space-y-2">
                {apiKeys.slice(0, 3).map((k) => (
                  <div key={k.id} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                    <span className="text-xs text-muted-foreground shrink-0 w-16 truncate">{k.name}</span>
                    <code className="flex-1 text-sm font-mono text-foreground break-all">
                      {k.key_value}
                    </code>
                    <button onClick={() => handleCopy(k.key_value, `key-${k.id}`)} className="shrink-0" aria-label="Copy API key">
                      {copied === `key-${k.id}` ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">{L.apiKeyHint}</p>
          </CardContent></Card>

          {/* Base URLs */}
          <Card><CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3"><Globe className="h-4 w-4 text-amber-400" /><h3 className="text-sm font-medium text-foreground">{L.baseUrl}</h3></div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground shrink-0">{L.openai}</span>
                <code className="flex-1 text-xs font-mono text-foreground truncate">{baseUrl}/api/v1</code>
                <button onClick={() => handleCopy(`${baseUrl}/api/v1`, "oai")} className="shrink-0" aria-label="Copy OpenAI base URL">
                  {copied === "oai" ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />}
                </button>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
                <span className="text-xs text-muted-foreground shrink-0">{L.anthropic}</span>
                <code className="flex-1 text-xs font-mono text-foreground truncate">{baseUrl}/api/v1/messages</code>
                <button onClick={() => handleCopy(`${baseUrl}/api/v1/messages`, "ant")} className="shrink-0" aria-label="Copy Anthropic base URL">
                  {copied === "ant" ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />}
                </button>
              </div>
            </div>
          </CardContent></Card>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {activeSub.status === "active" && (
              <>
                <Button variant="outline" size="sm" onClick={() => { setUpgradeOpen(true); setUpgradePlanId(0); }}>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />{L.changePlan}
                </Button>
                <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300" onClick={() => handleCancel(activeSub.id)} disabled={actionLoading === activeSub.id}>
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />{L.cancel}
                </Button>
              </>
            )}
            <Link href="/token-plan"><Button variant="outline" size="sm">{L.browsePlans}</Button></Link>
          </div>

          {/* Past subscriptions */}
          {subscriptions.filter(s => s.id !== activeSub.id).length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.pastSubs}</h3>
              <div className="space-y-2">
                {subscriptions.filter(s => s.id !== activeSub.id).map(sub => {
                  const st = STATUS_CONFIG[sub.status] || STATUS_CONFIG.expired;
                  const I = st.icon;
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                      <div className="flex items-center gap-2"><I className={`h-4 w-4 ${st.color}`} /><span className="text-sm text-foreground">{sub.plan_display_name}</span><span className="text-xs text-muted-foreground">{formatDate(sub.created_at)}</span></div>
                      <span className={`text-xs ${st.color}`}>{st.label[lang]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
        title={lang === "zh" ? "取消订阅" : "Cancel Subscription"}
        message={lang === "zh" ? "确定要取消订阅吗？当前周期结束后将不再续费，已使用的额度不受影响。" : "Cancel subscription? It remains active until the end of the current period. Used credits are unaffected."}
        onConfirm={confirmCancel}
        confirmLabel={lang === "zh" ? "确认取消" : "Confirm Cancel"}
        variant="danger"
        loading={actionLoading !== null}
      />

      {/* Change Plan Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={(open) => { if (!open) setUpgradeOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{L.changePlan}</DialogTitle>
            <DialogDescription>{L.changePlanConfirm}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm text-foreground mb-1.5 block">{L.selectNewPlan}</label>
              <select
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none"
                value={upgradePlanId}
                onChange={e => setUpgradePlanId(+e.target.value)}
              >
                <option value={0}>{L.selectNewPlan}</option>
                {plans.filter(p => p.id !== activeSub?.plan_id).map(p => (
                  <option key={p.id} value={p.id}>{p.display_name} — {p.monthly_credits.toLocaleString()} credits / ${p.monthly_price}/mo</option>
                ))}
              </select>
            </div>
            {upgradePlanId > 0 && activeSub && (() => {
              const currentPlan = plans.find(p => p.id === activeSub.plan_id);
              const newPlan = plans.find(p => p.id === upgradePlanId);
              const isUpgrade = (newPlan?.tier || 0) > (currentPlan?.tier || 0);
              return (
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">{currentPlan?.display_name}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{newPlan?.display_name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isUpgrade ? L.upgrade : L.downgrade} • {L.proratedCredits}: {activeSub.credits_remaining.toLocaleString()} → {newPlan?.monthly_credits.toLocaleString()} + prorated
                  </div>
                </div>
              );
            })()}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setUpgradeOpen(false)}>{L.cancel}</Button>
              <Button onClick={handleChangePlan} disabled={upgradeLoading || !upgradePlanId || upgradePlanId === activeSub?.plan_id}>
                {upgradeLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                {upgradeLoading ? L.changing : L.changePlan}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

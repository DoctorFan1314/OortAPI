"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/contexts/toast-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { cn } from "@/lib/utils";
import {
  Plus, Pencil, Trash2, Save, Loader2,
  Link as LinkIcon, Unlink, Users, DollarSign,
  TrendingUp, Star, Crown, Zap, Sparkles,
} from "lucide-react";

interface Plan {
  id: number; name: string; display_name: string; tagline: string | null; tier: number;
  monthly_price: number; yearly_price: number; currency: string; monthly_credits: number;
  first_purchase_discount: number; overage_rate_multiplier: number;
  max_concurrency: number; route_priority: string; off_peak_discount: number;
  support_level: string; enabled: number; popular: number;
  created_at: string; updated_at: string;
}
interface PlanModel { id: number; plan_id: number; model_name: string; enabled: number; }
interface PlanStat {
  plan_id: number; plan_name: string; active_subs: number;
  monthly_revenue: number; credits_used: number; credits_usage_rate: number;
}

// Match token-plan tier colors from globals.css (--plan-{tier}-from/to)
const TIER_MAP: Record<number, { name: string; gradient: string; accent: string; icon: typeof Zap }> = {
  1: { name: "spark", gradient: "gradient-spark", accent: "var(--plan-spark-from)", icon: Zap },
  2: { name: "flare", gradient: "gradient-flare", accent: "var(--plan-flare-from)", icon: Sparkles },
  3: { name: "pulse", gradient: "gradient-pulse", accent: "var(--plan-pulse-from)", icon: Star },
  4: { name: "nova",  gradient: "gradient-nova",  accent: "var(--plan-nova-from)",  icon: Crown },
};

function getTier(tier: number) {
  return TIER_MAP[tier] || TIER_MAP[1];
}

const ROUTE_LABELS: Record<string, { zh: string; en: string }> = {
  standard: { zh: "标准", en: "Standard" },
  priority: { zh: "优先", en: "Priority" },
  ultra: { zh: "极速", en: "Ultra" },
  exclusive: { zh: "专属", en: "Exclusive" },
};
const SUPPORT_LABELS: Record<string, { zh: string; en: string }> = {
  community: { zh: "社区", en: "Community" },
  email: { zh: "邮件", en: "Email" },
  priority: { zh: "优先", en: "Priority" },
  dedicated: { zh: "专属", en: "Dedicated" },
};

export default function AdminPlansPage() {
  return <AdminPlansContent />;
}

function AdminPlansContent() {
  const { lang, t } = useI18n();
  const L = t.dashboard;
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // SWR for plans, settings, stats, and models
  const { data: plansData, mutate: mutatePlans } = useSWR<{ plans?: Plan[] }>(
    "/api/dashboard/admin/plans", dashboardSWRConfig,
  );
  const { data: settingsData } = useSWR<{ settings?: { exchange_rate?: string } }>(
    "/api/dashboard/settings", dashboardSWRConfig,
  );
  const { data: statsData } = useSWR<{ stats?: PlanStat[]; total_subs?: number; total_monthly_revenue?: number }>(
    "/api/dashboard/admin/plans?action=stats", dashboardSWRConfig,
  );
  const { data: modelsData } = useSWR<{ data?: { id: string }[]; models?: { id: string }[] }>(
    "/api/v1/models", dashboardSWRConfig,
  );
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editTab, setEditTab] = useState("basic");
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modelDialogPlan, setModelDialogPlan] = useState<Plan | null>(null);
  const [planModels, setPlanModels] = useState<PlanModel[]>([]);
  const [newModel, setNewModel] = useState("");
  const [modelLoading, setModelLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState<string>("CNY");
  const [exchangeRate, setExchangeRate] = useState(7.3);
  const [planStats, setPlanStats] = useState<PlanStat[]>([]);
  const [totalSubs, setTotalSubs] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "", display_name: "", tagline: "",
    monthly_price: 0, yearly_price: 0, monthly_credits: 0,
    max_concurrency: 10, route_priority: "standard", currency: "CNY",
  });
  const [createSaving, setCreateSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    await mutatePlans();
  }, [mutatePlans]);

  // Sync SWR data into local state
  useEffect(() => {
    if (plansData?.plans) setPlans(plansData.plans);
    setLoading(!plansData);
  }, [plansData]);

  useEffect(() => {
    if (settingsData?.settings?.exchange_rate) {
      setExchangeRate(parseFloat(settingsData.settings.exchange_rate) || 7.3);
    }
  }, [settingsData]);

  useEffect(() => {
    if (statsData) {
      setPlanStats(statsData.stats || []);
      setTotalSubs(statsData.total_subs || 0);
      setTotalRevenue(statsData.total_monthly_revenue || 0);
    }
  }, [statsData]);

  useEffect(() => {
    if (modelsData) {
      const models = (modelsData.data || modelsData.models || []).map((m) => m.id);
      setAvailableModels(models);
    }
  }, [modelsData]);

  async function fetchPlanModels(planId: number) {
    try {
      const res = await fetch(`/api/dashboard/admin/plans/${planId}/models`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setPlanModels(d.models || []); }
    } catch {}
  }

  function sym(cur: string) { return cur === "CNY" ? "¥" : "$"; }

  function convertPrice(price: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return price;
    if (fromCurrency === "CNY" && toCurrency === "USD") return price / exchangeRate;
    if (fromCurrency === "USD" && toCurrency === "CNY") return price * exchangeRate;
    return price;
  }

  function fmtDisplay(price: number, planCurrency: string): string {
    const converted = convertPrice(price, planCurrency, displayCurrency);
    return `${sym(displayCurrency)}${converted.toFixed(2)}`;
  }

  function fmtOriginal(price: number, planCurrency: string): string {
    return `${sym(planCurrency)}${price.toFixed(2)}`;
  }

  async function handleSave() {
    if (!editPlan) return; setEditSaving(true);
    try {
      const res = await fetch("/api/dashboard/admin/plans", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(editPlan),
      });
      if (res.ok) { setEditPlan(null); await fetchPlans(); showToast(L.saved, "success"); }
      else { const data = await res.json().catch(() => ({})); showToast(data.error || L.saveFailed, "error"); }
    } catch { showToast(L.networkError, "error"); } finally { setEditSaving(false); }
  }

  async function handleDelete() {
    if (!deletePlan) return; setDeleteLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/plans?id=${deletePlan.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setDeletePlan(null); await fetchPlans(); showToast(L.deleted, "success"); }
      else { showToast(L.deleteFailed, "error"); }
    } catch { showToast(L.networkError, "error"); } finally { setDeleteLoading(false); }
  }

  async function handleAddModel() {
    if (!modelDialogPlan || !newModel.trim()) return; setModelLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/plans/${modelDialogPlan.id}/models`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ model_name: newModel.trim() }),
      });
      if (res.ok) { setNewModel(""); await fetchPlanModels(modelDialogPlan.id); }
      else { showToast(L.addModelFailed, "error"); }
    } catch { showToast(L.networkError, "error"); } finally { setModelLoading(false); }
  }

  async function handleRemoveModel(modelName: string) {
    if (!modelDialogPlan) return; setModelLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/plans/${modelDialogPlan.id}/models?model=${encodeURIComponent(modelName)}`, { method: "DELETE", credentials: "include" });
      if (res.ok) await fetchPlanModels(modelDialogPlan.id);
      else showToast(L.removeModelFailed, "error");
    } catch { showToast(L.networkError, "error"); } finally { setModelLoading(false); }
  }

  async function handleCreate() {
    setCreateSaving(true);
    try {
      const tier = plans.length > 0 ? Math.min(4, Math.max(...plans.map(p => p.tier)) + 1) : 1;
      const res = await fetch("/api/dashboard/admin/plans", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ ...createForm, tier }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setCreateForm({
          name: "", display_name: "", tagline: "",
          monthly_price: 0, yearly_price: 0, monthly_credits: 0,
          max_concurrency: 10, route_priority: "standard", currency: "CNY",
        });
        await fetchPlans();
        showToast(L.planCreated, "success");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || L.createFailed, "error");
      }
    } catch { showToast(L.networkError, "error"); } finally { setCreateSaving(false); }
  }

  const arpu = totalSubs > 0 ? totalRevenue / totalSubs : 0;

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-muted-foreground">{L.adminAccessRequired}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {L.planManage}
          </h1>
          <p className="text-sm text-muted-foreground">
            {L.manageSubPlans}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)} disabled={plans.length >= 4}>
            <Plus className="h-4 w-4 mr-1" />
            {plans.length >= 4
              ? L.maxPlans
              : L.createPlan}
          </Button>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-full">
            <button
              onClick={() => setDisplayCurrency("USD")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                displayCurrency === "USD" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={L.switchToUsd}
            >
              $ USD
            </button>
            <button
              onClick={() => setDisplayCurrency("CNY")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                displayCurrency === "CNY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={L.switchToCny}
            >
              {"¥"} CNY
            </button>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      {!loading && planStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{L.activeSubs}</p>
                <p className="text-lg font-bold font-mono">{totalSubs}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{L.monthlyRevenue}</p>
                <p className="text-lg font-bold font-mono">{fmtDisplay(totalRevenue, "CNY")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <TrendingUp className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{L.planCount}</p>
                <p className="text-lg font-bold font-mono">{plans.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Crown className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{L.avgArpu}</p>
                <p className="text-lg font-bold font-mono">{fmtDisplay(arpu, "CNY")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card><CardContent className="p-10 text-center">
          <p className="text-muted-foreground">{L.noPlans}</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map(plan => {
            const tier = getTier(plan.tier);
            const TierIcon = tier.icon;
            const stat = planStats.find(s => s.plan_id === plan.id);
            const usageRate = stat?.credits_usage_rate || 0;

            const isPopular = plan.popular === 1;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-xl overflow-hidden transition-all duration-300 bg-card border",
                  !plan.enabled && "opacity-50 grayscale",
                  isPopular ? "border-transparent" : "border-border/50",
                )}
                style={isPopular ? {
                  boxShadow: `0 0 0 1.5px ${tier.accent}, 0 0 16px color-mix(in srgb, ${tier.accent} 20%, transparent)`,
                } : undefined}
              >
                {/* Gradient top bar */}
                <div className={cn("h-1", tier.gradient)} />

                <div className="p-5 space-y-4">
                  {/* Header: name + price */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `color-mix(in srgb, ${tier.accent} 12%, transparent)` }}>
                        <TierIcon className="h-4.5 w-4.5" style={{ color: tier.accent }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-foreground">{plan.display_name}</h3>
                          {isPopular && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: `color-mix(in srgb, ${tier.accent} 15%, transparent)`, color: tier.accent }}>
                              {L.mostPopular}
                            </span>
                          )}
                          {!plan.enabled && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{plan.tagline || plan.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold" style={{ color: tier.accent }}>
                        {fmtDisplay(plan.monthly_price, plan.currency)}
                        <span className="text-xs font-normal text-muted-foreground">{L.pricePerMonth}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDisplay(plan.yearly_price, plan.currency)}{L.pricePerYear}
                      </p>
                    </div>
                  </div>

                  {/* Credits — prominent */}
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: `color-mix(in srgb, ${tier.accent} 6%, transparent)` }}>
                    <span className="text-sm font-semibold" style={{ color: tier.accent }}>
                      {plan.monthly_credits.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">Credits / {L.monthShort}</span>
                  </div>

                  {/* Stats row */}
                  {stat && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {stat.active_subs} {L.subs}
                        </span>
                        <span>{L.usageRate} {usageRate}%</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {fmtDisplay(stat.monthly_revenue, plan.currency)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${usageRate}%`, backgroundColor: tier.accent }} />
                      </div>
                    </div>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: L.concurrency, value: plan.max_concurrency },
                      { label: L.route, value: ROUTE_LABELS[plan.route_priority]?.[lang] || plan.route_priority },
                      { label: L.support, value: SUPPORT_LABELS[plan.support_level]?.[lang] || plan.support_level },
                    ].map(item => (
                      <div key={item.label} className="p-2 rounded-lg bg-muted/30">
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setModelDialogPlan(plan); setNewModel(""); fetchPlanModels(plan.id); }}>
                      <LinkIcon className="h-3.5 w-3.5 mr-1" />{L.models}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditPlan({ ...plan }); setEditTab("basic"); }}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />{L.edit}
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setDeletePlan(plan)} aria-label={L.deletePlanItem.replace("{name}", plan.display_name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{L.createPlan}</DialogTitle>
            <DialogDescription>{L.enterPlanDetails}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{L.planName}</label>
                <Input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} placeholder="spark" className="h-10" autoFocus />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{L.displayName}</label>
                <Input value={createForm.display_name} onChange={e => setCreateForm({ ...createForm, display_name: e.target.value })} placeholder="Lite" className="h-10" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">{L.tagline}</label>
              <Input value={createForm.tagline} onChange={e => setCreateForm({ ...createForm, tagline: e.target.value })} placeholder={L.taglinePlaceholder} className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{L.monthlyPrice}</label>
                <Input type="number" step="0.01" value={createForm.monthly_price} onChange={e => setCreateForm({ ...createForm, monthly_price: Math.max(0, +e.target.value || 0) })} className="h-10" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{L.yearlyPrice}</label>
                <Input type="number" step="0.01" value={createForm.yearly_price} onChange={e => setCreateForm({ ...createForm, yearly_price: Math.max(0, +e.target.value || 0) })} className="h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{L.monthlyCredits}</label>
                <Input type="number" value={createForm.monthly_credits} onChange={e => setCreateForm({ ...createForm, monthly_credits: Math.max(0, +e.target.value || 0) })} className="h-10" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{L.maxConcurrency}</label>
                <Input type="number" value={createForm.max_concurrency} onChange={e => setCreateForm({ ...createForm, max_concurrency: +e.target.value || 10 })} className="h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{L.routePriority}</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={createForm.route_priority} onChange={e => setCreateForm({ ...createForm, route_priority: e.target.value })}>
                  {Object.entries(ROUTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{L.currency}</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={createForm.currency} onChange={e => setCreateForm({ ...createForm, currency: e.target.value })}>
                  <option value="CNY">CNY (&#165;)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{L.cancel}</Button>
              <Button onClick={handleCreate} disabled={createSaving || !createForm.name || !createForm.display_name}>
                {createSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
                {L.create}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog — Tabbed */}
      <Dialog open={!!editPlan} onOpenChange={() => setEditPlan(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{L.editPlan}</DialogTitle>
            <DialogDescription>{editPlan?.display_name}</DialogDescription>
          </DialogHeader>
          {editPlan && (
            <div className="space-y-5">
              <Tabs value={editTab} onValueChange={setEditTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">
                    {L.basicInfo}
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="flex-1">
                    {L.pricingTab}
                  </TabsTrigger>
                  <TabsTrigger value="limits" className="flex-1">
                    {L.limitsTab}
                  </TabsTrigger>
                  <TabsTrigger value="routing" className="flex-1">
                    {L.routingTab}
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Basic Info */}
                <TabsContent value="basic" className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{L.displayName}</label>
                      <Input value={editPlan.display_name} onChange={e => setEditPlan({ ...editPlan, display_name: e.target.value })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{L.tagline}</label>
                      <Input value={editPlan.tagline || ""} onChange={e => setEditPlan({ ...editPlan, tagline: e.target.value })} className="h-10" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Switch checked={!!editPlan.popular} onCheckedChange={(v: boolean) => setEditPlan({ ...editPlan, popular: v ? 1 : 0 })} />
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      Popular
                    </label>
                    <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Switch checked={!!editPlan.enabled} onCheckedChange={(v: boolean) => setEditPlan({ ...editPlan, enabled: v ? 1 : 0 })} />
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      Enabled
                    </label>
                  </div>
                </TabsContent>

                {/* Tab 2: Pricing */}
                <TabsContent value="pricing" className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{L.currency}</label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={editPlan.currency} onChange={e => setEditPlan({ ...editPlan, currency: e.target.value })}>
                        <option value="CNY">CNY (&#165;)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{L.monthlyCredits}</label>
                      <Input type="number" value={editPlan.monthly_credits} onChange={e => setEditPlan({ ...editPlan, monthly_credits: Math.max(0, +e.target.value || 0) })} className="h-10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        {L.monthlyPriceLabel.replace("{currency}", sym(editPlan.currency))}
                      </label>
                      <Input type="number" step="0.01" value={editPlan.monthly_price} onChange={e => setEditPlan({ ...editPlan, monthly_price: Math.max(0, +e.target.value || 0) })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        {L.yearlyPriceLabel.replace("{currency}", sym(editPlan.currency))}
                      </label>
                      <Input type="number" step="0.01" value={editPlan.yearly_price} onChange={e => setEditPlan({ ...editPlan, yearly_price: Math.max(0, +e.target.value || 0) })} className="h-10" />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    {L.previewLabel}
                    {sym(editPlan.currency)}{editPlan.monthly_price || "0"}{L.pricePerMonth}{" "}
                    {"·"} {sym(editPlan.currency)}{editPlan.yearly_price || "0"}{L.pricePerYear}
                    {editPlan.currency !== displayCurrency && (
                      <span className="ml-2">
                        ({fmtDisplay(editPlan.monthly_price, editPlan.currency)}{L.pricePerMonth}{" "}
                        {"·"} {fmtDisplay(editPlan.yearly_price, editPlan.currency)}{L.pricePerYear})
                      </span>
                    )}
                  </div>
                </TabsContent>

                {/* Tab 3: Limits */}
                <TabsContent value="limits" className="pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{L.firstPurchase}</label>
                      <Input type="number" step="0.01" value={editPlan.first_purchase_discount} onChange={e => setEditPlan({ ...editPlan, first_purchase_discount: +e.target.value || 0 })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{L.overageRate}</label>
                      <Input type="number" step="0.01" value={editPlan.overage_rate_multiplier} onChange={e => setEditPlan({ ...editPlan, overage_rate_multiplier: +e.target.value || 0 })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{L.maxConcurrency}</label>
                      <Input type="number" value={editPlan.max_concurrency} onChange={e => setEditPlan({ ...editPlan, max_concurrency: +e.target.value || 0 })} className="h-10" />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 4: Routing */}
                <TabsContent value="routing" className="pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{L.routePriority}</label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={editPlan.route_priority} onChange={e => setEditPlan({ ...editPlan, route_priority: e.target.value })}>
                        {Object.entries(ROUTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{L.offPeakDiscount}</label>
                      <Input type="number" step="0.05" value={editPlan.off_peak_discount} onChange={e => setEditPlan({ ...editPlan, off_peak_discount: +e.target.value || 0 })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{L.supportLevel}</label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={editPlan.support_level} onChange={e => setEditPlan({ ...editPlan, support_level: e.target.value })}>
                        {Object.entries(SUPPORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
                      </select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditPlan(null)}>{L.cancel}</Button>
                <Button onClick={handleSave} disabled={editSaving}>
                  {editSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                  {L.save}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletePlan}
        onOpenChange={() => setDeletePlan(null)}
        title={L.deletePlan}
        message={deletePlan ? L.deletePlanConfirm.replace("{name}", deletePlan.display_name) : ""}
        onConfirm={handleDelete}
        confirmLabel={L.confirmDelete}
        variant="danger"
        loading={deleteLoading}
      />

      {/* Models Dialog — with autocomplete */}
      <Dialog open={!!modelDialogPlan} onOpenChange={() => setModelDialogPlan(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {L.manageModels}
              {planModels.length > 0 && (
                <Badge variant="outline" className="ml-2 text-[10px]">
                  {planModels.length}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>{modelDialogPlan?.display_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder={L.modelNamePH}
                  value={newModel}
                  onChange={e => setNewModel(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddModel()}
                  list="available-models"
                  className="h-10"
                />
                <datalist id="available-models">
                  {availableModels
                    .filter(m => !newModel || m.toLowerCase().includes(newModel.toLowerCase()))
                    .slice(0, 20)
                    .map(m => <option key={m} value={m} />)}
                </datalist>
              </div>
              <Button onClick={handleAddModel} disabled={modelLoading || !newModel.trim()} className="h-10" aria-label={L.addModel}>
                {modelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {planModels.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">
                  {L.noModelsBound}
                </p>
              ) : planModels.map(pm => (
                <div key={pm.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm font-mono text-foreground">{pm.model_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 h-7 px-2"
                    onClick={() => handleRemoveModel(pm.model_name)}
                    disabled={modelLoading}
                  >
                    <Unlink className="h-3.5 w-3.5 mr-1" />
                    {L.remove}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

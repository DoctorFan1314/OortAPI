"use client";

import { useState, useEffect, useCallback } from "react";
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
  const { lang } = useI18n();
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
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
    try {
      const [planRes, settingsRes, statsRes] = await Promise.all([
        fetch("/api/dashboard/admin/plans", { credentials: "include" }),
        fetch("/api/dashboard/settings", { credentials: "include" }),
        fetch("/api/dashboard/admin/plans?action=stats", { credentials: "include" }),
      ]);
      if (planRes.ok) { const d = await planRes.json(); setPlans(d.plans || []); }
      if (settingsRes.ok) {
        const d = await settingsRes.json();
        const rate = d.settings?.find((s: { key: string }) => s.key === "exchange_rate");
        if (rate) setExchangeRate(parseFloat(rate.value) || 7.3);
      }
      if (statsRes.ok) {
        const d = await statsRes.json();
        setPlanStats(d.stats || []);
        setTotalSubs(d.total_subs || 0);
        setTotalRevenue(d.total_monthly_revenue || 0);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  const fetchAvailableModels = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/models", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        const models = (d.data || d.models || []).map((m: { id: string }) => m.id);
        setAvailableModels(models);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchPlans(); fetchAvailableModels(); }, [fetchPlans, fetchAvailableModels]);

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
      if (res.ok) { setEditPlan(null); await fetchPlans(); showToast(lang === "zh" ? "已保存" : "Saved", "success"); }
      else { const data = await res.json().catch(() => ({})); showToast(data.error || (lang === "zh" ? "保存失败" : "Save failed"), "error"); }
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); } finally { setEditSaving(false); }
  }

  async function handleDelete() {
    if (!deletePlan) return; setDeleteLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/plans?id=${deletePlan.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setDeletePlan(null); await fetchPlans(); showToast(lang === "zh" ? "已删除" : "Deleted", "success"); }
      else { showToast(lang === "zh" ? "删除失败" : "Delete failed", "error"); }
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); } finally { setDeleteLoading(false); }
  }

  async function handleAddModel() {
    if (!modelDialogPlan || !newModel.trim()) return; setModelLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/plans/${modelDialogPlan.id}/models`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ model_name: newModel.trim() }),
      });
      if (res.ok) { setNewModel(""); await fetchPlanModels(modelDialogPlan.id); }
      else { showToast(lang === "zh" ? "添加失败" : "Failed to add model", "error"); }
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); } finally { setModelLoading(false); }
  }

  async function handleRemoveModel(modelName: string) {
    if (!modelDialogPlan) return; setModelLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/plans/${modelDialogPlan.id}/models?model=${encodeURIComponent(modelName)}`, { method: "DELETE", credentials: "include" });
      if (res.ok) await fetchPlanModels(modelDialogPlan.id);
      else showToast(lang === "zh" ? "删除失败" : "Failed to remove model", "error");
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); } finally { setModelLoading(false); }
  }

  async function handleCreate() {
    setCreateSaving(true);
    try {
      const tier = plans.length > 0 ? Math.max(...plans.map(p => p.tier)) + 1 : 1;
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
        showToast(lang === "zh" ? "套餐已创建" : "Plan created", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || (lang === "zh" ? "创建失败" : "Create failed"), "error");
      }
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); } finally { setCreateSaving(false); }
  }

  const arpu = totalSubs > 0 ? totalRevenue / totalSubs : 0;

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-muted-foreground">{lang === "zh" ? "需要管理员权限" : "Admin access required"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {lang === "zh" ? "套餐管理" : "Plan Management"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "zh" ? "管理订阅套餐方案" : "Manage subscription plans"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)} disabled={plans.length >= 4}>
            <Plus className="h-4 w-4 mr-1" />
            {plans.length >= 4
              ? (lang === "zh" ? "最多 4 个套餐" : "Max 4 plans")
              : (lang === "zh" ? "创建套餐" : "Create Plan")}
          </Button>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-full">
            <button
              onClick={() => setDisplayCurrency("USD")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                displayCurrency === "USD" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={lang === "zh" ? "切换为美元显示" : "Switch to USD display"}
            >
              $ USD
            </button>
            <button
              onClick={() => setDisplayCurrency("CNY")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer",
                displayCurrency === "CNY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={lang === "zh" ? "切换为人民币显示" : "Switch to CNY display"}
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
                <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "活跃订阅" : "Active Subs"}</p>
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
                <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "月收入" : "Monthly Revenue"}</p>
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
                <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "套餐数" : "Plans"}</p>
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
                <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "平均 ARPU" : "Avg ARPU"}</p>
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
          <p className="text-muted-foreground">{lang === "zh" ? "暂无套餐" : "No plans"}</p>
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
                              {lang === "zh" ? "最受欢迎" : "Popular"}
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
                        <span className="text-xs font-normal text-muted-foreground">{lang === "zh" ? "/月" : "/mo"}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fmtDisplay(plan.yearly_price, plan.currency)}{lang === "zh" ? "/年" : "/yr"}
                      </p>
                    </div>
                  </div>

                  {/* Credits — prominent */}
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: `color-mix(in srgb, ${tier.accent} 6%, transparent)` }}>
                    <span className="text-sm font-semibold" style={{ color: tier.accent }}>
                      {plan.monthly_credits.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">Credits / {lang === "zh" ? "月" : "mo"}</span>
                  </div>

                  {/* Stats row */}
                  {stat && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {stat.active_subs} {lang === "zh" ? "订阅" : "subs"}
                        </span>
                        <span>{lang === "zh" ? "使用率" : "Usage"} {usageRate}%</span>
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
                      { label: lang === "zh" ? "并发" : "Concurrency", value: plan.max_concurrency },
                      { label: lang === "zh" ? "路由" : "Route", value: ROUTE_LABELS[plan.route_priority]?.[lang] || plan.route_priority },
                      { label: lang === "zh" ? "支持" : "Support", value: SUPPORT_LABELS[plan.support_level]?.[lang] || plan.support_level },
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
                      <LinkIcon className="h-3.5 w-3.5 mr-1" />{lang === "zh" ? "模型" : "Models"}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditPlan({ ...plan }); setEditTab("basic"); }}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />{lang === "zh" ? "编辑" : "Edit"}
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setDeletePlan(plan)} aria-label={lang === "zh" ? `删除 ${plan.display_name}` : `Delete ${plan.display_name}`}>
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
            <DialogTitle>{lang === "zh" ? "创建套餐" : "Create Plan"}</DialogTitle>
            <DialogDescription>{lang === "zh" ? "填写新套餐信息" : "Enter new plan details"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "名称" : "Name"}</label>
                <Input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} placeholder="spark" className="h-10" autoFocus />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "显示名称" : "Display Name"}</label>
                <Input value={createForm.display_name} onChange={e => setCreateForm({ ...createForm, display_name: e.target.value })} placeholder="Lite" className="h-10" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "标语" : "Tagline"}</label>
              <Input value={createForm.tagline} onChange={e => setCreateForm({ ...createForm, tagline: e.target.value })} placeholder={lang === "zh" ? "尝鲜入门" : "Great for getting started"} className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "月付价格" : "Monthly Price"}</label>
                <Input type="number" step="0.01" value={createForm.monthly_price} onChange={e => setCreateForm({ ...createForm, monthly_price: Math.max(0, +e.target.value || 0) })} className="h-10" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "年付价格" : "Yearly Price"}</label>
                <Input type="number" step="0.01" value={createForm.yearly_price} onChange={e => setCreateForm({ ...createForm, yearly_price: Math.max(0, +e.target.value || 0) })} className="h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "月 Credits" : "Monthly Credits"}</label>
                <Input type="number" value={createForm.monthly_credits} onChange={e => setCreateForm({ ...createForm, monthly_credits: Math.max(0, +e.target.value || 0) })} className="h-10" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "最大并发" : "Max Concurrency"}</label>
                <Input type="number" value={createForm.max_concurrency} onChange={e => setCreateForm({ ...createForm, max_concurrency: +e.target.value || 10 })} className="h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "路由优先级" : "Route Priority"}</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={createForm.route_priority} onChange={e => setCreateForm({ ...createForm, route_priority: e.target.value })}>
                  {Object.entries(ROUTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "货币" : "Currency"}</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={createForm.currency} onChange={e => setCreateForm({ ...createForm, currency: e.target.value })}>
                  <option value="CNY">CNY (&#165;)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{lang === "zh" ? "取消" : "Cancel"}</Button>
              <Button onClick={handleCreate} disabled={createSaving || !createForm.name || !createForm.display_name}>
                {createSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
                {lang === "zh" ? "创建" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog — Tabbed */}
      <Dialog open={!!editPlan} onOpenChange={() => setEditPlan(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{lang === "zh" ? "编辑套餐" : "Edit Plan"}</DialogTitle>
            <DialogDescription>{editPlan?.display_name}</DialogDescription>
          </DialogHeader>
          {editPlan && (
            <div className="space-y-5">
              <Tabs value={editTab} onValueChange={setEditTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">
                    {lang === "zh" ? "基本信息" : "Basic"}
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="flex-1">
                    {lang === "zh" ? "价格" : "Pricing"}
                  </TabsTrigger>
                  <TabsTrigger value="limits" className="flex-1">
                    {lang === "zh" ? "费率限制" : "Limits"}
                  </TabsTrigger>
                  <TabsTrigger value="routing" className="flex-1">
                    {lang === "zh" ? "路由支持" : "Routing"}
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Basic Info */}
                <TabsContent value="basic" className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "显示名称" : "Display Name"}</label>
                      <Input value={editPlan.display_name} onChange={e => setEditPlan({ ...editPlan, display_name: e.target.value })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "宣传语" : "Tagline"}</label>
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
                      <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "货币" : "Currency"}</label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={editPlan.currency} onChange={e => setEditPlan({ ...editPlan, currency: e.target.value })}>
                        <option value="CNY">CNY (&#165;)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "月 Credits" : "Monthly Credits"}</label>
                      <Input type="number" value={editPlan.monthly_credits} onChange={e => setEditPlan({ ...editPlan, monthly_credits: Math.max(0, +e.target.value || 0) })} className="h-10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        {lang === "zh" ? `月付价格 (${sym(editPlan.currency)})` : `Monthly (${sym(editPlan.currency)})`}
                      </label>
                      <Input type="number" step="0.01" value={editPlan.monthly_price} onChange={e => setEditPlan({ ...editPlan, monthly_price: Math.max(0, +e.target.value || 0) })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        {lang === "zh" ? `年付价格 (${sym(editPlan.currency)})` : `Yearly (${sym(editPlan.currency)})`}
                      </label>
                      <Input type="number" step="0.01" value={editPlan.yearly_price} onChange={e => setEditPlan({ ...editPlan, yearly_price: Math.max(0, +e.target.value || 0) })} className="h-10" />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    {lang === "zh" ? "预览：" : "Preview: "}
                    {sym(editPlan.currency)}{editPlan.monthly_price || "0"}{lang === "zh" ? "/月" : "/mo"}{" "}
                    {"·"} {sym(editPlan.currency)}{editPlan.yearly_price || "0"}{lang === "zh" ? "/年" : "/yr"}
                    {editPlan.currency !== displayCurrency && (
                      <span className="ml-2">
                        ({fmtDisplay(editPlan.monthly_price, editPlan.currency)}{lang === "zh" ? "/月" : "/mo"}{" "}
                        {"·"} {fmtDisplay(editPlan.yearly_price, editPlan.currency)}{lang === "zh" ? "/年" : "/yr"})
                      </span>
                    )}
                  </div>
                </TabsContent>

                {/* Tab 3: Limits */}
                <TabsContent value="limits" className="pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "首购折扣" : "First Purchase"}</label>
                      <Input type="number" step="0.01" value={editPlan.first_purchase_discount} onChange={e => setEditPlan({ ...editPlan, first_purchase_discount: +e.target.value || 0 })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "超出费率" : "Overage Rate"}</label>
                      <Input type="number" step="0.01" value={editPlan.overage_rate_multiplier} onChange={e => setEditPlan({ ...editPlan, overage_rate_multiplier: +e.target.value || 0 })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "最大并发" : "Concurrency"}</label>
                      <Input type="number" value={editPlan.max_concurrency} onChange={e => setEditPlan({ ...editPlan, max_concurrency: +e.target.value || 0 })} className="h-10" />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 4: Routing */}
                <TabsContent value="routing" className="pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "路由优先级" : "Route"}</label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={editPlan.route_priority} onChange={e => setEditPlan({ ...editPlan, route_priority: e.target.value })}>
                        {Object.entries(ROUTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "非高峰折扣" : "Off-Peak"}</label>
                      <Input type="number" step="0.05" value={editPlan.off_peak_discount} onChange={e => setEditPlan({ ...editPlan, off_peak_discount: +e.target.value || 0 })} className="h-10" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "技术支持" : "Support"}</label>
                      <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={editPlan.support_level} onChange={e => setEditPlan({ ...editPlan, support_level: e.target.value })}>
                        {Object.entries(SUPPORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
                      </select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditPlan(null)}>{lang === "zh" ? "取消" : "Cancel"}</Button>
                <Button onClick={handleSave} disabled={editSaving}>
                  {editSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                  {lang === "zh" ? "保存" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletePlan}
        onOpenChange={() => setDeletePlan(null)}
        title={lang === "zh" ? "删除套餐" : "Delete Plan"}
        message={deletePlan ? (lang === "zh" ? `确定要删除「${deletePlan.display_name}」吗？` : `Delete "${deletePlan.display_name}"?`) : ""}
        onConfirm={handleDelete}
        confirmLabel={lang === "zh" ? "确认删除" : "Delete"}
        variant="danger"
        loading={deleteLoading}
      />

      {/* Models Dialog — with autocomplete */}
      <Dialog open={!!modelDialogPlan} onOpenChange={() => setModelDialogPlan(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {lang === "zh" ? "管理模型" : "Manage Models"}
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
                  placeholder={lang === "zh" ? "模型名称" : "Model name"}
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
              <Button onClick={handleAddModel} disabled={modelLoading || !newModel.trim()} className="h-10" aria-label={lang === "zh" ? "添加模型" : "Add model"}>
                {modelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {planModels.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">
                  {lang === "zh" ? "暂无绑定模型" : "No models bound"}
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
                    {lang === "zh" ? "移除" : "Remove"}
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

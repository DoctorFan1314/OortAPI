"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/contexts/toast-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Plus, Pencil, Trash2, Save, Loader2, Link as LinkIcon, Unlink, Users, DollarSign, TrendingUp } from "lucide-react";

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
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modelDialogPlan, setModelDialogPlan] = useState<Plan | null>(null);
  const [planModels, setPlanModels] = useState<PlanModel[]>([]);
  const [newModel, setNewModel] = useState("");
  const [modelLoading, setModelLoading] = useState(false);
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
  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  async function fetchPlanModels(planId: number) {
    try { const res = await fetch(`/api/dashboard/admin/plans/${planId}/models`, { credentials: "include" }); if (res.ok) { const d = await res.json(); setPlanModels(d.models || []); } } catch {}
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
      const res = await fetch("/api/dashboard/admin/plans", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(editPlan) });
      if (res.ok) { setEditPlan(null); await fetchPlans(); showToast(lang === "zh" ? "已保存" : "Saved", "success"); }
      else { const data = await res.json().catch(() => ({})); showToast(data.error || (lang === "zh" ? "保存失败" : "Save failed"), "error"); }
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); } finally { setEditSaving(false); }
  }

  async function handleDelete() {
    if (!deletePlan) return; setDeleteLoading(true);
    try { const res = await fetch(`/api/dashboard/admin/plans?id=${deletePlan.id}`, { method: "DELETE", credentials: "include" }); if (res.ok) { setDeletePlan(null); await fetchPlans(); showToast(lang === "zh" ? "已删除" : "Deleted", "success"); } else { showToast(lang === "zh" ? "删除失败" : "Delete failed", "error"); } } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); } finally { setDeleteLoading(false); }
  }

  async function handleAddModel() {
    if (!modelDialogPlan || !newModel.trim()) return; setModelLoading(true);
    try { const res = await fetch(`/api/dashboard/admin/plans/${modelDialogPlan.id}/models`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ model_name: newModel.trim() }) }); if (res.ok) { setNewModel(""); await fetchPlanModels(modelDialogPlan.id); } else { showToast(lang === "zh" ? "添加失败" : "Failed to add model", "error"); } } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); } finally { setModelLoading(false); }
  }

  async function handleRemoveModel(modelName: string) {
    if (!modelDialogPlan) return; setModelLoading(true);
    try { const res = await fetch(`/api/dashboard/admin/plans/${modelDialogPlan.id}/models?model=${encodeURIComponent(modelName)}`, { method: "DELETE", credentials: "include" }); if (res.ok) await fetchPlanModels(modelDialogPlan.id); else showToast(lang === "zh" ? "删除失败" : "Failed to remove model", "error"); } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); } finally { setModelLoading(false); }
  }

  async function handleCreate() {
    setCreateSaving(true);
    try {
      const tier = plans.length > 0 ? Math.max(...plans.map(p => p.tier)) + 1 : 1;
      const res = await fetch("/api/dashboard/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...createForm, tier }),
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
    } catch {
      showToast(lang === "zh" ? "网络错误" : "Network error", "error");
    } finally { setCreateSaving(false); }
  }

  const ROUTE_LABELS: Record<string, { zh: string; en: string }> = { standard: { zh: "标准", en: "Standard" }, priority: { zh: "优先", en: "Priority" }, ultra: { zh: "极速", en: "Ultra" }, exclusive: { zh: "专属", en: "Exclusive" } };
  const SUPPORT_LABELS: Record<string, { zh: string; en: string }> = { community: { zh: "社区", en: "Community" }, email: { zh: "邮件", en: "Email" }, priority: { zh: "优先", en: "Priority" }, dedicated: { zh: "专属", en: "Dedicated" } };

  if (user?.role !== "admin") return <div className="mx-auto max-w-5xl px-4 py-20 text-center"><p className="text-muted-foreground">{lang === "zh" ? "需要管理员权限" : "Admin access required"}</p></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-bold text-foreground">{lang === "zh" ? "套餐管理" : "Plan Management"}</h1><p className="text-sm text-muted-foreground">{lang === "zh" ? "管理订阅套餐方案" : "Manage subscription plans"}</p></div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" />{lang === "zh" ? "创建套餐" : "Create Plan"}</Button>
          <div className="flex items-center gap-1 p-1 bg-muted rounded-full">
            <button onClick={() => setDisplayCurrency("USD")} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${displayCurrency === "USD" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>$ USD</button>
            <button onClick={() => setDisplayCurrency("CNY")} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${displayCurrency === "CNY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>¥ CNY</button>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      {!loading && planStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "活跃订阅" : "Active Subs"}</p>
                <p className="text-lg font-bold font-mono">{totalSubs}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "月收入" : "Monthly Revenue"}</p>
                <p className="text-lg font-bold font-mono">{fmtDisplay(totalRevenue, "CNY")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "套餐数" : "Plans"}</p>
                <p className="text-lg font-bold font-mono">{plans.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div> : plans.length === 0 ? (
        <Card><CardContent className="p-10 text-center"><p className="text-muted-foreground">{lang === "zh" ? "暂无套餐" : "No plans"}</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <Card key={plan.id}><CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{plan.display_name}</h3>
                    {plan.popular === 1 && <Badge variant="outline" className="text-amber-400 border-amber-500/20 text-[10px]">Popular</Badge>}
                    {!plan.enabled && <Badge variant="outline" className="text-zinc-400 border-zinc-500/20 text-[10px]">Disabled</Badge>}
                    <Badge variant="outline" className="text-[10px]">{plan.currency}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.tagline || plan.name}</p>
                  <div className="text-[10px] text-muted-foreground/60 mt-1">
                    {new Date(plan.created_at).toLocaleDateString()} · {new Date(plan.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-5 text-sm">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "月付" : "Monthly"}</p>
                    <p className="font-medium text-foreground">{fmtDisplay(plan.monthly_price, plan.currency)}</p>
                    {plan.currency !== displayCurrency && <p className="text-[10px] text-muted-foreground">({fmtOriginal(plan.monthly_price, plan.currency)})</p>}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "年付" : "Yearly"}</p>
                    <p className="font-medium text-foreground">{fmtDisplay(plan.yearly_price, plan.currency)}</p>
                    {plan.currency !== displayCurrency && <p className="text-[10px] text-muted-foreground">({fmtOriginal(plan.yearly_price, plan.currency)})</p>}
                  </div>
                  <div className="text-center"><p className="text-[10px] text-muted-foreground">Credits</p><p className="font-medium text-foreground">{plan.monthly_credits.toLocaleString()}</p></div>
                  {planStats.find(s => s.plan_id === plan.id) && (
                    <>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "订阅数" : "Subs"}</p>
                        <p className="font-medium text-foreground">{planStats.find(s => s.plan_id === plan.id)?.active_subs || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">{lang === "zh" ? "使用率" : "Usage"}</p>
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${planStats.find(s => s.plan_id === plan.id)?.credits_usage_rate || 0}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{planStats.find(s => s.plan_id === plan.id)?.credits_usage_rate || 0}%</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setModelDialogPlan(plan); setNewModel(""); fetchPlanModels(plan.id); }}><LinkIcon className="h-3.5 w-3.5 mr-1" />{lang === "zh" ? "模型" : "Models"}</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditPlan({ ...plan })}><Pencil className="h-3.5 w-3.5 mr-1" />{lang === "zh" ? "编辑" : "Edit"}</Button>
                  <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300" onClick={() => setDeletePlan(plan)} aria-label={lang === "zh" ? "删除" : "Delete"}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{lang === "zh" ? "创建套餐" : "Create Plan"}</DialogTitle><DialogDescription>{lang === "zh" ? "填写新套餐信息" : "Enter new plan details"}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "名称" : "Name"}</label><Input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} placeholder="spark" className="h-10" autoFocus /></div>
              <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "显示名称" : "Display Name"}</label><Input value={createForm.display_name} onChange={e => setCreateForm({ ...createForm, display_name: e.target.value })} placeholder="Lite" className="h-10" /></div>
            </div>
            <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "标语" : "Tagline"}</label><Input value={createForm.tagline} onChange={e => setCreateForm({ ...createForm, tagline: e.target.value })} placeholder={lang === "zh" ? "尝鲜入门" : "Great for getting started"} className="h-10" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "月付价格" : "Monthly Price"}</label><Input type="number" step="0.01" value={createForm.monthly_price} onChange={e => setCreateForm({ ...createForm, monthly_price: +e.target.value || 0 })} className="h-10" /></div>
              <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "年付价格" : "Yearly Price"}</label><Input type="number" step="0.01" value={createForm.yearly_price} onChange={e => setCreateForm({ ...createForm, yearly_price: +e.target.value || 0 })} className="h-10" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "月 Credits" : "Monthly Credits"}</label><Input type="number" value={createForm.monthly_credits} onChange={e => setCreateForm({ ...createForm, monthly_credits: +e.target.value || 0 })} className="h-10" /></div>
              <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "最大并发" : "Max Concurrency"}</label><Input type="number" value={createForm.max_concurrency} onChange={e => setCreateForm({ ...createForm, max_concurrency: +e.target.value || 10 })} className="h-10" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "路由优先级" : "Route Priority"}</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={createForm.route_priority} onChange={e => setCreateForm({ ...createForm, route_priority: e.target.value })}>
                  {Object.entries(ROUTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
                </select>
              </div>
              <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "货币" : "Currency"}</label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={createForm.currency} onChange={e => setCreateForm({ ...createForm, currency: e.target.value })}>
                  <option value="CNY">CNY (¥)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>{lang === "zh" ? "取消" : "Cancel"}</Button>
              <Button onClick={handleCreate} disabled={createSaving || !createForm.name || !createForm.display_name}>{createSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}{lang === "zh" ? "创建" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPlan} onOpenChange={() => setEditPlan(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{lang === "zh" ? "编辑套餐" : "Edit Plan"}</DialogTitle><DialogDescription>{editPlan?.display_name}</DialogDescription></DialogHeader>
          {editPlan && (
            <div className="space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-5">
                <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "显示名称" : "Display Name"}</label><Input value={editPlan.display_name} onChange={e => setEditPlan({ ...editPlan, display_name: e.target.value })} className="h-10" autoFocus /></div>
                <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "宣传语" : "Tagline"}</label><Input value={editPlan.tagline || ""} onChange={e => setEditPlan({ ...editPlan, tagline: e.target.value })} className="h-10" /></div>
              </div>

              {/* Pricing */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-3">{lang === "zh" ? "价格设置" : "Pricing"}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "货币" : "Currency"}</label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={editPlan.currency} onChange={e => setEditPlan({ ...editPlan, currency: e.target.value })}>
                      <option value="CNY">CNY (¥)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "月 Credits" : "Monthly Credits"}</label><Input type="number" value={editPlan.monthly_credits} onChange={e => setEditPlan({ ...editPlan, monthly_credits: +e.target.value || 0 })} className="h-10" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? `月付价格 (${sym(editPlan.currency)})` : `Monthly (${sym(editPlan.currency)})`}</label><Input type="number" step="0.01" value={editPlan.monthly_price} onChange={e => setEditPlan({ ...editPlan, monthly_price: +e.target.value || 0 })} className="h-10" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? `年付价格 (${sym(editPlan.currency)})` : `Yearly (${sym(editPlan.currency)})`}</label><Input type="number" step="0.01" value={editPlan.yearly_price} onChange={e => setEditPlan({ ...editPlan, yearly_price: +e.target.value || 0 })} className="h-10" /></div>
                </div>
              </div>

              {/* Rate & Limits */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-3">{lang === "zh" ? "费率与限制" : "Rates & Limits"}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "首购折扣" : "First Purchase"}</label><Input type="number" step="0.01" value={editPlan.first_purchase_discount} onChange={e => setEditPlan({ ...editPlan, first_purchase_discount: +e.target.value || 0 })} className="h-10" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "超出费率" : "Overage Rate"}</label><Input type="number" step="0.01" value={editPlan.overage_rate_multiplier} onChange={e => setEditPlan({ ...editPlan, overage_rate_multiplier: +e.target.value || 0 })} className="h-10" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "最大并发" : "Concurrency"}</label><Input type="number" value={editPlan.max_concurrency} onChange={e => setEditPlan({ ...editPlan, max_concurrency: +e.target.value || 0 })} className="h-10" /></div>
                </div>
              </div>

              {/* Routing & Support */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-3">{lang === "zh" ? "路由与支持" : "Routing & Support"}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "路由优先级" : "Route"}</label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={editPlan.route_priority} onChange={e => setEditPlan({ ...editPlan, route_priority: e.target.value })}>
                      {Object.entries(ROUTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
                    </select>
                  </div>
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "非高峰折扣" : "Off-Peak"}</label><Input type="number" step="0.05" value={editPlan.off_peak_discount} onChange={e => setEditPlan({ ...editPlan, off_peak_discount: +e.target.value || 0 })} className="h-10" /></div>
                  <div><label className="text-sm text-muted-foreground mb-1.5 block">{lang === "zh" ? "技术支持" : "Support"}</label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={editPlan.support_level} onChange={e => setEditPlan({ ...editPlan, support_level: e.target.value })}>
                      {Object.entries(SUPPORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v[lang]}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editPlan.popular} onChange={e => setEditPlan({ ...editPlan, popular: e.target.checked ? 1 : 0 })} />Popular</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editPlan.enabled} onChange={e => setEditPlan({ ...editPlan, enabled: e.target.checked ? 1 : 0 })} />Enabled</label>
              </div>

              {/* Price preview */}
              <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                {lang === "zh" ? "预览：" : "Preview: "}{sym(editPlan.currency)}{editPlan.monthly_price || "0"}{lang === "zh" ? "/月" : "/mo"} · {sym(editPlan.currency)}{editPlan.yearly_price || "0"}{lang === "zh" ? "/年" : "/yr"}
                {editPlan.currency !== displayCurrency && (
                  <span className="ml-2">({fmtDisplay(editPlan.monthly_price, editPlan.currency)}{lang === "zh" ? "/月" : "/mo"} · {fmtDisplay(editPlan.yearly_price, editPlan.currency)}{lang === "zh" ? "/年" : "/yr"})</span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditPlan(null)}>{lang === "zh" ? "取消" : "Cancel"}</Button>
                <Button onClick={handleSave} disabled={editSaving}>{editSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}{lang === "zh" ? "保存" : "Save"}</Button>
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

      {/* Models Dialog */}
      <Dialog open={!!modelDialogPlan} onOpenChange={() => setModelDialogPlan(null)}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{lang === "zh" ? "管理模型" : "Manage Models"}</DialogTitle><DialogDescription>{modelDialogPlan?.display_name}</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder={lang === "zh" ? "模型名称" : "Model name"} value={newModel} onChange={e => setNewModel(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddModel()} />
              <Button onClick={handleAddModel} disabled={modelLoading || !newModel.trim()}>{modelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}</Button>
            </div>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {planModels.length === 0 ? <p className="text-sm text-muted-foreground text-center py-3">{lang === "zh" ? "暂无绑定模型" : "No models bound"}</p> : planModels.map(pm => (
                <div key={pm.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm font-mono text-foreground">{pm.model_name}</span>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 h-7 px-2" onClick={() => handleRemoveModel(pm.model_name)} disabled={modelLoading}><Unlink className="h-3.5 w-3.5 mr-1" />{lang === "zh" ? "移除" : "Remove"}</Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

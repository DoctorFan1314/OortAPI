"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/contexts/toast-context";
import { useCurrency } from "@/contexts/currency-context";
import { Users, Search, Shield, Loader2, Pencil, Trash2, Wallet, KeyRound } from "lucide-react";

interface UserItem {
  id: number;
  email: string;
  username: string;
  balance: number;
  role: "user" | "admin";
  enabled: number;
  created_at: string;
  subscription?: {
    sub_id: number;
    status: string;
    credits_remaining: number;
    credits_total: number;
    billing_cycle: string;
    current_period_end: string;
    plan_display_name: string;
    plan_name: string;
  } | null;
}

interface Plan {
  id: number;
  name: string;
  display_name: string;
  monthly_credits: number;
  monthly_price: number;
}

const LABELS = {
  zh: {
    title: "用户管理", search: "搜索邮箱或用户名", all: "全部", admin: "管理员", user: "普通用户",
    email: "邮箱", username: "用户名", role: "角色", balance: "余额", status: "状态", registered: "注册时间", actions: "操作",
    edit: "编辑", delete: "删除", topup: "充值", enabled: "正常", disabled: "已禁用",
    editUser: "编辑用户", changeRole: "角色", addBalance: "充值金额", deductBalance: "扣费金额",
    save: "保存", cancel: "取消", confirm: "确定", deleteUser: "删除用户",
    deleteConfirm: "确定要删除用户 {email} 吗？此操作不可撤销，将删除该用户的所有数据（API Keys、用量记录、账单记录）。",
    noUsers: "暂无用户", selfDisable: "不能禁用自己", selfDemote: "不能降级自己", selfDelete: "不能删除自己",
    balanceTopup: "用户充值", balanceDeduct: "用户扣费",
    resetPassword: "重置密码", resetPasswordConfirm: "确认重置密码",
    resetPasswordSuccess: "密码重置成功，请将新密码告知用户：", copyPassword: "复制密码", copied: "已复制",
  },
  en: {
    title: "User Management", search: "Search email or username", all: "All", admin: "Admin", user: "User",
    email: "Email", username: "Username", role: "Role", balance: "Balance", status: "Status", registered: "Registered", actions: "Actions",
    edit: "Edit", delete: "Delete", topup: "Top Up", enabled: "Active", disabled: "Disabled",
    editUser: "Edit User", changeRole: "Role", addBalance: "Top Up Amount", deductBalance: "Deduct Amount",
    save: "Save", cancel: "Cancel", confirm: "Confirm", deleteUser: "Delete User",
    deleteConfirm: "Are you sure you want to delete {email}? This cannot be undone and will delete all their data (API Keys, usage logs, billing records).",
    noUsers: "No users found", selfDisable: "Cannot disable yourself", selfDemote: "Cannot demote yourself", selfDelete: "Cannot delete yourself",
    balanceTopup: "Top Up Balance", balanceDeduct: "Deduct Balance",
    resetPassword: "Reset Password", resetPasswordConfirm: "Confirm Password Reset",
    resetPasswordSuccess: "Password reset successfully. Please share this new password with the user:", copyPassword: "Copy", copied: "Copied",
  },
};

export default function UsersPage() {
  const { lang } = useI18n();
  const { user: currentUser } = useAuth();
  const { toast: showToast } = useToast();
  const { formatPrice } = useCurrency();
  const t = LABELS[lang];
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Edit dialog
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [editAdd, setEditAdd] = useState("");
  const [editDeduct, setEditDeduct] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete dialog
  const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reset password result
  const [resetResult, setResetResult] = useState<{ email: string; password: string } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Subscription management
  const [plans, setPlans] = useState<Plan[]>([]);
  const [giftPlanId, setGiftPlanId] = useState<number>(0);
  const [giftCredits, setGiftCredits] = useState("");
  const [subActionLoading, setSubActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: "cancel" | "gift" | "credits"; label: string } | null>(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (roleFilter !== "all") params.set("role", roleFilter);
    try {
      const res = await fetch(`/api/dashboard/users?${params}`, { credentials: "include" });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setHasMore(data.has_more || false);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    fetch("/api/plans").then(r => r.json()).then(d => setPlans(d.plans || [])).catch(() => {});
  }, []);

  function openEdit(u: UserItem) {
    setEditUser(u);
    setEditRole(u.role);
    setEditAdd("");
    setEditDeduct("");
  }

  async function handleSave() {
    if (!editUser) return;
    setEditSaving(true);
    const body: Record<string, unknown> = { id: editUser.id };
    if (editRole !== editUser.role) body.role = editRole;
    const addAmt = parseFloat(editAdd);
    const deductAmt = parseFloat(editDeduct);
    if (addAmt > 0) body.addBalance = addAmt;
    if (deductAmt > 0) body.deductBalance = deductAmt;
    try {
      const res = await fetch("/api/dashboard/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Operation failed", "error");
      }
    } catch { showToast("Network error", "error"); }
    setEditSaving(false);
    setEditUser(null);
    fetchUsers();
  }

  async function handleDelete() {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/dashboard/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: deleteUser.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Delete failed", "error");
      }
    } catch { showToast("Network error", "error"); }
    setDeleteLoading(false);
    setDeleteUser(null);
    fetchUsers();
  }

  async function handleResetPassword() {
    if (!editUser) return;
    setResetLoading(true);
    try {
      const res = await fetch("/api/dashboard/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editUser.id, resetPassword: true }),
      });
      const data = await res.json();
      if (res.ok && data.newPassword) {
        setResetResult({ email: editUser.email, password: data.newPassword });
      } else {
        showToast(data.error || "Password reset failed", "error");
      }
    } catch { showToast("Network error", "error"); }
    setResetLoading(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleGiftSubscription() {
    if (!editUser || !giftPlanId) return;
    setConfirmAction({ type: "gift", label: lang === "zh" ? `赠送套餐给 ${editUser.email}？` : `Gift subscription to ${editUser.email}?` });
  }

  async function confirmGiftSubscription() {
    if (!editUser || !giftPlanId) return;
    setSubActionLoading(true);
    setConfirmAction(null);
    try {
      const res = await fetch("/api/dashboard/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editUser.id, giftSubscription: { planId: giftPlanId, credits: giftCredits ? parseInt(giftCredits) : undefined } }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Operation failed", "error"); }
    } catch { showToast("Network error", "error"); }
    setSubActionLoading(false);
    setEditUser(null);
    fetchUsers();
  }

  async function handleCancelSubscription() {
    if (!editUser?.subscription) return;
    setConfirmAction({ type: "cancel", label: lang === "zh" ? `取消 ${editUser.email} 的订阅？` : `Cancel subscription for ${editUser.email}?` });
  }

  async function confirmCancelSubscription() {
    if (!editUser?.subscription) return;
    setSubActionLoading(true);
    setConfirmAction(null);
    try {
      const res = await fetch("/api/dashboard/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editUser.id, cancelSubscription: true }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Operation failed", "error"); }
    } catch { showToast("Network error", "error"); }
    setSubActionLoading(false);
    setEditUser(null);
    fetchUsers();
  }

  async function handleAddCredits() {
    if (!editUser?.subscription || !giftCredits) return;
    setConfirmAction({ type: "credits", label: lang === "zh" ? `为 ${editUser.email} 添加 ${giftCredits} credits？` : `Add ${giftCredits} credits to ${editUser.email}?` });
  }

  async function confirmAddCredits() {
    if (!editUser?.subscription || !giftCredits) return;
    setSubActionLoading(true);
    setConfirmAction(null);
    try {
      const res = await fetch("/api/dashboard/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editUser.id, addCredits: parseInt(giftCredits) }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Operation failed", "error"); }
    } catch { showToast("Network error", "error"); }
    setSubActionLoading(false);
    setEditUser(null);
    fetchUsers();
  }

  const roleFilters = [
    { key: "all" as const, label: t.all },
    { key: "admin" as const, label: t.admin },
    { key: "user" as const, label: t.user },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" />{t.title}</h1>
        <Badge variant="secondary">{total}</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-1">
          {roleFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setRoleFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                roleFilter === f.key ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="h-48 animate-pulse bg-muted rounded-lg m-6" />
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">{t.noUsers}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{t.email}</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">{t.username}</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">{t.role}</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">{lang === "zh" ? "订阅" : "Plan"}</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">{t.balance}</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">{t.status}</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">{t.registered}</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">{u.email}</td>
                      <td className="py-3 px-4">{u.username}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary" className={u.role === "admin" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : ""}>
                          {u.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.subscription ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {u.subscription.plan_display_name}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{formatPrice(u.balance)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.enabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                          {u.enabled ? t.enabled : t.disabled}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-muted-foreground">{new Date(u.created_at + "Z").toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title={t.edit} aria-label={t.edit}>
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setDeleteUser(u)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors" title={t.delete} aria-label={t.delete}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</Button>
          <span className="text-sm text-muted-foreground py-1.5">{lang === "zh" ? `第 ${page} 页` : `Page ${page}`}</span>
          <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => setPage(p => p + 1)}>→</Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.editUser}</DialogTitle>
            <DialogDescription>{editUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Subscription Info */}
            {editUser?.subscription ? (
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{editUser.subscription.plan_display_name}</span>
                  <span className="text-xs text-amber-400">{editUser.subscription.credits_remaining.toLocaleString()} / {editUser.subscription.credits_total.toLocaleString()} Credits</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${editUser.subscription.credits_total > 0 ? ((editUser.subscription.credits_total - editUser.subscription.credits_remaining) / editUser.subscription.credits_total) * 100 : 0}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">{lang === "zh" ? "有效期至" : "Valid until"} {new Date(editUser.subscription.current_period_end).toLocaleDateString()}</p>
                <div className="flex items-center gap-2">
                  <Input type="number" min="0" placeholder={lang === "zh" ? "添加额度" : "Add credits"} value={giftCredits} onChange={e => setGiftCredits(e.target.value)} className="h-8 text-xs bg-secondary border-border" />
                  <Button variant="outline" size="sm" className="h-8 text-xs shrink-0" onClick={handleAddCredits} disabled={subActionLoading || !giftCredits}>
                    {lang === "zh" ? "添加" : "Add"}
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs text-red-400 hover:text-red-300 shrink-0" onClick={handleCancelSubscription} disabled={subActionLoading}>
                    {lang === "zh" ? "取消订阅" : "Cancel"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-2">{lang === "zh" ? "该用户暂无订阅" : "No subscription"}</p>
                <div className="flex items-center gap-2">
                  <select className="flex-1 h-8 px-2 rounded-md border border-input bg-background text-xs" value={giftPlanId} onChange={e => setGiftPlanId(+e.target.value)}>
                    <option value={0}>{lang === "zh" ? "选择套餐" : "Select plan"}</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.display_name} ({p.monthly_credits.toLocaleString()} credits)</option>)}
                  </select>
                  <Button variant="outline" size="sm" className="h-8 text-xs shrink-0" onClick={handleGiftSubscription} disabled={subActionLoading || !giftPlanId}>
                    {lang === "zh" ? "赠送" : "Gift"}
                  </Button>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.changeRole}</label>
              <div className="flex gap-2">
                <button onClick={() => setEditRole("user")} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${editRole === "user" ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border"}`}>User</button>
                <button onClick={() => setEditRole("admin")} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${editRole === "admin" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" : "bg-secondary text-muted-foreground border-border"}`}>Admin</button>
              </div>
            </div>
            <div>
              <label className="text-sm text-foreground mb-1.5 block flex items-center gap-1"><Wallet className="h-3.5 w-3.5" />{t.balanceTopup}</label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={editAdd} onChange={(e) => setEditAdd(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div>
              <label className="text-sm text-foreground mb-1.5 block">{t.balanceDeduct}</label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={editDeduct} onChange={(e) => setEditDeduct(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="flex gap-2 justify-between">
              <Button variant="outline" size="sm" onClick={handleResetPassword} disabled={resetLoading} className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10">
                {resetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <KeyRound className="h-4 w-4 mr-1" />}
                {t.resetPassword}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditUser(null)}>{t.cancel}</Button>
                <Button onClick={handleSave} disabled={editSaving}>{editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t.save}</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteUser} onOpenChange={(open) => { if (!open) setDeleteUser(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.deleteUser}</DialogTitle>
            <DialogDescription>{deleteUser ? t.deleteConfirm.replace("{email}", deleteUser.email) : ""}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDeleteUser(null)}>{t.cancel}</Button>
            <Button onClick={handleDelete} disabled={deleteLoading} className="bg-red-600 text-white hover:bg-red-700">
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.confirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Result Dialog */}
      <Dialog open={!!resetResult} onOpenChange={(open) => { if (!open) { setResetResult(null); setCopied(false); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-green-500" />
              {t.resetPasswordConfirm}
            </DialogTitle>
            <DialogDescription>{resetResult?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">{t.resetPasswordSuccess}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono break-all select-all">{resetResult?.password}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetResult && copyToClipboard(resetResult.password)}
              >
                {copied ? t.copied : t.copyPassword}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Action Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{lang === "zh" ? "确认操作" : "Confirm Action"}</DialogTitle>
            <DialogDescription>{confirmAction?.label}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>{t.cancel}</Button>
            <Button
              onClick={() => {
                if (confirmAction?.type === "cancel") confirmCancelSubscription();
                else if (confirmAction?.type === "gift") confirmGiftSubscription();
                else if (confirmAction?.type === "credits") confirmAddCredits();
              }}
              disabled={subActionLoading}
            >
              {subActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.confirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

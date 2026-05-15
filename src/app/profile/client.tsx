"use client";

import { useState, useMemo } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { useCurrency } from "@/contexts/currency-context";
import { useLocale } from "@/hooks/use-locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import {
  User, Mail, Calendar, Shield, Activity, Key, Coins, DollarSign,
  Sun, Moon, Monitor, Camera, Save, Loader2, Clock, Zap, BarChart3,
  Settings, ArrowRight, Trash2, AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AvatarCropDialog } from "@/components/profile/avatar-crop-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface UsageLog {
  id: number;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost: number;
  credits_used: number;
  deduction_source: string;
  latency_ms: number | null;
  success: number;
  created_at: string;
}

const LABELS = {
  zh: {
    title: "个人中心",
    overview: "概览",
    settings: "设置",
    account: "账户信息",
    joinedAt: "加入于",
    adminRole: "管理员",
    userRole: "普通用户",
    totalCalls: "总调用",
    totalTokens: "总 Tokens",
    totalCost: "总花费",
    apiKeys: "API Keys",
    balance: "余额",
    recentUsage: "最近调用",
    goToDashboard: "前往控制台",
    manageKeys: "管理 Keys",
    viewUsage: "查看用量",
    viewBilling: "查看账单",
    noUsage: "暂无调用记录",
    editProfile: "编辑资料",
    username: "用户名",
    bio: "个人简介",
    bioPlaceholder: "介绍一下自己...",
    saveProfile: "保存",
    profileUpdated: "资料已更新",
    usernameRequired: "请输入用户名",
    themePreference: "主题偏好",
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
    changeAvatar: "更换头像",
    success: "成功",
    failed: "失败",
    dangerZone: "危险操作",
    deleteAccount: "删除账户",
    deleteAccountDesc: "删除账户将永久清除所有数据，包括调用记录、API Key、余额等。此操作不可撤销。",
    deleteConfirmTitle: "确认删除账户",
    deleteConfirmDesc: "此操作将永久删除你的账户及所有数据，无法恢复。",
    deleteConfirmInput: '请输入 "DELETE" 确认',
    deletePassword: "请输入密码验证",
    deleteBtn: "永久删除",
    deleting: "删除中...",
    deleteSuccess: "账户已删除",
    model: "模型",
    tokens: "Tokens",
    cost: "费用",
    time: "时间",
    status: "状态",
    latency: "延迟",
  },
  en: {
    title: "Profile",
    overview: "Overview",
    settings: "Settings",
    account: "Account Info",
    joinedAt: "Joined",
    adminRole: "Admin",
    userRole: "User",
    totalCalls: "Total Calls",
    totalTokens: "Total Tokens",
    totalCost: "Total Cost",
    apiKeys: "API Keys",
    balance: "Balance",
    recentUsage: "Recent Usage",
    goToDashboard: "Go to Dashboard",
    manageKeys: "Manage Keys",
    viewUsage: "View Usage",
    viewBilling: "View Billing",
    noUsage: "No usage records yet",
    editProfile: "Edit Profile",
    username: "Username",
    bio: "Bio",
    bioPlaceholder: "Tell us about yourself...",
    saveProfile: "Save",
    profileUpdated: "Profile updated",
    usernameRequired: "Username is required",
    themePreference: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    changeAvatar: "Change Avatar",
    success: "Success",
    failed: "Failed",
    dangerZone: "Danger Zone",
    deleteAccount: "Delete Account",
    deleteAccountDesc: "Permanently delete your account and all data, including usage logs, API keys, and balance. This cannot be undone.",
    deleteConfirmTitle: "Confirm Account Deletion",
    deleteConfirmDesc: "This will permanently delete your account and all data. This action cannot be undone.",
    deleteConfirmInput: 'Type "DELETE" to confirm',
    deletePassword: "Enter your password to verify",
    deleteBtn: "Delete Forever",
    deleting: "Deleting...",
    deleteSuccess: "Account deleted",
    model: "Model",
    tokens: "Tokens",
    cost: "Cost",
    time: "Time",
    status: "Status",
    latency: "Latency",
  },
};

export default function ProfileClient() {
  const { t: i18nT } = useI18n();
  const { user, updateProfile } = useAuth();
  const { formatPrice } = useCurrency();
  const { lang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const locale = useLocale();
  const t = LABELS[lang];

  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");

  // Settings state
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const { data: usageData, isLoading } = useSWR<{ data: UsageLog[]; total: number }>(
    "/api/v1/billing/usage?limit=10",
    dashboardSWRConfig,
  );

  const logs = usageData?.data || [];
  const stats = useMemo(() => ({
    totalCalls: usageData?.total || logs.length,
    totalTokens: logs.reduce((s, l) => s + l.tokens_in + l.tokens_out, 0),
    totalCost: logs.reduce((s, l) => s + l.cost, 0),
  }), [usageData, logs]);

  const handleSaveProfile = () => {
    if (!username.trim()) {
      toast(t.usernameRequired, "error");
      return;
    }
    setSaving(true);
    updateProfile({ username: username.trim(), bio: bio.trim() });
    toast(t.profileUpdated, "success");
    setSaving(false);
  };

  const handleCropComplete = (dataUrl: string) => {
    updateProfile({ avatar: dataUrl });
    setCropImage(null);
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || t.failed);
        setDeleteLoading(false);
        return;
      }
      window.location.href = "/";
    } catch {
      setDeleteError(t.failed);
      setDeleteLoading(false);
    }
  };

  const formatTokens = (n: number) => {
    return n.toLocaleString();
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/jpeg,image/png";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { toast("File too large (max 5MB)", "error"); return; }
                  const reader = new FileReader();
                  reader.onload = (ev) => setCropImage(ev.target?.result as string);
                  reader.readAsDataURL(file);
                };
                input.click();
              }}
              className="relative h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary shrink-0 overflow-hidden cursor-pointer hover:border-primary/60 transition-colors"
            >
              {user.avatar ? (
                <Image src={user.avatar} alt={user.username} fill className="rounded-full object-cover" unoptimized />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <Badge variant="secondary" className={user.role === "admin" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : ""}>
                  {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                  {user.role === "admin" ? t.adminRole : t.userRole}
                </Badge>
              </div>
              {user.bio && <p className="text-sm text-muted-foreground mb-2">{user.bio}</p>}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.joinedAt} {new Date(user.created_at).toLocaleDateString(locale)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" />{t.goToDashboard}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border pb-px">
          {[
            { id: "overview" as const, label: t.overview, icon: Activity },
            { id: "settings" as const, label: t.settings, icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.balance}</p>
                    <p className="text-xl font-bold font-mono">{formatPrice(user.balance)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-md bg-green-500/10">
                    <Activity className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.totalCalls}</p>
                    <p className="text-xl font-bold font-mono">{stats.totalCalls.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-md bg-purple-500/10">
                    <Coins className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.totalTokens}</p>
                    <p className="text-xl font-bold font-mono">{formatTokens(stats.totalTokens)}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-md bg-amber-500/10">
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t.totalCost}</p>
                    <p className="text-xl font-bold font-mono">{formatPrice(stats.totalCost)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href="/dashboard/keys" className="glass-card glass-card-hover p-4 flex items-center gap-3 group">
                <div className="p-2 rounded-md bg-primary/10">
                  <Key className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.apiKeys}</p>
                  <p className="text-xs text-muted-foreground">{t.manageKeys}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
              <Link href="/dashboard/usage" className="glass-card glass-card-hover p-4 flex items-center gap-3 group">
                <div className="p-2 rounded-md bg-primary/10">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.recentUsage}</p>
                  <p className="text-xs text-muted-foreground">{t.viewUsage}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
              <Link href="/dashboard/billing" className="glass-card glass-card-hover p-4 flex items-center gap-3 group">
                <div className="p-2 rounded-md bg-primary/10">
                  <Coins className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.balance}</p>
                  <p className="text-xs text-muted-foreground">{t.viewBilling}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>

            {/* Recent Usage */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">{t.recentUsage}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-32 animate-pulse bg-muted rounded-lg" />
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">{t.noUsage}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t.model}</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t.tokens}</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t.cost}</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t.latency}</th>
                          <th className="text-center py-2 px-3 text-muted-foreground font-medium">{t.status}</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t.time}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b border-border/20 hover:bg-muted/30">
                            <td className="py-2 px-3 font-mono text-xs">{log.model}</td>
                            <td className="py-2 px-3 text-right font-mono">{(log.tokens_in + log.tokens_out).toLocaleString()}</td>
                            <td className="py-2 px-3 text-right font-mono">
                              {log.deduction_source === "credits" ? (
                                <span className="text-amber-500">{(log.credits_used || 0).toLocaleString()} credits</span>
                              ) : (
                                formatPrice(log.cost)
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono">{log.latency_ms ? `${log.latency_ms}ms` : "-"}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${log.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                {log.success ? t.success : t.failed}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right text-xs text-muted-foreground">{new Date(log.created_at + "Z").toLocaleString(locale)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {logs.length > 0 && (
                  <div className="mt-4 text-center">
                    <Link href="/dashboard/usage">
                      <Button variant="outline" size="sm">
                        {t.viewUsage} <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Edit Profile */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">{t.editProfile}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm mb-1.5 block">{t.changeAvatar}</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/jpeg,image/png";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) { toast("File too large (max 5MB)", "error"); return; }
                            const reader = new FileReader();
                            reader.onload = (ev) => setCropImage(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          };
                          input.click();
                        }}
                        className="relative h-14 w-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary shrink-0 overflow-hidden cursor-pointer hover:border-primary/60 transition-colors"
                      >
                        {user.avatar ? (
                          <Image src={user.avatar} alt={user.username} fill className="rounded-full object-cover" unoptimized />
                        ) : (
                          user.username.charAt(0).toUpperCase()
                        )}
                      </button>
                      <div>
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/jpeg,image/png";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) { toast("File too large (max 5MB)", "error"); return; }
                            const reader = new FileReader();
                            reader.onload = (ev) => setCropImage(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          };
                          input.click();
                        }}>
                          <Camera className="h-3.5 w-3.5 mr-1.5" />{t.changeAvatar}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm mb-1.5 block">{t.username}</label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm mb-1.5 block">{t.bio}</label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder={t.bioPlaceholder} />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                    {t.saveProfile}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Theme */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">{t.themePreference}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: "light" as const, label: t.light, icon: Sun },
                    { key: "dark" as const, label: t.dark, icon: Moon },
                    { key: "system" as const, label: t.system, icon: Monitor },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setTheme(opt.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                          theme === opt.key
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-secondary text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t.dangerZone}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.deleteAccount}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.deleteAccountDesc}</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.deleteAccount}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Account Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) { setDeletePassword(""); setDeleteConfirmText(""); setDeleteError(""); }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-400">{t.deleteConfirmTitle}</DialogTitle>
              <DialogDescription>{t.deleteConfirmDesc}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">{t.deletePassword}</label>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="********"
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">{t.deleteConfirmInput}</label>
                <Input
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="bg-secondary border-border"
                />
              </div>
              {deleteError && <p className="text-sm text-red-400" role="alert">{deleteError}</p>}
              <Button
                variant="destructive"
                className="w-full"
                disabled={deleteConfirmText !== "DELETE" || !deletePassword || deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.deleting}</>
                ) : (
                  <><Trash2 className="h-4 w-4 mr-2" />{t.deleteBtn}</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {cropImage && (
          <AvatarCropDialog
            open={!!cropImage}
            onOpenChange={(open) => { if (!open) setCropImage(null); }}
            imageSrc={cropImage}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>
    </AuthGuard>
  );
}

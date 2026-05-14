"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/toast-context";
import { Loader2, Settings } from "lucide-react";

const LABELS = {
  zh: { title: "账户设置", username: "用户名", email: "邮箱", save: "保存修改", saved: "已保存", bio: "个人简介", apiEndpoint: "API 端点", copyEndpoint: "复制", changePassword: "修改密码", currentPassword: "当前密码", newPassword: "新密码", confirmPassword: "确认新密码", passwordChanged: "密码修改成功", passwordMismatch: "两次输入的密码不一致", wrongPassword: "当前密码不正确", passwordMinLength: "新密码至少 8 位", changePwBtn: "修改密码", systemSettings: "系统设置", timezone: "时区", currency: "默认货币", exchangeRate: "汇率", saveSystem: "保存系统设置" },
  en: { title: "Account Settings", username: "Username", email: "Email", save: "Save Changes", saved: "Saved", bio: "Bio", apiEndpoint: "API Endpoint", copyEndpoint: "Copy", changePassword: "Change Password", currentPassword: "Current Password", newPassword: "New Password", confirmPassword: "Confirm Password", passwordChanged: "Password changed successfully", passwordMismatch: "Passwords do not match", wrongPassword: "Current password is incorrect", passwordMinLength: "New password must be at least 8 characters", changePwBtn: "Change Password", systemSettings: "System Settings", timezone: "Timezone", currency: "Default Currency", exchangeRate: "Exchange Rate", saveSystem: "Save System Settings" },
};

export default function SettingsPage() {
  const { lang } = useI18n();
  const { user, updateProfile, changePassword } = useAuth();
  const { toast: showToast } = useToast();
  const t = LABELS[lang];
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  // System settings (admin only)
  const [timezone, setTimezone] = useState("Asia/Shanghai");
  const [systemCurrency, setSystemCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("7.3");
  const [systemSaving, setSystemSaving] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/dashboard/settings", { credentials: "include" })
        .then(r => r.json())
        .then(d => {
          if (d.settings) {
            setTimezone(d.settings.timezone || "Asia/Shanghai");
            setSystemCurrency(d.settings.currency || "USD");
            setExchangeRate(d.settings.exchange_rate || "7.3");
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSaveSystem = async () => {
    setSystemSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ timezone, currency: systemCurrency, exchange_rate: exchangeRate }),
      });
      if (res.ok) showToast(t.saved, "success");
    } catch { /* ignore */ }
    setSystemSaving(false);
  };

  // Password change state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ username, bio });
      showToast(t.saved, "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed", "error");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPw.length < 8) { showToast(t.passwordMinLength, "error"); return; }
    if (newPw !== confirmPw) { showToast(t.passwordMismatch, "error"); return; }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      showToast(t.passwordChanged, "success");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Password change failed";
      showToast(msg.includes("incorrect") ? t.wrongPassword : msg, "error");
    }
    setPwLoading(false);
  };

  const endpoint = typeof window !== "undefined" ? `${window.location.origin}/api/v1` : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.title}</h1>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.apiEndpoint}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted/50 rounded px-3 py-2 text-sm font-mono">{endpoint}</code>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(endpoint); showToast(t.copyEndpoint, "success"); }}>
              {t.copyEndpoint}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">{t.email}</label>
            <Input value={user?.email || ""} disabled className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t.username}</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t.bio}</label>
            <Input value={bio} onChange={e => setBio(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={save} disabled={saving}>{t.save}</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{t.changePassword}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div>
            <label className="text-sm text-muted-foreground">{t.currentPassword}</label>
            <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t.newPassword}</label>
            <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t.confirmPassword}</label>
            <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={handleChangePassword} disabled={pwLoading || !currentPw || !newPw || !confirmPw}>
            {pwLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            {t.changePwBtn}
          </Button>
        </CardContent>
      </Card>

      {/* System Settings (Admin only) */}
      {user?.role === "admin" && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {lang === "zh" ? "系统设置" : "System Settings"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <div>
              <label className="text-sm text-muted-foreground">{lang === "zh" ? "时区" : "Timezone"}</label>
              <select
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
              >
                <option value="Asia/Shanghai">Asia/Shanghai (北京时间)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (东京时间)</option>
                <option value="America/New_York">America/New_York (纽约时间)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (洛杉矶时间)</option>
                <option value="Europe/London">Europe/London (伦敦时间)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{lang === "zh" ? "默认货币" : "Default Currency"}</label>
              <select
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm mt-1 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={systemCurrency}
                onChange={e => setSystemCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="CNY">CNY (¥)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{lang === "zh" ? "汇率 (1 USD = ? CNY)" : "Exchange Rate (1 USD = ? CNY)"}</label>
              <Input
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={e => setExchangeRate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleSaveSystem} disabled={systemSaving}>
              {systemSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {lang === "zh" ? "保存系统设置" : "Save System Settings"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

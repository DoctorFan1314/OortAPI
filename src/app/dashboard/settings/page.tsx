"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { useToast } from "@/contexts/toast-context";
import { Loader2, Settings, Download, Upload, Wallet, Search, Bell } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const LABELS = {
  zh: { apiEndpoint: "API 端点", copyEndpoint: "复制", systemSettings: "系统设置", timezone: "时区", currency: "默认货币", exchangeRate: "汇率", saveSystem: "保存系统设置", saved: "已保存", budget: "预算管理", budgetDesc: "设置每月消费上限，接近阈值时将收到提醒", monthlyBudget: "月度预算上限", currentSpend: "本月已消费", noBudget: "未设置预算", saveBudget: "保存预算", budgetWarning: "预算提醒", budgetExceeded: "已超出预算！", budgetNear: "已接近预算上限", budgetOk: "预算正常" },
  en: { apiEndpoint: "API Endpoint", copyEndpoint: "Copy", systemSettings: "System Settings", timezone: "Timezone", currency: "Default Currency", exchangeRate: "Exchange Rate", saveSystem: "Save System Settings", saved: "Saved", budget: "Budget Management", budgetDesc: "Set a monthly spending limit. You'll be notified when approaching the threshold.", monthlyBudget: "Monthly Budget Limit", currentSpend: "Current Month Spend", noBudget: "No budget set", saveBudget: "Save Budget", budgetWarning: "Budget Alert", budgetExceeded: "Budget exceeded!", budgetNear: "Approaching budget limit", budgetOk: "Within budget" },
};

export default function SettingsPage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  const t = LABELS[lang];

  // System settings (admin only)
  const [timezone, setTimezone] = useState("Asia/Shanghai");
  const [systemCurrency, setSystemCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("7.3");
  const [initialExchangeRate, setInitialExchangeRate] = useState("7.3");
  const [systemSaving, setSystemSaving] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [currentSpend, setCurrentSpend] = useState(0);
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved"|"saving"|"unsaved">("saved");
  const [savedBudget, setSavedBudget] = useState(0);
  const [confirmExchangeOpen, setConfirmExchangeOpen] = useState(false);
  const [settingsSearch, setSettingsSearch] = useState("");
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({ budget: true, key_expiry: true, sub_expiry: true, usage_spike: false });

  // Search filtering helpers
  const searchLower = settingsSearch.toLowerCase().trim();
  const matchSearch = (...texts: string[]) =>
    !searchLower || texts.some(t => t.toLowerCase().includes(searchLower));

  const sectionMeta = {
    baseUrl: { zh: ["接入地址", "API 端点", "复制"], en: ["Base URL", "API Endpoint", "Copy"] },
    budget: { zh: ["预算管理", "月度预算上限", "预算提醒"], en: ["Budget Management", "Monthly Budget Limit", "Budget Alert"] },
    notif: { zh: ["通知偏好", "预算超限", "Key 即将过期", "套餐到期", "用量异常"], en: ["Notification Preferences", "Budget Exceeded", "Key Expiring", "Plan Expiring", "Usage Spike"] },
    system: { zh: ["系统设置", "时区", "默认货币", "汇率"], en: ["System Settings", "Timezone", "Default Currency", "Exchange Rate"] },
  };

  const budgetLimit = monthlyBudget ? parseFloat(monthlyBudget) : savedBudget;
  const budgetPercent = budgetLimit > 0 ? (currentSpend / budgetLimit) * 100 : 0;
  const budgetStatus = budgetLimit > 0 ? (budgetPercent >= 100 ? "exceeded" : budgetPercent >= 80 ? "near" : "ok") : "none";

  // SWR: fetch settings
  const { data: settingsData, isLoading: settingsLoading } = useSWR<{
    settings?: { timezone?: string; currency?: string; exchange_rate?: string };
    preferences?: { monthly_budget?: number; notification_preferences?: Record<string, boolean> };
  }>("/api/dashboard/settings", dashboardSWRConfig);

  // SWR: fetch current month spending
  const billingUrl = useMemo(() => {
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return `/api/v1/billing/usage?limit=1&from=${from}`;
  }, []);
  const { data: billingData } = useSWR<{ total_cost?: number }>(billingUrl, dashboardSWRConfig);

  // Derive local state from SWR data
  useEffect(() => {
    if (settingsData?.settings && user?.role === "admin") {
      setTimezone(settingsData.settings.timezone || "Asia/Shanghai");
      setSystemCurrency(settingsData.settings.currency || "USD");
      setExchangeRate(settingsData.settings.exchange_rate || "7.3");
      setInitialExchangeRate(settingsData.settings.exchange_rate || "7.3");
    }
    if (settingsData?.preferences?.monthly_budget) {
      setMonthlyBudget(String(settingsData.preferences.monthly_budget));
      setSavedBudget(settingsData.preferences.monthly_budget);
    }
    if (settingsData?.preferences?.notification_preferences) {
      setNotifPrefs(prev => ({ ...prev, ...settingsData.preferences!.notification_preferences! }));
    }
  }, [settingsData, user]);

  useEffect(() => {
    if (billingData) setCurrentSpend(billingData.total_cost || 0);
  }, [billingData]);

  // Budget alert only when newly exceeded (not on every mount, guard against StrictMode double-fire)
  const prevExceeded = useRef(false);
  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    const isExceeded = budgetLimit > 0 && budgetPercent >= 100;
    if (isExceeded && !prevExceeded.current && !hasNotifiedRef.current) {
      showToast(lang === "zh" ? "预算已超限！" : "Budget exceeded!", "error");
      hasNotifiedRef.current = true;
    }
    if (!isExceeded) hasNotifiedRef.current = false;
    prevExceeded.current = isExceeded;
  }, [budgetLimit, budgetPercent, lang]);

  // Auto-save budget with 2s debounce
  const budgetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notifPrefsTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!monthlyBudget || monthlyBudget === String(savedBudget)) { setAutoSaveStatus("saved"); return; }
    setAutoSaveStatus("unsaved");
    clearTimeout(budgetTimerRef.current);
    budgetTimerRef.current = setTimeout(() => {
      setAutoSaveStatus("saving");
      handleSaveBudget();
    }, 2000);
    return () => clearTimeout(budgetTimerRef.current);
  }, [monthlyBudget]);

  // Notification prefs: debounced save with 2s delay
  const notifPrefsRef = useRef(notifPrefs);
  notifPrefsRef.current = notifPrefs;

  const handleSaveNotifPrefs = useCallback(async (prefs: Record<string, boolean>) => {
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notificationPreferences: prefs }),
      });
      if (res.ok) {
        showToast(lang === "zh" ? "通知偏好已保存" : "Notification preferences saved", "success");
      } else {
        showToast(lang === "zh" ? "通知偏好保存失败" : "Failed to save notification preferences", "error");
      }
    } catch {
      showToast(lang === "zh" ? "网络错误" : "Network error", "error");
    }
  }, [lang, showToast]);

  const notifPrefsLoadedRef = useRef(false);
  useEffect(() => {
    if (settingsLoading) return;
    if (!notifPrefsLoadedRef.current) {
      notifPrefsLoadedRef.current = true;
      return;
    }
    clearTimeout(notifPrefsTimerRef.current);
    notifPrefsTimerRef.current = setTimeout(() => {
      handleSaveNotifPrefs(notifPrefsRef.current);
    }, 2000);
    return () => clearTimeout(notifPrefsTimerRef.current);
  }, [notifPrefs, settingsLoading, handleSaveNotifPrefs]);

  const handleSaveSystem = async () => {
    if (exchangeRate !== initialExchangeRate) {
      setConfirmExchangeOpen(true);
      return;
    }
    doSaveSystem();
  };

  const doSaveSystem = async () => {
    setSystemSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ timezone, currency: systemCurrency, exchange_rate: exchangeRate }),
      });
      if (res.ok) {
        setInitialExchangeRate(exchangeRate);
        showToast(t.saved, "success");
        try { localStorage.setItem("oortapi-currency", systemCurrency); } catch { /* ignore */ }
      } else {
        showToast(lang === "zh" ? "保存失败" : "Save failed", "error");
      }
    } catch {
      showToast(lang === "zh" ? "网络错误，保存失败" : "Network error", "error");
    }
    setSystemSaving(false);
  };

  const handleSaveBudget = async () => {
    const budget = monthlyBudget ? parseFloat(monthlyBudget) : 0;
    if (budget < 0) {
      showToast(lang === "zh" ? "预算不能为负数" : "Budget cannot be negative", "error");
      return;
    }
    setBudgetSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ monthly_budget: budget || null }),
      });
      if (res.ok) {
        setSavedBudget(budget || 0);
        showToast(t.saved, "success");
      } else {
        showToast(lang === "zh" ? "保存失败" : "Save failed", "error");
      }
    } catch {
      showToast(lang === "zh" ? "网络错误" : "Network error", "error");
    }
    setBudgetSaving(false);
  };

  const endpoint = typeof window !== "undefined" ? `${window.location.origin}/api/v1` : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.apiEndpoint}</h1>
      {/* Settings search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
        <input
          value={settingsSearch}
          onChange={(e) => setSettingsSearch(e.target.value)}
          placeholder={lang === "zh" ? "搜索设置..." : "Search settings..."}
          className="w-full h-8 pl-8 pr-3 rounded-md border border-input bg-background text-xs focus:border-primary focus:outline-none"
        />
      </div>

      {matchSearch(...sectionMeta.baseUrl[lang]) && (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{lang === "zh" ? "接入地址" : "Base URL"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted/50 rounded px-3 py-2 text-sm font-mono">{endpoint}</code>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(endpoint); showToast(lang === "zh" ? "已复制" : "Copied", "success"); }}>
              {t.copyEndpoint}
            </Button>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Budget Management */}
      {matchSearch(...sectionMeta.budget[lang]) && (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t.budget}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t.budgetDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div>
            <label className="text-sm text-muted-foreground">{t.monthlyBudget} ($)</label>
            <Input
              type="number"
              step="1"
              min="0"
              value={monthlyBudget}
              onChange={e => setMonthlyBudget(e.target.value)}
              placeholder="100"
              className="mt-1"
            />
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-[10px] ${autoSaveStatus === "saved" ? "text-emerald-400" : autoSaveStatus === "saving" ? "text-amber-400" : "text-muted-foreground"}`}>
                {autoSaveStatus === "saved" ? (lang === "zh" ? "已保存" : "Saved") : autoSaveStatus === "saving" ? (lang === "zh" ? "保存中..." : "Saving...") : (lang === "zh" ? "未保存" : "Unsaved")}
              </span>
            </div>
          </div>
          {budgetLimit > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.currentSpend}</span>
                <span className="font-mono">${currentSpend.toFixed(4)} / ${budgetLimit.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetStatus === "exceeded" ? "bg-red-500" :
                    budgetStatus === "near" ? "bg-amber-500" :
                    "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                />
              </div>
              <p className={`text-xs ${
                budgetStatus === "exceeded" ? "text-red-500" :
                budgetStatus === "near" ? "text-amber-500" :
                "text-green-500"
              }`}>
                {budgetStatus === "exceeded" ? t.budgetExceeded :
                 budgetStatus === "near" ? t.budgetNear :
                 t.budgetOk}
                {budgetPercent > 0 && ` (${budgetPercent.toFixed(1)}%)`}
              </p>
            </div>
          )}
          <Button onClick={handleSaveBudget} disabled={budgetSaving}>
            {budgetSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            {t.saveBudget}
          </Button>
        </CardContent>
      </Card>
      )}

      {/* Notification Preferences */}
      {matchSearch(...sectionMeta.notif[lang]) && (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            {lang === "zh" ? "通知偏好" : "Notification Preferences"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-md">
            {[
              { key: "budget", label: lang === "zh" ? "预算超限" : "Budget Exceeded", desc: lang === "zh" ? "当月度预算超限时通知" : "When monthly budget is exceeded" },
              { key: "key_expiry", label: lang === "zh" ? "Key 即将过期" : "Key Expiring", desc: lang === "zh" ? "API Key 过期前 7 天通知" : "7 days before API key expires" },
              { key: "sub_expiry", label: lang === "zh" ? "套餐到期" : "Plan Expiring", desc: lang === "zh" ? "套餐到期前 3 天通知" : "3 days before plan expires" },
              { key: "usage_spike", label: lang === "zh" ? "用量异常" : "Usage Spike", desc: lang === "zh" ? "日用量突增 50% 以上时通知" : "When daily usage spikes >50%" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative ${notifPrefs[item.key] ? "bg-primary" : "bg-muted/50 border border-border"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notifPrefs[item.key] ? "left-[18px]" : "left-[2px]"}`} />
                </div>
                <input type="checkbox" className="sr-only" checked={notifPrefs[item.key]} onChange={() => setNotifPrefs(prev => ({ ...prev, [item.key]: !prev[item.key] }))} />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* System Settings (Admin only) */}
      {user?.role === "admin" && matchSearch(...sectionMeta.system[lang]) && (
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
                <option value="Asia/Shanghai">Asia/Shanghai (UTC+8 北京时间)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (UTC+9 东京)</option>
                <option value="Asia/Hong_Kong">Asia/Hong_Kong (UTC+8 香港)</option>
                <option value="Asia/Singapore">Asia/Singapore (UTC+8 新加坡)</option>
                <option value="Asia/Seoul">Asia/Seoul (UTC+9 首尔)</option>
                <option value="Asia/Taipei">Asia/Taipei (UTC+8 台北)</option>
                <option value="America/New_York">America/New_York (UTC-5 纽约)</option>
                <option value="America/Chicago">America/Chicago (UTC-6 芝加哥)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (UTC-8 洛杉矶)</option>
                <option value="Europe/London">Europe/London (UTC+0 伦敦)</option>
                <option value="Europe/Berlin">Europe/Berlin (UTC+1 柏林)</option>
                <option value="Europe/Paris">Europe/Paris (UTC+1 巴黎)</option>
                <option value="Australia/Sydney">Australia/Sydney (UTC+11 悉尼)</option>
                <option value="Pacific/Auckland">Pacific/Auckland (UTC+12 奥克兰)</option>
                <option value="UTC">UTC (协调世界时)</option>
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
                min="0.01"
                value={exchangeRate}
                onChange={e => setExchangeRate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleSaveSystem} disabled={systemSaving}>
              {systemSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {lang === "zh" ? "保存系统设置" : "Save System Settings"}
            </Button>
            <div className="flex gap-2 pt-2 border-t border-border/30">
              <Button variant="outline" size="sm" onClick={async () => {
                try {
                  const res = await fetch("/api/dashboard/settings?action=export", { credentials: "include" });
                  if (res.ok) {
                    const data = await res.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `oortapi-config-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast(lang === "zh" ? "配置已导出" : "Config exported", "success");
                  }
                } catch { showToast(lang === "zh" ? "导出失败" : "Export failed", "error"); }
              }}>
                <Download className="h-4 w-4 mr-1" />
                {lang === "zh" ? "导出配置" : "Export Config"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    const res = await fetch("/api/dashboard/settings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ action: "import", data }),
                    });
                    if (res.ok) {
                      const result = await res.json();
                      showToast(lang === "zh" ? `导入成功: ${result.imported?.settings || 0} 项设置, ${result.imported?.model_rates || 0} 个模型` : `Imported: ${result.imported?.settings || 0} settings, ${result.imported?.model_rates || 0} models`, "success");
                    } else {
                      showToast(lang === "zh" ? "导入失败" : "Import failed", "error");
                    }
                  } catch { showToast(lang === "zh" ? "导入失败: 文件格式错误" : "Import failed: invalid file", "error"); }
                };
                input.click();
              }}>
                <Upload className="h-4 w-4 mr-1" />
                {lang === "zh" ? "导入配置" : "Import Config"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmExchangeOpen}
        onOpenChange={setConfirmExchangeOpen}
        title={lang === "zh" ? "修改汇率" : "Change Exchange Rate"}
        message={lang === "zh" ? "确定要修改汇率吗？这将影响所有 USD/CNY 价格显示。" : "Are you sure you want to change the exchange rate? This will affect all USD/CNY price displays."}
        onConfirm={() => { setConfirmExchangeOpen(false); doSaveSystem(); }}
        confirmLabel={lang === "zh" ? "确认修改" : "Confirm"}
        variant="default"
      />
    </div>
  );
}

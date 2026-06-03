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

export default function SettingsPage() {
  const { lang, t } = useI18n();
  const L = t.dashboard;
  const { user } = useAuth();
  const { toast: showToast } = useToast();

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
    baseUrl: [L.baseUrl, L.apiEndpoint, L.copyEndpoint],
    budget: [L.budget, L.monthlyBudget, L.budgetWarning],
    notif: [L.notifPrefs, L.notifBudgetExceeded, L.notifKeyExpiring, L.notifPlanExpiring, L.notifUsageSpike],
    system: [L.systemSettings, L.timezone, L.currency, L.exchangeRate],
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
  const now = new Date();
  const billingUrl = useMemo(() => {
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return `/api/v1/billing/usage?limit=1&from=${from}`;
  }, [now.getMonth(), now.getFullYear()]);
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
      showToast(L.budgetExceeded, "error");
      hasNotifiedRef.current = true;
    }
    if (!isExceeded) hasNotifiedRef.current = false;
    prevExceeded.current = isExceeded;
  }, [budgetLimit, budgetPercent, lang]);

  // Auto-save budget with 2s debounce
  const budgetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const budgetLoadedRef = useRef(false);
  const notifPrefsTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!budgetLoadedRef.current) { budgetLoadedRef.current = true; setAutoSaveStatus("saved"); return; }
    if (!monthlyBudget || monthlyBudget === String(savedBudget)) { setAutoSaveStatus("saved"); return; }
    setAutoSaveStatus("unsaved");
    clearTimeout(budgetTimerRef.current);
    budgetTimerRef.current = setTimeout(() => {
      setAutoSaveStatus("saving");
      handleSaveBudget();
    }, 2000);
    return () => clearTimeout(budgetTimerRef.current);
  }, [monthlyBudget, savedBudget]);

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
        showToast(L.notifPrefsSaved, "success");
      } else {
        showToast(L.notifPrefsSaveFailed, "error");
      }
    } catch {
      showToast(L.networkError, "error");
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
        showToast(L.saved, "success");
        try { localStorage.setItem("oortapi-currency", systemCurrency); } catch { /* ignore */ }
      } else {
        showToast(L.saveFailed, "error");
      }
    } catch {
      showToast(L.networkError, "error");
    }
    setSystemSaving(false);
  };

  const handleSaveBudget = async () => {
    const budget = monthlyBudget ? parseFloat(monthlyBudget) : 0;
    if (budget < 0) {
      showToast(L.budgetNegative, "error");
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
        showToast(L.saved, "success");
      } else {
        showToast(L.saveFailed, "error");
      }
    } catch {
      showToast(L.networkError, "error");
    }
    setBudgetSaving(false);
  };

  const endpoint = typeof window !== "undefined" ? `${window.location.origin}/api/v1` : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{L.apiEndpoint}</h1>
      {/* Settings search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
        <input
          value={settingsSearch}
          onChange={(e) => setSettingsSearch(e.target.value)}
          placeholder={L.searchSettings}
          className="w-full h-8 pl-8 pr-3 rounded-md border border-input bg-background text-xs focus:border-primary focus:outline-none"
        />
      </div>

      {matchSearch(...sectionMeta.baseUrl) && (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">{L.baseUrl}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted/50 rounded px-3 py-2 text-sm font-mono">{endpoint}</code>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(endpoint); showToast(t.common.copied, "success"); }}>
              {L.copyEndpoint}
            </Button>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Budget Management */}
      {matchSearch(...sectionMeta.budget) && (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {L.budget}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{L.budgetDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div>
            <label className="text-sm text-muted-foreground">{L.monthlyBudget} ($)</label>
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
                {autoSaveStatus === "saved" ? L.saved : autoSaveStatus === "saving" ? L.saving : L.unsaved}
              </span>
            </div>
          </div>
          {budgetLimit > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{L.currentSpend}</span>
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
                {budgetStatus === "exceeded" ? L.budgetExceeded :
                 budgetStatus === "near" ? L.budgetNear :
                 L.budgetOk}
                {budgetPercent > 0 && ` (${budgetPercent.toFixed(1)}%)`}
              </p>
            </div>
          )}
          <Button onClick={handleSaveBudget} disabled={budgetSaving}>
            {budgetSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            {L.saveBudget}
          </Button>
        </CardContent>
      </Card>
      )}

      {/* Notification Preferences */}
      {matchSearch(...sectionMeta.notif) && (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            {L.notifPrefs}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-md">
            {[
              { key: "budget", label: L.notifBudgetExceeded, desc: L.notifBudgetExceededDesc },
              { key: "key_expiry", label: L.notifKeyExpiring, desc: L.notifKeyExpiringDesc },
              { key: "sub_expiry", label: L.notifPlanExpiring, desc: L.notifPlanExpiringDesc },
              { key: "usage_spike", label: L.notifUsageSpike, desc: L.notifUsageSpikeDesc },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div role="switch" aria-checked={notifPrefs[item.key]} className={`w-9 h-5 rounded-full transition-colors relative ${notifPrefs[item.key] ? "bg-primary" : "bg-muted/50 border border-border"}`}>
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
      {user?.role === "admin" && matchSearch(...sectionMeta.system) && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {L.systemSettings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <div>
              <label className="text-sm text-muted-foreground">{L.timezone}</label>
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
              <label className="text-sm text-muted-foreground">{L.currency}</label>
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
              <label className="text-sm text-muted-foreground">{L.exchangeRateLabel}</label>
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
              {L.saveSystem}
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
                    showToast(L.configExported, "success");
                  }
                } catch { showToast(L.exportFailed, "error"); }
              }}>
                <Download className="h-4 w-4 mr-1" />
                {L.exportConfig}
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
                      showToast(L.importSuccessDetail.replace("{settings}", String(result.imported?.settings || 0)).replace("{models}", String(result.imported?.model_rates || 0)), "success");
                    } else {
                      showToast(L.importFailed, "error");
                    }
                  } catch { showToast(L.importFailedInvalid, "error"); }
                };
                input.click();
              }}>
                <Upload className="h-4 w-4 mr-1" />
                {L.importConfig}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmExchangeOpen}
        onOpenChange={setConfirmExchangeOpen}
        title={L.changeExchangeRate}
        message={L.changeExchangeRateDesc}
        onConfirm={() => { setConfirmExchangeOpen(false); doSaveSystem(); }}
        confirmLabel={t.common.confirm}
        variant="default"
      />
    </div>
  );
}

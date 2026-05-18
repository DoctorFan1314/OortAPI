"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/toast-context";
import { Loader2, Settings, Download, Upload, Wallet } from "lucide-react";

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

  const budgetLimit = monthlyBudget ? parseFloat(monthlyBudget) : 0;
  const budgetPercent = budgetLimit > 0 ? (currentSpend / budgetLimit) * 100 : 0;
  const budgetStatus = budgetLimit > 0 ? (budgetPercent >= 100 ? "exceeded" : budgetPercent >= 80 ? "near" : "ok") : "none";

  useEffect(() => {
    fetch("/api/dashboard/settings", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.settings && user?.role === "admin") {
          setTimezone(d.settings.timezone || "Asia/Shanghai");
          setSystemCurrency(d.settings.currency || "USD");
          setExchangeRate(d.settings.exchange_rate || "7.3");
          setInitialExchangeRate(d.settings.exchange_rate || "7.3");
        }
        if (d.preferences?.monthly_budget) {
          setMonthlyBudget(String(d.preferences.monthly_budget));
        }
      })
      .catch(() => {});
    // Fetch current month spending
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    fetch(`/api/v1/billing/usage?limit=1&from=${from}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setCurrentSpend(d.total_cost || 0);
      })
      .catch(() => {});
  }, [user]);

  // Budget alert on load
  useEffect(() => {
    if (budgetLimit > 0 && budgetPercent >= 100) {
      showToast("Budget exceeded!", "error");
    }
  }, [budgetLimit, budgetPercent]);

  const handleSaveSystem = async () => {
    if (exchangeRate !== initialExchangeRate) {
      if (!window.confirm(lang === "zh" ? "确定要修改汇率吗？" : "Are you sure you want to change the exchange rate?")) return;
    }
    setSystemSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ timezone, currency: systemCurrency, exchange_rate: exchangeRate }),
      });
      if (res.ok) {
        showToast(t.saved, "success");
        // Update localStorage so CurrencyProvider picks up the change immediately
        try { localStorage.setItem("oortapi-currency", systemCurrency); } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    setSystemSaving(false);
  };

  const handleSaveBudget = async () => {
    setBudgetSaving(true);
    try {
      const budget = monthlyBudget ? parseFloat(monthlyBudget) : null;
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ monthly_budget: budget }),
      });
      if (res.ok) showToast(t.saved, "success");
    } catch { /* ignore */ }
    setBudgetSaving(false);
  };

  const endpoint = typeof window !== "undefined" ? `${window.location.origin}/api/v1` : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.apiEndpoint}</h1>

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

      {/* Budget Management */}
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
    </div>
  );
}

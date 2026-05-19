"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ModelAnalytics } from "@/components/dashboard/model-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Key, CreditCard, ArrowRight, Sparkles, Copy, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

const LABELS = {
  zh: {
    title: "快速开始",
    description: "使用以下代码开始调用 OortAPI",
    welcome: "欢迎使用 OortAPI",
    welcomeDesc: "完成以下步骤开始使用 AI API 中转服务",
    step1: "创建 API Key",
    step1Desc: "生成一个 API Key 用于调用 AI 模型",
    step2: "选择套餐",
    step2Desc: "选择适合你的 Token Plan 套餐",
    step3: "开始调用",
    step3Desc: "使用 API Key 调用 30+ AI 模型",
    goTo: "前往",
    done: "已完成",
    createKey: "创建 API Key",
    browsePlans: "浏览套餐",
    viewDocs: "查看文档",
  },
  en: {
    title: "Quick Start",
    description: "Use the following code to start calling OortAPI",
    welcome: "Welcome to OortAPI",
    welcomeDesc: "Complete these steps to start using the AI API relay",
    step1: "Create API Key",
    step1Desc: "Generate an API Key to call AI models",
    step2: "Choose a Plan",
    step2Desc: "Pick a Token Plan that fits your needs",
    step3: "Start Calling",
    step3Desc: "Use your API Key to call 30+ AI models",
    goTo: "Go to",
    done: "Done",
    createKey: "Create API Key",
    browsePlans: "Browse Plans",
    viewDocs: "View Docs",
  },
};

export default function DashboardPage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const t = LABELS[lang];
  const [baseUrl, setBaseUrl] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const { data: keysData, error: keysError, mutate: mutateKeys } = useSWR<{ keys: { id: number }[] }>("/api/dashboard/keys", dashboardSWRConfig);
  const { data: subData, error: subError, mutate: mutateSub } = useSWR<{ subscriptions: { id: number; status: string; current_period_end: string; plan_display_name: string; auto_renew: number }[] }>("/api/dashboard/subscription", dashboardSWRConfig);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  useEffect(() => {
    if (keysData || subData) setLastUpdated(new Date());
  }, [keysData, subData]);

  const hasError = !!(keysError || subError);

  function handleRefresh() {
    mutateKeys();
    mutateSub();
  }

  const hasKeys = (keysData?.keys?.length || 0) > 0;
  const hasSub = (subData?.subscriptions?.length || 0) > 0;
  const isNewUser = !hasKeys && !hasSub;

  // Check for expiring subscription (within 3 days, not auto-renew)
  const expiringSub = subData?.subscriptions?.find(s => {
    if (s.status !== 'active' || s.auto_renew) return false;
    const endDate = new Date(s.current_period_end);
    const now = new Date();
    const daysLeft = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft <= 3;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {lang === "zh" ? "控制台" : "Dashboard"}
        </h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              {lang === "zh" ? "上次更新" : "Last updated"}: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            {lang === "zh" ? "刷新" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {hasError && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-400">
              {lang === "zh" ? "部分数据加载失败" : "Failed to load some data"}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "zh" ? "请检查网络连接后重试" : "Check your connection and retry"}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh} className="shrink-0 border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            {lang === "zh" ? "重试" : "Retry"}
          </Button>
        </div>
      )}

      {/* Subscription expiry warning */}
      {expiringSub && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-400">
              {lang === "zh"
                ? `您的 ${expiringSub.plan_display_name} 套餐将于 ${new Date(expiringSub.current_period_end).toLocaleDateString()} 到期`
                : `Your ${expiringSub.plan_display_name} plan expires on ${new Date(expiringSub.current_period_end).toLocaleDateString()}`
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "zh" ? "自动续费已关闭，请及时续费以避免服务中断" : "Auto-renew is off. Renew now to avoid service interruption"}
            </p>
          </div>
          <Link href="/dashboard/token-plan">
            <Button size="sm" variant="outline" className="shrink-0 border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
              {lang === "zh" ? "续费" : "Renew"}
            </Button>
          </Link>
        </div>
      )}

      {/* Onboarding for new users */}
      {isNewUser && (
        <Card className="glass-card border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t.welcome}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t.welcomeDesc}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Step 1 */}
              <div className="flex flex-col gap-2 p-4 rounded-lg glass-card glass-card-hover">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  <Key className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{t.step1}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t.step1Desc}</p>
                <Link href="/dashboard/keys" className="mt-auto">
                  <Button size="sm" className="w-full gap-1">
                    {t.createKey} <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-2 p-4 rounded-lg glass-card glass-card-hover">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{t.step2}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t.step2Desc}</p>
                <Link href="/token-plan" className="mt-auto">
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    {t.browsePlans} <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col gap-2 p-4 rounded-lg glass-card glass-card-hover">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
                  <Code className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{t.step3}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t.step3Desc}</p>
                <Link href="/docs" className="mt-auto">
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    {t.viewDocs} <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <StatsCards lang={lang} />
      <ModelAnalytics />

      {baseUrl && (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t.description}</p>
          <div className="relative group">
            <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm font-mono">
{`curl ${baseUrl}/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-oort-xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`curl ${baseUrl}/api/v1/chat/completions \\\n  -H "Authorization: Bearer sk-oort-xxxxxxxxxxxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Hello!"}]\n  }'`);
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2000);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              aria-label="Copy code"
            >
              {codeCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}

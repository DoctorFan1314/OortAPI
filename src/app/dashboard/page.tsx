"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ModelAnalytics } from "@/components/dashboard/model-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Key, CreditCard, ArrowRight, Sparkles, Copy, Check } from "lucide-react";
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
  const [baseUrl, setBaseUrl] = useState("https://your-domain.com");
  const [codeCopied, setCodeCopied] = useState(false);
  const { data: keysData } = useSWR<{ keys: { id: number }[] }>("/api/dashboard/keys", dashboardSWRConfig);
  const { data: subData } = useSWR<{ subscriptions: { id: number }[] }>("/api/dashboard/subscription", dashboardSWRConfig);

  const hasKeys = (keysData?.keys?.length || 0) > 0;
  const hasSub = (subData?.subscriptions?.length || 0) > 0;
  const isNewUser = !hasKeys && !hasSub;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {lang === "zh" ? "控制台" : "Dashboard"}
      </h1>

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
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-border/50 bg-muted/30">
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
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-border/50 bg-muted/30">
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
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-border/50 bg-muted/30">
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
  -H "Authorization: Bearer sk-oort-YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`curl ${baseUrl}/api/v1/chat/completions \\\n  -H "Authorization: Bearer sk-oort-YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "gpt-4o",\n    "messages": [{"role": "user", "content": "Hello!"}]\n  }'`);
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2000);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Copy code"
            >
              {codeCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, Coins, DollarSign, Key, Shield, TrendingUp, User, Clock } from "lucide-react";
import Link from "next/link";

interface UserDetail {
  id: number;
  email: string;
  username: string;
  balance: number;
  role: string;
  enabled: number;
  created_at: string;
}

interface Stats {
  total_calls: number;
  total_tokens: number;
  total_cost: number;
  success_calls: number;
}

interface TopModel {
  model: string;
  calls: number;
  tokens: number;
}

interface TrendDay {
  day: string;
  calls: number;
  cost: number;
}

interface KeyItem {
  id: number;
  name: string;
  enabled: number;
  total_calls: number;
  last_used_at: string | null;
}

interface Subscription {
  plan_display_name: string;
  plan_name: string;
  credits_remaining: number;
  credits_total: number;
  current_period_end: string;
}

interface RecentActivity {
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost: number;
  success: number;
  latency_ms: number | null;
  created_at: string;
}

const LABELS = {
  zh: {
    title: "用户详情",
    back: "返回用户管理",
    totalCalls: "总调用",
    totalTokens: "总 Tokens",
    totalCost: "总花费",
    successRate: "成功率",
    topModels: "常用模型",
    calls: "调用次数",
    tokens: "Tokens",
    trend7d: "7 天趋势",
    day: "日期",
    cost: "费用",
    apiKeys: "API Keys",
    enabled: "已启用",
    disabled: "已禁用",
    lastUsed: "最后使用",
    never: "从未",
    noKeys: "暂无 API Key",
    subscription: "订阅信息",
    credits: "Credits",
    validUntil: "有效期至",
    noSub: "暂无订阅",
    status: "状态",
    registered: "注册时间",
    recentActivity: "近期活动",
    noActivity: "暂无调用记录",
  },
  en: {
    title: "User Details",
    back: "Back to Users",
    totalCalls: "Total Calls",
    totalTokens: "Total Tokens",
    totalCost: "Total Cost",
    successRate: "Success Rate",
    topModels: "Top Models",
    calls: "Calls",
    tokens: "Tokens",
    trend7d: "7-Day Trend",
    day: "Date",
    cost: "Cost",
    apiKeys: "API Keys",
    enabled: "Enabled",
    disabled: "Disabled",
    lastUsed: "Last Used",
    never: "Never",
    noKeys: "No API Keys",
    subscription: "Subscription",
    credits: "Credits",
    validUntil: "Valid Until",
    noSub: "No subscription",
    status: "Status",
    registered: "Registered",
    recentActivity: "Recent Activity",
    noActivity: "No calls yet",
  },
};

export default function UserDetailPage() {
  const { lang } = useI18n();
  const { formatPrice } = useCurrency();
  const t = LABELS[lang];
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [topModels, setTopModels] = useState<TopModel[]>([]);
  const [trend, setTrend] = useState<TrendDay[]>([]);
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/users?action=detail&id=${userId}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setUser(d.user);
        setStats(d.stats);
        setTopModels(d.topModels || []);
        setTrend(d.trend || []);
        setKeys(d.keys || []);
        setSubscription(d.subscription);
        setRecentActivity(d.recentActivity || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse bg-muted rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-12 text-muted-foreground">User not found</div>;
  }

  const successRate = stats && stats.total_calls > 0
    ? ((stats.success_calls / stats.total_calls) * 100).toFixed(1)
    : "-";

  const maxCalls = Math.max(...trend.map(d => d.calls), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/users" className="text-xs text-muted-foreground hover:text-foreground mb-1 inline-block">
            &larr; {t.back}
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            {user.email}
            {user.role === "admin" && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                <Shield className="h-3 w-3 mr-1" /> Admin
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.registered}: {new Date(user.created_at + "Z").toLocaleDateString()} · {t.status}: {user.enabled ? t.enabled : t.disabled}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="glass-card">
          <CardContent className="p-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-[10px] text-muted-foreground">{t.totalCalls}</p>
              <p className="text-lg font-bold font-mono">{(stats?.total_calls || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 flex items-center gap-2">
            <Coins className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-[10px] text-muted-foreground">{t.totalTokens}</p>
              <p className="text-lg font-bold font-mono">{(stats?.total_tokens || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-[10px] text-muted-foreground">{t.totalCost}</p>
              <p className="text-lg font-bold font-mono">{formatPrice(stats?.total_cost || 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-[10px] text-muted-foreground">{t.successRate}</p>
              <p className="text-lg font-bold font-mono">{successRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top models */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">{t.topModels}</CardTitle>
          </CardHeader>
          <CardContent>
            {topModels.length === 0 ? (
              <p className="text-sm text-muted-foreground">-</p>
            ) : (
              <div className="space-y-2">
                {topModels.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <code className="text-xs font-mono">{m.model}</code>
                    <span className="text-muted-foreground text-xs">{m.calls.toLocaleString()} {t.calls} · {m.tokens.toLocaleString()} {t.tokens}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 7-day trend */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">{t.trend7d}</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.length === 0 ? (
              <p className="text-sm text-muted-foreground">-</p>
            ) : (
              <div className="space-y-1">
                {trend.map((d) => (
                  <div key={d.day} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-muted-foreground">{d.day}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full"
                        style={{ width: `${(d.calls / maxCalls) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono">{d.calls}</span>
                    <span className="w-16 text-right font-mono text-muted-foreground">{formatPrice(d.cost)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Keys */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="h-4 w-4" />
            {t.apiKeys}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noKeys}</p>
          ) : (
            <div className="space-y-2">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between p-2 rounded-lg border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{k.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${k.enabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                      {k.enabled ? t.enabled : t.disabled}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.calls}: {k.total_calls.toLocaleString()} · {t.lastUsed}: {k.last_used_at ? new Date(k.last_used_at + "Z").toLocaleString() : t.never}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm">{t.subscription}</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{subscription.plan_display_name}</span>
                <span className="text-xs text-amber-400">
                  {subscription.credits_remaining.toLocaleString()} / {subscription.credits_total.toLocaleString()} {t.credits}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${subscription.credits_total > 0 ? ((subscription.credits_total - subscription.credits_remaining) / subscription.credits_total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {t.validUntil}: {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.noSub}</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t.recentActivity}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noActivity}</p>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/30 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={a.success ? "text-green-500" : "text-red-500"}>{a.success ? "✓" : "✗"}</span>
                    <code className="font-mono truncate">{a.model}</code>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground shrink-0">
                    <span>{(a.tokens_in + a.tokens_out).toLocaleString()} tok</span>
                    <span>${a.cost.toFixed(4)}</span>
                    {a.latency_ms && <span>{a.latency_ms}ms</span>}
                    <span className="w-28 text-right">{new Date(a.created_at + "Z").toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

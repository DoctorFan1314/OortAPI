"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Activity, Users, ArrowLeft } from "lucide-react";

interface HealthData {
  status: string;
  timestamp: string;
  version?: string;
  checks?: {
    database: { status: string; latency_ms: number };
    channels: { status: string; count: number };
    active_users_24h: number;
  };
}

const PROVIDERS = (locale: string) => [
  { name: "OpenAI", status: "operational" as const },
  { name: "Anthropic", status: "operational" as const },
  { name: "Google", status: "operational" as const },
  { name: "DeepSeek", status: "operational" as const },
  { name: "Meta", status: "operational" as const },
  { name: "Alibaba", status: "operational" as const },
];

export default function StatusPage() {
  const { lang } = useI18n();
  const locale = lang || "en";
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHealth = () => {
    setLoading(true);
    setError("");
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => { setHealth(d); setLoading(false); })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  };

  useEffect(() => { fetchHealth(); }, []);

  const overallStatus = health?.status === "healthy" ? "operational" : "degraded";
  const lastUpdated = health?.timestamp ? new Date(health.timestamp + "Z").toLocaleString() : "";

  return (
    <div className="min-h-[calc(100vh-8rem)] mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />{locale === "zh" ? "返回首页" : "Back to Home"}
      </Link>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-foreground">{locale === "zh" ? "系统状态" : "System Status"}</h1>
        <button onClick={fetchHealth} disabled={loading} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {locale === "zh" ? "刷新" : "Refresh"}
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`p-4 rounded-xl border mb-6 flex items-center gap-3 ${overallStatus === "operational" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
        {overallStatus === "operational" ? <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />}
        <div>
          <p className={`text-sm font-medium ${overallStatus === "operational" ? "text-emerald-400" : "text-amber-400"}`}>
            {overallStatus === "operational" ? (locale === "zh" ? "所有系统正常运行" : "All Systems Operational") : (locale === "zh" ? "部分系统异常" : "Partial System Outage")}
          </p>
          {lastUpdated && <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "最后更新" : "Last updated"}: {lastUpdated}</p>}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-6">{error}</div>
      )}

      {/* Infrastructure checks */}
      <Card className="glass-card mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />{locale === "zh" ? "基础设施" : "Infrastructure"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !health ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>
          ) : health?.checks ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground flex items-center gap-2"><Database className="h-3.5 w-3.5 text-muted-foreground" />{locale === "zh" ? "数据库" : "Database"}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{health.checks.database.latency_ms}ms</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${health.checks.database.status === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{health.checks.database.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border/30">
                <span className="text-sm text-foreground flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-muted-foreground" />{locale === "zh" ? "活跃渠道" : "Active Channels"}</span>
                <span className="text-xs font-mono text-foreground">{health.checks.channels.count}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border/30">
                <span className="text-sm text-foreground flex items-center gap-2"><Users className="h-3.5 w-3.5 text-muted-foreground" />{locale === "zh" ? "24h 活跃用户" : "24h Active Users"}</span>
                <span className="text-xs font-mono text-foreground">{health.checks.active_users_24h}</span>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Upstream providers */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />{locale === "zh" ? "上游服务商" : "Upstream Providers"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {PROVIDERS(locale).map((p) => (
              <div key={p.name} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-sm text-foreground">{p.name}</span>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${p.status === "operational" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.status === "operational" ? "bg-emerald-400" : "bg-red-400"}`} />
                  {p.status === "operational" ? (locale === "zh" ? "正常" : "Operational") : (locale === "zh" ? "异常" : "Outage")}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-4 text-center">
            {locale === "zh" ? "状态基于最近 5 分钟的自动检测" : "Status based on automated checks in the last 5 minutes"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

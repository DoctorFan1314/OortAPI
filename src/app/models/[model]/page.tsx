"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useCurrency } from "@/contexts/currency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Cpu, Activity, Clock, Coins, ArrowLeft, Server } from "lucide-react";
import Link from "next/link";

interface ModelInfo {
  name: string;
  display_name: string;
  provider: string;
  input_rate: number;
  output_rate: number;
  cache_rate: number;
  cache_creation_rate: number;
  credit_rate: number;
}

interface ChannelInfo {
  id: number;
  name: string;
  type: string;
  status: string;
  enabled: number;
  priority: number;
}

interface ModelStats {
  calls_7d: number;
  avg_latency: number | null;
  tokens_7d: number;
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  anthropic: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  deepseek: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  google: "bg-red-500/10 text-red-400 border-red-500/20",
  alibaba: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const LABELS = {
  zh: {
    title: "模型详情",
    back: "返回模型市场",
    provider: "供应商",
    inputRate: "输入价格",
    outputRate: "输出价格",
    cacheRead: "缓存读取",
    cacheCreate: "缓存创建",
    creditRate: "Credit 倍率",
    perMillion: "/1M tokens",
    channels: "可用渠道",
    noChannels: "暂无可用渠道",
    stats7d: "7 天统计",
    totalCalls: "调用次数",
    avgLatency: "平均延迟",
    totalTokens: "总 Tokens",
    priority: "优先级",
    online: "在线",
    offline: "离线",
    unknown: "未知",
    status: "状态",
  },
  en: {
    title: "Model Details",
    back: "Back to Models",
    provider: "Provider",
    inputRate: "Input Price",
    outputRate: "Output Price",
    cacheRead: "Cache Read",
    cacheCreate: "Cache Write",
    creditRate: "Credit Rate",
    perMillion: "/1M tokens",
    channels: "Available Channels",
    noChannels: "No available channels",
    stats7d: "7-Day Stats",
    totalCalls: "Total Calls",
    avgLatency: "Avg Latency",
    totalTokens: "Total Tokens",
    priority: "Priority",
    online: "Online",
    offline: "Offline",
    unknown: "Unknown",
    status: "Status",
  },
};

export default function ModelDetailPage() {
  const { lang } = useI18n();
  const { formatPrice, symbol, exchangeRate } = useCurrency();
  const t = LABELS[lang];
  const params = useParams();
  const modelName = decodeURIComponent(params.model as string);

  const [model, setModel] = useState<ModelInfo | null>(null);
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/models/${encodeURIComponent(modelName)}`)
      .then(r => r.json())
      .then(d => {
        setModel(d.model);
        setChannels(d.channels || []);
        setStats(d.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [modelName]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Model not found</p>
        <Link href="/models" className="text-primary hover:underline text-sm mt-2 inline-block">{t.back}</Link>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "online": return "text-green-500";
      case "offline": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "online": return t.online;
      case "offline": return t.offline;
      default: return t.unknown;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link href="/models" className="text-xs text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> {t.back}
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Cpu className="h-6 w-6" />
          {model.display_name}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className={PROVIDER_COLORS[model.provider] || PROVIDER_COLORS.unknown}>
            {model.provider}
          </Badge>
          <code className="text-xs text-muted-foreground font-mono">{model.name}</code>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="glass-card">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">{t.inputRate}</p>
            <p className="text-lg font-bold font-mono">{symbol}{(model.input_rate * exchangeRate).toFixed(4)}</p>
            <p className="text-[10px] text-muted-foreground">{t.perMillion}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">{t.outputRate}</p>
            <p className="text-lg font-bold font-mono">{symbol}{(model.output_rate * exchangeRate).toFixed(4)}</p>
            <p className="text-[10px] text-muted-foreground">{t.perMillion}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">{t.cacheRead}</p>
            <p className="text-lg font-bold font-mono">{symbol}{(model.cache_rate * exchangeRate).toFixed(4)}</p>
            <p className="text-[10px] text-muted-foreground">{t.perMillion}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground">{t.creditRate}</p>
            <p className="text-lg font-bold font-mono">{model.credit_rate}</p>
            <p className="text-[10px] text-muted-foreground">1 token = {model.credit_rate} credits</p>
          </CardContent>
        </Card>
      </div>

      {/* 7-day stats */}
      {stats && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t.stats7d}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t.totalCalls}</p>
                <p className="text-xl font-bold font-mono">{stats.calls_7d.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.avgLatency}</p>
                <p className="text-xl font-bold font-mono">{stats.avg_latency !== null ? `${stats.avg_latency}ms` : "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.totalTokens}</p>
                <p className="text-xl font-bold font-mono">{stats.tokens_7d.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Channels */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="h-4 w-4" />
            {t.channels} ({channels.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {channels.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noChannels}</p>
          ) : (
            <div className="space-y-2">
              {channels.map(ch => (
                <div key={ch.id} className="flex items-center justify-between p-2 rounded-lg border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${statusColor(ch.status)}`}>●</span>
                    <span className="text-sm font-medium">{ch.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{ch.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{t.priority}: {ch.priority}</span>
                    <span className={statusColor(ch.status)}>{statusLabel(ch.status)}</span>
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

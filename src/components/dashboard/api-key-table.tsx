"use client";

import { useState, useEffect, Fragment } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Copy, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/contexts/toast-context";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";

interface ApiKey {
  id: number;
  name: string;
  key_value: string;
  permissions: string;
  rate_limit: number;
  enabled: number;
  created_at: string;
  last_used_at: string | null;
  total_calls: number;
  expires_at: string | null;
}

const LABELS = {
  zh: {
    title: "API Keys 管理",
    create: "创建新 Key",
    name: "名称",
    key: "Key",
    status: "状态",
    calls: "调用次数",
    lastUsed: "最后使用",
    enabled: "已启用",
    disabled: "已禁用",
    never: "从未",
    copied: "已复制到剪贴板",
    keyCreated: "API Key 创建成功",
    confirmDelete: "确定删除此 Key？",
    noKeys: "暂无 API Key，点击上方按钮创建",
    searchKeys: "搜索 Key...",
    rateLimit: "速率限制",
    rpm: "次/分钟",
    save: "保存",
    cancel: "取消",
    keyAnalytics: "Key 用量分析",
    recentCalls: "近 7 天调用",
    recentCost: "近 7 天费用",
    recentTokens: "近 7 天 Tokens",
    avgLatency: "平均延迟",
    errorRate: "错误率",
    noData: "暂无数据",
    expires: "过期时间",
    expiresIn: "剩余 {days} 天",
    expired: "已过期",
    neverExpires: "永不过期",
  },
  en: {
    title: "API Keys Management",
    create: "Create New Key",
    name: "Name",
    key: "Key",
    status: "Status",
    calls: "Total Calls",
    lastUsed: "Last Used",
    enabled: "Enabled",
    disabled: "Disabled",
    never: "Never",
    copied: "Copied to clipboard",
    keyCreated: "API Key created successfully",
    confirmDelete: "Delete this key?",
    noKeys: "No API keys yet. Click above to create one.",
    rateLimit: "Rate Limit",
    rpm: "RPM",
    save: "Save",
    cancel: "Cancel",
    keyAnalytics: "Key Analytics",
    recentCalls: "7d Calls",
    recentCost: "7d Cost",
    recentTokens: "7d Tokens",
    avgLatency: "Avg Latency",
    errorRate: "Error Rate",
    noData: "No data",
    searchKeys: "Search keys...",
    expires: "Expires",
    expiresIn: "{days} days left",
    expired: "Expired",
    neverExpires: "Never expires",
  },
};

export function ApiKeyTable({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const { data, isLoading, mutate } = useSWR<{ keys: ApiKey[] }>("/api/dashboard/keys", dashboardSWRConfig);
  const keys = data?.keys || [];
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyExpires, setNewKeyExpires] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [newKeyFull, setNewKeyFull] = useState<string | null>(null);
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const [editRateValue, setEditRateValue] = useState("60");
  const [expandedKeyId, setExpandedKeyId] = useState<number | null>(null);
  const [keyStats, setKeyStats] = useState<Record<number, { calls: number; cost: number; tokens: number; avg_latency: number | null; error_rate: number; by_model?: { model: string; calls: number; cost: number; tokens: number }[] }>>({});
  const { toast: showToast } = useToast();
  const [keySearch, setKeySearch] = useState("");
  const t = LABELS[lang];

  const createKey = async () => {
    if (!newKeyName.trim()) {
      showToast(lang === "zh" ? "请输入 Key 名称" : "Key name is required", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newKeyName, expires_at: newKeyExpires || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewKeyName("");
        setNewKeyExpires("");
        mutate();
        if (data.full_key) {
          setNewKeyFull(data.full_key);
        } else {
          showToast(t.keyCreated, "success");
        }
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleKey = async (id: number, enabled: boolean) => {
    await fetch("/api/dashboard/keys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, enabled }),
    });
    mutate();
  };

  const confirmDelete = async () => {
    if (deleteTarget === null) return;
    await fetch("/api/dashboard/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: deleteTarget }),
    });
    setDeleteTarget(null);
    mutate();
  };

  const saveRateLimit = async (id: number) => {
    const val = Math.min(Math.max(Math.floor(Number(editRateValue) || 60), 1), 10000);
    await fetch("/api/dashboard/keys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, rate_limit: val }),
    });
    setEditingRateId(null);
    mutate();
  };

  const toggleKeyAnalytics = async (id: number) => {
    if (expandedKeyId === id) {
      setExpandedKeyId(null);
      return;
    }
    setExpandedKeyId(id);
    if (!keyStats[id]) {
      try {
        const res = await fetch(`/api/dashboard/keys/${id}/stats`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setKeyStats(prev => ({ ...prev, [id]: data }));
        }
      } catch {}
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast(t.copied, "success");
  };

  const maskKey = (key: string) => key.slice(0, 12) + "..." + key.slice(-4);

  const formatLastUsed = (dateStr: string | null) => {
    if (!dateStr) return t.never;
    const date = new Date(dateStr + "Z");
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return lang === "zh" ? "刚刚" : "Just now";
    if (diffMin < 60) return lang === "zh" ? `${diffMin} 分钟前` : `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return lang === "zh" ? `${diffHr} 小时前` : `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return lang === "zh" ? `${diffDay} 天前` : `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  const filteredKeys = keySearch
    ? keys.filter(k => k.name.toLowerCase().includes(keySearch.toLowerCase()) || k.key_value.toLowerCase().includes(keySearch.toLowerCase()))
    : keys;

  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted rounded-lg" />;
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">{t.title}{!isLoading && <Badge variant="secondary" className="ml-1 text-xs">{keys.length}</Badge>}</CardTitle>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t.name}
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            className="w-40 h-9"
          />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{t.expires}:</span>
            <input type="date" value={newKeyExpires} onChange={e => setNewKeyExpires(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-9 px-2 rounded-md border border-input bg-background text-sm" />
          </div>
          <Button size="sm" onClick={createKey} disabled={creating}>
            <Plus className="h-4 w-4 mr-1" />
            {t.create}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredKeys.length === 0 && keys.length > 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{lang === "zh" ? "无匹配的 Key" : "No matching keys"}</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{t.noKeys}</div>
        ) : (
          <div className="space-y-3">
            {keys.length > 5 && (
              <input value={keySearch} onChange={e => setKeySearch(e.target.value)}
                placeholder={t.searchKeys}
                className="w-full h-8 px-3 rounded-md border border-input bg-background text-sm" />
            )}
            {filteredKeys.map((k) => {
              const isExpired = k.expires_at ? new Date(k.expires_at + 'T23:59:59') < new Date() : false;
              const calcDaysLeft = k.expires_at ? Math.ceil((new Date(k.expires_at + 'T23:59:59').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
              return (
              <Fragment key={k.id}>
              <div className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${isExpired ? "border-red-500/30 bg-red-500/5" : "border-border/50 hover:bg-muted/50"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{k.name}</span>
                    <button onClick={() => toggleKeyAnalytics(k.id)}
                      className={`text-xs px-1.5 py-0.5 rounded transition-colors ${expandedKeyId === k.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                      {t.keyAnalytics}
                    </button>
                    <StatusBadge variant={k.enabled ? "success" : "error"} label={k.enabled ? t.enabled : t.disabled} />
                    {isExpired && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">{t.expired}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-muted-foreground break-all">
                      {k.key_value}
                    </code>
                    <button onClick={() => copyKey(k.key_value)} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Copy key">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {k.expires_at ? (
                      <span className={isExpired ? "text-red-500" : ""}>
                        {t.expires}: {new Date(k.expires_at + "Z").toLocaleDateString()}
                        {isExpired ? ` (${t.expired})` : calcDaysLeft !== null ? ` (${t.expiresIn.replace('{days}', String(calcDaysLeft))})` : ""}
                      </span>
                    ) : (
                      <span>{t.expires}: {t.neverExpires}</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground shrink-0">
                  <div>{t.calls}: {k.total_calls.toLocaleString()}</div>
                  <div>{t.lastUsed}: {formatLastUsed(k.last_used_at)}</div>
                  {editingRateId === k.id ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Input type="number" value={editRateValue} onChange={e => setEditRateValue(e.target.value)}
                        className="w-16 h-6 text-xs px-1" min={1} max={10000}
                        onKeyDown={e => { if (e.key === 'Enter') saveRateLimit(k.id); if (e.key === 'Escape') setEditingRateId(null); }}
                        autoFocus />
                      <button onClick={() => saveRateLimit(k.id)} className="text-green-500 hover:text-green-400 text-xs">{t.save}</button>
                      <button onClick={() => setEditingRateId(null)} className="text-muted-foreground hover:text-foreground text-xs">{t.cancel}</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingRateId(k.id); setEditRateValue(String(k.rate_limit)); }}
                      className="mt-1 hover:text-foreground cursor-pointer" title={t.rateLimit}>
                      {t.rateLimit}: {k.rate_limit} {t.rpm}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleKey(k.id, !k.enabled)} className="text-muted-foreground hover:text-foreground" aria-label={k.enabled ? "Disable key" : "Enable key"}>
                    {k.enabled ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button onClick={() => setDeleteTarget(k.id)} className="text-muted-foreground hover:text-red-500" aria-label="Delete key">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {expandedKeyId === k.id && (
                <div className="px-3 pb-3 pt-1">
                  {keyStats[k.id] ? (() => {
                    const s = keyStats[k.id];
                    return (<>
                    <div className="grid grid-cols-5 gap-3 p-3 bg-muted/30 rounded-lg text-xs">
                      <div>
                        <p className="text-muted-foreground">{t.recentCalls}</p>
                        <p className="text-base font-bold font-mono">{s.calls.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.recentCost}</p>
                        <p className="text-base font-bold font-mono">${s.cost.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.recentTokens}</p>
                        <p className="text-base font-bold font-mono">{s.tokens.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.avgLatency}</p>
                        <p className="text-base font-bold font-mono">{s.avg_latency != null ? `${Math.round(s.avg_latency)}ms` : "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t.errorRate}</p>
                        <p className={`text-base font-bold font-mono ${s.error_rate > 10 ? "text-red-500" : s.error_rate > 0 ? "text-amber-500" : "text-green-500"}`}>
                          {s.error_rate}%
                        </p>
                      </div>
                    </div>
                    {s.by_model && s.by_model.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/20">
                        <p className="text-xs text-muted-foreground mb-1">{lang === "zh" ? "按模型" : "By Model"}</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {s.by_model.slice(0, 5).map(m => (
                            <div key={m.model} className="flex justify-between text-xs">
                              <span className="font-mono text-muted-foreground truncate max-w-[120px]">{m.model}</span>
                              <span className="font-mono shrink-0">{m.calls.toLocaleString()} calls · ${m.cost.toFixed(4)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    </>
                    );
                  })() : (
                    <div className="h-16 animate-pulse bg-muted/30 rounded-lg" />
                  )}
                </div>
              )}
              </Fragment>
              );
            })}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={lang === "zh" ? "删除 API Key" : "Delete API Key"}
        message={deleteTarget
          ? (lang === "zh" ? `确定要删除「${keys.find(k => k.id === deleteTarget)?.name}」吗？此操作不可撤销。` : `Delete "${keys.find(k => k.id === deleteTarget)?.name}"? This cannot be undone.`)
          : ""}
        onConfirm={confirmDelete}
        confirmLabel={lang === "zh" ? "确认删除" : "Delete"}
        variant="danger"
      />

      {/* Show full key after creation */}
      <Dialog open={newKeyFull !== null} onOpenChange={(open) => { if (!open) setNewKeyFull(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{lang === "zh" ? "API Key 创建成功" : "API Key Created"}</DialogTitle>
            <DialogDescription>
              {lang === "zh"
                ? "请立即复制保存此 Key，它只会显示一次！"
                : "Copy and save this key now — it will only be shown once!"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm font-mono break-all">{newKeyFull}</code>
            <Button size="sm" variant="outline" onClick={() => { if (newKeyFull) { navigator.clipboard.writeText(newKeyFull); showToast(t.copied, "success"); } }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setNewKeyFull(null)}>{lang === "zh" ? "我已保存" : "I've saved it"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

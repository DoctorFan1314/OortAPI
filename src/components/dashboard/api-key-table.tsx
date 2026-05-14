"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Copy, Eye, EyeOff, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/contexts/toast-context";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

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
  },
};

export function ApiKeyTable({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const { data, isLoading, mutate } = useSWR<{ keys: ApiKey[] }>("/api/dashboard/keys", dashboardSWRConfig);
  const keys = data?.keys || [];
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const { toast: showToast } = useToast();
  const t = LABELS[lang];

  const createKey = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newKeyName || "Default" }),
      });
      if (res.ok) {
        setNewKeyName("");
        mutate();
        showToast(t.keyCreated, "success");
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

  if (isLoading) {
    return <div className="h-48 animate-pulse bg-muted rounded-lg" />;
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{t.title}</CardTitle>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t.name}
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            className="w-40 h-9"
          />
          <Button size="sm" onClick={createKey} disabled={creating}>
            <Plus className="h-4 w-4 mr-1" />
            {t.create}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {keys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{t.noKeys}</div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{k.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${k.enabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                      {k.enabled ? t.enabled : t.disabled}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-muted-foreground">
                      {showKey[k.id] ? k.key_value : maskKey(k.key_value)}
                    </code>
                    <button onClick={() => setShowKey(p => ({ ...p, [k.id]: !p[k.id] }))} className="text-muted-foreground hover:text-foreground" aria-label={showKey[k.id] ? "Hide key" : "Show key"}>
                      {showKey[k.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button onClick={() => copyKey(k.key_value)} className="text-muted-foreground hover:text-foreground" aria-label="Copy key">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground shrink-0">
                  <div>{t.calls}: {k.total_calls}</div>
                  <div>{t.lastUsed}: {formatLastUsed(k.last_used_at)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleKey(k.id, !k.enabled)} className="text-muted-foreground hover:text-foreground" aria-label={k.enabled ? t.disabled : t.enabled}>
                    {k.enabled ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button onClick={() => setDeleteTarget(k.id)} className="text-muted-foreground hover:text-red-500" aria-label={t.confirmDelete}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.title}</DialogTitle>
            <DialogDescription>{t.confirmDelete}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{lang === "zh" ? "取消" : "Cancel"}</Button>
            <Button onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">{lang === "zh" ? "确认删除" : "Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

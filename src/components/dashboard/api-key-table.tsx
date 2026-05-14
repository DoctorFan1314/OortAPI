"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        showToast(t.copied, "success");
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

  const deleteKey = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    await fetch("/api/dashboard/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    mutate();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast(t.copied, "success");
  };

  const maskKey = (key: string) => key.slice(0, 12) + "..." + key.slice(-4);

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
                    <button onClick={() => setShowKey(p => ({ ...p, [k.id]: !p[k.id] }))} className="text-muted-foreground hover:text-foreground">
                      {showKey[k.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button onClick={() => copyKey(k.key_value)} className="text-muted-foreground hover:text-foreground">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground shrink-0">
                  <div>{t.calls}: {k.total_calls}</div>
                  <div>{t.lastUsed}: {k.last_used_at || t.never}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleKey(k.id, !k.enabled)} className="text-muted-foreground hover:text-foreground">
                    {k.enabled ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button onClick={() => deleteKey(k.id)} className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

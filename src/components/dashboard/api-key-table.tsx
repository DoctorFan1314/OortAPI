"use client";

import { useState, useEffect, Fragment } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Copy, Plus, Trash2, RefreshCw, Key, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
    noKeys: "暂无 API Key，点击下方按钮创建",
    justNow: "刚刚",
    minutesAgo: "{n} 分钟前",
    hoursAgo: "{n} 小时前",
    daysAgo: "{n} 天前",
    keyNameRequired: "请输入 Key 名称",
    operationFailed: "操作失败",
    networkError: "网络错误",
    rotationFailed: "轮换失败",
    confirmBatchDelete: "确定删除选中的 {count} 个 Key？",
    createTitle: "创建新 Key",
    selectAll: "全选",
    noMatch: "无匹配的 Key",
    callsText: "次调用",
    switchOn: "已启用",
    switchOff: "已禁用",
    rotate: "轮换",
    delete: "删除",
    createDesc: "创建新的 API Key。Key 名称用于标识用途。可选设置过期时间。",
    keyNameLabel: "名称",
    keyNamePlaceholder: "例如：开发环境、生产环境",
    expiresLabel: "过期时间（可选）",
    expiresHint: "留空则永不过期",
    creating: "创建中...",
    batchDelete: "批量删除",
    confirmDeleteTitle: "删除 API Key",
    confirmDeleteLabel: "确认删除",
    keyCreatedTitle: "API Key 创建成功",
    keyCreatedDesc: "请立即复制保存此 Key，它只会显示一次！",
    keySaved: "我已保存",
    searchKeys: "搜索 Key...",
    rateLimit: "速率限制",
    rpm: "次/分钟",
    save: "保存",
    cancel: "取消",
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
    noKeys: "No API keys yet. Click below to create one.",
    justNow: "Just now",
    minutesAgo: "{n}m ago",
    hoursAgo: "{n}h ago",
    daysAgo: "{n}d ago",
    keyNameRequired: "Key name is required",
    rateLimit: "Rate Limit",
    rpm: "RPM",
    save: "Save",
    cancel: "Cancel",
    rotationFailed: "Rotation failed",
    operationFailed: "Operation failed",
    networkError: "Network error",
    confirmBatchDelete: "Delete {count} selected keys?",
    createTitle: "Create New Key",
    selectAll: "All",
    noMatch: "No matching keys",
    callsText: "calls",
    switchOn: "On",
    switchOff: "Off",
    rotate: "Rotate",
    delete: "Delete",
    createDesc: "Create a new API key. Name it for identification. Optionally set an expiration date.",
    keyNameLabel: "Key Name",
    keyNamePlaceholder: "e.g. Dev, Production",
    expiresLabel: "Expires (optional)",
    expiresHint: "Leave empty for no expiration",
    creating: "Creating...",
    batchDelete: "Batch Delete",
    confirmDeleteTitle: "Delete API Key",
    confirmDeleteLabel: "Delete",
    keyCreatedTitle: "API Key Created",
    keyCreatedDesc: "Copy and save this key now — it will only be shown once!",
    keySaved: "I've saved it",
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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [newKeyFull, setNewKeyFull] = useState<string | null>(null);
  // Auto-copy to clipboard when key is created
  useEffect(() => {
    if (newKeyFull) {
      navigator.clipboard.writeText(newKeyFull).catch(() => {});
    }
  }, [newKeyFull]);
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const [editRateValue, setEditRateValue] = useState("60");
  const { toast: showToast } = useToast();
  const [keySearch, setKeySearch] = useState("");
  const t = LABELS[lang];

  const createKey = async () => {
    if (!newKeyName.trim()) {
      showToast(t.keyNameRequired, "error");
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
        setShowCreateDialog(false);
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
    // Optimistic: toggle immediately, revalidate on response
    mutate({ ...data, keys: (data?.keys || []).map((k: ApiKey) => k.id === id ? { ...k, enabled: enabled ? 1 : 0 } : k) } as typeof data, false);
    try {
      const res = await fetch("/api/dashboard/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, enabled }),
      });
      if (!res.ok) {
        const data = await res.json();
        mutate(); // Revert on error
        showToast(data.error || t.operationFailed, "error");
        return;
      }
      mutate();
    } catch {
      showToast(t.networkError, "error");
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget === null) return;
    try {
      const res = await fetch("/api/dashboard/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: deleteTarget }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || t.operationFailed, "error");
        return;
      }
      setDeleteTarget(null);
      mutate();
    } catch {
      showToast(t.networkError, "error");
    }
  };

  const handleRotateKey = async (id: number) => {
    try {
      const res = await fetch("/api/dashboard/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, action: "rotate" }),
      });
      const data = await res.json();
      if (res.ok && data.key?.full_key) {
        setNewKeyFull(data.key.full_key);
      } else {
        showToast(data.error || t.rotationFailed, "error");
      }
      mutate();
    } catch { showToast(t.networkError, "error"); }
  };

  const saveRateLimit = async (id: number) => {
    const val = Math.min(Math.max(Math.floor(Number(editRateValue) || 60), 1), 10000);
    try {
      const res = await fetch("/api/dashboard/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, rate_limit: val }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || t.operationFailed, "error");
        return;
      }
      setEditingRateId(null);
      mutate();
    } catch {
      showToast(t.networkError, "error");
    }
  };

  const toggleSelectKey = (id: number) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedKeys.size === filteredKeys.length) setSelectedKeys(new Set());
    else setSelectedKeys(new Set(filteredKeys.map(k => k.id)));
  };
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  const batchDelete = async () => {
    if (selectedKeys.size === 0) return;
    setShowBatchDeleteConfirm(true);
  };

  const confirmBatchDelete = async () => {
    setShowBatchDeleteConfirm(false);
    setBatchDeleting(true);
    const ids = Array.from(selectedKeys);
    setBatchProgress({ current: 0, total: ids.length });
    let successCount = 0;
    for (let i = 0; i < ids.length; i++) {
      setBatchProgress({ current: i + 1, total: ids.length });
      try {
        const res = await fetch("/api/dashboard/keys", { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ id: ids[i] }) });
        if (res.ok) successCount++;
      } catch {}
    }
    setBatchProgress(null);
    setSelectedKeys(new Set());
    setBatchDeleting(false);
    mutate();
    showToast(`${t.delete} ${successCount}/${ids.length} keys`, successCount === ids.length ? "success" : "warning");
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast(t.copied, "success");
  };

  const formatLastUsed = (dateStr: string | null) => {
    if (!dateStr) return t.never;
    const date = new Date(dateStr + "Z");
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return t.justNow;
    if (diffMin < 60) return t.minutesAgo.replace("{n}", String(diffMin));
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return t.hoursAgo.replace("{n}", String(diffHr));
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return t.daysAgo.replace("{n}", String(diffDay));
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
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {filteredKeys.length > 0 && (
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" checked={selectedKeys.size === filteredKeys.length && filteredKeys.length > 0}
                  onChange={toggleSelectAll} className="rounded border-border" />
                {t.selectAll}
              </label>
            )}
            <span className="text-xs text-muted-foreground">{`${keys.length} keys`}</span>
            {selectedKeys.size > 0 && (
              <Button size="sm" variant="outline" onClick={batchDelete} disabled={batchDeleting} className="text-red-500 text-xs h-7 ml-1">
                {batchDeleting
                  ? `${t.delete} ${batchProgress?.current || 0}/${batchProgress?.total || selectedKeys.size}...`
                  : `${t.delete} ${selectedKeys.size}`}
              </Button>
            )}
            {batchProgress && (
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-36">
              <input value={keySearch} onChange={e => setKeySearch(e.target.value)}
                placeholder={t.searchKeys}
                className="w-full h-9 px-3 pl-8 pr-8 rounded-lg border border-border/60 bg-background text-sm focus:border-primary focus:outline-none" />
              <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              {keySearch && (
                <button onClick={() => setKeySearch("")} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button size="sm" onClick={() => setShowCreateDialog(true)} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" />
              {t.create}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredKeys.length === 0 && keys.length > 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">{t.noMatch}</div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Key className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{t.noKeys}</p>
            <Button size="sm" variant="outline" onClick={() => setShowCreateDialog(true)} className="mt-2">
              <Plus className="h-4 w-4 mr-1" />{t.create}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredKeys.map((k) => {
              const isExpired = k.expires_at ? new Date(k.expires_at + 'T23:59:59') < new Date() : false;
              const calcDaysLeft = k.expires_at ? Math.ceil((new Date(k.expires_at + 'T23:59:59').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
              return (
              <Fragment key={k.id}>
              <div className={`rounded-xl border transition-all ${isExpired ? "border-red-500/30 bg-red-500/[0.02]" : "border-border/50 hover:border-border hover:shadow-sm"}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <input type="checkbox" checked={selectedKeys.has(k.id)} onChange={() => toggleSelectKey(k.id)} className="rounded border-border shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{k.name}</span>
                      <StatusBadge variant={k.enabled ? "success" : "error"} label={k.enabled ? t.enabled : t.disabled} />
                      {isExpired && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">{t.expired}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <code className="text-[11px] font-mono text-muted-foreground/70 select-all">{k.key_value}</code>
                      <button onClick={() => copyKey(k.key_value)} className="p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors" aria-label="Copy key">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
                      <span>{k.total_calls.toLocaleString()} {t.callsText}</span>
                      <span>{t.lastUsed}: {formatLastUsed(k.last_used_at)}</span>
                      {k.expires_at ? (
                        <span className={isExpired ? "text-red-500" : ""}>
                          {k.expires_at ? new Date(k.expires_at + "Z").toLocaleDateString() : ""}
                          {isExpired ? ` (${t.expired})` : calcDaysLeft !== null ? ` (${t.expiresIn.replace('{days}', String(calcDaysLeft))})` : ""}
                        </span>
                      ) : (
                        <span>{t.neverExpires}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Switch checked={!!k.enabled} onCheckedChange={(checked) => toggleKey(k.id, checked)}
                        className="border-2 border-border data-[checked]:bg-green-500 data-[unchecked]:bg-muted data-[unchecked]:border-border" />
                      <span className={`text-[11px] ${k.enabled ? "text-green-500" : "text-muted-foreground/50"}`}>
                        {k.enabled ? t.switchOn : t.switchOff}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-border/50" />
                    <div className="flex flex-col gap-1">
                      <button onClick={() => handleRotateKey(k.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-amber-400 hover:bg-muted transition-colors" title={t.rotate}>
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(k.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/60 hover:text-red-500 hover:bg-muted transition-colors" title={t.delete}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </Fragment>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Create Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Key className="h-5 w-5" />{t.createTitle}</DialogTitle>
            <DialogDescription>{t.createDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">{t.keyNameLabel} <span className="text-red-500">*</span></label>
              <Input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder={t.keyNamePlaceholder} autoFocus className="rounded-xl"
                onKeyDown={e => { if (e.key === 'Enter') createKey(); }} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">{t.expiresLabel}</label>
              <input type="date" value={newKeyExpires} onChange={e => setNewKeyExpires(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:border-primary focus:outline-none" />
              <p className="text-xs text-muted-foreground mt-1">{t.expiresHint}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>{t.cancel}</Button>
            <Button onClick={createKey} disabled={creating || !newKeyName.trim()}>
              {creating ? t.creating : <><Plus className="h-4 w-4 mr-1" />{t.create}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showBatchDeleteConfirm}
        onOpenChange={setShowBatchDeleteConfirm}
        title={t.batchDelete}
        message={t.confirmBatchDelete.replace("{count}", String(selectedKeys.size))}
        onConfirm={confirmBatchDelete}
        confirmLabel={t.confirmDeleteLabel}
        variant="danger"
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={t.confirmDeleteTitle}
        message={deleteTarget
          ? `${t.confirmDelete} "${keys.find(k => k.id === deleteTarget)?.name}"`
          : ""}
        onConfirm={confirmDelete}
        confirmLabel={t.confirmDeleteLabel}
        variant="danger"
      />

      {/* Show full key after creation */}
      <Dialog open={newKeyFull !== null} onOpenChange={(open) => { if (!open) setNewKeyFull(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.keyCreatedTitle}</DialogTitle>
            <DialogDescription>{t.keyCreatedDesc}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg overflow-hidden">
            <code className="flex-1 text-xs font-mono whitespace-nowrap select-all overflow-x-auto leading-relaxed">{newKeyFull}</code>
            <Button size="sm" variant="outline" className="shrink-0" onClick={() => { if (newKeyFull) { navigator.clipboard.writeText(newKeyFull); showToast(t.copied, "success"); } }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setNewKeyFull(null)}>{t.keySaved}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

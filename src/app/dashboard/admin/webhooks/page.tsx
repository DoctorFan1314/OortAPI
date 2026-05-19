"use client";

import { useI18n } from "@/contexts/i18n-context";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Webhook, Plus, Trash2, ToggleLeft, ToggleRight, Pencil, Send, Copy, CheckCheck } from "lucide-react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { useToast } from "@/contexts/toast-context";

interface WebhookItem {
  id: number;
  url: string;
  secret: string;
  events: string;
  enabled: number;
  created_at: string;
  updated_at: string;
  last_triggered_at: string | null;
  last_status_code: number | null;
}

const AVAILABLE_EVENTS = [
  "subscription.created",
  "subscription.renewed",
  "subscription.expired",
  "subscription.expiring",
  "user.created",
  "usage.threshold",
  "channel.down",
  "channel.up",
];

const LABELS = {
  zh: {
    title: "Webhook 管理",
    create: "新建 Webhook",
    url: "Webhook URL",
    events: "订阅事件",
    status: "状态",
    enabled: "已启用",
    disabled: "已禁用",
    actions: "操作",
    noWebhooks: "暂无 Webhook，点击上方按钮创建",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    confirmDelete: "确定删除此 Webhook？",
    test: "测试",
    testSent: "测试请求已发送",
    secret: "Secret",
    createdAt: "创建时间",
    urlRequired: "请输入 URL",
    eventsRequired: "请至少选择一个事件",
    created: "Webhook 创建成功",
    updated: "Webhook 更新成功",
    deleted: "Webhook 已删除",
    lastTriggered: "最后触发",
    lastStatus: "状态码",
    never: "从未",
  },
  en: {
    title: "Webhook Management",
    create: "Create Webhook",
    url: "Webhook URL",
    events: "Subscribe Events",
    status: "Status",
    enabled: "Enabled",
    disabled: "Disabled",
    actions: "Actions",
    noWebhooks: "No webhooks yet. Click above to create one.",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    confirmDelete: "Delete this webhook?",
    test: "Test",
    testSent: "Test request sent",
    secret: "Secret",
    createdAt: "Created",
    urlRequired: "URL is required",
    eventsRequired: "Select at least one event",
    created: "Webhook created",
    updated: "Webhook updated",
    deleted: "Webhook deleted",
    lastTriggered: "Last Triggered",
    lastStatus: "Status",
    never: "Never",
  },
};

export default function WebhooksPage() {
  const { lang } = useI18n();
  const t = LABELS[lang];
  const { toast: showToast } = useToast();
  const { data, isLoading, mutate } = useSWR<{ webhooks: WebhookItem[] }>("/api/dashboard/webhooks", dashboardSWRConfig);
  const webhooks = data?.webhooks || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [testing, setTesting] = useState<number | null>(null);
  const [copiedSecret, setCopiedSecret] = useState<number | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setUrl("");
    setSelectedEvents([]);
    setDialogOpen(true);
  };

  const openEdit = (wh: WebhookItem) => {
    setEditingId(wh.id);
    setUrl(wh.url);
    try {
      setSelectedEvents(JSON.parse(wh.events));
    } catch {
      setSelectedEvents([]);
    }
    setDialogOpen(true);
  };

  const toggleEvent = (ev: string) => {
    setSelectedEvents(prev => prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]);
  };

  const save = async () => {
    if (!url) { showToast(t.urlRequired, "error"); return; }
    if (selectedEvents.length === 0) { showToast(t.eventsRequired, "error"); return; }

    if (editingId) {
      await fetch("/api/dashboard/webhooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editingId, url, events: selectedEvents }),
      });
      showToast(t.updated, "success");
    } else {
      await fetch("/api/dashboard/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, events: selectedEvents }),
      });
      showToast(t.created, "success");
    }
    setDialogOpen(false);
    mutate();
  };

  const toggleEnabled = async (id: number, enabled: boolean) => {
    await fetch("/api/dashboard/webhooks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, enabled }),
    });
    mutate();
  };

  const confirmDelete = async () => {
    if (deleteTarget === null) return;
    await fetch("/api/dashboard/webhooks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: deleteTarget }),
    });
    setDeleteTarget(null);
    showToast(t.deleted, "success");
    mutate();
  };

  const testWebhook = async (id: number) => {
    setTesting(id);
    try {
      const res = await fetch(`/api/dashboard/webhooks/${id}/test`, {
        method: "POST",
        credentials: "include",
      });
      showToast(res.ok ? t.testSent : (lang === "zh" ? "测试请求失败" : "Test failed"), res.ok ? "success" : "error");
    } catch {
      showToast(lang === "zh" ? "网络错误" : "Network error", "error");
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Webhook className="h-6 w-6" />
          {t.title}
        </h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          {t.create}
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-48 animate-pulse bg-muted rounded-lg" />
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t.noWebhooks}</div>
          ) : (
            <div className="divide-y divide-border/20">
              {webhooks.map((wh) => {
                let events: string[] = [];
                try { events = JSON.parse(wh.events); } catch { /* ignore */ }
                return (
                  <div key={wh.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono truncate" title={wh.url}>{wh.url}</code>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${wh.enabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                          {wh.enabled ? t.enabled : t.disabled}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {events.map(ev => (
                          <span key={ev} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                            {ev}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t.secret}: <code className="font-mono">{wh.secret.slice(0, 8)}...{wh.secret.slice(-4)}</code>
                        <button onClick={() => { navigator.clipboard.writeText(wh.secret); setCopiedSecret(wh.id); setTimeout(() => setCopiedSecret(null), 2000); }} className="ml-1 align-middle text-muted-foreground hover:text-foreground" aria-label="Copy secret">
                          {copiedSecret === wh.id ? <CheckCheck className="h-3 w-3 inline" /> : <Copy className="h-3 w-3 inline" />}
                        </button>
                      </div>
                      <div className="text-xs mt-1">
                        {wh.last_triggered_at ? (
                          <span className={wh.last_status_code && wh.last_status_code >= 200 && wh.last_status_code < 300 ? "text-green-500" : "text-red-500"}>
                            {t.lastTriggered}: {new Date(wh.last_triggered_at + "Z").toLocaleString()} | {t.lastStatus}: {wh.last_status_code ?? "-"}
                            {wh.last_status_code && (wh.last_status_code >= 200 && wh.last_status_code < 300 ? " ✓" : " ✗")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{t.lastTriggered}: {t.never}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground shrink-0 text-center">
                      <div>{new Date(wh.created_at + "Z").toLocaleDateString()}</div>
                      <div className="text-[10px] opacity-70">{new Date(wh.updated_at + "Z").toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleEnabled(wh.id, !wh.enabled)} className="text-muted-foreground hover:text-foreground" aria-label="Toggle">
                        {wh.enabled ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <button onClick={() => testWebhook(wh.id)} disabled={testing === wh.id} className="text-muted-foreground hover:text-foreground" aria-label="Test">
                        <Send className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(wh)} className="text-muted-foreground hover:text-foreground" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(wh.id)} className="text-muted-foreground hover:text-red-500" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? t.edit : t.create}</DialogTitle>
            <DialogDescription>{t.url}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">{t.url}</label>
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/webhook" autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">{t.events}</label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_EVENTS.map(ev => (
                  <label key={ev} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(ev)}
                      onChange={() => toggleEvent(ev)}
                      className="rounded border-border"
                    />
                    <code className="text-xs font-mono">{ev}</code>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
              <Button onClick={save}>{t.save}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={t.confirmDelete}
        message={webhooks.find(w => w.id === deleteTarget)?.url || ""}
        onConfirm={confirmDelete}
        confirmLabel={t.delete}
        variant="danger" />
    </div>
  );
}

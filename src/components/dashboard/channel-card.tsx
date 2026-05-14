"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Radio,
  Pencil,
  Zap,
  X,
  PlusCircle,
  MinusCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/contexts/toast-context";

interface Channel {
  id: number;
  name: string;
  type: string;
  api_key_encrypted: string;
  base_url: string | null;
  weight: number;
  enabled: number;
  models: string;
  model_mapping: string;
  status: string;
  priority: number;
  fail_count: number;
  created_at: string;
  updated_at: string;
}

const PROVIDER_LABELS: Record<string, { zh: string; en: string }> = {
  openai: { zh: "OpenAI", en: "OpenAI" },
  anthropic: { zh: "Anthropic", en: "Anthropic" },
  deepseek: { zh: "DeepSeek", en: "DeepSeek" },
  google: { zh: "Google Gemini", en: "Google Gemini" },
  alibaba: { zh: "阿里云", en: "Alibaba" },
  midjourney: { zh: "Midjourney", en: "Midjourney" },
  suno: { zh: "Suno", en: "Suno" },
};

const LABELS = {
  zh: {
    title: "渠道管理",
    add: "添加渠道",
    edit: "编辑",
    test: "测试连接",
    testing: "测试中...",
    name: "名称",
    type: "类型",
    url: "Base URL",
    weight: "权重",
    priority: "优先级",
    apiKey: "API Key",
    models: "模型列表",
    modelMapping: "模型映射",
    addMapping: "添加映射",
    requestModel: "请求模型",
    actualModel: "上游模型",
    status: "状态",
    online: "在线",
    offline: "离线",
    rateLimited: "限流",
    unknown: "未知",
    enabled: "已启用",
    disabled: "已禁用",
    fails: "失败次数",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    deleteConfirm: "确认删除",
    deleteMsg: "确定要删除渠道 \"{name}\" 吗？此操作不可撤销。",
    confirm: "确认",
    noChannels: "暂无渠道，点击上方按钮添加",
    testSuccess: "连接成功",
    testFail: "连接失败",
    latency: "响应时间",
    syncModels: "同步模型",
    syncing: "同步中...",
    syncSuccess: "同步成功",
    syncNoModels: "渠道未配置模型，请先编辑添加模型",
    channelModels: "渠道模型",
    successRate: "成功率",
    avgLatency: "平均延迟",
    calls24h: "24h调用",
  },
  en: {
    title: "Channel Management",
    add: "Add Channel",
    edit: "Edit",
    test: "Test Connection",
    testing: "Testing...",
    name: "Name",
    type: "Type",
    url: "Base URL",
    weight: "Weight",
    priority: "Priority",
    apiKey: "API Key",
    models: "Models",
    modelMapping: "Model Mapping",
    addMapping: "Add Mapping",
    requestModel: "Request Model",
    actualModel: "Upstream Model",
    status: "Status",
    online: "Online",
    offline: "Offline",
    rateLimited: "Rate Limited",
    unknown: "Unknown",
    enabled: "Enabled",
    disabled: "Disabled",
    fails: "Failures",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    deleteConfirm: "Confirm Delete",
    deleteMsg: 'Are you sure you want to delete channel "{name}"? This action cannot be undone.',
    confirm: "Confirm",
    noChannels: "No channels yet. Click above to add one.",
    testSuccess: "Connection successful",
    testFail: "Connection failed",
    latency: "Latency",
    syncModels: "Sync Models",
    syncing: "Syncing...",
    syncSuccess: "Synced successfully",
    syncNoModels: "Channel has no models configured. Please edit and add models first.",
    channelModels: "Channel models",
    successRate: "Success",
    avgLatency: "Avg Latency",
    calls24h: "24h Calls",
  },
};

interface ChannelForm {
  name: string;
  type: string;
  api_key_encrypted: string;
  base_url: string;
  weight: number;
  priority: number;
  models: string;
  model_mapping: Record<string, string>;
}

const defaultForm: ChannelForm = {
  name: "",
  type: "openai",
  api_key_encrypted: "",
  base_url: "",
  weight: 1,
  priority: 0,
  models: "",
  model_mapping: {},
};

function MappingEditor({
  mapping,
  onChange,
  t,
}: {
  mapping: Record<string, string>;
  onChange: (m: Record<string, string>) => void;
  t: (typeof LABELS)["zh"];
}) {
  const entries = Object.entries(mapping);

  const addEntry = () => {
    onChange({ ...mapping, "": "" });
  };

  const updateEntry = (oldKey: string, newKey: string, value: string) => {
    const newMapping: Record<string, string> = {};
    for (const [k, v] of Object.entries(mapping)) {
      if (k === oldKey) {
        if (newKey) newMapping[newKey] = value;
      } else {
        newMapping[k] = v;
      }
    }
    onChange(newMapping);
  };

  const removeEntry = (key: string) => {
    const newMapping = { ...mapping };
    delete newMapping[key];
    onChange(newMapping);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">{t.modelMapping}</label>
      {entries.map(([key, value], i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={key}
            onChange={(e) => updateEntry(key, e.target.value, value)}
            placeholder={t.requestModel}
            className="h-8 text-xs flex-1"
          />
          <span className="text-muted-foreground text-xs">→</span>
          <Input
            value={value}
            onChange={(e) => updateEntry(key, key, e.target.value)}
            placeholder={t.actualModel}
            className="h-8 text-xs flex-1"
          />
          <button
            onClick={() => removeEntry(key)}
            className="text-muted-foreground hover:text-red-500 shrink-0"
            aria-label="Remove mapping"
          >
            <MinusCircle className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addEntry}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        {t.addMapping}
      </button>
    </div>
  );
}

function ChannelFormFields({
  form,
  setForm,
  t,
  lang,
}: {
  form: ChannelForm;
  setForm: React.Dispatch<React.SetStateAction<ChannelForm>>;
  t: (typeof LABELS)["zh"];
  lang: "zh" | "en";
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">{t.name}</label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-9 mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">{t.type}</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-sm"
          >
            {Object.entries(PROVIDER_LABELS).map(([key, val]) => (
              <option key={key} value={key}>
                {val[lang]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">{t.apiKey}</label>
        <Input
          type="password"
          value={form.api_key_encrypted}
          onChange={(e) =>
            setForm((f) => ({ ...f, api_key_encrypted: e.target.value }))
          }
          className="h-9 mt-1"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">{t.url}</label>
          <Input
            value={form.base_url}
            onChange={(e) =>
              setForm((f) => ({ ...f, base_url: e.target.value }))
            }
            placeholder="https://api.openai.com"
            className="h-9 mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">{t.weight}</label>
          <Input
            type="number"
            value={form.weight}
            onChange={(e) =>
              setForm((f) => ({ ...f, weight: Number(e.target.value) }))
            }
            className="h-9 mt-1"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">{t.priority}</label>
          <Input
            type="number"
            value={form.priority}
            onChange={(e) =>
              setForm((f) => ({ ...f, priority: Number(e.target.value) }))
            }
            className="h-9 mt-1"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">
          {t.models} (
          {lang === "zh" ? "逗号分隔，留空支持全部" : "comma separated, empty = all"}
          )
        </label>
        <Input
          value={form.models}
          onChange={(e) => setForm((f) => ({ ...f, models: e.target.value }))}
          placeholder="gpt-4o, claude-3-5-sonnet"
          className="h-9 mt-1"
        />
      </div>
      <MappingEditor
        mapping={form.model_mapping}
        onChange={(m) => setForm((f) => ({ ...f, model_mapping: m }))}
        t={t}
      />
    </div>
  );
}

export function ChannelCard({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const { toast: showToast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ChannelForm>({ ...defaultForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ChannelForm>({ ...defaultForm });
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<{
    id: number;
    success: boolean;
    latency?: number;
    error?: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Channel | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [syncResult, setSyncResult] = useState<{
    id: number;
    success: boolean;
    synced?: number;
    error?: string;
  } | null>(null);
  const [healthData, setHealthData] = useState<Record<number, {
    total_calls_24h: number;
    success_rate_24h: number | null;
    avg_latency_24h: number | null;
  }>>({});
  const t = LABELS[lang];

  const fetchChannels = () => {
    fetch("/api/dashboard/channels", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => {
        setChannels(d.channels || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchChannels();
    fetchHealth();
  }, []);

  const fetchHealth = () => {
    fetch("/api/dashboard/channels?action=health", { credentials: "include" })
      .then((res) => res.json())
      .then((d) => {
        const map: Record<number, typeof healthData[number]> = {};
        for (const h of d.health || []) {
          map[h.channel_id] = h;
        }
        setHealthData(map);
      })
      .catch(() => {});
  };

  const createChannel = async () => {
    try {
      const res = await fetch("/api/dashboard/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          models: form.models ? form.models.split(",").map((m) => m.trim()) : [],
          model_mapping: form.model_mapping,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); showToast(d.error || (lang === "zh" ? "创建失败" : "Create failed"), "error"); return; }
      setShowForm(false);
      setForm({ ...defaultForm });
      fetchChannels();
      showToast(lang === "zh" ? "渠道已创建" : "Channel created", "success");
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); }
  };

  const startEdit = (ch: Channel) => {
    setEditingId(ch.id);
    setEditForm({
      name: ch.name,
      type: ch.type,
      api_key_encrypted: "",
      base_url: ch.base_url || "",
      weight: ch.weight,
      priority: ch.priority,
      models: JSON.parse(ch.models || "[]").join(", "),
      model_mapping: JSON.parse(ch.model_mapping || "{}"),
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const body: Record<string, unknown> = {
      id: editingId,
      name: editForm.name,
      type: editForm.type,
      base_url: editForm.base_url,
      weight: editForm.weight,
      priority: editForm.priority,
      models: editForm.models
        ? editForm.models.split(",").map((m) => m.trim())
        : [],
      model_mapping: editForm.model_mapping,
    };
    if (editForm.api_key_encrypted) {
      body.api_key_encrypted = editForm.api_key_encrypted;
    }
    try {
      const res = await fetch("/api/dashboard/channels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); showToast(d.error || (lang === "zh" ? "保存失败" : "Save failed"), "error"); return; }
      setEditingId(null);
      fetchChannels();
      showToast(lang === "zh" ? "已保存" : "Saved", "success");
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); }
  };

  const toggleChannel = async (id: number, enabled: boolean) => {
    try {
      const res = await fetch("/api/dashboard/channels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, enabled }),
      });
      if (!res.ok) { showToast(lang === "zh" ? "更新失败" : "Update failed", "error"); return; }
      fetchChannels();
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); }
  };

  const deleteChannel = async (id: number) => {
    try {
      const res = await fetch("/api/dashboard/channels", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { showToast(lang === "zh" ? "删除失败" : "Delete failed", "error"); return; }
      setDeleteTarget(null);
      fetchChannels();
      showToast(lang === "zh" ? "已删除" : "Deleted", "success");
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); }
  };

  const testConnection = async (id: number) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await fetch("/api/dashboard/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "test", id }),
      });
      const data = await res.json();
      setTestResult({
        id,
        success: data.success,
        latency: data.latency_ms,
        error: data.error,
      });
    } catch {
      setTestResult({ id, success: false, error: "Request failed" });
    } finally {
      setTestingId(null);
    }
  };

  const syncModels = async (id: number) => {
    setSyncingId(id);
    setSyncResult(null);
    try {
      const res = await fetch("/api/dashboard/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "sync-models", id }),
      });
      const data = await res.json();
      setSyncResult({
        id,
        success: data.success,
        synced: data.synced,
        error: data.error,
      });
    } catch {
      setSyncResult({ id, success: false, error: "Request failed" });
    } finally {
      setSyncingId(null);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "online":
        return t.online;
      case "offline":
        return t.offline;
      case "rate_limited":
        return t.rateLimited;
      default:
        return t.unknown;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-500";
      case "offline":
        return "text-red-500";
      case "rate_limited":
        return "text-yellow-500";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading) return <div className="h-48 animate-pulse bg-muted rounded-lg" />;

  return (
    <>
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t.title}</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />
            {t.add}
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 rounded-lg border border-border/50">
              <ChannelFormFields
                form={form}
                setForm={setForm}
                t={t}
                lang={lang}
              />
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={createChannel}>
                  {t.save}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          )}

          {channels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t.noChannels}
            </div>
          ) : (
            <div className="space-y-3">
              {channels.map((ch) => (
                <div key={ch.id}>
                  {editingId === ch.id ? (
                    <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                      <ChannelFormFields
                        form={editForm}
                        setForm={setEditForm}
                        t={t}
                        lang={lang}
                      />
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" onClick={saveEdit}>
                          {t.save}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          {t.cancel}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                      <Radio
                        className={`h-5 w-5 shrink-0 ${statusColor(ch.status)}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{ch.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                            {PROVIDER_LABELS[ch.type]?.[lang] || ch.type}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              ch.enabled
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {ch.enabled ? t.enabled : t.disabled}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${statusColor(ch.status)} bg-muted/50`}
                          >
                            {statusLabel(ch.status)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ch.base_url || "default"} · {t.weight}: {ch.weight} ·{" "}
                          {t.priority}: {ch.priority} · {t.fails}: {ch.fail_count}
                          {healthData[ch.id] && (
                            <>
                              {" · "}{t.calls24h}: {healthData[ch.id].total_calls_24h}
                              {healthData[ch.id].success_rate_24h !== null && (
                                <>{" · "}{t.successRate}: <span className={healthData[ch.id].success_rate_24h! >= 95 ? "text-green-500" : healthData[ch.id].success_rate_24h! >= 80 ? "text-yellow-500" : "text-red-500"}>{healthData[ch.id].success_rate_24h!.toFixed(1)}%</span></>
                              )}
                              {healthData[ch.id].avg_latency_24h !== null && (
                                <>{" · "}{t.avgLatency}: {healthData[ch.id].avg_latency_24h}ms</>
                              )}
                            </>
                          )}
                        </div>
                        {testResult?.id === ch.id && (
                          <div
                            className={`text-xs mt-1 ${testResult.success ? "text-green-500" : "text-red-500"}`}
                          >
                            {testResult.success
                              ? `${t.testSuccess} (${t.latency}: ${testResult.latency}ms)`
                              : `${t.testFail}: ${testResult.error}`}
                          </div>
                        )}
                        {syncResult?.id === ch.id && (
                          <div
                            className={`text-xs mt-1 ${syncResult.success ? "text-green-500" : "text-red-500"}`}
                          >
                            {syncResult.success
                              ? `${t.syncSuccess} (${syncResult.synced} models)`
                              : `${t.syncNoModels}: ${syncResult.error}`}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => syncModels(ch.id)}
                          disabled={syncingId === ch.id}
                          className="text-muted-foreground hover:text-green-500 disabled:opacity-50"
                          title={t.syncModels}
                          aria-label={t.syncModels}
                        >
                          {syncingId === ch.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => testConnection(ch.id)}
                          disabled={testingId === ch.id}
                          className="text-muted-foreground hover:text-yellow-500 disabled:opacity-50"
                          title={t.test}
                          aria-label={t.test}
                        >
                          {testingId === ch.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => startEdit(ch)}
                          className="text-muted-foreground hover:text-blue-500"
                          title={t.edit}
                          aria-label={t.edit}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            toggleChannel(ch.id, !ch.enabled)
                          }
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={ch.enabled ? "Disable channel" : "Enable channel"}
                        >
                          {ch.enabled ? (
                            <ToggleRight className="h-5 w-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(ch)}
                          className="text-muted-foreground hover:text-red-500"
                          title={t.delete}
                          aria-label={t.delete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteConfirm}</DialogTitle>
            <DialogDescription>
              {t.deleteMsg.replace("{name}", deleteTarget?.name || "")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              {t.cancel}
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => deleteTarget && deleteChannel(deleteTarget.id)}
            >
              {t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

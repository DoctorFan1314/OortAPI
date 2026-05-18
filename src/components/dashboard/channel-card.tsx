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
  Eye,
  EyeOff,
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
    fetchModels: "获取模型",
    fetching: "获取中...",
    fetchModelsTitle: "选择模型",
    fetchModelsEmpty: "未获取到模型",
    fetchModelsError: "获取失败",
    selectAll: "全选",
    selectedCount: "已选 {count} 个",
    channelModels: "渠道模型",
    successRate: "成功率",
    avgLatency: "平均延迟",
    calls24h: "24h调用",
    search: "搜索渠道",
    filterStatus: "状态筛选",
    filterType: "类型筛选",
    all: "全部",
    batchEnable: "批量启用",
    batchDisable: "批量禁用",
    batchDelete: "批量删除",
    selected: "已选 {count} 个",
    batchConfirm: "确认批量操作",
    batchDeleteMsg: "确定要删除选中的 {count} 个渠道吗？",
    batchEnableMsg: "确定要启用选中的 {count} 个渠道吗？",
    batchDisableMsg: "确定要禁用选中的 {count} 个渠道吗？",
    batchSuccess: "批量操作成功",
    routingMatrix: "路由矩阵",
    routingDesc: "每个模型的可用渠道及其优先级",
    noModels: "无模型数据",
    showRouting: "显示路由",
    hideRouting: "隐藏路由",
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
    fetchModels: "Fetch Models",
    fetching: "Fetching...",
    fetchModelsTitle: "Select Models",
    fetchModelsEmpty: "No models fetched",
    fetchModelsError: "Failed to fetch",
    selectAll: "Select All",
    selectedCount: "{count} selected",
    channelModels: "Channel models",
    successRate: "Success",
    avgLatency: "Avg Latency",
    calls24h: "24h Calls",
    search: "Search channels",
    filterStatus: "Status",
    filterType: "Type",
    all: "All",
    batchEnable: "Batch Enable",
    batchDisable: "Batch Disable",
    batchDelete: "Batch Delete",
    selected: "{count} selected",
    batchConfirm: "Confirm Batch Action",
    batchDeleteMsg: "Delete {count} selected channels?",
    batchEnableMsg: "Enable {count} selected channels?",
    batchDisableMsg: "Disable {count} selected channels?",
    batchSuccess: "Batch action completed",
    routingMatrix: "Routing Matrix",
    routingDesc: "Available channels and their priority for each model",
    noModels: "No model data",
    showRouting: "Show Routing",
    hideRouting: "Hide Routing",
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
  channelId,
  showToast,
}: {
  form: ChannelForm;
  setForm: React.Dispatch<React.SetStateAction<ChannelForm>>;
  t: (typeof LABELS)["zh"];
  lang: "zh" | "en";
  channelId?: number | null;
  showToast?: (msg: string, type?: "success" | "error") => void;
}) {
  const [fetching, setFetching] = useState(false);
  const [showFetchDialog, setShowFetchDialog] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());

  const urlError = form.base_url && !form.base_url.startsWith("http://") && !form.base_url.startsWith("https://")
    ? (lang === "zh" ? "URL 必须以 http:// 或 https:// 开头" : "URL must start with http:// or https://")
    : null;

  const handleFetchModels = async () => {
    setFetching(true);
    try {
      const body: Record<string, unknown> = { action: "fetch-models" };
      if (channelId) {
        body.id = channelId;
      } else {
        body.base_url = form.base_url;
        body.api_key = form.api_key_encrypted;
      }
      const res = await fetch("/api/dashboard/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const existing = new Set(
        form.models.split(",").map((m) => m.trim()).filter(Boolean)
      );
      setFetchedModels(data.models || []);
      setSelectedModels(existing);
      setShowFetchDialog(true);
    } catch (err) {
      showToast?.(
        err instanceof Error ? err.message : t.fetchModelsError,
        "error"
      );
    } finally {
      setFetching(false);
    }
  };

  const handleConfirmModels = () => {
    setForm((f) => ({ ...f, models: Array.from(selectedModels).join(", ") }));
    setShowFetchDialog(false);
  };

  const toggleModel = (model: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(model)) next.delete(model);
      else next.add(model);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedModels.size === fetchedModels.length) {
      setSelectedModels(new Set());
    } else {
      setSelectedModels(new Set(fetchedModels));
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">{t.name}</label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="h-9 mt-1"
            autoFocus
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
        <div className="relative mt-1">
          <Input
            type={showKey ? "text" : "password"}
            value={form.api_key_encrypted}
            onChange={(e) =>
              setForm((f) => ({ ...f, api_key_encrypted: e.target.value }))
            }
            className="h-9 pr-8"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showKey ? "Hide key" : "Show key"}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
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
            className={`h-9 mt-1 ${urlError ? "border-red-500" : ""}`}
          />
          {urlError && <p className="text-xs text-red-400 mt-1">{urlError}</p>}
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
        <div className="flex gap-2 mt-1">
          <Input
            value={form.models}
            onChange={(e) => setForm((f) => ({ ...f, models: e.target.value }))}
            placeholder="gpt-4o, claude-3-5-sonnet"
            className="h-9 flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
            disabled={fetching || !form.base_url || !form.api_key_encrypted}
            onClick={handleFetchModels}
            type="button"
          >
            {fetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1 hidden sm:inline">
              {fetching ? t.fetching : t.fetchModels}
            </span>
          </Button>
        </div>
      </div>
      <MappingEditor
        mapping={form.model_mapping}
        onChange={(m) => setForm((f) => ({ ...f, model_mapping: m }))}
        t={t}
      />

      {/* Fetch Models Dialog */}
      <Dialog open={showFetchDialog} onOpenChange={setShowFetchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.fetchModelsTitle}</DialogTitle>
          </DialogHeader>
          {fetchedModels.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              {t.fetchModelsEmpty}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between py-2 border-b">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModels.size === fetchedModels.length}
                    onChange={toggleAll}
                    className="rounded"
                  />
                  {t.selectAll}
                </label>
                <span className="text-xs text-muted-foreground">
                  {t.selectedCount.replace("{count}", String(selectedModels.size))}
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1 py-2">
                {fetchedModels.map((model) => (
                  <label
                    key={model}
                    className="flex items-center gap-2 px-1 py-1.5 rounded hover:bg-accent cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModels.has(model)}
                      onChange={() => toggleModel(model)}
                      className="rounded"
                    />
                    {model}
                  </label>
                ))}
              </div>
            </>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFetchDialog(false)}
              type="button"
            >
              {t.cancel}
            </Button>
            <Button onClick={handleConfirmModels} type="button">
              {t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  const [testResults, setTestResults] = useState<Record<number, {
    success: boolean;
    latency?: number;
    error?: string;
  }>>({});
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
    total_cost_24h: number;
  }>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchAction, setBatchAction] = useState<"enable" | "disable" | "delete" | null>(null);
  const [showRouting, setShowRouting] = useState(false);
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
    if (form.base_url && !form.base_url.startsWith("http://") && !form.base_url.startsWith("https://")) {
      showToast(lang === "zh" ? "URL 必须以 http:// 或 https:// 开头" : "URL must start with http:// or https://", "error");
      return;
    }
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
    if (editForm.base_url && !editForm.base_url.startsWith("http://") && !editForm.base_url.startsWith("https://")) {
      showToast(lang === "zh" ? "URL 必须以 http:// 或 https:// 开头" : "URL must start with http:// or https://", "error");
      return;
    }
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
    try {
      const res = await fetch("/api/dashboard/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "test", id }),
      });
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [id]: { success: data.success, latency: data.latency_ms, error: data.error } }));
    } catch {
      setTestResults(prev => ({ ...prev, [id]: { success: false, error: "Request failed" } }));
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

  const filteredChannels = channels.filter(ch => {
    if (searchQuery && !ch.name.toLowerCase().includes(searchQuery.toLowerCase()) && !ch.type.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus === "enabled" && !ch.enabled) return false;
    if (filterStatus === "disabled" && ch.enabled) return false;
    if (filterStatus === "online" && ch.status !== "online") return false;
    if (filterStatus === "offline" && ch.status !== "offline") return false;
    if (filterType && ch.type !== filterType) return false;
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredChannels.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredChannels.map(c => c.id)));
    }
  };

  const executeBatch = async () => {
    if (!batchAction) return;
    const ids = Array.from(selectedIds);
    if (batchAction === "delete") {
      await Promise.all(ids.map(id =>
        fetch("/api/dashboard/channels", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id }),
        })
      ));
    } else {
      const enabled = batchAction === "enable";
      await Promise.all(ids.map(id =>
        fetch("/api/dashboard/channels", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id, enabled }),
        })
      ));
    }
    setSelectedIds(new Set());
    setBatchAction(null);
    fetchChannels();
    showToast(t.batchSuccess, "success");
  };

  const uniqueTypes = [...new Set(channels.map(c => c.type))];

  // Build routing matrix: model -> channels that serve it
  const routingMatrix = (() => {
    const modelMap = new Map<string, Array<{ id: number; name: string; priority: number; weight: number; status: string; enabled: boolean }>>();
    for (const ch of channels) {
      let models: string[] = [];
      try { models = JSON.parse(ch.models || "[]"); } catch { models = []; }
      if (models.length === 0) {
        // Empty models = serves all models (wildcard)
        continue;
      }
      for (const model of models) {
        if (!modelMap.has(model)) modelMap.set(model, []);
        modelMap.get(model)!.push({ id: ch.id, name: ch.name, priority: ch.priority, weight: ch.weight, status: ch.status, enabled: !!ch.enabled });
      }
    }
    // Sort by priority desc, then weight desc
    for (const [, chans] of modelMap) {
      chans.sort((a, b) => b.priority - a.priority || b.weight - a.weight);
    }
    return modelMap;
  })();

  return (
    <>
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t.title}</CardTitle>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <span className="text-xs text-muted-foreground">{t.selected.replace("{count}", String(selectedIds.size))}</span>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setBatchAction("enable")}>{t.batchEnable}</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setBatchAction("disable")}>{t.batchDisable}</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs text-red-500 hover:text-red-600" onClick={() => setBatchAction("delete")}>{t.batchDelete}</Button>
              </>
            )}
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-1" />
              {t.add}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 rounded-lg border border-border/50">
              <ChannelFormFields
                form={form}
                setForm={setForm}
                t={t}
                lang={lang}
                showToast={showToast}
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
            <>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="relative flex-1 min-w-[180px]">
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t.search} className="h-8 text-sm pl-3" />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="h-8 px-2 rounded-md border border-input bg-background text-xs">
                  <option value="">{t.filterStatus}: {t.all}</option>
                  <option value="enabled">{t.enabled}</option>
                  <option value="disabled">{t.disabled}</option>
                  <option value="online">{t.online}</option>
                  <option value="offline">{t.offline}</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  className="h-8 px-2 rounded-md border border-input bg-background text-xs">
                  <option value="">{t.filterType}: {t.all}</option>
                  {uniqueTypes.map(tp => (
                    <option key={tp} value={tp}>{PROVIDER_LABELS[tp]?.[lang] || tp}</option>
                  ))}
                </select>
                {filteredChannels.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer ml-auto">
                    <input type="checkbox" checked={selectedIds.size === filteredChannels.length && filteredChannels.length > 0}
                      onChange={toggleSelectAll} className="rounded" />
                    {t.selectAll}
                  </label>
                )}
              </div>
            <div className="space-y-3">
              {filteredChannels.map((ch) => (
                <div key={ch.id}>
                  {editingId === ch.id ? (
                    <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                      <ChannelFormFields
                        form={editForm}
                        setForm={setEditForm}
                        t={t}
                        lang={lang}
                        channelId={editingId}
                        showToast={showToast}
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
                      <input type="checkbox" checked={selectedIds.has(ch.id)}
                        onChange={() => toggleSelect(ch.id)}
                        className="rounded shrink-0" />
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
                              {healthData[ch.id].total_cost_24h > 0 && (
                                <>{" · "}{lang === "zh" ? "费用" : "Cost"}: ${healthData[ch.id].total_cost_24h.toFixed(2)}</>
                              )}
                            </>
                          )}
                        </div>
                        {testResults[ch.id] && (
                          <div
                            className={`text-xs mt-1 ${testResults[ch.id].success ? "text-green-500" : "text-red-500"}`}
                          >
                            {testResults[ch.id].success
                              ? `${t.testSuccess} (${t.latency}: ${testResults[ch.id].latency}ms)`
                              : `${t.testFail}: ${testResults[ch.id].error}`}
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
            </>
          )}
          {channels.length > 0 && (
            <div className="mt-4">
              <button onClick={() => setShowRouting(!showRouting)}
                className="text-xs text-primary hover:underline flex items-center gap-1">
                {showRouting ? t.hideRouting : t.showRouting}
              </button>
              {showRouting && (
                <div className="mt-3 p-3 bg-muted/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-3">{t.routingDesc}</p>
                  {routingMatrix.size === 0 ? (
                    <p className="text-xs text-muted-foreground">{t.noModels}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/30">
                            <th className="text-left py-1.5 px-2 text-muted-foreground font-medium sticky left-0 bg-muted/20">{t.channelModels}</th>
                            {channels.map(ch => (
                              <th key={ch.id} className="text-center py-1.5 px-2 text-muted-foreground font-medium min-w-[80px]">
                                <span className={ch.enabled ? "" : "line-through opacity-50"}>{ch.name}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(routingMatrix.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([model, chans]) => (
                            <tr key={model} className="border-b border-border/10 hover:bg-muted/20">
                              <td className="py-1.5 px-2 font-mono sticky left-0 bg-muted/20">{model}</td>
                              {channels.map(ch => {
                                const match = chans.find(c => c.id === ch.id);
                                if (!match) return <td key={ch.id} className="py-1.5 px-2 text-center text-muted-foreground/30">-</td>;
                                return (
                                  <td key={ch.id} className="py-1.5 px-2 text-center">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                                      !match.enabled ? "bg-muted text-muted-foreground" :
                                      match.status === "online" ? "bg-green-500/10 text-green-500" :
                                      match.status === "offline" ? "bg-red-500/10 text-red-500" :
                                      "bg-yellow-500/10 text-yellow-500"
                                    }`}>
                                      P{match.priority} W{match.weight}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
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

      {/* Batch Action Confirmation Dialog */}
      <Dialog open={batchAction !== null} onOpenChange={(open) => { if (!open) setBatchAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.batchConfirm}</DialogTitle>
            <DialogDescription>
              {batchAction === "delete"
                ? t.batchDeleteMsg.replace("{count}", String(selectedIds.size))
                : batchAction === "enable"
                ? t.batchEnableMsg.replace("{count}", String(selectedIds.size))
                : t.batchDisableMsg.replace("{count}", String(selectedIds.size))}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchAction(null)}>{t.cancel}</Button>
            <Button
              className={batchAction === "delete" ? "bg-red-600 text-white hover:bg-red-700" : ""}
              onClick={executeBatch}
            >
              {t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

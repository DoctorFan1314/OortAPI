"use client";

import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { useToast } from "@/contexts/toast-context";
import { cn } from "@/lib/utils";
import {
  Cpu,
  Search,
  Power,
  PowerOff,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ModelItem {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  display_name: string;
  pricing: { input: number; output: number; cache: number } | null;
  tags: string[];
}

interface ModelsResponse {
  object: string;
  data: ModelItem[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Extract the provider portion from a model ID.
 *  "openai/gpt-4o"       -> "openai"
 *  "claude-sonnet-4-..."  -> "anthropic"
 *  "deepseek-chat"        -> "deepseek"
 *  Falls back to owned_by when available. */
function extractProvider(modelId: string, ownedBy: string): string {
  if (ownedBy && ownedBy !== "unknown") return ownedBy;
  if (modelId.includes("/")) return modelId.split("/")[0];
  const lower = modelId.toLowerCase();
  if (lower.startsWith("claude") || lower.startsWith("anthropic")) return "anthropic";
  if (lower.startsWith("gpt") || lower.startsWith("o1") || lower.startsWith("o3") || lower.startsWith("o4") || lower.startsWith("chatgpt")) return "openai";
  if (lower.startsWith("deepseek")) return "deepseek";
  if (lower.startsWith("gemini") || lower.startsWith("palm")) return "google";
  if (lower.startsWith("qwen") || lower.startsWith("qwq")) return "alibaba";
  if (lower.startsWith("mistral") || lower.startsWith("codestral")) return "mistral";
  if (lower.startsWith("llama")) return "meta";
  if (lower.startsWith("yi-")) return "01-ai";
  if (lower.startsWith("command")) return "cohere";
  if (lower.startsWith("glm") || lower.startsWith("chatglm")) return "zhipu";
  if (lower.startsWith("doubao") || lower.startsWith("bytedance")) return "bytedance";
  return "other";
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminModelsPage() {
  const { lang } = useI18n();
  const { toast: showToast } = useToast();

  const { data, error, isLoading, mutate } = useSWR<ModelsResponse>(
    "/api/v1/models",
    dashboardSWRConfig,
  );

  const models = data?.data ?? [];

  // Local enabled-state map (optimistic). Default all to true since
  // /api/v1/models only returns models visible to users.
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => setDebouncedSearch(value), 300));
  }

  // Provider filter
  const providers = useMemo(() => {
    const set = new Set<string>();
    for (const m of models) set.add(extractProvider(m.id, m.owned_by));
    return Array.from(set).sort();
  }, [models]);

  const [providerFilter, setProviderFilter] = useState<string>("all");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  // Filtered models
  const filtered = useMemo(() => {
    let list = models;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.display_name.toLowerCase().includes(q) ||
          extractProvider(m.id, m.owned_by).toLowerCase().includes(q),
      );
    }
    if (providerFilter !== "all") {
      list = list.filter((m) => extractProvider(m.id, m.owned_by) === providerFilter);
    }
    return list;
  }, [models, debouncedSearch, providerFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Selection helpers
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((m) => m.id)));
    }
  }

  /* ---- Toggle single model ---- */
  async function handleToggle(modelId: string, currentEnabled: boolean) {
    setTogglingId(modelId);
    const nextEnabled = !currentEnabled;
    // Optimistic: update UI immediately
    setEnabledMap((prev) => ({ ...prev, [modelId]: nextEnabled }));
    try {
      const res = await fetch("/api/dashboard/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ modelId, enabled: nextEnabled }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Rollback on error
        setEnabledMap((prev) => ({ ...prev, [modelId]: currentEnabled }));
        showToast(data.error || (lang === "zh" ? "操作失败" : "Operation failed"), "error");
      } else {
        showToast(
          lang === "zh"
            ? `${modelId} 已${nextEnabled ? "启用" : "禁用"}`
            : `${modelId} ${nextEnabled ? "enabled" : "disabled"}`,
          "success",
        );
      }
    } catch {
      // Rollback on error
      setEnabledMap((prev) => ({ ...prev, [modelId]: currentEnabled }));
      showToast(lang === "zh" ? "网络错误" : "Network error", "error");
    }
    setTogglingId(null);
  }

  /* ---- Batch enable / disable ---- */
  async function handleBatchAction(action: "enable" | "disable") {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBatchLoading(true);
    const nextEnabled = action === "enable";
    let successCount = 0;
    for (const modelId of ids) {
      try {
        const res = await fetch("/api/dashboard/admin/models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ modelId, enabled: nextEnabled }),
        });
        if (res.ok) {
          setEnabledMap((prev) => ({ ...prev, [modelId]: nextEnabled }));
          successCount++;
        }
      } catch {
        /* continue */
      }
    }
    showToast(
      lang === "zh"
        ? `${successCount} 个模型已${nextEnabled ? "启用" : "禁用"}`
        : `${successCount} model(s) ${nextEnabled ? "enabled" : "disabled"}`,
      successCount > 0 ? "success" : "error",
    );
    setSelectedIds(new Set());
    setBatchLoading(false);
  }

  function isEnabled(modelId: string): boolean {
    return enabledMap[modelId] ?? true;
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Cpu className="h-6 w-6" />
          {lang === "zh" ? "模型管理" : "Model Management"}
        </h1>
        <Badge variant="secondary">{filtered.length}</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={lang === "zh" ? "搜索模型名称或提供商" : "Search model name or provider"}
            value={search}
            onChange={(e) => {
              handleSearchChange(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => {
              setProviderFilter("all");
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
              providerFilter === "all"
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground",
            )}
          >
            {lang === "zh" ? "全部" : "All"}
          </button>
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => {
                setProviderFilter(p);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                providerFilter === p
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {/* Batch action bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 bg-primary/5">
              <span className="text-sm text-muted-foreground">
                {lang === "zh" ? "已选择" : "Selected"}:{" "}
                <strong className="text-foreground">{selectedIds.size}</strong>
              </span>
              <div className="flex gap-1.5 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchAction("enable")}
                  disabled={batchLoading}
                >
                  {batchLoading ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Power className="h-3.5 w-3.5 mr-1" />
                  )}
                  {lang === "zh" ? "批量启用" : "Batch Enable"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchAction("disable")}
                  disabled={batchLoading}
                >
                  {batchLoading ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <PowerOff className="h-3.5 w-3.5 mr-1" />
                  )}
                  {lang === "zh" ? "批量禁用" : "Batch Disable"}
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="h-48 animate-pulse bg-muted rounded-lg m-6" />
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {lang === "zh" ? "加载失败" : "Failed to load models"}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {lang === "zh" ? "暂无模型" : "No models found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 w-10">
                      <input
                        type="checkbox"
                        checked={paged.length > 0 && selectedIds.size === paged.length}
                        onChange={toggleSelectAll}
                        className="rounded border-input"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      {lang === "zh" ? "模型 ID" : "Model ID"}
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      {lang === "zh" ? "提供商" : "Provider"}
                    </th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                      {lang === "zh" ? "上下文长度" : "Context Length"}
                    </th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                      {lang === "zh" ? "状态" : "Status"}
                    </th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                      {lang === "zh" ? "操作" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((m) => {
                    const provider = extractProvider(m.id, m.owned_by);
                    const enabled = isEnabled(m.id);
                    return (
                      <tr
                        key={m.id}
                        className="border-b border-border/20 hover:bg-muted/30"
                      >
                        <td className="py-3 px-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(m.id)}
                            onChange={() => toggleSelect(m.id)}
                            className="rounded border-input"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs">{m.id}</span>
                            {m.display_name !== m.id && (
                              <span className="text-xs text-muted-foreground">
                                {m.display_name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="text-xs">
                            {provider}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                          {"—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              enabled
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500",
                            )}
                          >
                            {enabled
                              ? lang === "zh"
                                ? "已启用"
                                : "Enabled"
                              : lang === "zh"
                                ? "已禁用"
                                : "Disabled"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggle(m.id, enabled)}
                            disabled={togglingId === m.id}
                            className={cn(
                              "p-1.5 rounded-md transition-colors",
                              enabled
                                ? "hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                                : "hover:bg-green-500/10 text-muted-foreground hover:text-green-500",
                            )}
                            title={
                              enabled
                                ? lang === "zh"
                                  ? "禁用"
                                  : "Disable"
                                : lang === "zh"
                                  ? "启用"
                                  : "Enable"
                            }
                            aria-label={
                              enabled
                                ? lang === "zh"
                                  ? "禁用"
                                  : "Disable"
                                : lang === "zh"
                                  ? "启用"
                                  : "Enable"
                            }
                          >
                            {togglingId === m.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : enabled ? (
                              <PowerOff className="h-3.5 w-3.5" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {(page > 1 || page < totalPages) && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {"←"}
          </Button>
          <span className="text-sm text-muted-foreground py-1.5">
            {lang === "zh" ? `第 ${page} / ${totalPages} 页` : `Page ${page} of ${totalPages}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {"→"}
          </Button>
        </div>
      )}
    </div>
  );
}

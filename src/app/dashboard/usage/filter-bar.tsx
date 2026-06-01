"use client";

import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { Filter, Download } from "lucide-react";

interface FilterBarProps {
  models: string[];
  keys: Array<{ id: number; name: string }>;
  inputModel: string;
  inputStatus: string;
  inputKeyId: string;
  inputFrom: string;
  inputTo: string;
  onInputChange: (field: string, value: string) => void;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  lang: string;
  filterModel: string;
  filterStatus: string;
  filterFrom: string;
  filterTo: string;
  filterKeyId: string;
}

export function FilterBar({
  models,
  keys,
  inputModel,
  inputStatus,
  inputKeyId,
  inputFrom,
  inputTo,
  onInputChange,
  onApply,
  onClear,
  hasActiveFilters,
  lang,
  filterModel,
  filterStatus,
  filterFrom,
  filterTo,
  filterKeyId,
}: FilterBarProps) {
  const { toast: showToast } = useToast();
  const { t } = useI18n();
  const L = t.dashboard;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 p-3 bg-muted/30 rounded-lg">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-44">
          <label className="text-xs text-muted-foreground block mb-1">{L.filterModel}</label>
          <select value={inputModel} onChange={e => onInputChange("model", e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none">
            <option value="">{L.all}</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="w-32">
          <label className="text-xs text-muted-foreground block mb-1">{L.filterStatus}</label>
          <select value={inputStatus} onChange={e => onInputChange("status", e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none">
            <option value="">{L.all}</option>
            <option value="success">{L.success}</option>
            <option value="failed">{L.failed}</option>
          </select>
        </div>
        <div className="w-40">
          <label className="text-xs text-muted-foreground block mb-1">{L.apiKey}</label>
          <select value={inputKeyId} onChange={e => onInputChange("keyId", e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none">
            <option value="">{L.allKeys}</option>
            {keys.map(k => (
              <option key={k.id} value={k.id}>{k.name || `Key #${k.id}`}</option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <label className="text-xs text-muted-foreground block mb-1">{L.dateFrom}</label>
          <input type="date" value={inputFrom} onChange={e => onInputChange("from", e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none" />
        </div>
        <div className="w-36">
          <label className="text-xs text-muted-foreground block mb-1">{L.dateTo}</label>
          <input type="date" value={inputTo} onChange={e => onInputChange("to", e.target.value)}
            className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none" />
        </div>
        <button onClick={onApply}
          className="h-8 px-4 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" />{L.filterBtn}
        </button>
        {hasActiveFilters && (
          <button onClick={onClear}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground border border-border/50 rounded-md hover:bg-muted transition-colors">
            {L.clearFilters}
          </button>
        )}
      </div>
      <div>
        <label className="text-xs text-transparent block mb-1">&nbsp;</label>
        <button onClick={async () => {
          const params = [
            'format=csv',
            filterModel ? `model=${encodeURIComponent(filterModel)}` : '',
            filterStatus ? `status=${filterStatus}` : '',
            filterFrom ? `from=${filterFrom}` : '',
            filterTo ? `to=${filterTo}` : '',
            filterKeyId ? `key_id=${filterKeyId}` : '',
          ].filter(Boolean).join('&');
          showToast(lang === "zh" ? "正在导出..." : "Exporting...", "info");
          try {
            const res = await fetch(`/api/v1/billing/usage?${params}`, { credentials: "include" });
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `usage-export-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(lang === "zh" ? "导出成功" : "Exported successfully", "success");
          } catch {
            showToast(lang === "zh" ? "导出失败" : "Export failed", "error");
          }
        }}
          className="h-8 px-3 text-xs border border-border/50 rounded-md hover:bg-muted transition-colors flex items-center gap-1.5">
          <Download className="h-3.5 w-3.5" />{L.exportCSV}
        </button>
      </div>
    </div>
  );
}

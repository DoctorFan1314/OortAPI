"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/i18n-context";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { Search, Download, Copy, Check, X, Palette, Sun, Moon } from "lucide-react";
import { PROVIDER_GROUPS, getAllProviders, getProviderLogo, type ProviderGroupKey, type ProviderInfo } from "@/lib/provider-logos";

const GROUP_KEYS: ProviderGroupKey[] = ["ai", "cloud", "tool"];

export default function LogoManagePage() {
  const { t, lang } = useI18n();
  const { resolvedTheme } = useTheme();
  const L = t.dashboard;

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<"all" | ProviderGroupKey>("all");
  const [selectedLogo, setSelectedLogo] = useState<ProviderInfo | null>(null);
  const [previewVariant, setPreviewVariant] = useState<"color" | "mono">("color");
  const [copied, setCopied] = useState(false);

  const allProviders = useMemo(() => getAllProviders(), []);

  const filtered = useMemo(() => {
    return allProviders.filter((p) => {
      const matchesSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.nameZh.includes(search) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = groupFilter === "all" || p.group === groupFilter;
      return matchesSearch && matchesGroup;
    });
  }, [allProviders, search, groupFilter]);

  const handleCopySvg = async (id: string) => {
    try {
      const res = await fetch(getProviderLogo(id, previewVariant));
      const svg = await res.text();
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await fetch(getProviderLogo(id, previewVariant));
      const svg = await res.text();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id}-${previewVariant}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const groupLabels: Record<string, string> = {
    all: L.logoAll,
    ai: L.logoAiModels,
    cloud: L.logoCloud,
    tool: L.logoTools,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            {L.logoManage}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {L.logoCount.replace("{count}", String(filtered.length))}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={L.logoSearch}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Group filter */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", ...GROUP_KEYS] as const).map((key) => (
          <button
            key={key}
            onClick={() => setGroupFilter(key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              groupFilter === key
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
            )}
          >
            {groupLabels[key]}
          </button>
        ))}
      </div>

      {/* Logo Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelectedLogo(p); setPreviewVariant("color"); setCopied(false); }}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={getProviderLogo(p.id, "color")}
                alt={p.name}
                className="w-10 h-10 object-contain"
                loading="lazy"
                onError={(e) => {
                  // Fallback to mono
                  const target = e.target as HTMLImageElement;
                  target.src = getProviderLogo(p.id, "mono");
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight truncate w-full">
              {lang === "zh" ? p.nameZh : p.name}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{lang === "zh" ? "未找到匹配的 Logo" : "No matching logos found"}</p>
        </div>
      )}

      {/* Preview Dialog */}
      {selectedLogo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedLogo(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold">{selectedLogo.name}</h3>
              <button onClick={() => setSelectedLogo(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="p-6 space-y-4">
              {/* Variant toggle */}
              <div className="flex gap-1 bg-muted rounded-lg p-0.5 text-xs font-medium">
                <button
                  onClick={() => setPreviewVariant("color")}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-md transition-all",
                    previewVariant === "color" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  {L.logoColor}
                </button>
                <button
                  onClick={() => setPreviewVariant("mono")}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-md transition-all",
                    previewVariant === "mono" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  {L.logoMono}
                </button>
              </div>

              {/* Preview cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-border">
                  <img src={getProviderLogo(selectedLogo.id, previewVariant)} alt={selectedLogo.name} className="w-16 h-16 object-contain" />
                  <span className="text-[10px] text-gray-500 flex items-center gap-1"><Sun className="h-3 w-3" /> Light</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-900 border border-gray-700">
                  <img
                    src={getProviderLogo(selectedLogo.id, previewVariant)}
                    alt={selectedLogo.name}
                    className="w-16 h-16 object-contain"
                    style={previewVariant === "mono" ? { filter: "invert(1)" } : undefined}
                  />
                  <span className="text-[10px] text-gray-400 flex items-center gap-1"><Moon className="h-3 w-3" /> Dark</span>
                </div>
              </div>

              {/* Info */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>ID: <code className="font-mono bg-muted px-1 rounded">{selectedLogo.id}</code></p>
                <p>{lang === "zh" ? "路径" : "Path"}: <code className="font-mono bg-muted px-1 rounded">{getProviderLogo(selectedLogo.id, previewVariant)}</code></p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-5 py-4 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleCopySvg(selectedLogo.id)}
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                {copied ? (lang === "zh" ? "已复制" : "Copied!") : L.logoCopySvg}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleDownload(selectedLogo.id)}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                {L.logoDownload}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

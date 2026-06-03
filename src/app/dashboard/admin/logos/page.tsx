"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/i18n-context";
import { cn } from "@/lib/utils";
import { Search, Download, Copy, Check, X, Palette, Sun, Moon } from "lucide-react";

interface IconEntry {
  id: string;
  variants: string[];
  provider?: string;
}

export default function LogoManagePage() {
  const { t, lang } = useI18n();
  const L = t.dashboard;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedIcon, setSelectedIcon] = useState<IconEntry | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [copied, setCopied] = useState(false);
  const [allIcons, setAllIcons] = useState<IconEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<string[]>([]);

  // Load manifest
  useEffect(() => {
    fetch("/providers/manifest.json")
      .then((r) => r.json())
      .then((data: IconEntry[]) => {
        setAllIcons(data);
        const provs = [...new Set(data.map((d) => d.provider || d.id))].sort();
        setProviders(provs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Provider categories
  const CATEGORIES = useMemo(() => {
    const cats: Record<string, { zh: string; en: string; providers: Set<string> }> = {
      all: { zh: "全部", en: "All", providers: new Set() },
      llm: { zh: "大语言模型", en: "LLM", providers: new Set(["OpenAI", "Anthropic", "Google", "DeepSeek", "Meta", "Alibaba", "Baidu", "ByteDance", "Mistral", "Cohere", "xAI", "Groq", "Perplexity", "ZhiPu", "MiniMax", "Moonshot", "StepFun", "Baichuan", "01.AI"]) },
      image: { zh: "图像/视频", en: "Image & Video", providers: new Set(["Stability", "Midjourney"]) },
      cloud: { zh: "云服务", en: "Cloud", providers: new Set(["AWS", "Azure", "NVIDIA", "Vercel", "Cloudflare", "GitHub", "Microsoft"]) },
      agent: { zh: "AI Agent/工具", en: "Agent & Tools", providers: new Set(["Cursor", "Windsurf", "Cline", "Ollama", "HuggingFace", "Replicate", "Together AI", "Fireworks", "SiliconCloud", "LobeHub"]) },
    };
    return cats;
  }, []);

  const filtered = useMemo(() => {
    let result = allIcons;

    // Category filter
    if (category !== "all") {
      const catProviders = CATEGORIES[category]?.providers || new Set();
      result = result.filter((icon) => catProviders.has(icon.provider || icon.id));
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((icon) =>
        icon.id.toLowerCase().includes(q) ||
        (icon.provider || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [allIcons, search, category, CATEGORIES]);

  const getSrc = (id: string, suffix: string) => `/providers/${id}${suffix}.svg`;

  const getVariantLabel = (suffix: string) => {
    const labels: Record<string, { zh: string; en: string }> = {
      "": { zh: "标准", en: "Standard" },
      "-color": { zh: "彩色", en: "Color" },
      "-text": { zh: "文字", en: "Text" },
      "-text-cn": { zh: "中文", en: "CN Text" },
      "-brand": { zh: "品牌", en: "Brand" },
      "-brand-color": { zh: "品牌彩色", en: "Brand Color" },
    };
    const l = labels[suffix];
    return l ? (lang === "zh" ? l.zh : l.en) : suffix;
  };

  const handleCopySvg = async (id: string, suffix: string) => {
    try {
      const res = await fetch(getSrc(id, suffix));
      const svg = await res.text();
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleDownload = async (id: string, suffix: string) => {
    try {
      const res = await fetch(getSrc(id, suffix));
      const svg = await res.text();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id}${suffix}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  // Group filtered icons by provider for display
  const groupedByProvider = useMemo(() => {
    const groups = new Map<string, IconEntry[]>();
    for (const icon of filtered) {
      const prov = icon.provider || icon.id;
      if (!groups.has(prov)) groups.set(prov, []);
      groups.get(prov)!.push(icon);
    }
    return groups;
  }, [filtered]);

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
            {loading
              ? (lang === "zh" ? "加载中..." : "Loading...")
              : `${allIcons.length} ${lang === "zh" ? "个图标" : "icons"} · ${providers.length} ${lang === "zh" ? "个供应商" : "providers"}`}
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

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              category === key
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
            )}
          >
            {lang === "zh" ? cat.zh : cat.en}
          </button>
        ))}
      </div>

      {/* Icon Grid — grouped by provider */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border/50 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {[...groupedByProvider.entries()].map(([provider, icons]) => (
            <div key={provider}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{provider}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {icons.map((icon) => {
                  const displaySuffix = icon.variants.includes("-color") ? "-color" : icon.variants[0];
                  return (
                    <button
                      key={icon.id}
                      onClick={() => { setSelectedIcon(icon); setSelectedVariant(displaySuffix); setCopied(false); }}
                      className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        <img
                          src={getSrc(icon.id, displaySuffix)}
                          alt={icon.id}
                          className="w-12 h-12 object-contain"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-xs text-foreground/80 group-hover:text-foreground transition-colors text-center leading-tight truncate w-full font-medium">
                        {icon.id}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {icon.variants.length} {lang === "zh" ? "个变体" : "variants"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{lang === "zh" ? "未找到匹配的图标" : "No matching icons found"}</p>
        </div>
      )}

      {/* Preview Dialog */}
      {selectedIcon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedIcon(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold font-mono">{selectedIcon.id}</h3>
                {selectedIcon.provider && selectedIcon.provider !== selectedIcon.id && (
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedIcon.provider}</p>
                )}
              </div>
              <button onClick={() => setSelectedIcon(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Variant selector */}
            {selectedIcon.variants.length > 1 && (
              <div className="flex gap-1.5 px-6 pt-4 flex-wrap">
                {selectedIcon.variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => { setSelectedVariant(v); setCopied(false); }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                      selectedVariant === v
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-transparent text-muted-foreground border-border hover:text-foreground"
                    )}
                  >
                    {getVariantLabel(v)}
                  </button>
                ))}
              </div>
            )}

            {/* Preview */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-border">
                  <img src={getSrc(selectedIcon.id, selectedVariant)} alt={selectedIcon.id} className="w-24 h-24 object-contain" />
                  <span className="text-xs text-gray-500 flex items-center gap-1.5"><Sun className="h-3.5 w-3.5" /> Light</span>
                </div>
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-gray-900 border border-gray-700">
                  <img
                    src={getSrc(selectedIcon.id, selectedVariant)}
                    alt={selectedIcon.id}
                    className="w-24 h-24 object-contain"
                    style={selectedVariant === "" ? { filter: "invert(1)" } : undefined}
                  />
                  <span className="text-xs text-gray-400 flex items-center gap-1.5"><Moon className="h-3.5 w-3.5" /> Dark</span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 text-sm text-muted-foreground space-y-1.5">
                <p>File: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{selectedIcon.id}{selectedVariant}.svg</code></p>
                <p>{lang === "zh" ? "变体" : "Variants"}: {selectedIcon.variants.map(v => <code key={v} className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs ml-1">{v || "(mono)"}</code>)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleCopySvg(selectedIcon.id, selectedVariant)}
              >
                {copied ? <Check className="h-4 w-4 mr-2 text-emerald-500" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? (lang === "zh" ? "已复制" : "Copied!") : L.logoCopySvg}
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleDownload(selectedIcon.id, selectedVariant)}
              >
                <Download className="h-4 w-4 mr-2" />
                {L.logoDownload}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

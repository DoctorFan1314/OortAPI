"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/i18n-context";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { Search, Download, Copy, Check, X, Palette, Sun, Moon, Star } from "lucide-react";

interface IconEntry {
  id: string;
  variants: string[];
}

const CATEGORIES = [
  { key: "all", zh: "全部", en: "All" },
  { key: "llm", zh: "大语言模型", en: "LLM", ids: ["openai","anthropic","claude","claudecode","google","gemini","geminicli","gemma","deepseek","meta","metaai","mistral","cohere","qwen","alibaba","baidu","bytedance","zhipu","minimax","moonshot","stepfun","baichuan","yi","zeroone","perplexity","groq","xai","grok","doubao","kimi","spark","hunyuan","internlm","chatglm","rwkv","sensenova","skywork","tii","alephalpha","inflection"] },
  { key: "image", zh: "图像/视频", en: "Image & Video", ids: ["dalle","sora","midjourney","stability","flux","ideogram","kolors","cogview","jimeng","kling","recraft","meshy","luma","pika","pixverse","vidu","hailuo","krea","sdxl"] },
  { key: "cloud", zh: "云服务", en: "Cloud", ids: ["aws","azure","bedrock","vertexai","googlecloud","alibabacloud","baiducloud","tencentcloud","huaweicloud","cloudflare","vercel","volcengine","sambanova","togetherai","fireworks","siliconcloud","deepinfra","anyscale","nvidia","replicate","hyperbolic","novita","ppio","leptonai","featherless","targon","centml","cerebras"] },
  { key: "agent", zh: "AI Agent/工具", en: "Agent & Tools", ids: ["cursor","windsurf","cline","roocode","opencode","devin","manus","crewai","langchain","langgraph","llamaindex","dify","fastgpt","coze","phidata","mastra","autogen","ollama","lmstudio","vllm","xinference","openrouter","newapi","lobehub","openwebui","sillytavern","cherrystudio"] },
  { key: "infra", zh: "基础设施", en: "Infrastructure", ids: ["docker","kubernetes","github","gitlab","bitbucket","npm","yarn","pnpm","webpack","vite","turbopack","babel","typescript","eslint","prettier"] },
];

const STORAGE_KEY = "oortapi-logo-favorites";

export default function LogoManagePage() {
  const { t, lang } = useI18n();
  const { resolvedTheme } = useTheme();
  const L = t.dashboard;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedIcon, setSelectedIcon] = useState<IconEntry | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [allIcons, setAllIcons] = useState<IconEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    fetch("/providers/manifest.json")
      .then((r) => r.json())
      .then((data: IconEntry[]) => { setAllIcons(data); setLoading(false); })
      .catch(() => setLoading(false));

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let result = allIcons;
    if (showFavorites) result = result.filter(i => favorites.has(i.id));
    if (category !== "all") {
      const catIds = new Set(CATEGORIES.find(c => c.key === category)?.ids || []);
      result = result.filter(i => catIds.has(i.id));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.id.toLowerCase().includes(q) || i.variants.some(v => v.includes(q)));
    }
    return result;
  }, [allIcons, search, category, showFavorites, favorites]);

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

  const handleCopy = async (id: string, suffix: string, idx: number) => {
    try {
      const res = await fetch(getSrc(id, suffix));
      const svg = await res.text();
      await navigator.clipboard.writeText(svg);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
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

  // Check if a variant needs invert in dark mode (mono variants have black fill)
  const needsInvert = (suffix: string) => {
    // color, text, brand-color variants have their own colors — no invert
    if (suffix === "-color" || suffix === "-brand-color") return false;
    // text variants often have colored text — no invert
    if (suffix === "-text" || suffix === "-text-cn") return false;
    // mono and brand variants are black — need invert in dark mode
    return true;
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
            {loading
              ? (lang === "zh" ? "加载中..." : "Loading...")
              : `${allIcons.length} ${lang === "zh" ? "个图标" : "icons"} · ${filtered.length} ${lang === "zh" ? "个显示" : "shown"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium transition-all border whitespace-nowrap",
              showFavorites
                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", showFavorites && "fill-current")} />
            {lang === "zh" ? "收藏" : "Favorites"}
          </button>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input placeholder={L.logoSearch} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              category === cat.key
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
            )}
          >
            {lang === "zh" ? cat.zh : cat.en}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 animate-pulse">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((icon) => {
            const displaySuffix = icon.variants.includes("-color") ? "-color" : icon.variants[0];
            const isFav = favorites.has(icon.id);
            const isDark = resolvedTheme === "dark";
            const invert = isDark && needsInvert(displaySuffix);

            return (
              <div
                key={icon.id}
                role="button"
                tabIndex={0}
                onClick={() => { setSelectedIcon(icon); setSelectedVariant(displaySuffix); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setSelectedIcon(icon); setSelectedVariant(displaySuffix); } }}
                className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(icon.id); }}
                  className={cn(
                    "absolute top-1.5 right-1.5 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100",
                    isFav ? "text-yellow-500 opacity-100" : "text-muted-foreground hover:text-yellow-500"
                  )}
                >
                  <Star className={cn("h-3.5 w-3.5", isFav && "fill-current")} />
                </button>
                <div className="w-12 h-12 flex items-center justify-center">
                  <img
                    src={getSrc(icon.id, displaySuffix)}
                    alt={icon.id}
                    className="w-12 h-12 object-contain"
                    loading="lazy"
                    style={invert ? { filter: "invert(1)" } : undefined}
                  />
                </div>
                <span className="text-xs text-foreground/80 group-hover:text-foreground transition-colors text-center leading-tight truncate w-full font-medium">
                  {icon.id}
                </span>
                {icon.variants.length > 1 && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {icon.variants.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-lg font-medium text-muted-foreground mb-2">{lang === "zh" ? "未找到匹配的图标" : "No matching icons found"}</p>
          <p className="text-sm text-muted-foreground">{search ? (lang === "zh" ? "尝试其他搜索词" : "Try a different search term") : (lang === "zh" ? "该分类下暂无图标" : "No icons in this category")}</p>
        </div>
      )}

      {/* Preview Dialog */}
      {selectedIcon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedIcon(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedIcon(null)}
        >
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold font-mono">{selectedIcon.id}</h3>
                <button
                  onClick={() => toggleFavorite(selectedIcon.id)}
                  className={cn("p-1 rounded-full transition-all", favorites.has(selectedIcon.id) ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500")}
                >
                  <Star className={cn("h-4 w-4", favorites.has(selectedIcon.id) && "fill-current")} />
                </button>
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
                    onClick={() => { setSelectedVariant(v); setCopiedIdx(null); }}
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

            {/* Preview — light and dark */}
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
                    style={needsInvert(selectedVariant) ? { filter: "invert(1)" } : undefined}
                  />
                  <span className="text-xs text-gray-400 flex items-center gap-1.5"><Moon className="h-3.5 w-3.5" /> Dark</span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 text-sm text-muted-foreground space-y-1.5">
                <p>File: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{selectedIcon.id}{selectedVariant}.svg</code></p>
                <p>Path: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">/providers/{selectedIcon.id}{selectedVariant}.svg</code></p>
              </div>
            </div>

            {/* Per-variant download/copy table */}
            <div className="px-6 pb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">{lang === "zh" ? "下载/复制单个变体" : "Download / Copy individual variant"}</p>
              <div className="border border-border rounded-lg overflow-hidden">
                {selectedIcon.variants.map((v, idx) => (
                  <div key={v} className={cn("flex items-center justify-between px-3 py-2 text-xs", idx > 0 && "border-t border-border/50")}>
                    <div className="flex items-center gap-2">
                      <img
                        src={getSrc(selectedIcon.id, v)}
                        alt={`${selectedIcon.id}${v}`}
                        className="w-5 h-5 object-contain"
                        style={resolvedTheme === "dark" && needsInvert(v) ? { filter: "invert(1)" } : undefined}
                      />
                      <span className="font-mono text-foreground/80">{selectedIcon.id}{v}.svg</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCopy(selectedIcon.id, v, idx)}
                        className="px-2 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                      <button
                        onClick={() => handleDownload(selectedIcon.id, v)}
                        className="px-2 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/i18n-context";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { Search, Download, Copy, Check, X, Palette, Sun, Moon, Star, Clock, Filter } from "lucide-react";

interface IconEntry {
  id: string;
  variants: string[];
}

// Category definitions
const CATEGORIES = [
  { key: "all", zh: "全部", en: "All" },
  { key: "llm", zh: "大语言模型", en: "LLM", ids: ["openai","anthropic","claude","claudecode","google","gemini","geminicli","gemma","deepseek","meta","metaai","mistral","cohere","qwen","alibaba","baidu","bytedance","zhipu","minimax","moonshot","stepfun","baichuan","yi","zeroone","perplexity","groq","xai","grok","doubao","kimi","spark","hunyuan","internlm","chatglm","rwkv","sensenova","skywork","tii","alephalpha","inflection"] },
  { key: "image", zh: "图像/视频", en: "Image & Video", ids: ["dalle","sora","midjourney","stability","flux","ideogram","kolors","cogview","jimeng","kling","recraft","meshy","luma","pika","pixverse","vidu","hailuo","krea","sdxl"] },
  { key: "cloud", zh: "云服务", en: "Cloud", ids: ["aws","azure","bedrock","vertexai","googlecloud","alibabacloud","baiducloud","tencentcloud","huaweicloud","cloudflare","vercel","volcengine","sambanova","togetherai","fireworks","siliconcloud","deepinfra","anyscale","nvidia","replicate","hyperbolic","novita","ppio","leptonai","featherless","targon","centml","cerebras"] },
  { key: "agent", zh: "AI Agent/工具", en: "Agent & Tools", ids: ["cursor","windsurf","cline","roocode","opencode","devin","manus","crewai","langchain","langgraph","llamaindex","dify","fastgpt","coze","phidata","mastra","autogen","ollama","lmstudio","vllm","xinference","openrouter","newapi","lobehub","openwebui","sillytavern","cherrystudio"] },
  { key: "infra", zh: "基础设施", en: "Infrastructure", ids: ["docker","kubernetes","github","gitlab","bitbucket","npm","yarn","pnpm","webpack","vite","turbopack","babel","typescript","eslint","prettier"] },
];

const STORAGE_KEY = "oortapi-logo-favorites";
const RECENT_KEY = "oortapi-logo-recent";

export default function LogoManagePage() {
  const { t, lang } = useI18n();
  const { resolvedTheme } = useTheme();
  const L = t.dashboard;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedIcon, setSelectedIcon] = useState<IconEntry | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [allIcons, setAllIcons] = useState<IconEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Load manifest + favorites + recent
  useEffect(() => {
    // Load manifest
    fetch("/providers/manifest.json")
      .then((r) => r.json())
      .then((data: IconEntry[]) => {
        setAllIcons(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Load favorites from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }

    // Load recent from localStorage
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecentIds(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Save favorites
  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Add to recent
  const addToRecent = useCallback((id: string) => {
    setRecentIds(prev => {
      const next = [id, ...prev.filter(r => r !== id)].slice(0, 10);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Filter icons
  const filtered = useMemo(() => {
    let result = allIcons;

    // Favorites filter
    if (showFavorites) {
      result = result.filter((icon) => favorites.has(icon.id));
    }

    // Category filter
    if (category !== "all") {
      const cat = CATEGORIES.find(c => c.key === category);
      const catIds = new Set(cat?.ids || []);
      result = result.filter((icon) => catIds.has(icon.id));
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((icon) =>
        icon.id.toLowerCase().includes(q) ||
        icon.variants.some(v => v.includes(q))
      );
    }

    return result;
  }, [allIcons, search, category, showFavorites, favorites]);

  // Recent icons (shown at top when no search/filter)
  const recentIcons = useMemo(() => {
    if (search || category !== "all" || showFavorites) return [];
    return recentIds
      .map(id => allIcons.find(i => i.id === id))
      .filter(Boolean) as IconEntry[];
  }, [allIcons, recentIds, search, category, showFavorites]);

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

  const handleCopyPath = async (id: string, suffix: string) => {
    try {
      await navigator.clipboard.writeText(`/providers/${id}${suffix}.svg`);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 2000);
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

  // Icon card component
  const IconCard = ({ icon, size = "normal" }: { icon: IconEntry; size?: "normal" | "small" }) => {
    const displaySuffix = icon.variants.includes("-color") ? "-color" : icon.variants[0];
    const isFav = favorites.has(icon.id);
    const isDark = resolvedTheme === "dark";
    const isMono = displaySuffix === "";

    return (
      <button
        onClick={() => { setSelectedIcon(icon); setSelectedVariant(displaySuffix); setCopied(false); addToRecent(icon.id); }}
        className={cn(
          "group relative flex flex-col items-center gap-2 rounded-xl border transition-all cursor-pointer",
          size === "small" ? "p-2" : "p-3",
          "border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-md"
        )}
      >
        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(icon.id); }}
          className={cn(
            "absolute top-1.5 right-1.5 p-1 rounded-full transition-all opacity-0 group-hover:opacity-100",
            isFav ? "text-yellow-500 opacity-100" : "text-muted-foreground hover:text-yellow-500"
          )}
          title={isFav ? (lang === "zh" ? "取消收藏" : "Unfavorite") : (lang === "zh" ? "收藏" : "Favorite")}
        >
          <Star className={cn("h-3.5 w-3.5", isFav && "fill-current")} />
        </button>

        {/* Icon */}
        <div className={cn("flex items-center justify-center", size === "small" ? "w-10 h-10" : "w-12 h-12")}>
          <img
            src={getSrc(icon.id, displaySuffix)}
            alt={icon.id}
            className={cn("object-contain", size === "small" ? "w-10 h-10" : "w-12 h-12")}
            loading="lazy"
            style={isMono && isDark ? { filter: "invert(1)" } : undefined}
          />
        </div>

        {/* Label */}
        <span className="text-xs text-foreground/80 group-hover:text-foreground transition-colors text-center leading-tight truncate w-full font-medium">
          {icon.id}
        </span>

        {/* Variant count badge */}
        {icon.variants.length > 1 && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {icon.variants.length}
          </span>
        )}
      </button>
    );
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              showFavorites
                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", showFavorites && "fill-current")} />
            {lang === "zh" ? "收藏" : "Favorites"}
          </button>
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

      {/* Recent icons */}
      {!loading && recentIcons.length > 0 && !search && category === "all" && !showFavorites && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {lang === "zh" ? "最近使用" : "Recent"}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
            {recentIcons.map((icon) => (
              <IconCard key={icon.id} icon={icon} size="small" />
            ))}
          </div>
        </div>
      )}

      {/* Main Icon Grid */}
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
          {filtered.map((icon) => (
            <IconCard key={icon.id} icon={icon} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {lang === "zh" ? "未找到匹配的图标" : "No matching icons found"}
          </p>
          <p className="text-sm text-muted-foreground">
            {search
              ? (lang === "zh" ? "尝试其他搜索词" : "Try a different search term")
              : (lang === "zh" ? "该分类下暂无图标" : "No icons in this category")}
          </p>
        </div>
      )}

      {/* Preview Dialog */}
      {selectedIcon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedIcon(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedIcon(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold font-mono">{selectedIcon.id}</h3>
                <button
                  onClick={() => toggleFavorite(selectedIcon.id)}
                  className={cn(
                    "p-1 rounded-full transition-all",
                    favorites.has(selectedIcon.id) ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
                  )}
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
                <p>Path: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">/providers/{selectedIcon.id}{selectedVariant}.svg</code></p>
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
                variant="outline"
                className="flex-1"
                onClick={() => handleCopyPath(selectedIcon.id, selectedVariant)}
              >
                {copiedPath ? <Check className="h-4 w-4 mr-2 text-emerald-500" /> : <Copy className="h-4 w-4 mr-2" />}
                {copiedPath ? (lang === "zh" ? "已复制" : "Copied!") : (lang === "zh" ? "复制路径" : "Copy Path")}
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

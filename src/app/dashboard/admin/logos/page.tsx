"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/i18n-context";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { Search, Download, Copy, Check, X, Palette, Star, Image as ImageIcon } from "lucide-react";

interface IconEntry {
  id: string;
  variants: string[];
  formats: {
    svg: string[];
    png_light: string[];
    png_dark: string[];
  };
}

type FormatType = "svg" | "png_light" | "png_dark";

const CATEGORIES = [
  { key: "all", zh: "全部", en: "All" },
  { key: "llm", zh: "大语言模型", en: "LLM", ids: ["openai","anthropic","claude","claudecode","google","gemini","geminicli","gemma","deepseek","meta","metaai","mistral","cohere","qwen","alibaba","baidu","bytedance","zhipu","minimax","moonshot","stepfun","baichuan","yi","zeroone","perplexity","groq","xai","grok","doubao","kimi","spark","hunyuan","internlm","chatglm","rwkv","sensenova","skywork","tii","alephalpha","inflection"] },
  { key: "image", zh: "图像/视频", en: "Image & Video", ids: ["dalle","sora","midjourney","stability","flux","ideogram","kolors","cogview","jimeng","kling","recraft","meshy","luma","pika","pixverse","vidu","hailuo","krea","sdxl"] },
  { key: "cloud", zh: "云服务", en: "Cloud", ids: ["aws","azure","bedrock","vertexai","googlecloud","alibabacloud","baiducloud","tencentcloud","huaweicloud","cloudflare","vercel","volcengine","sambanova","togetherai","fireworks","siliconcloud","deepinfra","anyscale","nvidia","replicate","hyperbolic","novita","ppio","leptonai","featherless","targon","centml","cerebras"] },
  { key: "agent", zh: "AI Agent/工具", en: "Agent & Tools", ids: ["cursor","windsurf","cline","roocode","opencode","devin","manus","crewai","langchain","langgraph","llamaindex","dify","fastgpt","coze","phidata","mastra","autogen","ollama","lmstudio","vllm","xinference","openrouter","newapi","lobehub","openwebui","sillytavern","cherrystudio"] },
  { key: "infra", zh: "基础设施", en: "Infrastructure", ids: ["docker","kubernetes","github","gitlab","bitbucket","npm","yarn","pnpm","webpack","vite","turbopack","babel","typescript","eslint","prettier"] },
];

const STORAGE_KEY = "oortapi-logo-favorites";

const FORMAT_LABELS: Record<FormatType, { zh: string; en: string }> = {
  svg: { zh: "SVG", en: "SVG" },
  png_light: { zh: "PNG 亮色", en: "PNG Light" },
  png_dark: { zh: "PNG 暗色", en: "PNG Dark" },
};

export default function LogoManagePage() {
  const { t, lang } = useI18n();
  const { resolvedTheme } = useTheme();
  const L = t.dashboard;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedIcon, setSelectedIcon] = useState<IconEntry | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<FormatType>("svg");
  const [copied, setCopied] = useState(false);
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

  const getSrc = (id: string, suffix: string, format: FormatType) => {
    if (format === "svg") return `/providers/${id}${suffix}.svg`;
    if (format === "png_light") return `/providers/light/${id}${suffix}.png`;
    return `/providers/dark/${id}${suffix}.png`;
  };

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

  const handleCopy = async (id: string, suffix: string) => {
    try {
      const res = await fetch(getSrc(id, suffix, selectedFormat));
      if (selectedFormat === "svg") {
        const svg = await res.text();
        await navigator.clipboard.writeText(svg);
      } else {
        const blob = await res.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleCopyPath = async (id: string, suffix: string) => {
    try {
      const path = selectedFormat === "svg"
        ? `/providers/${id}${suffix}.svg`
        : `/providers/${selectedFormat === "png_light" ? "light" : "dark"}/${id}${suffix}.png`;
      await navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleDownload = async (id: string, suffix: string) => {
    try {
      const res = await fetch(getSrc(id, suffix, selectedFormat));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = selectedFormat === "svg" ? "svg" : "png";
      a.download = `${id}${suffix}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const needsInvert = (suffix: string) => {
    if (suffix === "-color" || suffix === "-brand-color") return false;
    if (suffix === "-text" || suffix === "-text-cn") return false;
    return true;
  };

  const hasFormat = (icon: IconEntry, format: FormatType) => {
    return icon.formats[format]?.length > 0;
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
                onClick={() => { setSelectedIcon(icon); setSelectedVariant(displaySuffix); setSelectedFormat("svg"); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setSelectedIcon(icon); setSelectedVariant(displaySuffix); setSelectedFormat("svg"); } }}
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
                    src={getSrc(icon.id, displaySuffix, "svg")}
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
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
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

            {/* Body: variant tabs (left) + preview (right) */}
            <div className="flex min-h-[360px]">
              {/* Left: variant tabs */}
              <div className="w-36 border-r border-border bg-muted/30 p-3 space-y-1 shrink-0">
                {selectedIcon.variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => { setSelectedVariant(v); setCopied(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      selectedVariant === v
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {getVariantLabel(v)}
                  </button>
                ))}
              </div>

              {/* Right: format tabs + preview + actions */}
              <div className="flex-1 p-6 flex flex-col">
                {/* Format tabs */}
                <div className="flex gap-1 mb-4">
                  {(["svg", "png_light", "png_dark"] as FormatType[]).map((fmt) => {
                    const available = hasFormat(selectedIcon, fmt);
                    return (
                      <button
                        key={fmt}
                        onClick={() => { if (available) { setSelectedFormat(fmt); setCopied(false); } }}
                        disabled={!available}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                          selectedFormat === fmt
                            ? "bg-primary/10 text-primary border-primary/30"
                            : available
                              ? "bg-transparent text-muted-foreground border-border hover:text-foreground"
                              : "bg-transparent text-muted-foreground/30 border-border/30 cursor-not-allowed"
                        )}
                      >
                        {lang === "zh" ? FORMAT_LABELS[fmt].zh : FORMAT_LABELS[fmt].en}
                        {!available && " (-)"}
                      </button>
                    );
                  })}
                </div>

                {/* Preview */}
                <div className="flex-1 flex items-center justify-center">
                  <div className={cn(
                    "rounded-xl border p-8 flex items-center justify-center",
                    selectedFormat === "png_dark" ? "bg-gray-900 border-gray-700" : "bg-white border-border"
                  )}>
                    <img
                      src={getSrc(selectedIcon.id, selectedVariant, selectedFormat)}
                      alt={selectedIcon.id}
                      className="w-24 h-24 object-contain"
                      style={selectedFormat === "svg" && needsInvert(selectedVariant) && resolvedTheme === "dark" ? { filter: "invert(1)" } : undefined}
                    />
                  </div>
                </div>

                {/* File info */}
                <div className="mt-3 text-xs text-muted-foreground">
                  <p className="font-mono">
                    {selectedIcon.id}{selectedVariant}.{selectedFormat === "svg" ? "svg" : "png"}
                  </p>
                  <p className="mt-1">
                    {lang === "zh" ? "路径" : "Path"}: <code className="font-mono bg-muted px-1 py-0.5 rounded">
                      {selectedFormat === "svg"
                        ? `/providers/${selectedIcon.id}${selectedVariant}.svg`
                        : `/providers/${selectedFormat === "png_light" ? "light" : "dark"}/${selectedIcon.id}${selectedVariant}.png`}
                    </code>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCopy(selectedIcon.id, selectedVariant)}
                  >
                    {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                    {copied ? (lang === "zh" ? "已复制" : "Copied!") : L.logoCopySvg}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCopyPath(selectedIcon.id, selectedVariant)}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    {lang === "zh" ? "复制路径" : "Copy Path"}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(selectedIcon.id, selectedVariant)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    {L.logoDownload}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

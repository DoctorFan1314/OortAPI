"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/i18n-context";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { Search, Download, Copy, Check, X, Palette, Sun, Moon, Image as ImageIcon } from "lucide-react";

// All available variant suffixes in lobehub icons
const VARIANT_SUFFIXES = ["-color", "-text", "-text-cn", "-brand", "-brand-color", ""];

interface LogoEntry {
  id: string;           // base ID, e.g. "openai"
  variants: string[];   // available variant suffixes, e.g. ["", "-color", "-text"]
}

export default function LogoManagePage() {
  const { t, lang } = useI18n();
  const { resolvedTheme } = useTheme();
  const L = t.dashboard;

  const [search, setSearch] = useState("");
  const [selectedLogo, setSelectedLogo] = useState<LogoEntry | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [copied, setCopied] = useState(false);
  const [allLogos, setAllLogos] = useState<LogoEntry[]>([]);

  // Discover all logos from public/providers/
  useEffect(() => {
    fetch("/api/docs/openapi.json")
      .catch(() => {});

    // Scan the providers directory by trying known patterns
    const discovered: Map<string, string[]> = new Map();

    // We'll check the manifest file if it exists, otherwise use a known list
    const knownProviders = [
      "ace", "adobe", "adobefirefly", "agentvoice", "agui", "ai2", "ai21", "ai302", "ai360",
      "aihubmix", "aimass", "aionlabs", "airjelly", "aistudio", "akashchat", "alephalpha",
      "alibaba", "alibabacloud", "amp", "antgroup", "anthropic", "antigravity", "anyscale",
      "apertis", "apple", "arcee", "askverdict", "assemblyai", "atlascloud", "automatic",
      "aws", "aya", "azure", "azureai", "baai", "baichuan", "baidu", "baiducloud", "bailian",
      "baseten", "bedrock", "bfl", "bilibili", "bilibiliindex", "bing", "briaai", "burncloud",
      "bytedance", "capcut", "centml", "cerebras", "chatglm", "cherrystudio", "civitai",
      "claude", "claudecode", "cline", "clipdrop", "cloudflare", "codebuddy", "codeflicker",
      "codegeex", "codex", "cogvideo", "cogview", "cohere", "colab", "cometapi", "comfyui",
      "commanda", "copilot", "copilotkit", "coqui", "coze", "crewai", "crusoe", "cursor",
      "cybercut", "dalle", "dbrx", "deepai", "deepcogito", "deepinfra", "deepl", "deepmind",
      "deepseek", "devin", "dify", "doc2x", "docsearch", "dolphin", "doubao", "dreammachine",
      "elevenlabs", "elevenx", "essentialai", "exa", "fal", "fastgpt", "featherless", "figma",
      "fireworks", "fishaudio", "flora", "flowith", "flux", "friendli", "gemini", "geminicli",
      "gemma", "giteeai", "github", "githubcopilot", "glama", "glif", "glmv", "google",
      "googlecloud", "goose", "gradio", "greptile", "grok", "groq", "hailuo", "haiper",
      "hedra", "hermesagent", "higress", "huawei", "huaweicloud", "huggingface", "hunyuan",
      "hyperbolic", "ibm", "ideogram", "iflytekcloud", "inception", "inference", "infermatic",
      "infinigence", "inflection", "internlm", "jimeng", "jina", "junie", "kilocode", "kimi",
      "kiro", "kling", "kluster", "kolors", "krea", "kwaikat", "kwaipilot", "lambda",
      "langchain", "langfuse", "langgraph", "langsmith", "leptonai", "lg", "lightricks",
      "liquid", "livekit", "llamaindex", "llava", "llmapi", "lmstudio", "lobehub", "longcat",
      "lovable", "lovart", "luma", "magic", "make", "manus", "mastra", "mcp", "mcpso",
      "menlo", "meshy", "meta", "metaai", "metagpt", "microsoft", "midjourney", "minimax",
      "mistral", "modelscope", "monica", "moonshot", "morph", "moxt", "myshell", "n8n",
      "nanobanana", "nebius", "newapi", "notebooklm", "notion", "nousresearch", "nova",
      "novelai", "novita", "nplcloud", "nvidia", "obsidian", "ollama", "openchat", "openclaw",
      "opencode", "openhands", "openhuman", "openrouter", "openwebui", "palm", "parasail",
      "perplexity", "phidata", "phind", "pika", "pixverse", "player2", "poe", "pollinations",
      "ppio", "prunaai", "pydanticai", "qingyan", "qiniu", "qoder", "qwen", "railway",
      "recraft", "relace", "replicate", "replit", "reve", "roocode", "rsshub", "runway",
      "rwkv", "sambanova", "search1api", "searchapi", "sensenova", "siliconcloud",
      "sillytavern", "skywork", "slock", "smithery", "snowflake", "sophnet", "sora", "spark",
      "speedai", "stability", "statecloud", "stepfun", "straico", "streamlake", "submodel",
      "suno", "sync", "targon", "tavily", "tencent", "tencentcloud", "tiangong", "tii",
      "togetherai", "topazlabs", "trae", "tripo", "turix", "udio", "unstructured", "upstage",
      "v0", "vectorizerai", "venice", "vercel", "vertexai", "vidu", "viggle", "vllm",
      "volcengine", "voyage", "wenxin", "windsurf", "workersai", "worldrouter", "xai",
      "xiaomimimo", "xinference", "xpay", "xuanyuan", "yandex", "yi", "youmind", "yuanbao",
      "zai", "zapier", "zeabur", "zencoder", "zenmux", "zeroone", "zhipu"
    ];

    // For each provider, discover which variants exist
    const checkVariant = (id: string, suffix: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = `/providers/${id}${suffix}.svg`;
      });
    };

    const discoverAll = async () => {
      const results: LogoEntry[] = [];
      for (const id of knownProviders) {
        const variants: string[] = [];
        for (const suffix of VARIANT_SUFFIXES) {
          const exists = await checkVariant(id, suffix);
          if (exists) variants.push(suffix);
        }
        if (variants.length > 0) {
          results.push({ id, variants });
        }
      }
      setAllLogos(results);
    };

    discoverAll();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return allLogos;
    const q = search.toLowerCase();
    return allLogos.filter((l) => l.id.toLowerCase().includes(q));
  }, [allLogos, search]);

  const getSrc = (id: string, suffix: string) => `/providers/${id}${suffix}.svg`;

  const getVariantLabel = (suffix: string) => {
    if (suffix === "") return lang === "zh" ? "标准" : "Standard";
    if (suffix === "-color") return lang === "zh" ? "彩色" : "Color";
    if (suffix === "-text") return lang === "zh" ? "文字" : "Text";
    if (suffix === "-text-cn") return lang === "zh" ? "中文文字" : "Text (CN)";
    if (suffix === "-brand") return lang === "zh" ? "品牌" : "Brand";
    if (suffix === "-brand-color") return lang === "zh" ? "品牌彩色" : "Brand Color";
    return suffix;
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
            {allLogos.length > 0
              ? `${allLogos.length} ${lang === "zh" ? "个供应商" : "providers"} · ${allLogos.reduce((s, l) => s + l.variants.length, 0)} ${lang === "zh" ? "个图标" : "icons"}`
              : lang === "zh" ? "加载中..." : "Loading..."}
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

      {/* Logo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {filtered.map((logo) => {
          // Prefer color variant, fallback to mono
          const displaySuffix = logo.variants.includes("-color") ? "-color" : logo.variants[0];
          return (
            <button
              key={logo.id}
              onClick={() => { setSelectedLogo(logo); setSelectedVariant(displaySuffix); setCopied(false); }}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src={getSrc(logo.id, displaySuffix)}
                  alt={logo.id}
                  className="w-10 h-10 object-contain"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight truncate w-full">
                {logo.id}
              </span>
            </button>
          );
        })}
      </div>

      {allLogos.length > 0 && filtered.length === 0 && (
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
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold font-mono">{selectedLogo.id}</h3>
              <button onClick={() => setSelectedLogo(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Variant selector */}
            {selectedLogo.variants.length > 1 && (
              <div className="flex gap-1 px-5 pt-4 flex-wrap">
                {selectedLogo.variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => { setSelectedVariant(v); setCopied(false); }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all border",
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
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-border">
                  <img src={getSrc(selectedLogo.id, selectedVariant)} alt={selectedLogo.id} className="w-16 h-16 object-contain" />
                  <span className="text-[10px] text-gray-500 flex items-center gap-1"><Sun className="h-3 w-3" /> Light</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-900 border border-gray-700">
                  <img
                    src={getSrc(selectedLogo.id, selectedVariant)}
                    alt={selectedLogo.id}
                    className="w-16 h-16 object-contain"
                    style={selectedVariant === "" ? { filter: "invert(1)" } : undefined}
                  />
                  <span className="text-[10px] text-gray-400 flex items-center gap-1"><Moon className="h-3 w-3" /> Dark</span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <p>ID: <code className="font-mono bg-muted px-1 rounded">{selectedLogo.id}{selectedVariant}.svg</code></p>
                <p>{lang === "zh" ? "变体" : "Variants"}: {selectedLogo.variants.length}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-5 py-4 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleCopySvg(selectedLogo.id, selectedVariant)}
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                {copied ? (lang === "zh" ? "已复制" : "Copied!") : L.logoCopySvg}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleDownload(selectedLogo.id, selectedVariant)}
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

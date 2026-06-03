"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/i18n-context";
import { cn } from "@/lib/utils";
import { Search, Download, Copy, Check, X, Palette, Sun, Moon } from "lucide-react";

// All available variant suffixes in lobehub icons
const VARIANT_SUFFIXES = ["-color", "-text", "-text-cn", "-brand", "-brand-color", ""];

// Category definitions for filtering
const CATEGORIES: Record<string, { zh: string; en: string; ids: string[] }> = {
  all: { zh: "全部", en: "All", ids: [] },
  llm: {
    zh: "大语言模型", en: "LLM",
    ids: ["openai", "anthropic", "claude", "claudecode", "google", "gemini", "geminicli", "gemma", "deepseek", "meta", "metaai", "mistral", "cohere", "qwen", "alibaba", "baidu", "bytedance", "zhipu", "minimax", "moonshot", "stepfun", "baichuan", "yi", "zeroone", "perplexity", "groq", "xai", "grok", "doubao", "kimi", "spark", "hunyuan", "internlm", "chatglm", "baichuan", "rwkv", "sensenova", "skywork", "tii", "alephalpha", "inflection"],
  },
  image: {
    zh: "图像生成", en: "Image Gen",
    ids: ["dalle", "sora", "midjourney", "stability", "flux", "ideogram", "kolors", "cogview", "jimeng", "kling", "recraft", "meshy", "luma", "pika", "pixverse", "vidu", "hailuo", "krea"],
  },
  cloud: {
    zh: "云服务", en: "Cloud",
    ids: ["aws", "azure", "bedrock", "vertexai", "googlecloud", "alibabacloud", "baiducloud", "tencentcloud", "huaweicloud", "cloudflare", "vercel", "volcengine", "sambanova", "togetherai", "fireworks", "siliconcloud", "deepinfra", "anyscale", "nvidia", "replicate", "hyperbolic", "novita", "ppio", "leptonai", "featherless", "targon", "centml", "cerebras", "groq"],
  },
  agent: {
    zh: "AI Agent", en: "AI Agent",
    ids: ["cursor", "windsurf", "cline", "roocode", "opencode", "devin", "manus", "crewai", "langchain", "langgraph", "llamaindex", "dify", "fastgpt", "coze", "phidata", "mastra", "autogen"],
  },
  infra: {
    zh: "基础设施", en: "Infrastructure",
    ids: ["ollama", "lmstudio", "vllm", "xinference", "openrouter", "newapi", "lobehub", "openwebui", "sillytavern", "cherrystudio", "oneapi"],
  },
};

interface LogoEntry {
  id: string;
  variants: string[];
}

export default function LogoManagePage() {
  const { t, lang } = useI18n();
  const L = t.dashboard;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedLogo, setSelectedLogo] = useState<LogoEntry | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [copied, setCopied] = useState(false);
  const [allLogos, setAllLogos] = useState<LogoEntry[]>([]);

  // Discover all logos
  useEffect(() => {
    const knownProviders = [
      "ace","adobe","adobefirefly","agentvoice","agui","ai2","ai21","ai302","ai360",
      "aihubmix","aimass","aionlabs","airjelly","aistudio","akashchat","alephalpha",
      "alibaba","alibabacloud","amp","antgroup","anthropic","antigravity","anyscale",
      "apertis","apple","arcee","askverdict","assemblyai","atlascloud","automatic",
      "aws","aya","azure","azureai","baai","baichuan","baidu","baiducloud","bailian",
      "baseten","bedrock","bfl","bilibili","bilibiliindex","bing","briaai","burncloud",
      "bytedance","capcut","centml","cerebras","chatglm","cherrystudio","civitai",
      "claude","claudecode","cline","clipdrop","cloudflare","codebuddy","codeflicker",
      "codegeex","codex","cogvideo","cogview","cohere","colab","cometapi","comfyui",
      "commanda","copilot","copilotkit","coqui","coze","crewai","crusoe","cursor",
      "cybercut","dalle","dbrx","deepai","deepcogito","deepinfra","deepl","deepmind",
      "deepseek","devin","dify","doc2x","docsearch","dolphin","doubao","dreammachine",
      "elevenlabs","elevenx","essentialai","exa","fal","fastgpt","featherless","figma",
      "fireworks","fishaudio","flora","flowith","flux","friendli","gemini","geminicli",
      "gemma","giteeai","github","githubcopilot","glama","glif","glmv","google",
      "googlecloud","goose","gradio","greptile","grok","groq","hailuo","haiper",
      "hedra","hermesagent","higress","huawei","huaweicloud","huggingface","hunyuan",
      "hyperbolic","ibm","ideogram","iflytekcloud","inception","inference","infermatic",
      "infinigence","inflection","internlm","jimeng","jina","junie","kilocode","kimi",
      "kiro","kling","kluster","kolors","krea","kwaikat","kwaipilot","lambda",
      "langchain","langfuse","langgraph","langsmith","leptonai","lg","lightricks",
      "liquid","livekit","llamaindex","llava","llmapi","lmstudio","lobehub","longcat",
      "lovable","lovart","luma","magic","make","manus","mastra","mcp","mcpso",
      "menlo","meshy","meta","metaai","metagpt","microsoft","midjourney","minimax",
      "mistral","modelscope","monica","moonshot","morph","moxt","myshell","n8n",
      "nanobanana","nebius","newapi","notebooklm","notion","nousresearch","nova",
      "novelai","novita","nplcloud","nvidia","obsidian","ollama","openchat","openclaw",
      "opencode","openhands","openhuman","openrouter","openwebui","palm","parasail",
      "perplexity","phidata","phind","pika","pixverse","player2","poe","pollinations",
      "ppio","prunaai","pydanticai","qingyan","qiniu","qoder","qwen","railway",
      "recraft","relace","replicate","replit","reve","roocode","rsshub","runway",
      "rwkv","sambanova","search1api","searchapi","sensenova","siliconcloud",
      "sillytavern","skywork","slock","smithery","snowflake","sophnet","sora","spark",
      "speedai","stability","statecloud","stepfun","straico","streamlake","submodel",
      "suno","sync","targon","tavily","tencent","tencentcloud","tiangong","tii",
      "togetherai","topazlabs","trae","tripo","turix","udio","unstructured","upstage",
      "v0","vectorizerai","venice","vercel","vertexai","vidu","viggle","vllm",
      "volcengine","voyage","wenxin","windsurf","workersai","worldrouter","xai",
      "xiaomimimo","xinference","xpay","xuanyuan","yandex","yi","youmind","yuanbao",
      "zai","zapier","zeabur","zencoder","zenmux","zeroone","zhipu"
    ];

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
      // Check variants in batches for performance
      const batchSize = 20;
      for (let i = 0; i < knownProviders.length; i += batchSize) {
        const batch = knownProviders.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (id) => {
            const variants: string[] = [];
            for (const suffix of VARIANT_SUFFIXES) {
              if (await checkVariant(id, suffix)) variants.push(suffix);
            }
            return variants.length > 0 ? { id, variants } : null;
          })
        );
        results.push(...batchResults.filter(Boolean) as LogoEntry[]);
      }
      setAllLogos(results);
    };

    discoverAll();
  }, []);

  const filtered = useMemo(() => {
    let result = allLogos;

    // Category filter
    if (category !== "all") {
      const catIds = new Set(CATEGORIES[category]?.ids || []);
      result = result.filter((l) => catIds.has(l.id));
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.id.toLowerCase().includes(q));
    }

    return result;
  }, [allLogos, search, category]);

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
              ? `${filtered.length} / ${allLogos.length} ${lang === "zh" ? "个供应商" : "providers"}`
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

      {/* Logo Grid — 6 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((logo) => {
          const displaySuffix = logo.variants.includes("-color") ? "-color" : logo.variants[0];
          return (
            <button
              key={logo.id}
              onClick={() => { setSelectedLogo(logo); setSelectedVariant(displaySuffix); setCopied(false); }}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={getSrc(logo.id, displaySuffix)}
                  alt={logo.id}
                  className="w-12 h-12 object-contain"
                  loading="lazy"
                />
              </div>
              <span className="text-xs text-foreground/80 group-hover:text-foreground transition-colors text-center leading-tight truncate w-full font-medium">
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

      {/* Preview Dialog — larger */}
      {selectedLogo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedLogo(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold font-mono">{selectedLogo.id}</h3>
              <button onClick={() => setSelectedLogo(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Variant selector */}
            {selectedLogo.variants.length > 1 && (
              <div className="flex gap-1.5 px-6 pt-4 flex-wrap">
                {selectedLogo.variants.map((v) => (
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

            {/* Preview — larger icons */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-border">
                  <img src={getSrc(selectedLogo.id, selectedVariant)} alt={selectedLogo.id} className="w-24 h-24 object-contain" />
                  <span className="text-xs text-gray-500 flex items-center gap-1.5"><Sun className="h-3.5 w-3.5" /> Light</span>
                </div>
                <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-gray-900 border border-gray-700">
                  <img
                    src={getSrc(selectedLogo.id, selectedVariant)}
                    alt={selectedLogo.id}
                    className="w-24 h-24 object-contain"
                    style={selectedVariant === "" ? { filter: "invert(1)" } : undefined}
                  />
                  <span className="text-xs text-gray-400 flex items-center gap-1.5"><Moon className="h-3.5 w-3.5" /> Dark</span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 text-sm text-muted-foreground space-y-1.5">
                <p>File: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{selectedLogo.id}{selectedVariant}.svg</code></p>
                <p>{lang === "zh" ? "可用变体" : "Available variants"}: {selectedLogo.variants.map(v => <code key={v} className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs ml-1">{v || "(mono)"}</code>)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleCopySvg(selectedLogo.id, selectedVariant)}
              >
                {copied ? <Check className="h-4 w-4 mr-2 text-emerald-500" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? (lang === "zh" ? "已复制" : "Copied!") : L.logoCopySvg}
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleDownload(selectedLogo.id, selectedVariant)}
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

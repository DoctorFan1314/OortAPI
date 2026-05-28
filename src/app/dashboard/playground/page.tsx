"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Play, Send, Bot, User, Loader2, Square, Zap, Settings2, Trash2, Download, RefreshCw, Plus, MessageSquare, X, Image, Link2, Brain, Wrench, Search, Copy, Check, Quote, Lock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUILTIN_TOOLS, getEnabledToolDefinitions, loadToolConfig, saveToolConfig, getModelCaps, type ToolConfig, type ToolDefinition, type ToolCall } from "@/lib/playground-tools";
import { getResourceById } from "@/lib/resource-registry";

// ─── Types ─────────────────────────────────────────────────

interface Model { id: string; owned_by: string; display_name?: string; tags?: string[]; }
interface ApiKey { id: number; name: string; key_value: string; enabled: number; }
interface Usage { prompt_tokens: number; completion_tokens: number; total_tokens: number; tokens_in_cache?: number; }

type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
type MessageContent = string | ContentPart[];

interface ChatMessage {
  role: "user" | "assistant" | "tool";
  content: MessageContent;
  createdAt: string;
  usage?: Usage;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  reasoningContent?: string;
  quote?: { content: string; role: string };
  name?: string;
}

interface PlaygroundParams {
  temperature: number; max_tokens: number; top_p: number;
  response_format: string; stop: string; seed: number;
  frequency_penalty: number; presence_penalty: number;
}

interface ChatSession {
  id: string; title: string; messages: ChatMessage[];
  selectedModel: string; selectedKeyId: number | null;
  systemPrompt: string; params: PlaygroundParams;
  activeMcpTools?: ToolDefinition[];  // MCP tools injected from resource hub
}

type ApiEndpoint = "openai" | "anthropic";

// ─── Helpers ───────────────────────────────────────────────

const CJK_RE = /[一-鿿㐀-䶿豈-﫿]/g;
function estimateTokens(text: string): number {
  const cjk = (text.match(CJK_RE) || []).length;
  const ascii = text.length - cjk;
  return Math.max(1, Math.ceil(cjk * 1.5 + ascii * 0.25));
}
function nowHHMM(): string { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function wordCount(text: string): number {
  const cjk = (text.match(CJK_RE) || []).length;
  const nonCjk = text.replace(CJK_RE, " ").split(/\s+/).filter(Boolean).length;
  return cjk + nonCjk;
}
function genId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const DEFAULT_PARAMS: PlaygroundParams = {
  temperature: 0.7, max_tokens: 32768, top_p: 1,
  response_format: "text", stop: "", seed: -1,
  frequency_penalty: 0, presence_penalty: 0,
};
const STORAGE_KEY = "oortapi-playground-v3";

const PRESETS_ZH = ["请你详细介绍你自己", "用 Python 写一个快速排序算法", "解释一下什么是量子计算"];
const PRESETS_EN = ["Tell me about yourself", "Write a quicksort in Python", "Explain quantum computing"];

const PARAM_PRESETS = [
  { label: { zh: "均衡", en: "Balanced" }, params: { temperature: 0.7, top_p: 1, frequency_penalty: 0, presence_penalty: 0 } },
  { label: { zh: "创意", en: "Creative" }, params: { temperature: 0.9, top_p: 0.95, frequency_penalty: 0.3, presence_penalty: 0.3 } },
  { label: { zh: "精确", en: "Precise" }, params: { temperature: 0.2, top_p: 0.8, frequency_penalty: 0.1, presence_penalty: 0.1 } },
  { label: { zh: "代码", en: "Code" }, params: { temperature: 0.1, top_p: 0.9, frequency_penalty: 0, presence_penalty: 0 } },
];

const LABELS = {
  zh: {
    title: "API 测试场", send: "发送", sending: "发送中...", stop: "停止",
    noResponse: "发送消息以查看响应", error: "错误",
    usage: "Token 用量", inputNonCached: "输入(未命中缓存)", inputCached: "输入(命中缓存)", outputTokens: "输出", totalTokensLabel: "总",
    noKeys: "暂无 API Key", noModels: "暂无可用模型",
    params: "参数设置", temperature: "温度", maxTokens: "最大 Tokens", topP: "Top P",
    systemPrompt: "系统提示词", systemPromptPH: "可选：设置系统提示词",
    refresh: "刷新", endpoint: "API 接口", openai: "OpenAI 格式", anthropic: "Anthropic 格式",
    presets: "常用语", selectModel: "选择模型", selectKey: "API Key", newSession: "新建会话",
    image: "图片", link: "链接", thinking: "思考", tools: "工具设置",
    thinkingOn: "思考中", toolCall: "调用了工具",
    contextLength: "上下文长度", responseFormat: "响应格式", stopSequences: "停止序列",
    seed: "种子值", freqPenalty: "频率惩罚", presPenalty: "存在惩罚",
    jsonObject: "JSON 对象", textFormat: "文本",
    toolSetup: "工具设置", webSearch: "联网搜索", fetchPage: "网页抓取",
    tavilyKey: "Tavily API Key",
    addLink: "添加链接", linkPlaceholder: "输入 URL...", confirm: "确认",
    reasoning: "思考过程", noCapability: "未配置能力", editCap: "编辑能力",
    capVision: "视觉", capReasoning: "推理", capTools: "工具",
    mcpCustom: "自定义 MCP 服务器", mcpAdd: "添加服务器", mcpComing: "即将支持",
  },
  en: {
    title: "API Playground", send: "Send", sending: "Sending...", stop: "Stop",
    noResponse: "Send a message to see the response", error: "Error",
    usage: "Token Usage", inputNonCached: "Input(non-cached)", inputCached: "Input(cached)", outputTokens: "Output", totalTokensLabel: "Total",
    noKeys: "No API keys found", noModels: "No models available",
    params: "Parameters", temperature: "Temperature", maxTokens: "Max Tokens", topP: "Top P",
    systemPrompt: "System Prompt", systemPromptPH: "Optional: Set a system prompt",
    refresh: "Refresh", endpoint: "API Endpoint", openai: "OpenAI Format", anthropic: "Anthropic Format",
    presets: "Presets", selectModel: "Select Model", selectKey: "API Key", newSession: "New Session",
    image: "Image", link: "Link", thinking: "Thinking", tools: "Tool Settings",
    thinkingOn: "Thinking", toolCall: "Called tool",
    contextLength: "Context Length", responseFormat: "Response Format", stopSequences: "Stop Sequences",
    seed: "Seed", freqPenalty: "Frequency Penalty", presPenalty: "Presence Penalty",
    jsonObject: "JSON Object", textFormat: "Text",
    toolSetup: "Tool Setup", webSearch: "Web Search", fetchPage: "Fetch URL",
    tavilyKey: "Tavily API Key",
    addLink: "Add Link", linkPlaceholder: "Enter URL...", confirm: "Confirm",
    reasoning: "Reasoning", noCapability: "No capabilities configured", editCap: "Edit",
    capVision: "Vision", capReasoning: "Reasoning", capTools: "Tools",
    mcpCustom: "Custom MCP Servers", mcpAdd: "Add Server", mcpComing: "Coming soon",
  },
};

const CAP_COLORS: Record<string, string> = {
  vision: "bg-sky-500/10 text-sky-500",
  reasoning: "bg-amber-500/10 text-amber-500",
  tools: "bg-emerald-500/10 text-emerald-500",
};

// ─── Component ─────────────────────────────────────────────

function PlaygroundContent() {
  const { lang, t: dict } = useI18n();
  const t = LABELS[lang];

  const [models, setModels] = useState<Model[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [streamMetrics, setStreamMetrics] = useState<{ ttfbMs: number | null; tokensPerSec: number | null }>({ ttfbMs: null, tokensPerSec: null });
  const [endpoint, setEndpoint] = useState<ApiEndpoint>("openai");
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolConfig, setToolConfig] = useState<ToolConfig>(loadToolConfig());
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [reasoningContent, setReasoningContent] = useState("");
  const [quoteMessage, setQuoteMessage] = useState<ChatMessage | null>(null);
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [showToolManager, setShowToolManager] = useState(false);
  const { toast } = useToast();

  const abortRef = useRef<AbortController | null>(null);
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const sentMsgRef = useRef("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const toolConfigRef = useRef(toolConfig);
  toolConfigRef.current = toolConfig;

  // ── Resource hub injection (cross-page params) ──
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessedParams = useRef(false);

  // ── Derive current session ──
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const chatHistory = currentSession?.messages ?? [];
  const selectedModel = currentSession?.selectedModel ?? "";
  const selectedKeyId = currentSession?.selectedKeyId ?? null;
  const systemPrompt = currentSession?.systemPrompt ?? "";
  const params = currentSession?.params ?? DEFAULT_PARAMS;
  const selectedKey = keys.find((k) => k.id === selectedKeyId) ?? keys[0] ?? null;
  const presets = lang === "zh" ? PRESETS_ZH : PRESETS_EN;
  const currentModelData = models.find((m) => m.id === selectedModel);
  const modelCaps = (() => {
    const tags = currentModelData?.tags;
    if (tags && tags.length > 0) {
      return {
        vision: tags.includes("vision"),
        reasoning: tags.includes("reasoning"),
        tools: tags.includes("fc"),
      };
    }
    return getModelCaps(selectedModel);
  })();
  const thinkingMode = modelCaps.reasoning;

  // ── Session management ──
  const createSession = useCallback(() => {
    const id = genId();
    setSessions((prev) => [...prev, { id, title: lang === "zh" ? "新会话" : "New Chat", messages: [], selectedModel: selectedModel || models[0]?.id || "", selectedKeyId: selectedKeyId ?? keys.find((k) => k.enabled === 1)?.id ?? null, systemPrompt: "", params: { ...DEFAULT_PARAMS } }]);
    setCurrentSessionId(id);
    setMessage(""); setResponse(""); setError(""); setUsage(null); setAttachedImages([]); setReasoningContent(""); 
  }, [lang, selectedModel, selectedKeyId, models, keys]);

  const switchSession = useCallback((id: string) => { setCurrentSessionId(id); setMessage(""); setResponse(""); setError(""); setUsage(null); setAttachedImages([]); setReasoningContent(""); }, []);

  const deleteSession = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions((prev) => {
      const f = prev.filter((s) => s.id !== id);
      if (f.length === 0) { const ns = { id: genId(), title: lang === "zh" ? "新会话" : "New Chat", messages: [], selectedModel: models[0]?.id || "", selectedKeyId: keys.find((k) => k.enabled === 1)?.id ?? null, systemPrompt: "", params: { ...DEFAULT_PARAMS } }; setCurrentSessionId(ns.id); return [ns]; }
      if (currentSessionId === id) setCurrentSessionId(f[0].id);
      return f;
    });
    setMessage(""); setResponse(""); setError(""); setUsage(null); setAttachedImages([]); setReasoningContent("");
  }, [currentSessionId, lang, models, keys]);

  const updateSession = useCallback((updater: (s: ChatSession) => ChatSession) => {
    setSessions((prev) => prev.map((s) => (s.id === currentSessionId ? updater(s) : s)));
  }, [currentSessionId]);

  const removeMcpTool = useCallback((toolName: string) => {
    updateSession((s) => ({
      ...s,
      activeMcpTools: (s.activeMcpTools ?? []).filter(t => t.function.name !== toolName),
    }));
    toast(lang === "zh" ? `已移除工具「${toolName}」` : `Removed tool "${toolName}"`, "info");
  }, [updateSession, lang, toast]);

  // ── Init ──
  useEffect(() => {
    if (sessions.length === 0) {
      const id = genId();
      setSessions([{ id, title: lang === "zh" ? "新会话" : "New Chat", messages: [], selectedModel: models[0]?.id || "", selectedKeyId: keys.find((k) => k.enabled === 1)?.id ?? null, systemPrompt: "", params: { ...DEFAULT_PARAMS } }]);
      setCurrentSessionId(id);
    }
  }, [lang]); // eslint-disable-line

  useEffect(() => {
    fetch("/api/v1/models").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.data) { setModels(d.data); setSessions((prev) => prev.map((s) => ({ ...s, selectedModel: s.selectedModel || d.data[0]?.id || "" }))); } }).catch(() => {});
  }, []);
  useEffect(() => {
    fetch("/api/dashboard/keys", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d?.keys) {
        const enabled = d.keys.filter((k: ApiKey) => k.enabled === 1);
        setKeys(enabled);
        if (enabled.length > 0) {
          const validIds = new Set(enabled.map((k: ApiKey) => k.id));
          setSessions((prev) => prev.map((s) => ({
            ...s,
            // Fix stale selectedKeyId: if it doesn't match any loaded key, reset to first available
            selectedKeyId: s.selectedKeyId != null && validIds.has(s.selectedKeyId) ? s.selectedKeyId : enabled[0].id,
          })));
        }
      }
    }).catch(() => {});
  }, []);

  // ── Persistence ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { const p = JSON.parse(saved); if (p.sessions?.length > 0) setSessions(p.sessions); if (p.currentSessionId) setCurrentSessionId(p.currentSessionId); }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        const json = JSON.stringify({ sessions: sessions.slice(-50), currentSessionId });
        if (json.length > 2_000_000) { const trimmed = sessions.slice(-20).map((s) => ({ ...s, messages: s.messages.slice(-30) })); localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions: trimmed, currentSessionId })); }
        else localStorage.setItem(STORAGE_KEY, json);
      } catch { /* ignore */ }
    }
  }, [sessions, currentSessionId]);

  // ── Resource Hub injection ──
  useEffect(() => {
    const source = searchParams.get("source");
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    if (source !== "hub" || !type || !id || hasProcessedParams.current) return;
    // Gate: wait for models and keys to be loaded before creating session
    if (models.length === 0 || keys.length === 0) return;
    hasProcessedParams.current = true;

    const item = getResourceById(id);
    if (!item) { router.replace("/dashboard/playground"); return; }

    const sessionId = genId();
    const newSession: ChatSession = {
      id: sessionId,
      title: lang === "zh" ? item.nameZh : item.name,
      messages: [],
      selectedModel: selectedModel || models[0]?.id || "",
      selectedKeyId: selectedKeyId ?? keys.find((k) => k.enabled === 1)?.id ?? null,
      systemPrompt: "",
      params: { ...DEFAULT_PARAMS },
    };

    if (item.type === "prompt-template" && item.promptContent) {
      newSession.systemPrompt = item.promptContent;
      toast(lang === "zh"
        ? `已加载提示词模板「${item.nameZh}」`
        : `Loaded prompt template "${item.name}"`, "success");
    } else if (item.type === "mcp" && item.requiredTools) {
      newSession.activeMcpTools = item.requiredTools;
      toast(lang === "zh"
        ? `已成功在云端挂载「${item.nameZh}」MCP 工具集`
        : `Mounted "${item.name}" MCP toolset in cloud`, "success");
    }

    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(sessionId);
    setMessage(""); setResponse(""); setError(""); setUsage(null);
    setAttachedImages([]); setReasoningContent("");
    router.replace("/dashboard/playground");
  }, [searchParams, models, keys]); // eslint-disable-line

  // ── Auto-scroll (always follow new content) ──
  const prevMsgLen = useRef(0);
  useEffect(() => {
    const el = msgContainerRef.current;
    if (!el) return;
    const len = chatHistory.length;
    const hasNew = len > 0 && len > (prevMsgLen.current || 0);
    const hasContent = !!(response && response.length > 0) || !!(reasoningContent && reasoningContent.length > 10);
    if (hasNew) {
      el.scrollTop = el.scrollHeight;
    } else if (hasContent) {
      if (!userScrolledUpRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    }
    prevMsgLen.current = len;
  }, [chatHistory, response, reasoningContent]);

  // Track user scroll direction
  useEffect(() => {
    const el = msgContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) userScrolledUpRef.current = true;
    };
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (atBottom) userScrolledUpRef.current = false;
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  // ── Build messages ──
  const buildMessages = () => {
    const msgs: Array<{ role: string; content: string | ContentPart[]; tool_call_id?: string; name?: string; tool_calls?: ToolCall[] }> = [];
    if (systemPrompt.trim() && endpoint === "openai") msgs.push({ role: "system", content: systemPrompt.trim() });
    for (const m of chatHistory) {
      if (m.role === "tool") { msgs.push({ role: "tool", content: m.content as string, tool_call_id: m.tool_call_id, name: m.name }); }
      else if (m.role === "assistant" && m.tool_calls) { msgs.push({ role: "assistant", content: m.content || "", tool_calls: m.tool_calls }); }
      else { msgs.push({ role: m.role, content: m.content }); }
    }
    if (attachedImages.length > 0) {
      const parts: ContentPart[] = [];
      if (message.trim()) parts.push({ type: "text", text: message });
      for (const img of attachedImages) parts.push({ type: "image_url", image_url: { url: img } });
      msgs.push({ role: "user", content: parts });
    } else {
      msgs.push({ role: "user", content: message });
    }
    return msgs;
  };

  // ── Build request body ──
  const buildRequestBody = (msgs: ReturnType<typeof buildMessages>, extra: Record<string, unknown> = {}) => {
    const builtinTools = modelCaps.tools ? getEnabledToolDefinitions(toolConfigRef.current) : [];
    const mcpTools = currentSession?.activeMcpTools ?? [];
    const seen = new Set<string>();
    const enabledTools = [...builtinTools, ...mcpTools].filter(t => {
      if (seen.has(t.function.name)) return false;
      seen.add(t.function.name);
      return true;
    });
    const body: Record<string, unknown> = {
      model: selectedModel, messages: msgs, stream: true,
      temperature: params.temperature, max_tokens: params.max_tokens, top_p: params.top_p,
      ...(thinkingMode && modelCaps.reasoning ? { thinking: { type: "enabled", budget_tokens: params.max_tokens } } : {}),
      ...(params.response_format === "json" ? { response_format: { type: "json_object" } } : {}),
      ...(params.stop.trim() ? { stop: params.stop.split(",").map((s) => s.trim()).filter(Boolean) } : {}),
      ...(params.seed >= 0 ? { seed: params.seed } : {}),
      ...(params.frequency_penalty > 0 ? { frequency_penalty: params.frequency_penalty } : {}),
      ...(params.presence_penalty > 0 ? { presence_penalty: params.presence_penalty } : {}),
      ...extra,
    };
    if (enabledTools.length > 0) body.tools = enabledTools;
    return body;
  };

  // ── Execute tool via server proxy ──
  const executeTool = async (tc: ToolCall): Promise<string> => {
    try {
      // Defensive parsing: models sometimes return empty/invalid arguments
      let args: Record<string, unknown> = {};
      const raw = tc.function.arguments?.trim();
      if (raw && raw !== "" && raw !== "{}") {
        try { args = JSON.parse(raw); } catch { args = {}; }
      }
      const res = await fetch("/api/playground/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: tc.function.name, args, config: { tavilyApiKey: toolConfigRef.current.tavilyApiKey } }),
      });
      const data = await res.json();
      return data.result || data.error || "Tool execution returned no result.";
    } catch { return "Error executing tool."; }
  };

  // ── Send message with tool loop ──
  const sendWithTools = async (firstBatchMsgs: ReturnType<typeof buildMessages>) => {
    let currentMsgs = firstBatchMsgs;
    let loopCount = 0;
    const MAX_TOOL_LOOPS = 5;

    while (loopCount < MAX_TOOL_LOOPS) {
      loopCount++;
      const body = buildRequestBody(currentMsgs);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const endpointUrl = endpoint === "openai" ? "/api/v1/chat/completions" : "/api/v1/messages";
        const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${selectedKey?.key_value || ""}` };
        if (endpoint === "anthropic") headers["anthropic-version"] = "2023-06-01";
        const fetchStart = performance.now();
	        const res = await fetch(endpointUrl, { method: "POST", headers, body: JSON.stringify(body), signal: controller.signal });
	        const ttfbMs = Math.round(performance.now() - fetchStart);

        if (!res.ok) { const errData = await res.json().catch(() => null); setError(errData?.error?.message || `HTTP ${res.status}`); setIsSending(false); return; }

        const streamStart = performance.now();
	        const { fullText, toolCalls, reasoning } = await readStream(res);
	        const streamDur = (performance.now() - streamStart) / 1000;
	        const tokCount = fullText ? fullText.split(/s+/).length : 0;
	        const tps = streamDur > 0 ? Math.round(tokCount / streamDur) : null;
	        setStreamMetrics({ ttfbMs, tokensPerSec: tps });
        setReasoningContent(reasoning);

        if (toolCalls.length > 0) {
          const assistantMsg: ChatMessage = { role: "assistant", content: fullText, createdAt: nowHHMM(), tool_calls: toolCalls, reasoningContent: reasoning };
          updateSession((s) => ({ ...s, messages: [...s.messages, assistantMsg] }));
          setResponse("");

          for (const tc of toolCalls) {
            const toolResult = await executeTool(tc);
            const toolMsg: ChatMessage = { role: "tool", content: toolResult, createdAt: nowHHMM(), tool_call_id: tc.id, name: tc.function.name };
            currentMsgs = [...currentMsgs, { role: "assistant" as const, content: fullText || "", tool_calls: [tc] }, { role: "tool" as const, content: toolResult, tool_call_id: tc.id, name: tc.function.name }];
            updateSession((s) => ({ ...s, messages: [...s.messages, toolMsg] }));
          }
          continue;
        }

        const msgUsage = {
          prompt_tokens: estimateTokens(JSON.stringify(currentMsgs)),
          completion_tokens: fullText ? estimateTokens(fullText) : 0,
          total_tokens: estimateTokens(JSON.stringify(currentMsgs)) + (fullText ? estimateTokens(fullText) : 0),
        };
        setUsage(msgUsage);
        if (fullText) {
          updateSession((s) => ({ ...s, title: s.messages.length <= 1 ? fullText.slice(0, 30).replace(/\n/g, " ") : s.title, messages: [...s.messages, { role: "assistant", content: fullText, createdAt: nowHHMM(), usage: msgUsage, reasoningContent: reasoning }] }));
          setMessage(""); setResponse("");
        }
        setIsSending(false); return;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") { setIsSending(false); return; }
        setError(err instanceof Error ? err.message : "Network error");
        setIsSending(false); return;
      }
    }
    setError("Tool execution reached maximum iterations.");
    setIsSending(false);
  };

  // ── Stream reader ──
  const readStream = async (res: Response): Promise<{ fullText: string; toolCalls: ToolCall[]; reasoning: string }> => {
    const reader = res.body?.getReader();
    if (!reader) return { fullText: "", toolCalls: [], reasoning: "" };
    const decoder = new TextDecoder();
    let buf = "", fullText = "", textBuf = "", reasoning = "";
    let lastRender = Date.now(), lineCount = 0;
    let toolCalls: ToolCall[] = [];
    let inThink = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop() || "";
      let streamDone = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") { streamDone = true; continue; }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;

          if (delta?.content) {
            const content = delta.content;
            const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
            if (thinkMatch) {
              reasoning += thinkMatch[1];
              const before = content.slice(0, content.indexOf("<think>"));
              const after = content.slice(content.indexOf("</think>") + 8);
              if (before) { fullText += before; textBuf += before; }
              if (after) { fullText += after; textBuf += after; }
            } else if (content.includes("<think>") && !content.includes("</think>")) {
              inThink = true; 
              const before = content.slice(0, content.indexOf("<think>"));
              if (before) { fullText += before; textBuf += before; }
              reasoning += content.slice(content.indexOf("<think>") + 7);
            } else if (inThink && content.includes("</think>")) {
              inThink = false; 
              reasoning += content.slice(0, content.indexOf("</think>"));
              const after = content.slice(content.indexOf("</think>") + 8);
              if (after) { fullText += after; textBuf += after; }
            } else if (inThink) { reasoning += content; }
            else { fullText += content; textBuf += content; }
            const now = Date.now();
            if (now - lastRender > 65) { setResponse(fullText); setReasoningContent(reasoning); lastRender = now; textBuf = ""; }
          }

          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              // Match by id first, then by function name for subsequent chunks
              // where id may be undefined
              const existing = tc.id
                ? toolCalls.find((t) => t.id === tc.id)
                : toolCalls.find((t) => t.function.name === tc.function?.name && !t.function.arguments);
              if (existing) {
                existing.function.arguments += (tc.function?.arguments || "");
              } else if (tc.function?.name) {
                toolCalls.push({ id: tc.id || `tc-${toolCalls.length}`, type: "function", function: { name: tc.function.name, arguments: tc.function?.arguments || "" } });
              }
            }
          }

          if (delta?.reasoning_content) { reasoning += delta.reasoning_content; setReasoningContent(reasoning);  }
          if (parsed.usage) setUsage(parsed.usage);
        } catch { /* skip */ }
        lineCount++;
        if (lineCount % 5 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      if (streamDone) break;
    }
    if (textBuf) { setResponse(fullText); setReasoningContent(reasoning); }
    return { fullText, toolCalls, reasoning };
  };

  // ── handleSend ──
  const handleSend = useCallback(async () => {
    if (!message.trim() || !selectedModel || !selectedKey || isSending) return;
    setIsSending(true); setError(""); setUsage(null); setResponse(""); setReasoningContent(""); 
    sentMsgRef.current = message;

    const userMsg: ChatMessage = { role: "user", content: message, createdAt: nowHHMM() };
    if (attachedImages.length > 0) {
      const parts: ContentPart[] = [{ type: "text", text: message }];
      for (const img of attachedImages) parts.push({ type: "image_url", image_url: { url: img } });
      userMsg.content = parts;
    }
    updateSession((s) => ({ ...s, messages: [...s.messages, userMsg] }));
    setMessage("");
    setAttachedImages([]);

    const firstMsgs = buildMessages();
    await sendWithTools(firstMsgs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, selectedModel, selectedKey?.key_value, isSending, chatHistory, systemPrompt, params, endpoint, attachedImages]);

  // ── Toolbar actions ──
  const handleImageSelect = () => imageInputRef.current?.click();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    // Compress large images to avoid 10MB body limit
    if (file.size > 2_000_000) {
      const img = new window.Image();
      const blobUrl = URL.createObjectURL(file);
      img.onload = () => {
        const maxDim = 1920;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        setAttachedImages((prev) => [...prev, canvas.toDataURL("image/jpeg", 0.85)]);
        URL.revokeObjectURL(blobUrl);
      };
      img.src = blobUrl;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setAttachedImages((prev) => [...prev, reader.result as string]); };
    reader.readAsDataURL(file);
  };

  // ── Link scraper ──
  // ── Other callbacks ──
  const handleStop = useCallback(() => { if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; setIsSending(false); } }, []);
  const handleRefresh = useCallback(() => {
    fetch("/api/v1/models").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.data) setModels(d.data); }).catch(() => {});
    fetch("/api/dashboard/keys", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.keys) setKeys(d.keys.filter((k: ApiKey) => k.enabled === 1)); }).catch(() => {});
  }, []);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const exportConversation = useCallback(() => {
    const title = currentSession?.title || "conversation";
    const lines = chatHistory.map((msg) => {
      const role = msg.role === "user" ? "**User**" : msg.role === "assistant" ? "**Assistant**" : "**Tool**";
      const content = typeof msg.content === "string" ? msg.content : msg.content.map((p) => ("text" in p ? p.text : "[Image]")).join("\n");
      return `## ${role}\n\n${content}\n`;
    });
    const md = `# ${title}\n\n${lines.join("---\n\n")}`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${title.replace(/[^a-zA-Z0-9一-鿿]/g, "_")}.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentSession, chatHistory]);

  const handleRegenerate = useCallback(async (assistantMsg: ChatMessage) => {
    const idx = chatHistory.indexOf(assistantMsg);
    if (idx < 1) return;
    const userMsg = chatHistory[idx - 1];
    if (userMsg.role !== "user") return;
    const text = flatContent(userMsg.content);
    if (!text.trim() || !selectedModel || !selectedKey || isSending) return;
    setIsSending(true); setError(""); setUsage(null); setResponse(""); setReasoningContent("");
    sentMsgRef.current = text;
    updateSession((s) => ({ ...s, messages: [...s.messages, { role: "user", content: text, createdAt: nowHHMM() }] }));
    const firstMsgs = buildMessages();
    const lastMsg = text;
    setMessage("");
    await sendWithTools(firstMsgs);
  }, [chatHistory, selectedModel, selectedKey?.key_value, isSending, endpoint]); // eslint-disable-line

  const handleClear = () => {
    updateSession((s) => ({ ...s, messages: [] }));
    setResponse(""); setError(""); setUsage(null); setAttachedImages([]); setReasoningContent("");
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  // ── Render message content ──
  const renderContent = (content: MessageContent) => {
    if (typeof content === "string") return <MarkdownRenderer content={content} />;
    return content.map((part, i) => {
      if (part.type === "image_url") return <img key={i} src={part.image_url.url} className="max-w-[200px] rounded-md border border-border/50 my-1" alt="" />;
      if (part.type === "text") return <div key={i} className="text-xs"><MarkdownRenderer content={part.text} /></div>;
      return null;
    });
  };

  const flatContent = (content: MessageContent): string => {
    if (typeof content === "string") return content;
    return content.map((p) => (p.type === "text" ? p.text : "[Image]")).join("\n");
  };

  const capEntries: { key: string; label: string; color: string }[] = [
    { key: "vision", label: t.capVision, color: CAP_COLORS.vision },
    { key: "reasoning", label: t.capReasoning, color: CAP_COLORS.reasoning },
    { key: "tools", label: t.capTools, color: CAP_COLORS.tools },
  ];

  // ── Render ──
  return (
    <div className="rounded-xl dark:shadow-[0_0_100px_25px_rgba(0,212,255,0.1)]">
      <div className="flex h-[calc(100vh-7rem)] w-full overflow-hidden bg-background border border-border/40 rounded-xl shadow-sm dark:border-white/[0.08]">
        {/* Column 1: Sessions */}
        <aside className="w-56 h-full border-r border-border/90 bg-muted/20 backdrop-blur-sm p-3 flex flex-col shrink-0">
          <button onClick={createSession} className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/50 mb-3"><Plus className="h-4 w-4" /><span>{t.newSession}</span></button>
          <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
            {sessions.map((s) => (
              <div key={`session-${s.id}`} onClick={() => switchSession(s.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchSession(s.id); } }} role="button" tabIndex={0} className={cn("group flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors", s.id === currentSessionId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                <MessageSquare className="h-3.5 w-3.5 shrink-0" /><span className="flex-1 truncate">{s.title}</span>
                {sessions.length > 1 && <button onClick={(e) => deleteSession(e, s.id)} aria-label={lang === "zh" ? "删除会话" : "Delete session"} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted-foreground/20"><X className="h-3 w-3" /></button>}
              </div>
            ))}
          </div>
        </aside>

        {/* Column 2: Chat */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden border-r border-border/90">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/90 bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              {selectedModel && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 backdrop-blur-sm border border-primary/20 text-[11px] font-mono text-primary"><Zap className="h-3 w-3" />{selectedModel}</span>}
              {thinkingMode && <span className="text-[11px] text-muted-foreground font-mono"><Brain className="h-3 w-3 inline mr-1" />{t.thinkingOn}</span>}
            </div>
            <div className="flex items-center gap-2">
              {chatHistory.length > 0 && (
                <button onClick={exportConversation} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={lang === "zh" ? "导出对话" : "Export conversation"}>
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:inline">{lang === "zh" ? "导出" : "Export"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div ref={msgContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 playground-scrollbar">
            {chatHistory.length === 0 && !response && !error && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bot className="h-12 w-12 mb-3 opacity-20" /><p className="text-sm">{t.noResponse}</p>
                <div className="mt-6 max-w-md"><p className="text-[11px] text-muted-foreground mb-2">{t.presets}:</p><div className="flex flex-wrap gap-1.5 justify-center">{presets.map((p, i) => (<button key={i} onClick={() => setMessage(p)} className="px-2.5 py-1.5 rounded-md text-[11px] font-mono text-muted-foreground bg-muted/50 border border-border/50 hover:text-foreground hover:border-muted-foreground/30 transition-colors">{p}</button>))}</div></div>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={`${msg.createdAt}-${i}`} className={cn("flex gap-3 group", msg.role === "assistant" ? "" : "flex-row-reverse")}>
                <div className={cn("p-1.5 rounded-lg shrink-0", msg.role === "assistant" ? "bg-primary/10" : msg.role === "tool" ? "bg-amber-500/10" : "bg-muted")}>
                  {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : msg.role === "tool" ? <Wrench className="h-4 w-4 text-amber-500" /> : <User className="h-4 w-4" />}
                </div>
                <div className="max-w-[80%]">
                  {msg.tool_calls && msg.tool_calls.length > 0 && (
                    <div className="glass-card rounded-lg px-3 py-2 mb-1 border border-amber-500/20">
                      <div className="text-[11px] font-mono text-amber-500 flex items-center gap-1.5 mb-1"><Wrench className="h-3 w-3" />{t.toolCall}: {msg.tool_calls.map((tc) => tc.function.name).join(", ")}</div>
                      {msg.tool_calls.map((tc) => (<pre key={tc.id} className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap overflow-hidden max-h-[100px]">{tc.function.arguments}</pre>))}
                    </div>
                  )}
                  {msg.reasoningContent && (
                    <div className="rounded-lg px-4 py-3 mb-2 border border-amber-500/20 bg-amber-500/[0.02]">
                      <details open>
                        <summary className="text-sm font-semibold text-amber-500 font-mono cursor-pointer hover:opacity-80 transition-opacity select-none"><Brain className="h-4 w-4 inline mr-1.5" />{t.reasoning}</summary>
                        <div className="mt-2 pt-2 border-t border-amber-500/10 text-[12px] text-muted-foreground/90 [&_p]:!text-[12px] [&_li]:!text-[12px] [&_strong]:!text-[12px] [&_em]:!text-[12px] [&_h1]:!text-sm [&_h2]:!text-sm [&_h3]:!text-xs"><MarkdownRenderer content={msg.reasoningContent} /></div>
                      </details>
                    </div>
                  )}
                  <div className={cn("glass-card rounded-lg px-4 py-2.5 text-sm leading-relaxed relative", msg.role === "assistant" ? "" : msg.role === "tool" ? "bg-amber-500/5 border-amber-500/20" : "bg-primary/10 border-0")}>
                    {msg.role === "tool" ? <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap max-h-[200px] overflow-y-auto">{msg.content as string}</pre> : <div className="text-xs">{renderContent(msg.content)}</div>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    <span className="text-[10px] text-muted-foreground/60 font-mono">{wordCount(flatContent(msg.content))} words · {msg.createdAt || nowHHMM()}</span>
                    <span className="flex-1" />
                    <button onClick={() => setQuoteMessage(msg)} className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors w-7 h-7 rounded hover:bg-muted/50 flex items-center justify-center" title={lang === "zh" ? "引用" : "Quote"} aria-label={lang === "zh" ? "引用" : "Quote"}><Quote className="h-3 w-3" /></button>
                    {msg.role === "assistant" && (
                      <button onClick={() => handleRegenerate(msg)} className="text-sm text-muted-foreground/50 hover:text-foreground transition-colors w-7 h-7 rounded hover:bg-muted/50 flex items-center justify-center" title={lang === "zh" ? "重新生成" : "Regenerate"} aria-label={lang === "zh" ? "重新生成" : "Regenerate"}>↻</button>
                    )}
                    <button onClick={() => { navigator.clipboard.writeText(flatContent(msg.content)); setCopiedIdx(i); setTimeout(() => setCopiedIdx(-1), 1500); }} className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors w-6 h-6 rounded hover:bg-muted/50 flex items-center justify-center opacity-100" title={lang === "zh" ? "复制" : "Copy"} aria-label={lang === "zh" ? "复制" : "Copy"}>{copiedIdx === i ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}</button>
                  </div>
                  {msg.role === "assistant" && msg.usage && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 px-1 text-[11px] text-muted-foreground/60 font-mono">
                      <span className="text-primary/70">{t.usage}:</span>
                      <span>{t.inputNonCached} <span className="text-foreground/80">{msg.usage.prompt_tokens - (msg.usage.tokens_in_cache || 0)}</span></span>
                      <span>{t.inputCached} <span className="text-foreground/80">{msg.usage.tokens_in_cache || 0}</span></span>
                      <span>{t.outputTokens} <span className="text-foreground/80">{msg.usage.completion_tokens}</span></span>
                      <span>{t.totalTokensLabel} <span className="text-foreground/80">{msg.usage.total_tokens}</span></span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Reasoning bubble — shows independently the moment reasoning content arrives */}
            {reasoningContent && reasoningContent.length > 5 && !chatHistory.some((m) => m.reasoningContent === reasoningContent) && (
              <div className="flex gap-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 shrink-0"><Brain className="h-4 w-4 text-amber-500" /></div>
                <div className="max-w-[80%]">
                  <div className="rounded-lg px-4 py-3 border border-amber-500/20 bg-amber-500/[0.02]">
                    <details open>
                      <summary className="text-sm font-semibold text-amber-500 font-mono cursor-pointer hover:opacity-80 transition-opacity select-none"><Brain className="h-4 w-4 inline mr-1.5" />{t.reasoning}</summary>
                      <div className="mt-2 pt-2 border-t border-amber-500/10 text-[12px] text-muted-foreground/90 [&_p]:!text-[12px] [&_li]:!text-[12px] [&_strong]:!text-[12px] [&_em]:!text-[12px] [&_h1]:!text-sm [&_h2]:!text-sm [&_h3]:!text-xs"><MarkdownRenderer content={reasoningContent} /></div>
                    </details>
                  </div>
                </div>
              </div>
            )}
            {response && (
              <div className="flex gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0"><Bot className="h-4 w-4" /></div>
                <div className="max-w-[80%]">
                  <div className="glass-card rounded-lg px-4 py-3"><div className="text-sm"><MarkdownRenderer content={response} /></div></div>
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    <span className="text-[11px] text-muted-foreground/60 font-mono">{wordCount(response)} words · {nowHHMM()}</span>
                    <span className="flex-1" />
                    <CopyButton text={response} className="text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 rounded hover:bg-muted/50" />
                  </div>
                  {usage && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 px-1 text-[11px] text-muted-foreground/60 font-mono">
                      <span className="text-primary/70">{t.usage}:</span>
                      <span>{t.inputNonCached} <span className="text-foreground/80">{usage.prompt_tokens - (usage.tokens_in_cache || 0)}</span></span>
                      <span>{t.inputCached} <span className="text-foreground/80">{usage.tokens_in_cache || 0}</span></span>
                      <span>{t.outputTokens} <span className="text-foreground/80">{usage.completion_tokens}</span></span>
                      <span>{t.totalTokensLabel} <span className="text-foreground/80">{usage.total_tokens}</span></span>
                      {streamMetrics.ttfbMs !== null && <span className="text-muted-foreground/40">| TTFB: {streamMetrics.ttfbMs}ms</span>}
                      {streamMetrics.tokensPerSec !== null && <span className="text-muted-foreground/40">{streamMetrics.tokensPerSec.toFixed(1)} tok/s</span>}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Error */}
          {error && <div className="mx-5 mb-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3"><p className="text-xs font-medium text-destructive mb-0.5">{t.error}</p><p className="text-xs text-destructive/80 font-mono">{error}</p></div>}

          {/* Attached images preview */}
          {attachedImages.length > 0 && (
            <div className="flex gap-2 px-5 py-2 border-t border-border/90 overflow-x-auto">
              {attachedImages.map((img, i) => (
                <div key={i} className="relative shrink-0">
                  <img src={img} className="h-16 w-16 object-cover rounded-md border border-border/50" alt="" />
                  <button onClick={() => setAttachedImages((prev) => prev.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center p-0.5"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-background border-t border-border/90">
            {/* Quote bar */}
            {quoteMessage && (
              <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-md bg-primary/[0.03] border-l-2 border-primary/40 border border-border/40">
                <Quote className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="flex-1 text-xs text-foreground/80 truncate font-medium">{flatContent(quoteMessage.content)}</span>
                <button onClick={() => setQuoteMessage(null)} className="p-0.5 rounded hover:bg-destructive/20 shrink-0"><X className="h-3.5 w-3.5 text-destructive/70 hover:text-destructive" /></button>
              </div>
            )}
            <div className="flex gap-2 items-start">
              {/* "+" button */}
              <div className="relative pt-1.5">
                <button onClick={() => setShowToolbar(!showToolbar)} className="w-9 h-9 rounded-md border border-border/60 bg-muted/20 hover:bg-muted flex items-center justify-center transition-colors shrink-0">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
                {showToolbar && (
                  <div className="absolute bottom-full left-0 mb-1 bg-card border border-border/50 rounded-lg shadow-xl p-1.5 space-y-0.5 z-10 min-w-[140px]">
                    <button onClick={() => { if (!modelCaps.vision) return; handleImageSelect(); setShowToolbar(false); }} className={cn("flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-xs transition-colors", modelCaps.vision ? "text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer" : "text-muted-foreground/30 cursor-not-allowed")}><Image className={cn("h-3.5 w-3.5", !modelCaps.vision && "opacity-30")} />{t.image}</button>
                  </div>
                )}
              </div>

              {/* Tool manager button */}
              <button onClick={() => setShowToolManager(true)} className="relative w-9 h-9 rounded-md border border-border/60 bg-muted/20 hover:bg-muted flex items-center justify-center transition-colors shrink-0 mt-1.5" title={dict.resourceHub.toolManager}>
                <Wrench className="h-4 w-4 text-muted-foreground" />
                {(currentSession?.activeMcpTools?.length ?? 0) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                    {currentSession!.activeMcpTools!.length}
                  </span>
                )}
              </button>


              <Textarea placeholder={lang === "zh" ? "输入消息... (Shift+Enter 换行)" : "Type a message... (Shift+Enter newline)"} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} rows={1} className="resize-none flex-1 min-h-[2.5rem] max-h-32 overflow-y-auto" disabled={isSending} />

              
                <div className="flex flex-col gap-1.5 self-center">
                  <div className="flex gap-1.5">
                    {isSending ? <button onClick={handleStop} className="w-10 h-full min-h-[2.5rem] rounded-md border border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-center shrink-0 hover:bg-destructive/20 transition-colors"><Loader2 className="h-5 w-5 animate-spin" /></button> : <button onClick={handleSend} disabled={!message.trim() || !selectedModel || !selectedKey} title={!selectedKey ? (lang === "zh" ? "请先在右侧选择 API Key" : "Please select an API Key in the right panel") : !selectedModel ? (lang === "zh" ? "请先选择模型" : "Please select a model") : !message.trim() ? (lang === "zh" ? "请输入消息" : "Type a message") : ""} className="w-10 h-full min-h-[2.5rem] rounded-md border border-primary/30 bg-primary/10 text-primary flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><Send className="h-5 w-5" /></button>}
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Column 3: Params */}
        <aside className="w-72 h-full bg-muted/20 backdrop-blur-sm p-4 space-y-4 hidden xl:block overflow-y-auto shrink-0 border-l border-border/90">
          {/* Model */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block flex items-center gap-2">{t.selectModel}<button onClick={handleRefresh} className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><RefreshCw className="h-3 w-3" /></button></label>
            <select className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-mono focus:border-primary focus:outline-none truncate" value={selectedModel} onChange={(e) => { updateSession((s) => ({ ...s, selectedModel: e.target.value })); }}>
              {models.length === 0 && <option value="">{t.noModels}</option>}
              {Object.entries(models.reduce<Record<string, Model[]>>((acc, m) => { const g = m.owned_by || "unknown"; if (!acc[g]) acc[g] = []; acc[g].push(m); return acc; }, {})).map(([group, gmodels]) => (<optgroup key={group} label={group}>{gmodels.map((m) => (<option key={m.id} value={m.id}>{m.display_name || m.id}</option>))}</optgroup>))}
            </select>
            {/* Model capability tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {capEntries.filter((e) => modelCaps[e.key as keyof typeof modelCaps]).map((e) => (
                <span key={e.key} className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono", e.color)}>{e.label}</span>
              ))}
              {!capEntries.some((e) => modelCaps[e.key as keyof typeof modelCaps]) && (
                <span className="text-[10px] text-muted-foreground/60 font-mono">{t.noCapability}</span>
              )}
            </div>
          </div>
          {/* Key */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">{t.selectKey}</label>
            <select className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-mono focus:border-primary focus:outline-none" value={selectedKeyId ?? ""} onChange={(e) => { updateSession((s) => ({ ...s, selectedKeyId: e.target.value ? Number(e.target.value) : null })); }}>
              {keys.length === 0 && <option value="">{t.noKeys}</option>}
              {keys.map((k) => (<option key={k.id} value={k.id}>{k.name} ({k.key_value.slice(0, 12)}...)</option>))}
            </select>
          </div>
          {/* Endpoint */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">{t.endpoint}</label>
            <div className="flex rounded-md border border-input overflow-hidden">
              <button onClick={() => setEndpoint("openai")} className={cn("flex-1 h-8 text-xs font-medium transition-colors", endpoint === "openai" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>{t.openai}</button>
              <button onClick={() => setEndpoint("anthropic")} className={cn("flex-1 h-8 text-xs font-medium transition-colors border-l border-input", endpoint === "anthropic" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>{t.anthropic}</button>
            </div>
          </div>
          {/* Params */}
          <div>
            <div className="flex items-center gap-1.5 mb-2"><Settings2 className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t.params}</span></div>
            {/* Parameter presets */}
            <div className="flex gap-1 mb-3">
              {PARAM_PRESETS.map((p) => {
                const label = p.label[lang as keyof typeof p.label] || p.label.en;
                const active = params.temperature === p.params.temperature && params.top_p === p.params.top_p;
                return (
                  <button key={label} onClick={() => updateSession((s) => ({ ...s, params: { ...s.params, ...p.params } }))}
                    className={`px-2 py-1 text-[10px] font-medium rounded-full border transition-colors ${active ? "bg-primary/10 border-primary/30 text-primary" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">
              <div><label className="text-[11px] text-muted-foreground block mb-1">{t.temperature}</label><div className="flex items-center gap-2"><input type="range" min="0" max="2" step="0.1" value={params.temperature} onChange={(e) => { const v = parseFloat(e.target.value); updateSession((s) => ({ ...s, params: { ...s.params, temperature: v } })); }} className="flex-1" /><span className="text-xs font-mono w-8 text-right text-foreground">{params.temperature.toFixed(1)}</span></div></div>
              <div><label className="text-[11px] text-muted-foreground block mb-1">{t.maxTokens}</label>
                <div className="space-y-1">
                  <input type="range" min={256} max={131072} step={256} value={params.max_tokens} onChange={(e) => { const v = parseInt(e.target.value); updateSession((s) => ({ ...s, params: { ...s.params, max_tokens: v } })); }} className="w-full" />
                  <div className="flex items-center gap-1"><input type="number" min={256} max={131072} step={256} value={params.max_tokens} onChange={(e) => { const v = Math.min(131072, Math.max(256, parseInt(e.target.value) || 4096)); updateSession((s) => ({ ...s, params: { ...s.params, max_tokens: v } })); }} className="w-full h-7 px-2 rounded border border-input bg-background text-xs font-mono" /></div>
                  <div className="flex gap-1">{["1K", "4K", "8K", "32K", "128K"].map((label) => { const val = label === "1K" ? 1024 : label === "4K" ? 4096 : label === "8K" ? 8192 : label === "32K" ? 32768 : 131072; return <button key={label} onClick={() => updateSession((s) => ({ ...s, params: { ...s.params, max_tokens: val } }))} className={cn("flex-1 px-1 py-1 text-[10px] font-mono rounded border transition-colors", params.max_tokens === val ? "border-primary text-primary bg-primary/10" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30")}>{label}</button>; })}</div>
                </div>
              </div>
              <div><label className="text-[11px] text-muted-foreground block mb-1">{t.topP}</label><div className="flex items-center gap-2"><input type="range" min="0" max="1" step="0.05" value={params.top_p} onChange={(e) => { const v = parseFloat(e.target.value); updateSession((s) => ({ ...s, params: { ...s.params, top_p: v } })); }} className="flex-1" /><span className="text-xs font-mono w-8 text-right text-foreground">{params.top_p.toFixed(2)}</span></div></div>
            </div>
            {/* Advanced params (collapsible) */}
            <div className="mt-3 pt-3 border-t border-border/40">
              <button onClick={() => setShowAdvancedParams(!showAdvancedParams)} className="flex items-center gap-1.5 w-full text-left">
                <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", showAdvancedParams && "rotate-180")} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{lang === "zh" ? "高级参数" : "Advanced"}</span>
              </button>
              {showAdvancedParams && (
                <div className="space-y-3 mt-3 animate-page-fade-in">
                  <div><label className="text-[11px] text-muted-foreground block mb-1">{t.responseFormat}</label><div className="flex rounded-md border border-input overflow-hidden"><button onClick={() => updateSession((s) => ({ ...s, params: { ...s.params, response_format: "text" } }))} className={cn("flex-1 h-7 text-[11px] font-medium transition-colors", params.response_format === "text" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>{t.textFormat}</button><button onClick={() => updateSession((s) => ({ ...s, params: { ...s.params, response_format: "json" } }))} className={cn("flex-1 h-7 text-[11px] font-medium transition-colors border-l border-input", params.response_format === "json" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>{t.jsonObject}</button></div></div>
                  <div><label className="text-[11px] text-muted-foreground block mb-1">{t.stopSequences}</label><input type="text" value={params.stop} onChange={(e) => updateSession((s) => ({ ...s, params: { ...s.params, stop: e.target.value } }))} placeholder="comma, separated" className="w-full h-7 px-2 rounded border border-input bg-background text-xs font-mono" /></div>
                  <div><label className="text-[11px] text-muted-foreground block mb-1">{t.seed}</label><input type="number" min={-1} max={999999} value={params.seed} onChange={(e) => { const v = parseInt(e.target.value) || -1; updateSession((s) => ({ ...s, params: { ...s.params, seed: v } })); }} className="w-full h-7 px-2 rounded border border-input bg-background text-xs font-mono" /></div>
                  <div><label className="text-[11px] text-muted-foreground block mb-1">{t.freqPenalty}</label><div className="flex items-center gap-2"><input type="range" min="0" max="2" step="0.1" value={params.frequency_penalty} onChange={(e) => { const v = parseFloat(e.target.value); updateSession((s) => ({ ...s, params: { ...s.params, frequency_penalty: v } })); }} className="flex-1" /><span className="text-xs font-mono w-8 text-right text-foreground">{params.frequency_penalty.toFixed(1)}</span></div></div>
                  <div><label className="text-[11px] text-muted-foreground block mb-1">{t.presPenalty}</label><div className="flex items-center gap-2"><input type="range" min="0" max="2" step="0.1" value={params.presence_penalty} onChange={(e) => { const v = parseFloat(e.target.value); updateSession((s) => ({ ...s, params: { ...s.params, presence_penalty: v } })); }} className="flex-1" /><span className="text-xs font-mono w-8 text-right text-foreground">{params.presence_penalty.toFixed(1)}</span></div></div>
                </div>
              )}
            </div>
          </div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">{t.systemPrompt}</label><textarea value={systemPrompt} onChange={(e) => updateSession((s) => ({ ...s, systemPrompt: e.target.value }))} placeholder={t.systemPromptPH} rows={3} className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-xs font-mono resize-none focus:border-primary focus:outline-none" /></div>
        </aside>
      </div>

      {/* Combined Tool Manager + Settings Sheet */}
      <Sheet open={showToolManager} onOpenChange={(open) => { setShowToolManager(open); if (!open) { setTimeout(() => msgContainerRef.current?.querySelector("textarea")?.focus(), 100); } }}>
        <SheetContent side="right" className="w-80 sm:max-w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              {t.tools}
            </SheetTitle>
            <SheetDescription>{dict.resourceHub.toolManagerDesc}</SheetDescription>
          </SheetHeader>
          <div className="px-4 py-3 space-y-5 overflow-y-auto flex-1">
            {/* ── Section 1: Tavily API Key ── */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t.tavilyKey}</label>
              <Input type="password" value={toolConfig.tavilyApiKey} placeholder="tvly-..."
                onChange={e => {
                  const newConfig = { ...toolConfig, tavilyApiKey: e.target.value };
                  setToolConfig(newConfig);
                  saveToolConfig(newConfig);
                }}
                className="text-sm font-mono" />
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "zh" ? "联网搜索工具需要。获取免费 Key：tavily.com" : "Required for web search. Get a free key at tavily.com"}
              </p>
            </div>

            {/* ── Section 2: Built-in MCP tool toggles ── */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">{dict.resourceHub.toolSourceBuiltin}</label>
              <div className="space-y-1.5">
                {Object.entries(BUILTIN_TOOLS).map(([name, def]) => {
                  const enabled = toolConfig.enabledTools.includes(name);
                  return (
                    <label key={name} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/40 cursor-pointer hover:bg-muted/40 transition-colors">
                      <input type="checkbox" checked={enabled}
                        onChange={() => {
                          const newEnabled = enabled
                            ? toolConfig.enabledTools.filter(n => n !== name)
                            : [...toolConfig.enabledTools, name];
                          const newConfig = { ...toolConfig, enabledTools: newEnabled };
                          setToolConfig(newConfig);
                          saveToolConfig(newConfig);
                        }}
                        className="rounded border-border" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium font-mono">{name}</p>
                        <p className="text-xs text-muted-foreground">{def.function.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ── Section 3: MCP Tools (from resource hub) ── */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">{dict.resourceHub.toolSourceMcp}</label>
              {(currentSession?.activeMcpTools?.length ?? 0) > 0 ? (
                <div className="space-y-1.5">
                  {currentSession!.activeMcpTools!.map(tool => (
                    <div key={tool.function.name} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/40">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium font-mono truncate">{tool.function.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{tool.function.description}</p>
                      </div>
                      <button onClick={() => removeMcpTool(tool.function.name)} className="p-1 rounded hover:bg-destructive/20 transition-colors shrink-0" title={dict.resourceHub.toolRemove}>
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">{dict.resourceHub.toolEmpty}</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-muted-foreground">Loading...</div>}>
      <PlaygroundContent />
    </Suspense>
  );
}

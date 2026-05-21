"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/shared/copy-button";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Play, Send, Bot, User, Loader2, Square, Zap, Settings2, ChevronDown, Trash2, Download, RefreshCw, GanttChart, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────

interface Model {
  id: string;
  owned_by: string;
  display_name?: string;
}

interface ApiKey {
  id: number;
  name: string;
  key_value: string;
  enabled: number;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface PlaygroundParams {
  temperature: number;
  max_tokens: number;
  top_p: number;
}

interface ConcurrencyResult {
  index: number;
  status: "success" | "error";
  latencyMs: number;
  responseSnippet: string;
  errorMessage?: string;
}

type ApiEndpoint = "openai" | "anthropic";

// ─── Constants ─────────────────────────────────────────────

const PRESETS_ZH = [
  "请你详细介绍你自己",
  "用 Python 写一个快速排序算法",
  "解释一下什么是量子计算",
  "写一首关于秋天的诗",
  "1+1 等于几？请一步一步思考",
  "用通俗的语言解释 HTTP、TCP、IP 三者的关系",
  "帮我写一封正式的商务邮件模板",
];

const PRESETS_EN = [
  "Tell me about yourself in detail",
  "Write a quicksort algorithm in Python",
  "Explain quantum computing in simple terms",
  "Write a poem about autumn",
  "What is 1+1? Think step by step",
  "Explain the difference between HTTP, TCP, and IP",
  "Write a formal business email template",
];

const LABELS = {
  zh: {
    title: "API 测试场",
    selectModel: "选择模型",
    selectKey: "API Key",
    send: "发送",
    sending: "发送中...",
    noResponse: "发送消息以查看响应",
    error: "错误",
    stop: "停止",
    usage: "Token 用量",
    promptTokens: "输入",
    completionTokens: "输出",
    totalTokens: "总计",
    noKeys: "暂无 API Key，请先创建",
    noModels: "暂无可用模型",
    params: "参数设置",
    temperature: "温度 (temperature)",
    maxTokens: "最大 Tokens (max_tokens)",
    topP: "Top P",
    clear: "清空对话",
    export: "导出对话",
    conversation: "对话历史",
    systemPrompt: "系统提示词",
    systemPromptPlaceholder: "可选：设置系统提示词",
    refresh: "刷新",
    endpoint: "API 接口",
    openai: "OpenAI 格式",
    anthropic: "Anthropic 格式",
    presets: "常用语",
    concurrency: "并发测试",
    concurrencyCount: "并发数",
    concurrencyGo: "开始测试",
    concurrencyRunning: "测试中...",
    concurrencyStatus: "状态",
    concurrencyLatency: "延迟",
    concurrencyResponse: "响应片段",
  },
  en: {
    title: "API Playground",
    selectModel: "Select Model",
    selectKey: "API Key",
    send: "Send",
    sending: "Sending...",
    noResponse: "Send a message to see the response",
    error: "Error",
    stop: "Stop",
    usage: "Token Usage",
    promptTokens: "Input",
    completionTokens: "Output",
    totalTokens: "Total",
    noKeys: "No API keys found. Create one first.",
    noModels: "No models available",
    params: "Parameters",
    temperature: "Temperature",
    maxTokens: "Max Tokens",
    topP: "Top P",
    clear: "Clear Conversation",
    export: "Export",
    conversation: "Conversation",
    systemPrompt: "System Prompt",
    systemPromptPlaceholder: "Optional: Set a system prompt",
    refresh: "Refresh",
    endpoint: "API Endpoint",
    openai: "OpenAI Format",
    anthropic: "Anthropic Format",
    presets: "Presets",
    concurrency: "Concurrency Test",
    concurrencyCount: "Concurrency",
    concurrencyGo: "Start",
    concurrencyRunning: "Testing...",
    concurrencyStatus: "Status",
    concurrencyLatency: "Latency",
    concurrencyResponse: "Response",
  },
};

// ─── Component ─────────────────────────────────────────────

export default function PlaygroundPage() {
  const { lang } = useI18n();
  const t = LABELS[lang];

  const [models, setModels] = useState<Model[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showParams, setShowParams] = useState(false);
  const [params, setParams] = useState<PlaygroundParams>({ temperature: 0.7, max_tokens: 4096, top_p: 1 });
  const [systemPrompt, setSystemPrompt] = useState("");
  const [endpoint, setEndpoint] = useState<ApiEndpoint>("openai");
  const [concurrencyCount, setConcurrencyCount] = useState(5);
  const [concurrencyResults, setConcurrencyResults] = useState<ConcurrencyResult[]>([]);
  const [isConcurrencyTesting, setIsConcurrencyTesting] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const STORAGE_KEY = "oortapi-playground";

  // ── LocalStorage persistence ──

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.chatHistory) setChatHistory(parsed.chatHistory);
        if (parsed.selectedModel) setSelectedModel(parsed.selectedModel);
        if (parsed.selectedKeyId) setSelectedKeyId(parsed.selectedKeyId);
        if (parsed.params) setParams(parsed.params);
        if (parsed.systemPrompt !== undefined) setSystemPrompt(parsed.systemPrompt);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const data = { chatHistory, selectedModel, selectedKeyId, params, systemPrompt };
      const json = JSON.stringify(data);
      if (json.length > 2_000_000) {
        const trimmed = { ...data, chatHistory: chatHistory.slice(-20) };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } else {
        localStorage.setItem(STORAGE_KEY, json);
      }
    } catch { /* ignore */ }
  }, [chatHistory, selectedModel, selectedKeyId, params, systemPrompt]);

  // ── Auto-scroll ──

  const prevLen = useRef(0);
  useEffect(() => {
    const len = chatHistory.length;
    if (len > 0 && len > prevLen.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    if (response && len > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLen.current = len;
  }, [chatHistory, response]);

  // ── Fetch models & keys ──

  useEffect(() => {
    fetch("/api/v1/models")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.data) {
          setModels(d.data);
          if (d.data.length > 0 && !selectedModel) setSelectedModel(d.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/dashboard/keys", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.keys) {
          const enabled = d.keys.filter((k: ApiKey) => k.enabled === 1);
          setKeys(enabled);
          if (enabled.length > 0 && selectedKeyId === null) setSelectedKeyId(enabled[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // ── Derived ──

  const selectedKey = keys.find((k) => k.id === selectedKeyId);
  const presets = lang === "zh" ? PRESETS_ZH : PRESETS_EN;

  // ── Message builder ──

  const buildMessages = () => {
    const msgs: Array<{ role: string; content: string }> = [];
    if (systemPrompt.trim() && endpoint === "openai") {
      msgs.push({ role: "system", content: systemPrompt.trim() });
    }
    for (const m of chatHistory) msgs.push(m);
    msgs.push({ role: "user", content: message });
    return msgs;
  };

  // ── Send (streaming) ──

  const handleSend = useCallback(async () => {
    if (!message.trim() || !selectedModel || !selectedKey || isSending) return;

    setIsSending(true);
    setError("");
    setUsage(null);
    setResponse("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const endpointUrl = endpoint === "openai"
        ? "/api/v1/chat/completions"
        : "/api/v1/messages";

      const body = endpoint === "openai"
        ? {
            model: selectedModel,
            messages: buildMessages(),
            stream: true,
            temperature: params.temperature,
            max_tokens: params.max_tokens,
            top_p: params.top_p,
          }
        : {
            model: selectedModel,
            messages: [{ role: "user", content: message }],
            system: systemPrompt.trim() || undefined,
            stream: true,
            max_tokens: params.max_tokens,
            temperature: params.temperature,
          };

      const res = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${selectedKey.key_value}`,
          ...(endpoint === "anthropic" ? { "anthropic-version": "2023-06-01" } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setError(errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
        setIsSending(false);
        return;
      }

      if (endpoint === "openai") {
        await handleOpenAIStream(res);
      } else {
        await handleAnthropicStream(res);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled
      } else {
        setError(err instanceof Error ? err.message : "Network error");
      }
    } finally {
      setIsSending(false);
      abortRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, selectedModel, selectedKey, isSending, chatHistory, systemPrompt, params, endpoint]);

  // ── Streaming parsers ──

  const handleOpenAIStream = async (res: Response) => {
    const reader = res.body?.getReader();
    if (!reader) { setError("No response body"); setIsSending(false); return; }

    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    let streamDone = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") { streamDone = true; continue; }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) { fullText += delta; setResponse(fullText); }
          if (parsed.usage) {
            setUsage(parsed.usage);
          }
        } catch { /* skip */ }
      }
      if (streamDone) break;
    }

    if (fullText) {
      setChatHistory(prev => [...prev, { role: "user", content: message }, { role: "assistant", content: fullText }]);
      setMessage("");
      setResponse("");
    }
  };

  const handleAnthropicStream = async (res: Response) => {
    const reader = res.body?.getReader();
    if (!reader) { setError("No response body"); setIsSending(false); return; }

    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    let streamDone = false;
    let inputTokens = 0;
    let outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("event: ")) continue;
        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              fullText += parsed.delta.text || "";
              setResponse(fullText);
            }
            if (parsed.type === "message_start" && parsed.message?.usage) {
              inputTokens = parsed.message.usage.input_tokens || 0;
              outputTokens = parsed.message.usage.output_tokens || 0;
              setUsage({ prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: inputTokens + outputTokens });
            }
            if (parsed.type === "message_delta" && parsed.usage) {
              outputTokens = parsed.usage.output_tokens || 0;
              inputTokens = parsed.usage.input_tokens || inputTokens;
              setUsage({ prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: inputTokens + outputTokens });
            }
          } catch { /* skip */ }
        }
      }
    }

    if (fullText) {
      setChatHistory(prev => [...prev, { role: "user", content: message }, { role: "assistant", content: fullText }]);
      setMessage("");
      setResponse("");
    }
  };

  // ── Concurrency test ──

  const handleConcurrencyTest = useCallback(async () => {
    if (!selectedModel || !selectedKey || isConcurrencyTesting) return;

    setIsConcurrencyTesting(true);
    setConcurrencyResults([]);

    const results: ConcurrencyResult[] = [];
    const promises = Array.from({ length: concurrencyCount }, async (_, i) => {
      const reqStart = performance.now();
      try {
        const endpointUrl = endpoint === "openai"
          ? "/api/v1/chat/completions"
          : "/api/v1/messages";

        const testMessage = message.trim() || (lang === "zh" ? "你好" : "Hello");

        const body = endpoint === "openai"
          ? { model: selectedModel, messages: [{ role: "user", content: testMessage }], stream: false, max_tokens: 100 }
          : { model: selectedModel, messages: [{ role: "user", content: testMessage }], max_tokens: 100, stream: false };

        const res = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${selectedKey.key_value}`,
            ...(endpoint === "anthropic" ? { "anthropic-version": "2023-06-01" } : {}),
          },
          body: JSON.stringify(body),
        });

        const latencyMs = Math.round(performance.now() - reqStart);

        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content || data?.content?.[0]?.text || "";
          results.push({ index: i + 1, status: "success", latencyMs, responseSnippet: content.slice(0, 80) });
        } else {
          const errData = await res.json().catch(() => null);
          results.push({ index: i + 1, status: "error", latencyMs, responseSnippet: "", errorMessage: errData?.error?.message || `HTTP ${res.status}` });
        }
      } catch (err) {
        results.push({ index: i + 1, status: "error", latencyMs: Math.round(performance.now() - reqStart), responseSnippet: "", errorMessage: err instanceof Error ? err.message : "Network error" });
      }
      setConcurrencyResults([...results]);
    });

    await Promise.allSettled(promises);
    setConcurrencyResults([...results]);
    setIsConcurrencyTesting(false);
  }, [selectedModel, selectedKey, concurrencyCount, message, endpoint, lang, isConcurrencyTesting]);

  // ── Other callbacks ──

  const handleStop = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; setIsSending(false); }
  }, []);

  const handleRefresh = useCallback(() => {
    fetch("/api/v1/models")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.data) setModels(d.data); })
      .catch(() => {});
    fetch("/api/dashboard/keys", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.keys) setKeys(d.keys.filter((k: ApiKey) => k.enabled === 1)); })
      .catch(() => {});
  }, []);

  const handleExport = useCallback(() => {
    const lines: string[] = [];
    lines.push(`# Playground Export — ${new Date().toLocaleString()}`);
    lines.push("");
    if (systemPrompt.trim()) { lines.push("## System Prompt"); lines.push(systemPrompt.trim()); lines.push(""); }
    for (const msg of chatHistory) {
      lines.push(`### ${msg.role === "user" ? "User" : "Assistant"}`);
      lines.push(msg.content);
      lines.push("");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `playground-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [chatHistory, systemPrompt]);

  const handleClear = () => {
    setChatHistory([]); setResponse(""); setError(""); setUsage(null); setConcurrencyResults([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Render ──

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Play className="h-6 w-6 text-primary" />
        {t.title}
      </h1>

      {/* Settings Card */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          {/* Model, Key, Endpoint row */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block flex items-center gap-2">
                {t.selectModel}
                <button onClick={handleRefresh} className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label={t.refresh}>
                  <RefreshCw className="h-3 w-3" />
                </button>
              </label>
              <select
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.length === 0 && <option value="">{t.noModels}</option>}
                {Object.entries(models.reduce<Record<string, Model[]>>((acc, m) => {
                  const g = m.owned_by || "unknown"; if (!acc[g]) acc[g] = []; acc[g].push(m); return acc;
                }, {})).map(([group, groupModels]) => (
                  <optgroup key={group} label={group}>
                    {groupModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.display_name || m.id}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block flex items-center gap-2">
                {t.selectKey}
                <button onClick={handleRefresh} className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label={t.refresh}>
                  <RefreshCw className="h-3 w-3" />
                </button>
              </label>
              <select
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none"
                value={selectedKeyId ?? ""}
                onChange={(e) => setSelectedKeyId(e.target.value ? Number(e.target.value) : null)}
              >
                {keys.length === 0 && <option value="">{t.noKeys}</option>}
                {keys.map((k) => (
                  <option key={k.id} value={k.id}>{k.name} ({k.key_value.slice(0, 12)}...)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">{t.endpoint}</label>
              <div className="flex rounded-md border border-input overflow-hidden">
                <button
                  onClick={() => setEndpoint("openai")}
                  className={cn("flex-1 h-9 text-sm font-medium transition-colors",
                    endpoint === "openai"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.openai}
                </button>
                <button
                  onClick={() => setEndpoint("anthropic")}
                  className={cn("flex-1 h-9 text-sm font-medium transition-colors border-l border-input",
                    endpoint === "anthropic"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.anthropic}
                </button>
              </div>
            </div>
          </div>

          {/* Parameters toggle */}
          <div>
            <button onClick={() => setShowParams(!showParams)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Settings2 className="h-3.5 w-3.5" />
              {t.params}
              <ChevronDown className={cn("h-3 w-3 transition-transform", showParams && "rotate-180")} />
            </button>
            {showParams && (
              <div className="grid md:grid-cols-3 gap-4 mt-3 p-4 rounded-lg bg-muted/20 border border-border/30 animate-slideDown">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">{t.temperature}</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="0" max="2" step="0.1" value={params.temperature}
                      onChange={e => setParams(p => ({ ...p, temperature: parseFloat(e.target.value) }))}
                      className="flex-1" />
                    <span className="text-xs font-mono w-8 text-right">{params.temperature.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">{t.maxTokens}</label>
                  <input type="number" min="1" max="131072" step="1" value={params.max_tokens}
                    onChange={e => setParams(p => ({ ...p, max_tokens: parseInt(e.target.value) || 4096 }))}
                    className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">{t.topP}</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="0" max="1" step="0.05" value={params.top_p}
                      onChange={e => setParams(p => ({ ...p, top_p: parseFloat(e.target.value) }))}
                      className="flex-1" />
                    <span className="text-xs font-mono w-8 text-right">{params.top_p.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* System Prompt */}
          <div>
            <label className="text-xs text-muted-foreground block mb-1">{t.systemPrompt}</label>
            <input value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
              placeholder={t.systemPromptPlaceholder}
              className="w-full h-8 px-3 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none" />
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {t.conversation}
            {isSending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </CardTitle>
          {chatHistory.length > 0 && (
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1 text-xs h-7">
                <Download className="h-3.5 w-3.5" />
                {t.export}
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear} className="gap-1 text-xs h-7">
                <Trash2 className="h-3.5 w-3.5" />
                {t.clear}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
            {chatHistory.length === 0 && !response && !error && (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t.noResponse}</p>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} className={cn("flex gap-3 group", msg.role === "assistant" ? "" : "flex-row-reverse")}>
                <div className={cn("p-1.5 rounded-lg shrink-0", msg.role === "assistant" ? "bg-primary/10" : "bg-muted")}>
                  {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={cn("rounded-lg px-4 py-2.5 max-w-[80%] text-sm leading-relaxed relative",
                  msg.role === "assistant" ? "bg-muted/30 border border-border/30" : "bg-primary/10"
                )}>
                  <div className="text-xs"><MarkdownRenderer content={msg.content} /></div>
                  <CopyButton text={msg.content} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground" />
                </div>
              </div>
            ))}

            {response && (
              <div className="flex gap-3 group">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg px-4 py-2.5 max-w-[80%] bg-muted/30 border border-border/30 relative">
                  <div className="text-xs"><MarkdownRenderer content={response} /></div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-xs font-medium text-destructive mb-0.5">{t.error}</p>
              <p className="text-xs text-destructive/80 font-mono">{error}</p>
            </div>
          )}

          {/* Usage */}
          {usage && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              <span className="font-medium">{t.usage}:</span>
              <span>{t.promptTokens}: <span className="font-mono text-foreground">{usage.prompt_tokens}</span></span>
              <span>{t.completionTokens}: <span className="font-mono text-foreground">{usage.completion_tokens}</span></span>
              <span>{t.totalTokens}: <span className="font-mono text-foreground">{usage.total_tokens}</span></span>
            </div>
          )}

          {/* Preset questions */}
          {chatHistory.length === 0 && !isSending && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">{t.presets}:</p>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(p)}
                    className="px-2.5 py-1.5 rounded-md text-[11px] font-mono text-muted-foreground bg-muted/50 border border-border/50 hover:text-foreground hover:border-muted-foreground/30 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder={lang === "zh" ? "输入消息... (Shift+Enter 换行, Enter 发送)" : "Type a message... (Shift+Enter newline, Enter send)"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="resize-none flex-1"
              disabled={isSending}
            />
            <div className="flex flex-col gap-1.5">
              {isSending ? (
                <Button variant="destructive" onClick={handleStop} className="gap-1 h-full">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSend}
                  disabled={!message.trim() || !selectedModel || !selectedKey}
                  className="gap-1 h-full">
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concurrency Test Card */}
      {selectedModel && selectedKey && (
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center gap-2 py-3 px-5">
            <Beaker className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-foreground">{t.concurrency}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{t.concurrencyCount}:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={concurrencyCount}
                onChange={e => setConcurrencyCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-16 h-7 px-2 rounded-md border border-input bg-background text-xs font-mono text-center"
              />
              <span className="text-[11px] text-muted-foreground">
                {lang === "zh" ? "使用当前输入框中的消息" : "Uses current input message"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleConcurrencyTest}
                disabled={isConcurrencyTesting}
                className="gap-1.5 text-xs h-7 ml-auto"
              >
                {isConcurrencyTesting ? (
                  <><Loader2 className="h-3 w-3 animate-spin" />{t.concurrencyRunning}</>
                ) : (
                  <><GanttChart className="h-3 w-3" />{t.concurrencyGo}</>
                )}
              </Button>
            </div>

            {concurrencyResults.length > 0 && (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left text-muted-foreground font-medium">#</th>
                      <th className="p-2 text-left text-muted-foreground font-medium">{t.concurrencyStatus}</th>
                      <th className="p-2 text-left text-muted-foreground font-medium">{t.concurrencyLatency}</th>
                      <th className="p-2 text-left text-muted-foreground font-medium">{t.concurrencyResponse}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {concurrencyResults.map((r) => (
                      <tr key={r.index} className={cn(r.status === "success" ? "" : "bg-destructive/5")}>
                        <td className="p-2 font-mono text-muted-foreground">{r.index}</td>
                        <td className="p-2">
                          <span className={cn("font-medium", r.status === "success" ? "text-emerald-500" : "text-red-500")}>
                            {r.status === "success" ? "✓" : "✗"}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-foreground">{r.latencyMs}ms</td>
                        <td className="p-2 text-muted-foreground truncate max-w-[200px]">
                          {r.status === "success" ? (
                            <span className="text-foreground/70">{r.responseSnippet}{r.responseSnippet.length >= 80 ? "..." : ""}</span>
                          ) : (
                            <span className="text-red-500/70">{r.errorMessage}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

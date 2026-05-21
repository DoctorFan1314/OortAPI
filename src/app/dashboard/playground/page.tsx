"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/shared/copy-button";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Play, Send, Bot, User, Loader2, Square, Zap, Settings2, Trash2, Download, RefreshCw, Plus, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────

interface Model { id: string; owned_by: string; display_name?: string; }
interface ApiKey { id: number; name: string; key_value: string; enabled: number; }
interface Usage { prompt_tokens: number; completion_tokens: number; total_tokens: number; tokens_in_cache?: number; }
interface ChatMessage { role: "user" | "assistant"; content: string; createdAt: string; usage?: Usage; }
interface PlaygroundParams { temperature: number; max_tokens: number; top_p: number; }
interface ChatSession { id: string; title: string; messages: ChatMessage[]; selectedModel: string; selectedKeyId: number | null; systemPrompt: string; params: PlaygroundParams; }
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

const DEFAULT_PARAMS: PlaygroundParams = { temperature: 0.7, max_tokens: 4096, top_p: 1 };
const STORAGE_KEY = "oortapi-playground-v2";

const PRESETS_ZH = ["请你详细介绍你自己", "用 Python 写一个快速排序算法", "解释一下什么是量子计算", "写一首关于秋天的诗", "1+1 等于几？请一步一步思考", "用通俗的语言解释 HTTP、TCP、IP 三者的关系", "帮我写一封正式的商务邮件模板"];
const PRESETS_EN = ["Tell me about yourself in detail", "Write a quicksort algorithm in Python", "Explain quantum computing in simple terms", "Write a poem about autumn", "What is 1+1? Think step by step", "Explain the difference between HTTP, TCP, and IP", "Write a formal business email template"];

const LABELS = {
  zh: { title: "API 测试场", send: "发送", sending: "发送中...", stop: "停止", noResponse: "发送消息以查看响应", error: "错误", usage: "Token 用量", inputNonCached: "输入(未命中缓存)", inputCached: "输入(命中缓存)", outputTokens: "输出", totalTokensLabel: "总", noKeys: "暂无 API Key，请先创建", noModels: "暂无可用模型", params: "参数设置", temperature: "温度 (temperature)", maxTokens: "最大 Tokens (max_tokens)", topP: "Top P", systemPrompt: "系统提示词", systemPromptPH: "可选：设置系统提示词", refresh: "刷新", endpoint: "API 接口", openai: "OpenAI 格式", anthropic: "Anthropic 格式", presets: "常用语", selectModel: "选择模型", selectKey: "API Key", newSession: "新建会话" },
  en: { title: "API Playground", send: "Send", sending: "Sending...", stop: "Stop", noResponse: "Send a message to see the response", error: "Error", usage: "Token Usage", inputNonCached: "Input(non-cached)", inputCached: "Input(cached)", outputTokens: "Output", totalTokensLabel: "Total", noKeys: "No API keys found.", noModels: "No models available", params: "Parameters", temperature: "Temperature", maxTokens: "Max Tokens", topP: "Top P", systemPrompt: "System Prompt", systemPromptPH: "Optional: Set a system prompt", refresh: "Refresh", endpoint: "API Endpoint", openai: "OpenAI Format", anthropic: "Anthropic Format", presets: "Presets", selectModel: "Select Model", selectKey: "API Key", newSession: "New Session" },
};

// ─── Component ─────────────────────────────────────────────

export default function PlaygroundPage() {
  const { lang } = useI18n();
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
  const [endpoint, setEndpoint] = useState<ApiEndpoint>("openai");

  const abortRef = useRef<AbortController | null>(null);
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const sentMsgRef = useRef("");

  // ── Derive current session ──
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const chatHistory = currentSession?.messages ?? [];
  const selectedModel = currentSession?.selectedModel ?? "";
  const selectedKeyId = currentSession?.selectedKeyId ?? null;
  const systemPrompt = currentSession?.systemPrompt ?? "";
  const params = currentSession?.params ?? DEFAULT_PARAMS;
  const selectedKey = keys.find((k) => k.id === selectedKeyId);
  const presets = lang === "zh" ? PRESETS_ZH : PRESETS_EN;
  const isAdmin = true; // placeholder, was never used in orig

  // ── Session management ──
  const createSession = useCallback(() => {
    const id = genId();
    setSessions((prev) => [...prev, { id, title: lang === "zh" ? "新会话" : "New Chat", messages: [], selectedModel: selectedModel || models[0]?.id || "", selectedKeyId: selectedKeyId ?? keys.find((k) => k.enabled === 1)?.id ?? null, systemPrompt: "", params: { ...DEFAULT_PARAMS } }]);
    setCurrentSessionId(id);
    setMessage(""); setResponse(""); setError(""); setUsage(null);
  }, [lang, selectedModel, selectedKeyId, models, keys]);

  const switchSession = useCallback((id: string) => { setCurrentSessionId(id); setMessage(""); setResponse(""); setError(""); setUsage(null); }, []);

  const deleteSession = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions((prev) => {
      const f = prev.filter((s) => s.id !== id);
      if (f.length === 0) { const ns = { id: genId(), title: lang === "zh" ? "新会话" : "New Chat", messages: [], selectedModel: models[0]?.id || "", selectedKeyId: keys.find((k) => k.enabled === 1)?.id ?? null, systemPrompt: "", params: { ...DEFAULT_PARAMS } }; setCurrentSessionId(ns.id); return [ns]; }
      if (currentSessionId === id) setCurrentSessionId(f[0].id);
      return f;
    });
    setMessage(""); setResponse(""); setError(""); setUsage(null);
  }, [currentSessionId, lang, models, keys]);

  const updateSession = useCallback((updater: (s: ChatSession) => ChatSession) => {
    setSessions((prev) => prev.map((s) => (s.id === currentSessionId ? updater(s) : s)));
  }, [currentSessionId]);

  // ── Init first session ──
  useEffect(() => {
    if (sessions.length === 0) {
      const id = genId();
      setSessions([{ id, title: lang === "zh" ? "新会话" : "New Chat", messages: [], selectedModel: models[0]?.id || "", selectedKeyId: keys.find((k) => k.enabled === 1)?.id ?? null, systemPrompt: "", params: { ...DEFAULT_PARAMS } }]);
      setCurrentSessionId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // ── Fetch ──
  useEffect(() => {
    fetch("/api/v1/models").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.data) { setModels(d.data); setSessions((prev) => prev.map((s) => ({ ...s, selectedModel: s.selectedModel || d.data[0]?.id || "" }))); } }).catch(() => {});
  }, []);
  useEffect(() => {
    fetch("/api/dashboard/keys", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d?.keys) { const enabled = d.keys.filter((k: ApiKey) => k.enabled === 1); setKeys(enabled); if (enabled.length > 0) setSessions((prev) => prev.map((s) => ({ ...s, selectedKeyId: s.selectedKeyId ?? enabled[0].id }))); }
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

  // ── Auto-scroll (container only) ──
  const scrollToBottom = useCallback(() => { msgContainerRef.current?.scrollTo({ top: msgContainerRef.current.scrollHeight, behavior: "smooth" }); }, []);

  const prevMsgLen = useRef(0);
  useEffect(() => {
    const len = chatHistory.length;
    if (len > 0 && len > prevMsgLen.current) scrollToBottom();
    if (response && len > 0) scrollToBottom();
    prevMsgLen.current = len;
  }, [chatHistory, response, scrollToBottom]);

  // ── Build messages ──
  const buildMessages = () => {
    const msgs: Array<{ role: string; content: string }> = [];
    if (systemPrompt.trim() && endpoint === "openai") msgs.push({ role: "system", content: systemPrompt.trim() });
    for (const m of chatHistory) msgs.push(m);
    msgs.push({ role: "user", content: message });
    return msgs;
  };

  // ── Streaming parsers ──
  const handleOpenAIStream = async (res: Response) => {
    const reader = res.body?.getReader();
    if (!reader) { setError("No response body"); setIsSending(false); return; }
    const decoder = new TextDecoder();
    let buf = "", fullText = "", textBuf = "";
    let lastRender = Date.now(), lineCount = 0;
    let streamUsage: Usage | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      let streamDone = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") { streamDone = true; continue; }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta; textBuf += delta;
            const now = Date.now();
            if (now - lastRender > 65) { setResponse(fullText); lastRender = now; textBuf = ""; }
          }
          if (parsed.usage) { streamUsage = parsed.usage; setUsage(parsed.usage); }
        } catch { /* skip */ }
        lineCount++;
        if (lineCount % 5 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      if (streamDone) break;
    }
    if (textBuf) setResponse(fullText);
    const msgUsage = streamUsage || { prompt_tokens: estimateTokens(sentMsgRef.current || ""), completion_tokens: fullText ? estimateTokens(fullText) : 0, total_tokens: estimateTokens(sentMsgRef.current || "") + (fullText ? estimateTokens(fullText) : 0) };
    setUsage(msgUsage);
    if (fullText) {
      updateSession((s) => ({ ...s, title: s.messages.length <= 1 ? fullText.slice(0, 30).replace(/\n/g, " ") : s.title, messages: [...s.messages, { role: "assistant", content: fullText, createdAt: nowHHMM(), usage: msgUsage }] }));
      setMessage(""); setResponse("");
    }
  };

  const handleAnthropicStream = async (res: Response) => {
    const reader = res.body?.getReader();
    if (!reader) { setError("No response body"); setIsSending(false); return; }
    const decoder = new TextDecoder();
    let buf = "", fullText = "", textBuf = "";
    let lastRender = Date.now(), inputTokens = 0, outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("event: ")) continue;
        if (trimmed.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              fullText += parsed.delta.text || ""; textBuf += parsed.delta.text || "";
              const now = Date.now();
              if (now - lastRender > 65) { setResponse(fullText); lastRender = now; textBuf = ""; }
            }
            if (parsed.type === "message_start" && parsed.message?.usage) { inputTokens = parsed.message.usage.input_tokens || 0; outputTokens = parsed.message.usage.output_tokens || 0; setUsage({ prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: inputTokens + outputTokens }); }
            if (parsed.type === "message_delta" && parsed.usage) { outputTokens = parsed.usage.output_tokens || 0; inputTokens = parsed.usage.input_tokens || inputTokens; setUsage({ prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: inputTokens + outputTokens }); }
          } catch { /* skip */ }
        }
      }
    }
    if (textBuf) setResponse(fullText);
    const msgUsage = (inputTokens > 0 || outputTokens > 0) ? { prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: inputTokens + outputTokens } : { prompt_tokens: estimateTokens(sentMsgRef.current || ""), completion_tokens: fullText ? estimateTokens(fullText) : 0, total_tokens: estimateTokens(sentMsgRef.current || "") + (fullText ? estimateTokens(fullText) : 0) };
    setUsage(msgUsage);
    if (fullText) {
      updateSession((s) => ({ ...s, title: s.messages.length <= 1 ? fullText.slice(0, 30).replace(/\n/g, " ") : s.title, messages: [...s.messages, { role: "assistant", content: fullText, createdAt: nowHHMM(), usage: msgUsage }] }));
      setMessage(""); setResponse("");
    }
  };

  // ── Send ──
  const handleSend = useCallback(async () => {
    if (!message.trim() || !selectedModel || !selectedKey || isSending) return;
    setIsSending(true); setError(""); setUsage(null); setResponse("");
    sentMsgRef.current = message;
    setMessage("");
    updateSession((s) => ({ ...s, messages: [...s.messages, { role: "user", content: sentMsgRef.current, createdAt: nowHHMM() }] }));

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const endpointUrl = endpoint === "openai" ? "/api/v1/chat/completions" : "/api/v1/messages";
      const body = endpoint === "openai" ? { model: selectedModel, messages: buildMessages(), stream: true, temperature: params.temperature, max_tokens: params.max_tokens, top_p: params.top_p } : { model: selectedModel, messages: [{ role: "user", content: sentMsgRef.current }], system: systemPrompt.trim() || undefined, stream: true, max_tokens: params.max_tokens, temperature: params.temperature };
      const res = await fetch(endpointUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${selectedKey.key_value}`, ...(endpoint === "anthropic" ? { "anthropic-version": "2023-06-01" } : {}) },
        body: JSON.stringify(body), signal: controller.signal,
      });
      if (!res.ok) { const errData = await res.json().catch(() => null); setError(errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`); setIsSending(false); return; }
      if (endpoint === "openai") await handleOpenAIStream(res);
      else await handleAnthropicStream(res);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") { /* cancelled */ }
      else setError(err instanceof Error ? err.message : "Network error");
    } finally { setIsSending(false); abortRef.current = null; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, selectedModel, selectedKey?.key_value, isSending, chatHistory, systemPrompt, params, endpoint]);

  // ── Stop / Refresh ──
  const handleStop = useCallback(() => { if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; setIsSending(false); } }, []);
  const handleRefresh = useCallback(() => {
    fetch("/api/v1/models").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.data) setModels(d.data); }).catch(() => {});
    fetch("/api/dashboard/keys", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.keys) setKeys(d.keys.filter((k: ApiKey) => k.enabled === 1)); }).catch(() => {});
  }, []);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  // ── Render ──
  return (
    <div className="rounded-xl dark:shadow-[0_0_100px_25px_rgba(0,212,255,0.1)]">
      <div className="flex h-[calc(100vh-7rem)] w-full overflow-hidden bg-background border border-border/40 rounded-xl shadow-sm dark:border-white/[0.08]">
      {/* Column 1: Session Sidebar */}
      <aside className="w-56 h-full border-r border-border/90 bg-muted/20 backdrop-blur-sm p-3 flex flex-col shrink-0">
        <button onClick={createSession} className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/50 mb-3"><Plus className="h-4 w-4" /><span>{t.newSession}</span></button>
        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
          {sessions.map((s) => (
            <div key={s.id} onClick={() => switchSession(s.id)} className={cn("group flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors", s.id === currentSessionId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate">{s.title}</span>
              {sessions.length > 1 && <button onClick={(e) => deleteSession(e, s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted-foreground/20"><X className="h-3 w-3" /></button>}
            </div>
          ))}
        </div>
      </aside>

      {/* Column 2: Chat Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden border-r border-border/90">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/90 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            {selectedModel && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 backdrop-blur-sm border border-primary/20 text-[11px] font-mono text-primary"><Zap className="h-3 w-3" />{selectedModel}</span>}
            {isSending && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
          </div>
          <div className="flex-1" />
        </div>

        {/* Messages */}
        <div ref={msgContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {chatHistory.length === 0 && !response && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-3 opacity-20" /><p className="text-sm">{t.noResponse}</p>
              <div className="mt-6 max-w-md"><p className="text-[11px] text-muted-foreground mb-2">{t.presets}:</p><div className="flex flex-wrap gap-1.5 justify-center">{presets.map((p, i) => (<button key={i} onClick={() => setMessage(p)} className="px-2.5 py-1.5 rounded-md text-[11px] font-mono text-muted-foreground bg-muted/50 border border-border/50 hover:text-foreground hover:border-muted-foreground/30 transition-colors">{p}</button>))}</div></div>
            </div>
          )}

          {chatHistory.map((msg, i) => (
            <div key={i} className={cn("flex gap-3 group", msg.role === "assistant" ? "" : "flex-row-reverse")}>
              <div className={cn("p-1.5 rounded-lg shrink-0", msg.role === "assistant" ? "bg-primary/10" : "bg-muted")}>{msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}</div>
              <div className="max-w-[80%]">
                <div className={cn("glass-card rounded-lg px-4 py-2.5 text-sm leading-relaxed relative", msg.role === "assistant" ? "" : "bg-primary/10 border-0")}>
                  <div className="text-xs"><MarkdownRenderer content={msg.content} /></div>
                  <CopyButton text={msg.content} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-muted-foreground/60 font-mono"><span>{wordCount(msg.content)} words</span><span>·</span><span>{msg.createdAt || nowHHMM()}</span></div>
                {msg.role === "assistant" && msg.usage && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 px-1 text-[10px] text-muted-foreground/60 font-mono">
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

          {response && (
            <div className="flex gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10 shrink-0"><Bot className="h-4 w-4" /></div>
              <div className="max-w-[80%]">
                <div className="glass-card rounded-lg px-4 py-2.5 relative"><div className="text-xs"><MarkdownRenderer content={response} /></div></div>
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-muted-foreground/60 font-mono"><span>{wordCount(response)} words</span><span>·</span><span>{nowHHMM()}</span></div>
                {usage && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 px-1 text-[10px] text-muted-foreground/60 font-mono">
                    <span className="text-primary/70">{t.usage}:</span>
                    <span>{t.inputNonCached} <span className="text-foreground/80">{usage.prompt_tokens - (usage.tokens_in_cache || 0)}</span></span>
                    <span>{t.inputCached} <span className="text-foreground/80">{usage.tokens_in_cache || 0}</span></span>
                    <span>{t.outputTokens} <span className="text-foreground/80">{usage.completion_tokens}</span></span>
                    <span>{t.totalTokensLabel} <span className="text-foreground/80">{usage.total_tokens}</span></span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={msgEndRef} />
        </div>

        {/* Error */}
        {error && <div className="mx-5 mb-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3"><p className="text-xs font-medium text-destructive mb-0.5">{t.error}</p><p className="text-xs text-destructive/80 font-mono">{error}</p></div>}


        {/* Input */}
        <div className="p-4 bg-background border-t border-border/90">
          <div className="flex gap-2">
            <Textarea placeholder={lang === "zh" ? "输入消息... (Shift+Enter 换行, Enter 发送)" : "Type a message... (Shift+Enter newline, Enter send)"} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} rows={2} className="resize-none flex-1" disabled={isSending} />
            <div className="flex flex-col gap-1.5">
              {isSending ? <Button variant="destructive" onClick={handleStop} className="gap-1 h-full"><Square className="h-4 w-4" /></Button> : <Button onClick={handleSend} disabled={!message.trim() || !selectedModel || !selectedKey} className="gap-1 h-full"><Send className="h-4 w-4" /></Button>}
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Parameters Panel */}
      <aside className="w-72 h-full bg-muted/20 backdrop-blur-sm p-4 space-y-5 hidden xl:block overflow-y-auto shrink-0 border-l border-border/90">
        {/* Model */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block flex items-center gap-2">{t.selectModel}<button onClick={handleRefresh} className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><RefreshCw className="h-3 w-3" /></button></label>
          <select className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-mono focus:border-primary focus:outline-none" value={selectedModel} onChange={(e) => { updateSession((s) => ({ ...s, selectedModel: e.target.value })); }}>
            {models.length === 0 && <option value="">{t.noModels}</option>}
            {Object.entries(models.reduce<Record<string, Model[]>>((acc, m) => { const g = m.owned_by || "unknown"; if (!acc[g]) acc[g] = []; acc[g].push(m); return acc; }, {})).map(([group, gmodels]) => (<optgroup key={group} label={group}>{gmodels.map((m) => (<option key={m.id} value={m.id}>{m.display_name || m.id}</option>))}</optgroup>))}
          </select>
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
          <div className="space-y-4">
            <div><label className="text-[11px] text-muted-foreground block mb-1">{t.temperature}</label><div className="flex items-center gap-2"><input type="range" min="0" max="2" step="0.1" value={params.temperature} onChange={(e) => { const v = parseFloat(e.target.value); updateSession((s) => ({ ...s, params: { ...s.params, temperature: v } })); }} className="flex-1" /><span className="text-xs font-mono w-8 text-right text-foreground">{params.temperature.toFixed(1)}</span></div></div>
            <div><label className="text-[11px] text-muted-foreground block mb-1">{t.maxTokens}</label><input type="number" min="1" max="131072" step="1" value={params.max_tokens} onChange={(e) => { const v = parseInt(e.target.value) || 4096; updateSession((s) => ({ ...s, params: { ...s.params, max_tokens: v } })); }} className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs font-mono" /></div>
            <div><label className="text-[11px] text-muted-foreground block mb-1">{t.topP}</label><div className="flex items-center gap-2"><input type="range" min="0" max="1" step="0.05" value={params.top_p} onChange={(e) => { const v = parseFloat(e.target.value); updateSession((s) => ({ ...s, params: { ...s.params, top_p: v } })); }} className="flex-1" /><span className="text-xs font-mono w-8 text-right text-foreground">{params.top_p.toFixed(2)}</span></div></div>
          </div>
        </div>
        {/* System Prompt */}
        <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">{t.systemPrompt}</label><textarea value={systemPrompt} onChange={(e) => updateSession((s) => ({ ...s, systemPrompt: e.target.value }))} placeholder={t.systemPromptPH} rows={3} className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-xs font-mono resize-none focus:border-primary focus:outline-none" /></div>
      </aside>
    </div>
    </div>
  );
}

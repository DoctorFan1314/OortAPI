"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Zap, Trash2, Download, Brain, Wrench, Lock, Cloud, X, SlidersHorizontal } from "lucide-react";
import { SessionSidebar } from "@/components/playground/session-sidebar";
import { ParamsPanel } from "@/components/playground/params-panel";
import { BUILTIN_TOOLS, getEnabledToolDefinitions, loadToolConfig, saveToolConfig, getModelCaps, type ToolConfig, type ToolDefinition, type ToolCall } from "@/lib/playground-tools";
import { getResourceById } from "@/lib/resource-registry";

import {
  type Model, type ApiKey, type Usage, type ContentPart, type MessageContent,
  type ChatMessage, type PlaygroundParams, type ChatSession, type ApiEndpoint,
  estimateTokens, nowHHMM, genId, flatContent,
  DEFAULT_PARAMS, STORAGE_KEY, PRESETS_ZH, PRESETS_EN, PARAM_PRESETS, CAP_COLORS,
} from "./chat-engine";
import { MessageList } from "./message-list";
import { InputArea } from "./input-area";

// ─── Component ─────────────────────────────────────────────

function PlaygroundContent() {
  const { lang, t: dict } = useI18n();
  const L = dict.dashboard;

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
  const [showParamsMobile, setShowParamsMobile] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { toast } = useToast();

  const abortRef = useRef<AbortController | null>(null);
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const sentMsgRef = useRef("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
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
    setSessions((prev) => [...prev, { id, title: L.newChat, messages: [], selectedModel: selectedModel || models[0]?.id || "", selectedKeyId: selectedKeyId ?? keys.find((k) => k.enabled === 1)?.id ?? null, systemPrompt: "", params: { ...DEFAULT_PARAMS } }]);
    setCurrentSessionId(id);
    setMessage(""); setResponse(""); setError(""); setUsage(null); setAttachedImages([]); setReasoningContent("");
  }, [lang, selectedModel, selectedKeyId, models, keys]);

  const switchSession = useCallback((id: string) => { setCurrentSessionId(id); setMessage(""); setResponse(""); setError(""); setUsage(null); setAttachedImages([]); setReasoningContent(""); }, []);

  const deleteSession = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions((prev) => {
      const f = prev.filter((s) => s.id !== id);
      if (f.length === 0) { const ns = { id: genId(), title: L.newChat, messages: [], selectedModel: models[0]?.id || "", selectedKeyId: keys.find((k) => k.enabled === 1)?.id ?? null, systemPrompt: "", params: { ...DEFAULT_PARAMS } }; setCurrentSessionId(ns.id); return [ns]; }
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
      setSessions([{ id, title: L.newChat, messages: [], selectedModel: models[0]?.id || "", selectedKeyId: keys.find((k) => k.enabled === 1)?.id ?? null, systemPrompt: "", params: { ...DEFAULT_PARAMS } }]);
      setCurrentSessionId(id);
    }
  }, [lang]); // eslint-disable-line

  useEffect(() => {
    fetch("/api/v1/models")
      .then((r) => { if (!r.ok) throw new Error(`Models: HTTP ${r.status}`); return r.json(); })
      .then((d) => { if (d?.data) { setModels(d.data); setSessions((prev) => prev.map((s) => ({ ...s, selectedModel: s.selectedModel || d.data[0]?.id || "" }))); } })
      .catch(() => {});
  }, []);
  useEffect(() => {
    fetch("/api/dashboard/keys", { credentials: "include" })
      .then((r) => { if (!r.ok) throw new Error(`Keys: HTTP ${r.status}`); return r.json(); })
      .then((d) => {
        if (d?.keys) {
          const enabled = d.keys.filter((k: ApiKey) => k.enabled === 1);
          setKeys(enabled);
          if (enabled.length > 0) {
            const validIds = new Set(enabled.map((k: ApiKey) => k.id));
            setSessions((prev) => prev.map((s) => ({
              ...s,
              selectedKeyId: s.selectedKeyId != null && validIds.has(s.selectedKeyId) ? s.selectedKeyId : enabled[0].id,
            })));
          }
        }
      })
      .catch(() => {});
  }, []);

  // ── Persistence ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { const p = JSON.parse(saved); if (p.sessions?.length > 0) setSessions(p.sessions); if (p.currentSessionId) setCurrentSessionId(p.currentSessionId); }
    } catch { /* ignore */ }
  }, []);

  // Debounced localStorage write (prevents rapid writes during streaming)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (sessions.length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        const json = JSON.stringify({ sessions: sessions.slice(-50), currentSessionId });
        if (json.length > 2_000_000) {
          const trimmed = sessions.slice(-20).map((s) => ({ ...s, messages: s.messages.slice(-30) }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions: trimmed, currentSessionId }));
        } else {
          localStorage.setItem(STORAGE_KEY, json);
        }
      } catch { /* ignore */ }
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [sessions, currentSessionId]);

  // ── Keyboard shortcut: / or Escape to focus message input ──
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
      if (e.key === "/" || e.key === "Escape") {
        e.preventDefault();
        messageInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

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
    const end = msgEndRef.current;
    if (!el) return;
    const len = chatHistory.length;
    const hasNew = len > 0 && len > (prevMsgLen.current || 0);
    const hasContent = !!(response && response.length > 0) || !!(reasoningContent && reasoningContent.length > 10);
    if (hasNew || hasContent) {
      if (!userScrolledUpRef.current) {
        // Use scrollIntoView for more reliable bottom-scrolling
        end?.scrollIntoView({ behavior: hasNew ? "auto" : "smooth", block: "end" });
      }
    }
    prevMsgLen.current = len;
  }, [chatHistory, response, reasoningContent]);

  // Track user scroll direction (mouse wheel + touch gestures)
  useEffect(() => {
    const el = msgContainerRef.current;
    if (!el) return;
    let lastTouchY = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) userScrolledUpRef.current = true;
    };
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0]?.clientY ?? 0;
      if (currentY > lastTouchY + 5) userScrolledUpRef.current = true; // Swiping down = scrolling up
    };
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (atBottom) userScrolledUpRef.current = false;
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
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
    // Only include tools if model supports tool calling
    const builtinTools = modelCaps.tools ? getEnabledToolDefinitions(toolConfigRef.current) : [];
    const mcpTools = modelCaps.tools ? (currentSession?.activeMcpTools ?? []) : [];
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
    const MAX_TOOL_LOOPS = 3; // Reduced from 5 to fail faster
  let consecutiveEmptyToolCalls = 0;
  let lastToolResult: string | null = null;

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

        if (!res.ok) {
          // If we have a successful tool result, show it as the response instead of error
          if (lastToolResult) {
            const resultMsg: ChatMessage = { role: "assistant", content: `${L.searchFallback}\n\n${lastToolResult}`, createdAt: nowHHMM() };
            updateSession((s) => ({ ...s, messages: [...s.messages, resultMsg] }));
            setResponse(`${L.searchFallback}\n\n${lastToolResult}`);
            setError(""); setIsSending(false);
            return;
          }
          const errData = await res.json().catch(() => null); setError(errData?.error?.message || `HTTP ${res.status}`); setIsSending(false); return;
        }

        const streamStart = performance.now();
	        const { fullText, toolCalls, reasoning } = await readStream(res);
	        const streamDur = (performance.now() - streamStart) / 1000;
	        const tokCount = fullText ? fullText.split(/\s+/).length : 0;
	        const tps = streamDur > 0 ? Math.round(tokCount / streamDur) : null;
	        setStreamMetrics({ ttfbMs, tokensPerSec: tps });
        setReasoningContent(reasoning);

        if (toolCalls.length > 0) {
          const assistantMsg: ChatMessage = { role: "assistant", content: fullText, createdAt: nowHHMM(), tool_calls: toolCalls, reasoningContent: reasoning };
          updateSession((s) => ({ ...s, messages: [...s.messages, assistantMsg] }));
          setResponse("");

          // Track consecutive duplicate tool calls to prevent infinite loops
          const recentToolNames = currentMsgs.filter(m => m.role === "tool").slice(-3).map(m => m.name);

          for (const tc of toolCalls) {
            // Skip if this tool was called in the last 2 iterations (prevent loops)
            const recentCount = recentToolNames.filter(n => n === tc.function.name).length;
            if (recentCount >= 2) {
              const skipMsg: ChatMessage = { role: "tool", content: `Tool "${tc.function.name}" was called ${recentCount} times recently. Skipping to prevent loop. Please provide your answer based on the information already gathered.`, createdAt: nowHHMM(), tool_call_id: tc.id, name: tc.function.name };
              currentMsgs = [...currentMsgs, { role: "assistant" as const, content: fullText || "", tool_calls: [tc] }, { role: "tool" as const, content: skipMsg.content, tool_call_id: tc.id, name: tc.function.name }];
              updateSession((s) => ({ ...s, messages: [...s.messages, skipMsg] }));
              continue;
            }

            // Fallback: if model returned empty arguments for search tools only
            if (!tc.function.arguments || tc.function.arguments.trim() === "" || tc.function.arguments === "{}") {
              const userMsg = currentMsgs.findLast((m) => m.role === "user");
              const userText = typeof userMsg?.content === "string" ? userMsg.content : "";
              const searchTools = ["web_search", "google_search", "bing_search"];
              if (userText && searchTools.includes(tc.function.name)) {
                const today = new Date().toISOString().split("T")[0];
                const hasTimeHint = /今天|今日|today|latest|最新|recent/i.test(userText);
                tc.function.arguments = JSON.stringify({ query: hasTimeHint ? `${userText} ${today}` : userText, count: 5 });
              } else if (userText && tc.function.name === "fetch_url") {
                const urlMatch = userText.match(/https?:\/\/[^\s]+/);
                tc.function.arguments = JSON.stringify({ url: urlMatch ? urlMatch[0] : userText });
              }
              // sequential_thinking and other tools: leave arguments as-is (server handles empty)
            }
            const toolResult = await executeTool(tc);
            if (!toolResult.startsWith("Error:") && !toolResult.startsWith("Unknown tool") && toolResult !== "Error executing tool.") {
              lastToolResult = toolResult; // Save for fallback if LLM fails
            }
            recentToolNames.push(tc.function.name);
            // Detect consecutive failed/empty tool calls to break loops
            const isFailedCall = toolResult.startsWith("Error:") || toolResult === "Error executing tool." || toolResult.startsWith("Unknown tool");
            if (isFailedCall) {
              consecutiveEmptyToolCalls++;
              if (consecutiveEmptyToolCalls >= 2) {
                const warnMsg = { role: "tool" as const, content: L.toolCallsFailing, createdAt: nowHHMM(), tool_call_id: tc.id, name: tc.function.name };
                currentMsgs = [...currentMsgs, { role: "assistant" as const, content: fullText || "", tool_calls: [tc] }, warnMsg];
                updateSession((s) => ({ ...s, messages: [...s.messages, warnMsg] }));
                break;
              }
            } else { consecutiveEmptyToolCalls = 0; }
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
    setError(L.maxIterations);
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

  // ── Other callbacks ──
  const handleStop = useCallback(() => { if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; setIsSending(false); } }, []);
  const handleRefresh = useCallback(() => {
    fetch("/api/v1/models").then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.data) setModels(d.data); }).catch(() => {});
    fetch("/api/dashboard/keys", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.keys) setKeys(d.keys.filter((k: ApiKey) => k.enabled === 1)); }).catch(() => {});
  }, []);

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
    setMessage("");
    await sendWithTools(firstMsgs);
  }, [chatHistory, selectedModel, selectedKey?.key_value, isSending, endpoint]); // eslint-disable-line

  const handleClear = () => {
    updateSession((s) => ({ ...s, messages: [] }));
    setResponse(""); setError(""); setUsage(null); setAttachedImages([]); setReasoningContent("");
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const capEntries: { key: string; label: string; color: string }[] = [
    { key: "vision", label: L.capVision, color: CAP_COLORS.vision },
    { key: "reasoning", label: L.capReasoning, color: CAP_COLORS.reasoning },
    { key: "tools", label: L.capTools, color: CAP_COLORS.tools },
  ];

  // ── Render ──
  return (
    <div className="rounded-xl dark:shadow-[0_0_100px_25px_rgba(0,212,255,0.1)]">
      <div className="flex h-[calc(100dvh-7rem)] w-full overflow-hidden bg-background border border-border/40 rounded-xl shadow-sm dark:border-white/[0.08]">
        {/* Column 1: Sessions */}
        <SessionSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onCreateSession={createSession}
          onSwitchSession={switchSession}
          onDeleteSession={deleteSession}
          newSessionLabel={L.newSession}
          deleteSessionLabel={lang === "zh" ? "删除会话" : "Delete session"}
        />

        {/* Column 2: Chat */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden border-r border-border/90">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/90 bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              {selectedModel && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 backdrop-blur-sm border border-primary/20 text-[11px] font-mono text-primary"><Zap className="h-3 w-3" />{selectedModel}</span>}
              {thinkingMode && <span className="text-[11px] text-muted-foreground font-mono"><Brain className="h-3 w-3 inline mr-1" />{L.thinkingOn}</span>}
            </div>
            <div className="flex items-center gap-2">
              {chatHistory.length > 0 && (
                <>
                  <button onClick={exportConversation} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={lang === "zh" ? "导出对话" : "Export conversation"}>
                    <Download className="h-3 w-3" />
                    <span className="hidden sm:inline">{lang === "zh" ? "导出" : "Export"}</span>
                  </button>
                  <button onClick={() => setShowClearConfirm(true)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors" title={lang === "zh" ? "清空对话" : "Clear conversation"}>
                    <Trash2 className="h-3 w-3" />
                    <span className="hidden sm:inline">{lang === "zh" ? "清空" : "Clear"}</span>
                  </button>
                  <button onClick={() => setShowParamsMobile(true)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors lg:hidden" title={lang === "zh" ? "参数设置" : "Parameters"}>
                    <SlidersHorizontal className="h-3 w-3" />
                    <span className="hidden sm:inline">{lang === "zh" ? "参数" : "Params"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <MessageList
            messages={chatHistory}
            isStreaming={isSending}
            response={response}
            reasoningContent={reasoningContent}
            error={error}
            usage={usage}
            streamMetrics={streamMetrics}
            copiedIdx={copiedIdx}
            lang={lang}
            t={L}
            presets={presets}
            onSetMessage={setMessage}
            onQuote={setQuoteMessage}
            onRegenerate={handleRegenerate}
            onCopy={(text, idx) => { navigator.clipboard.writeText(text); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(-1), 1500); }}
            containerRef={msgContainerRef}
            endRef={msgEndRef}
          />

          {/* Error */}
          {error && <div className="mx-5 mb-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3"><p className="text-xs font-medium text-destructive mb-0.5">{L.error}</p><p className="text-xs text-destructive/80 font-mono">{error}</p></div>}

          {/* Input */}
          <InputArea
            message={message}
            isStreaming={isSending}
            hasModel={!!selectedModel}
            hasKey={!!selectedKey}
            visionCapable={modelCaps.vision}
            showToolbar={showToolbar}
            quoteMessage={quoteMessage}
            attachedImages={attachedImages}
            mcpToolCount={currentSession?.activeMcpTools?.length ?? 0}
            lang={lang}
            t={L}
            toolManagerLabel={dict.resourceHub.toolManager}
            onSetMessage={setMessage}
            onSend={handleSend}
            onStop={handleStop}
            onToggleToolbar={() => setShowToolbar(!showToolbar)}
            onImageSelect={handleImageSelect}
            onRemoveImage={(idx) => setAttachedImages((prev) => prev.filter((_, j) => j !== idx))}
            onClearQuote={() => setQuoteMessage(null)}
            onOpenToolManager={() => setShowToolManager(true)}
            textareaRef={messageInputRef}
          />
        </div>

        {/* Column 3: Params */}
        <aside className="w-72 h-full bg-muted/20 backdrop-blur-sm p-4 hidden lg:block overflow-y-auto shrink-0 border-l border-border/90">
          <ParamsPanel
            models={models}
            keys={keys}
            selectedModel={selectedModel}
            selectedKeyId={selectedKeyId}
            endpoint={endpoint}
            params={params}
            systemPrompt={systemPrompt}
            showAdvancedParams={showAdvancedParams}
            modelCaps={modelCaps}
            lang={lang}
            t={L}
            paramPresets={PARAM_PRESETS}
            capEntries={capEntries}
            onRefresh={handleRefresh}
            onSelectModel={(id) => updateSession((s) => ({ ...s, selectedModel: id }))}
            onSelectKey={(id) => updateSession((s) => ({ ...s, selectedKeyId: id }))}
            onSetEndpoint={setEndpoint}
            onUpdateParams={(updater) => updateSession((s) => ({ ...s, params: updater(s.params) }))}
            onUpdateSystemPrompt={(value) => updateSession((s) => ({ ...s, systemPrompt: value }))}
            onToggleAdvanced={() => setShowAdvancedParams(!showAdvancedParams)}
          />
        </aside>
      </div>

      {/* Combined Tool Manager + Settings Sheet */}
      <Sheet open={showToolManager} onOpenChange={(open) => { setShowToolManager(open); if (!open) { setTimeout(() => msgContainerRef.current?.querySelector("textarea")?.focus(), 100); } }}>
        <SheetContent side="right" className="w-96 sm:max-w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              {L.tools}
            </SheetTitle>
            <SheetDescription>{dict.resourceHub.toolManagerDesc}</SheetDescription>
          </SheetHeader>
          <div className="px-4 py-3 space-y-6 overflow-y-auto flex-1">
            {/* ── Model capability warning ── */}
            {currentModelData && !currentModelData.tags?.includes("fc") && !currentModelData.tags?.length && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{dict.resourceHub.toolModelUnknown}</span>
              </div>
            )}

            {/* ── Section 1: Tavily API Key ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">{L.tavilyKey}</label>
              <Input type="password" value={toolConfig.tavilyApiKey} placeholder="tvly-..."
                onChange={e => {
                  const newConfig = { ...toolConfig, tavilyApiKey: e.target.value };
                  setToolConfig(newConfig);
                  saveToolConfig(newConfig);
                }}
                className="text-sm font-mono rounded-xl" />
              <p className="text-xs text-muted-foreground">
                {lang === "zh" ? "联网搜索工具需要。获取免费 Key：tavily.com" : "Required for web search. Get a free key at tavily.com"}
              </p>
            </div>

            {/* ── Section 2: Built-in tool toggles ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">{dict.resourceHub.toolSourceBuiltin}</label>
              <div className="space-y-2">
                {Object.entries(BUILTIN_TOOLS).map(([name, def]) => {
                  const enabled = toolConfig.enabledTools.includes(name);
                  const toolsDisabled = !modelCaps.tools;
                  return (
                    <div key={name} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${enabled ? "bg-primary/5 border-primary/20 hover:shadow-md hover:border-primary/40" : "bg-muted/20 border-border/50 hover:bg-muted/30 hover:shadow-md hover:border-primary/30"}`}>
                      <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold font-mono">{name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{def.function.description}</p>
                      </div>
                      <Switch
                        checked={enabled}
                        disabled={toolsDisabled}
                        onCheckedChange={(checked) => {
                          const newEnabled = checked
                            ? [...toolConfig.enabledTools, name]
                            : toolConfig.enabledTools.filter(n => n !== name);
                          const newConfig = { ...toolConfig, enabledTools: newEnabled };
                          setToolConfig(newConfig);
                          saveToolConfig(newConfig);
                        }}
                        title={toolsDisabled ? dict.resourceHub.toolModelNoSupport : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Section 3: MCP Tools (from resource hub) ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">{dict.resourceHub.toolSourceMcp}</label>
              {(currentSession?.activeMcpTools?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  {currentSession!.activeMcpTools!.map(tool => (
                    <div key={tool.function.name} className="flex items-center gap-3 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:shadow-md hover:border-purple-500/40 transition-all">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Cloud className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold font-mono truncate">{tool.function.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{tool.function.description}</p>
                      </div>
                      <button onClick={() => removeMcpTool(tool.function.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors shrink-0" title={dict.resourceHub.toolRemove}>
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-3">
                    <Cloud className="h-7 w-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{dict.resourceHub.toolNoMcpTitle}</p>
                  <p className="text-xs text-muted-foreground/70 max-w-[200px]">{dict.resourceHub.toolNoMcpDesc}</p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Params Panel */}
      <Sheet open={showParamsMobile} onOpenChange={setShowParamsMobile}>
        <SheetContent side="right" className="w-80 sm:max-w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {lang === "zh" ? "参数设置" : "Parameters"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto flex-1">
            <ParamsPanel
              models={models}
              keys={keys}
              selectedModel={selectedModel}
              selectedKeyId={selectedKeyId}
              endpoint={endpoint}
              params={params}
              systemPrompt={systemPrompt}
              showAdvancedParams={showAdvancedParams}
              modelCaps={modelCaps}
              lang={lang}
              t={L}
              paramPresets={PARAM_PRESETS}
              capEntries={capEntries}
              onRefresh={handleRefresh}
              onSelectModel={(id) => updateSession((s) => ({ ...s, selectedModel: id }))}
              onSelectKey={(id) => updateSession((s) => ({ ...s, selectedKeyId: id }))}
              onSetEndpoint={setEndpoint}
              onUpdateParams={(updater) => updateSession((s) => ({ ...s, params: updater(s.params) }))}
              onUpdateSystemPrompt={(value) => updateSession((s) => ({ ...s, systemPrompt: value }))}
              onToggleAdvanced={() => setShowAdvancedParams(v => !v)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Clear conversation confirm */}
      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title={lang === "zh" ? "清空对话" : "Clear Conversation"}
        message={lang === "zh" ? "确定要清空当前会话的所有消息吗？此操作不可撤销。" : "Clear all messages in this session? This cannot be undone."}
        onConfirm={handleClear}
        confirmLabel={lang === "zh" ? "确认清空" : "Clear"}
        variant="danger"
      />

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

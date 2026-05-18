"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/shared/copy-button";
import { Play, Send, Bot, User, Loader2, Square, Zap, Settings2, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

const LABELS = {
  zh: {
    title: "API 测试场",
    selectModel: "选择模型",
    selectKey: "API Key",
    message: "消息",
    send: "发送",
    sending: "发送中...",
    response: "响应",
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
    copy: "复制",
    conversation: "对话历史",
    systemPrompt: "系统提示词",
    systemPromptPlaceholder: "可选：设置系统提示词（system message）",
  },
  en: {
    title: "API Playground",
    selectModel: "Select Model",
    selectKey: "API Key",
    message: "Message",
    send: "Send",
    sending: "Sending...",
    response: "Response",
    noResponse: "Send a message to see the response",
    error: "Error",
    stop: "Stop",
    usage: "Token Usage",
    promptTokens: "Prompt",
    completionTokens: "Completion",
    totalTokens: "Total",
    noKeys: "No API keys found. Create one first.",
    noModels: "No models available",
    params: "Parameters",
    temperature: "Temperature",
    maxTokens: "Max Tokens",
    topP: "Top P",
    clear: "Clear Conversation",
    copy: "Copy",
    conversation: "Conversation",
    systemPrompt: "System Prompt",
    systemPromptPlaceholder: "Optional: Set a system prompt",
  },
};

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
  const [params, setParams] = useState<PlaygroundParams>({
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 1,
  });
  const [systemPrompt, setSystemPrompt] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const STORAGE_KEY = "oortapi-playground";

  // Restore playground state from localStorage on mount
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

  // Persist playground state to localStorage on changes (max ~2MB)
  useEffect(() => {
    try {
      const data = { chatHistory, selectedModel, selectedKeyId, params, systemPrompt };
      const json = JSON.stringify(data);
      if (json.length > 2_000_000) {
        // Trim older half of chat history if too large
        const trimmed = { ...data, chatHistory: chatHistory.slice(-20) };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } else {
        localStorage.setItem(STORAGE_KEY, json);
      }
    } catch { /* ignore */ }
  }, [chatHistory, selectedModel, selectedKeyId, params, systemPrompt]);
  const responseRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch models
  useEffect(() => {
    fetch("/api/v1/models")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.data) {
          setModels(d.data);
          if (d.data.length > 0 && !selectedModel) {
            setSelectedModel(d.data[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Fetch API keys
  useEffect(() => {
    fetch("/api/dashboard/keys", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.keys) {
          const enabled = d.keys.filter((k: ApiKey) => k.enabled === 1);
          setKeys(enabled);
          if (enabled.length > 0 && selectedKeyId === null) {
            setSelectedKeyId(enabled[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, response]);

  const selectedKey = keys.find((k) => k.id === selectedKeyId);

  const groupedModels = models.reduce<Record<string, Model[]>>((acc, m) => {
    const group = m.owned_by || "unknown";
    if (!acc[group]) acc[group] = [];
    acc[group].push(m);
    return acc;
  }, {});

  const buildMessages = () => {
    const msgs: Array<{ role: string; content: string }> = [];
    if (systemPrompt.trim()) {
      msgs.push({ role: "system", content: systemPrompt.trim() });
    }
    for (const m of chatHistory) {
      msgs.push(m);
    }
    msgs.push({ role: "user", content: message });
    return msgs;
  };

  const handleSend = useCallback(async () => {
    if (!message.trim() || !selectedModel || !selectedKey || isSending) return;

    setIsSending(true);
    setError("");
    setUsage(null);
    setResponse("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${selectedKey.key_value}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: buildMessages(),
          stream: true,
          temperature: params.temperature,
          max_tokens: params.max_tokens,
          top_p: params.top_p,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setError(errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
        setIsSending(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("No response body");
        setIsSending(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

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
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              setResponse(fullText);
            }
            if (parsed.usage) {
              setUsage(parsed.usage);
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      // Add to chat history on success
      if (fullText) {
        setChatHistory(prev => [
          ...prev,
          { role: "user", content: message },
          { role: "assistant", content: fullText },
        ]);
        setMessage("");
        setResponse("");
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
  }, [message, selectedModel, selectedKey, isSending, chatHistory, systemPrompt, params]);

  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setIsSending(false);
    }
  }, []);

  const handleClear = () => {
    setChatHistory([]);
    setResponse("");
    setError("");
    setUsage(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Play className="h-6 w-6 text-primary" />
        {t.title}
      </h1>

      {/* Model, Key & Parameters */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">{t.selectModel}</label>
              <select
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.length === 0 && <option value="">{t.noModels}</option>}
                {Object.entries(groupedModels).map(([group, groupModels]) => (
                  <optgroup key={group} label={group}>
                    {groupModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.display_name || m.id}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">{t.selectKey}</label>
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
              <div className="grid md:grid-cols-3 gap-4 mt-3 p-4 rounded-lg bg-muted/20 border border-border/30">
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
            <Button variant="outline" size="sm" onClick={handleClear} className="gap-1 text-xs h-7">
              <Trash2 className="h-3.5 w-3.5" />
              {t.clear}
            </Button>
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

            {/* History messages */}
            {chatHistory.map((msg, i) => (
              <div key={i} className={cn("flex gap-3 group", msg.role === "assistant" ? "" : "flex-row-reverse")}>
                <div className={cn("p-1.5 rounded-lg shrink-0", msg.role === "assistant" ? "bg-primary/10" : "bg-muted")}>
                  {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "rounded-lg px-4 py-2.5 max-w-[80%] text-sm leading-relaxed relative",
                  msg.role === "assistant" ? "bg-muted/30 border border-border/30" : "bg-primary/10"
                )}>
                  <pre className="whitespace-pre-wrap break-words text-xs">{msg.content}</pre>
                  <CopyButton text={msg.content} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground" />
                </div>
              </div>
            ))}

            {/* Streaming response */}
            {response && (
              <div className="flex gap-3 group">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg px-4 py-2.5 max-w-[80%] bg-muted/30 border border-border/30 relative">
                  <pre className="whitespace-pre-wrap break-words text-xs">{response}</pre>
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
    </div>
  );
}

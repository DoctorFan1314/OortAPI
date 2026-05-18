"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Send, Bot, User, Loader2, Square, Zap } from "lucide-react";

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
    allModels: "全部模型",
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
    allModels: "All Models",
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
  const abortRef = useRef<AbortController | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll response
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const selectedKey = keys.find((k) => k.id === selectedKeyId);

  // Group models by owned_by
  const groupedModels = models.reduce<Record<string, Model[]>>((acc, m) => {
    const group = m.owned_by || "unknown";
    if (!acc[group]) acc[group] = [];
    acc[group].push(m);
    return acc;
  }, {});

  const handleSend = useCallback(async () => {
    if (!message.trim() || !selectedModel || !selectedKey || isSending) return;

    setIsSending(true);
    setResponse("");
    setError("");
    setUsage(null);

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
          messages: [{ role: "user", content: message }],
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setError(
          errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`
        );
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
            // Capture usage if returned in the final chunk
            if (parsed.usage) {
              setUsage(parsed.usage);
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
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
  }, [message, selectedModel, selectedKey, isSending]);

  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setIsSending(false);
    }
  }, []);

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

      {/* Model & Key Selectors */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Model Selector */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                {t.selectModel}
              </label>
              <select
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.length === 0 && (
                  <option value="">{t.noModels}</option>
                )}
                {Object.entries(groupedModels).map(([group, groupModels]) => (
                  <optgroup key={group} label={group}>
                    {groupModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.display_name || m.id}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Key Selector */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                {t.selectKey}
              </label>
              <select
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={selectedKeyId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedKeyId(val ? Number(val) : null);
                }}
              >
                {keys.length === 0 && (
                  <option value="">{t.noKeys}</option>
                )}
                {keys.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} ({k.key_value.slice(0, 12)}...)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {t.message}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={
              lang === "zh"
                ? "输入你的消息... (Shift+Enter 换行)"
                : "Type your message... (Shift+Enter for newline)"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className="resize-none"
            disabled={isSending}
          />
          <div className="flex justify-end">
            {isSending ? (
              <Button variant="destructive" onClick={handleStop} className="gap-2">
                <Square className="h-4 w-4" />
                {t.stop}
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!message.trim() || !selectedModel || !selectedKey}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {t.send}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Display */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {t.response}
            {isSending && (
              <Loader2 className="h-4 w-4 animate-spin text-primary ml-1" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive mb-1">
                {t.error}
              </p>
              <p className="text-sm text-destructive/80 font-mono">{error}</p>
            </div>
          ) : response ? (
            <div className="space-y-4">
              <div
                ref={responseRef}
                className="rounded-lg bg-muted/50 border border-border p-4 max-h-[500px] overflow-y-auto"
              >
                <pre className="whitespace-pre-wrap break-words text-sm font-mono leading-relaxed">
                  {response}
                </pre>
              </div>
              {usage && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  <span className="font-medium">{t.usage}:</span>
                  <span>
                    {t.promptTokens}:{" "}
                    <span className="font-mono text-foreground">
                      {usage.prompt_tokens}
                    </span>
                  </span>
                  <span>
                    {t.completionTokens}:{" "}
                    <span className="font-mono text-foreground">
                      {usage.completion_tokens}
                    </span>
                  </span>
                  <span>
                    {t.totalTokens}:{" "}
                    <span className="font-mono text-foreground">
                      {usage.total_tokens}
                    </span>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{t.noResponse}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Play, Loader2, Terminal } from "lucide-react";

const DEMO_ENDPOINT = "/api/v1/chat/completions";
const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_KEY || "";

export function ApiDemo({ lang = "zh" }: { lang?: string }) {
  const [prompt, setPrompt] = useState(lang === "zh" ? "你好，介绍一下你自己" : "Hello, introduce yourself");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const executeDemo = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(""); setResponse("");
    try {
      const res = await fetch(DEMO_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEMO_KEY || "demo"}` },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], max_tokens: 200 }),
      });
      if (!res.ok) { setError(`HTTP ${res.status}`); setLoading(false); return; }
      const data = await res.json();
      setResponse(data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2));
    } catch { setError("Request failed"); }
    setLoading(false);
  };

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {lang === "zh" ? "在线体验 API" : "Try the API Live"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lang === "zh" ? "无需注册，直接发送请求体验" : "Send a real request without signing up"}
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Terminal className="h-3.5 w-3.5" />
            <span className="font-mono">POST {DEMO_ENDPOINT}</span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono text-foreground resize-none focus:border-primary focus:outline-none"
            placeholder={lang === "zh" ? "输入消息..." : "Type a message..."}
          />
          <div className="flex justify-end">
            <button
              onClick={executeDemo}
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {lang === "zh" ? "发送请求" : "Send Request"}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
          {response && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{response}</pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

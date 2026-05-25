"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";

interface CodeExample {
  label: string;
  code: string;
}

interface CodeBlockProps {
  code?: string;
  examples?: CodeExample[];
}

const PLACEHOLDER = "sk-oort-your-key";

function useApiKey(): string {
  const { user } = useAuth();
  const { data } = useSWR<{ keys: Array<{ key_value: string }> }>(
    user ? "/api/dashboard/keys" : null,
    (url) => fetch(url, { credentials: "include" }).then((r) => r.json()),
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );
  const [sessionKey, setSessionKey] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("oort_last_created_key");
    if (stored) {
      setSessionKey(stored);
      const timer = setTimeout(() => {
        sessionStorage.removeItem("oort_last_created_key");
        setSessionKey("");
      }, 5 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const firstKey = data?.keys?.[0]?.key_value;
  return sessionKey || firstKey || PLACEHOLDER;
}

function replaceKey(code: string, apiKey: string): string {
  return apiKey !== PLACEHOLDER ? code.replaceAll(PLACEHOLDER, apiKey) : code;
}

export function CodeBlock({ code, examples }: CodeBlockProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const apiKey = useApiKey();

  // Simple mode: single code string
  if (code) {
    const displayCode = replaceKey(code, apiKey);
    return (
      <div className="relative group">
        <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed border border-zinc-800">
          <code className="text-zinc-300 font-mono whitespace-pre">{displayCode}</code>
        </pre>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <button onClick={() => { navigator.clipboard.writeText(displayCode); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200" aria-label="Copy code">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  // Multi-tab mode
  const tabs = useMemo(
    () => (examples || []).map((ex) => ({ ...ex, code: replaceKey(ex.code, apiKey) })),
    [examples, apiKey]
  );
  const active = tabs[activeIdx];

  const handleCopy = useCallback(() => {
    if (!active) return;
    navigator.clipboard.writeText(active.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [active]);

  if (!active) return null;

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-muted/30">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-muted/20">
        <div className="flex gap-0.5">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => { setActiveIdx(i); setCopied(false); }}
              className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                i === activeIdx
                  ? "bg-background text-foreground border border-border/40 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy code">
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className="text-[12px] font-mono leading-relaxed text-foreground p-4 overflow-x-auto">
        <code>{active.code}</code>
      </pre>
    </div>
  );
}

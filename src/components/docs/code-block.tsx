"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import useSWR from "swr";
import LazySyntaxHighlighter from "@/components/shared/lazy-syntax-highlighter";

interface CodeExample {
  label: string;
  code: string;
  language?: string;
}

interface CodeBlockProps {
  code?: string;
  examples?: CodeExample[];
  language?: string;
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

export function CodeBlock({ code, examples, language }: CodeBlockProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const apiKey = useApiKey();

  // Simple mode: single code string
  if (code) {
    const displayCode = replaceKey(code, apiKey);
    const lang = language || "bash";
    return (
      <div className="relative group rounded-lg overflow-hidden border border-zinc-800">
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b20] border-b border-zinc-800">
          <span className="text-[11px] text-zinc-400 font-mono">{lang}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(displayCode); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
            aria-label="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="w-full max-w-full overflow-x-auto min-w-0">
          <LazySyntaxHighlighter code={displayCode} language={lang} />
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
    <div className="rounded-lg border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-[#161b20]">
        <div className="flex gap-0.5">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => { setActiveIdx(i); setCopied(false); }}
              className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                i === activeIdx
                  ? "bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors" aria-label="Copy code">
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <div className="w-full max-w-full overflow-x-auto min-w-0">
        <LazySyntaxHighlighter code={active.code} language={active.language || "bash"} />
      </div>
    </div>
  );
}

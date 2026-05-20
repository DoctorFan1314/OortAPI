"use client";

import { useState, useRef, useCallback } from "react";
import { CODE_SNIPPETS, type SnippetLang } from "@/lib/code-snippets";

export function MockTerminal() {
  const [tab, setTab] = useState<SnippetLang>("curl");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [usage, setUsage] = useState<{ prompt_tokens: number; completion_tokens: number; total_tokens: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const snippet = CODE_SNIPPETS[tab];

  const handleRun = useCallback(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      return;
    }

    setRunning(true);
    setOutput("");
    setUsage(null);

    const lines = snippet.response.split("\n");
    let idx = 0;

    intervalRef.current = setInterval(() => {
      if (idx < lines.length) {
        setOutput(prev => prev + (prev ? "\n" : "") + lines[idx]);
        idx++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRunning(false);
        // Show final token usage
        setUsage(snippet.usage);
        intervalRef.current = null;
      }
    }, 80);
  }, [running, snippet]);

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-2xl bg-zinc-950 dark:bg-zinc-950">
      {/* Title bar — Mac style */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[11px] font-mono text-zinc-500 mx-auto tracking-wide">api-playground — bash</span>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/50">
        {(["curl", "python", "node"] as const).map(lang => (
          <button
            key={lang}
            onClick={() => { if (!running) setTab(lang); }}
            className={`px-4 py-2 text-xs font-mono transition-colors ${
              tab === lang
                ? "text-white border-b-2 border-primary bg-zinc-800/50"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {lang === "node" ? "Node.js" : lang.charAt(0).toUpperCase() + lang.slice(1)}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="relative">
        {!running && !output ? (
          /* Code display */
          <pre className="p-4 text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto max-h-[360px] scrollbar-hide">
            {snippet.code}
          </pre>
        ) : (
          /* Streaming output */
          <pre className="p-4 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-[360px] scrollbar-hide whitespace-pre-wrap">
            {output}
            {running && <span className="terminal-cursor" />}
          </pre>
        )}

        {/* Token usage footer */}
        {usage && (
          <div className="border-t border-zinc-800 px-4 py-2 flex items-center gap-4 text-[10px] font-mono text-zinc-500 bg-zinc-900/50">
            <span>prompt: <span className="text-zinc-300">{usage.prompt_tokens}</span></span>
            <span>completion: <span className="text-zinc-300">{usage.completion_tokens}</span></span>
            <span>total: <span className="text-zinc-300">{usage.total_tokens}</span></span>
          </div>
        )}

        {/* Run / Stop button */}
        <button
          onClick={handleRun}
          className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all ${
            running
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              : "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
          }`}
        >
          {running ? "■ Stop" : "▶ Run"}
        </button>
      </div>
    </div>
  );
}

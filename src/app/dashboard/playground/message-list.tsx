"use client";

import { Bot, User, Loader2, Brain, Wrench, Copy, Check, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/shared/copy-button";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { type ChatMessage, type MessageContent, type Usage, flatContent, wordCount, nowHHMM } from "./chat-engine";

// ─── Types ─────────────────────────────────────────────────

export interface MessageListLabels {
  noResponse: string;
  presets: string;
  reasoning: string;
  toolCall: string;
  usage: string;
  inputNonCached: string;
  inputCached: string;
  outputTokens: string;
  totalTokensLabel: string;
  quote: string;
  regenerate: string;
  copy: string;
}

export interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  response: string;
  reasoningContent: string;
  error: string;
  usage: Usage | null;
  streamMetrics: { ttfbMs: number | null; tokensPerSec: number | null };
  copiedIdx: number;
  lang: string;
  t: MessageListLabels;
  presets: string[];
  onSetMessage: (text: string) => void;
  onQuote: (msg: ChatMessage) => void;
  onRegenerate: (msg: ChatMessage) => void;
  onCopy: (text: string, idx: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  endRef: React.RefObject<HTMLDivElement | null>;
}

// ─── Component ─────────────────────────────────────────────

export function MessageList({
  messages,
  isStreaming,
  response,
  reasoningContent,
  error,
  usage,
  streamMetrics,
  copiedIdx,
  lang,
  t,
  presets,
  onSetMessage,
  onQuote,
  onRegenerate,
  onCopy,
  containerRef,
  endRef,
}: MessageListProps) {
  const renderContent = (content: MessageContent) => {
    if (typeof content === "string") return <MarkdownRenderer content={content} />;
    return content.map((part, i) => {
      if (part.type === "image_url") return <img key={i} src={part.image_url.url} className="max-w-[200px] rounded-md border border-border/50 my-1" alt="" />;
      if (part.type === "text") return <div key={i} className="text-xs"><MarkdownRenderer content={part.text} /></div>;
      return null;
    });
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-4 playground-scrollbar">
      {messages.length === 0 && !response && !error && (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <Bot className="h-12 w-12 mb-3 opacity-20" /><p className="text-sm">{t.noResponse}</p>
          <div className="mt-6 max-w-md"><p className="text-[11px] text-muted-foreground mb-2">{t.presets}:</p><div className="flex flex-wrap gap-1.5 justify-center">{presets.map((p, i) => (<button key={i} onClick={() => onSetMessage(p)} className="px-2.5 py-1.5 rounded-md text-[11px] font-mono text-muted-foreground bg-muted/50 border border-border/50 hover:text-foreground hover:border-muted-foreground/30 transition-colors">{p}</button>))}</div></div>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={`${msg.createdAt}-${i}`} className={cn("flex gap-3 group", msg.role === "assistant" ? "" : "flex-row-reverse")}>
          <div className={cn("p-1.5 rounded-lg shrink-0", msg.role === "assistant" ? "bg-primary/10" : msg.role === "tool" ? "bg-amber-500/10" : "bg-muted")}>
            {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : msg.role === "tool" ? <Wrench className="h-4 w-4 text-amber-500" /> : <User className="h-4 w-4" />}
          </div>
          <div className="max-w-[80%]">
            {/* Tool call cards */}
            {msg.tool_calls && msg.tool_calls.length > 0 && msg.tool_calls.map((tc) => {
              let argSummary = "";
              try { const a = JSON.parse(tc.function.arguments || "{}"); argSummary = Object.entries(a).map(([k, v]) => `${k}: ${typeof v === "string" ? v.slice(0, 60) : JSON.stringify(v)}`).join(", "); } catch { argSummary = tc.function.arguments || ""; }
              return (
                <div key={tc.id} className="flex items-center gap-2 px-3 py-2 mb-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
                  <Wrench className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="font-mono font-medium text-amber-500">{tc.function.name}</span>
                  {argSummary && <span className="text-muted-foreground truncate">{argSummary}</span>}
                </div>
              );
            })}
            {msg.reasoningContent && (
              <div className="rounded-lg px-4 py-3 mb-2 border border-amber-500/20 bg-amber-500/[0.02]">
                <details>
                  <summary className="text-xs font-medium text-amber-500/80 cursor-pointer hover:text-amber-500 transition-colors select-none"><Brain className="h-3.5 w-3.5 inline mr-1" />{t.reasoning}</summary>
                  <div className="mt-2 pt-2 border-t border-amber-500/10 text-[12px] text-muted-foreground/90 [&_p]:!text-[12px] [&_li]:!text-[12px]"><MarkdownRenderer content={msg.reasoningContent} /></div>
                </details>
              </div>
            )}
            {/* Message bubble */}
            {msg.role === "tool" ? (
              <div className="glass-card rounded-lg px-4 py-2.5 text-sm leading-relaxed bg-amber-500/5 border-amber-500/20">
                <details>
                  <summary className="text-xs font-medium text-amber-500/80 cursor-pointer hover:text-amber-500 transition-colors select-none flex items-center gap-1.5">
                    <Wrench className="h-3 w-3" />{msg.name || t.toolCall}
                  </summary>
                  <pre className="mt-2 pt-2 border-t border-amber-500/10 text-[11px] font-mono text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">{msg.content as string}</pre>
                </details>
              </div>
            ) : (typeof msg.content === "string" && !msg.content.trim() && msg.tool_calls?.length) ? null : (
              <div className={cn("glass-card rounded-lg px-4 py-2.5 text-sm leading-relaxed relative", msg.role === "assistant" ? "" : "bg-primary/10 border-0")}>
                <div className="text-xs">{renderContent(msg.content)}</div>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1 px-1">
              <span className="text-[10px] text-muted-foreground/60 font-mono">{msg.role === "tool" ? `${msg.name || t.toolCall}` : `${wordCount(flatContent(msg.content))} words`} · {msg.createdAt || nowHHMM()}</span>
              <span className="flex-1" />
              <button onClick={() => onQuote(msg)} className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors w-7 h-7 rounded hover:bg-muted/50 flex items-center justify-center" title={t.quote} aria-label={t.quote}><Quote className="h-3 w-3" /></button>
              {msg.role === "assistant" && (
                <button onClick={() => onRegenerate(msg)} className="text-sm text-muted-foreground/50 hover:text-foreground transition-colors w-7 h-7 rounded hover:bg-muted/50 flex items-center justify-center" title={t.regenerate} aria-label={t.regenerate}>&#8635;</button>
              )}
              <button onClick={() => onCopy(flatContent(msg.content), i)} className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors w-6 h-6 rounded hover:bg-muted/50 flex items-center justify-center opacity-100" title={t.copy} aria-label={t.copy}>{copiedIdx === i ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}</button>
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

      {/* Reasoning bubble for streaming */}
      {reasoningContent && reasoningContent.length > 5 && !messages.some((m) => m.reasoningContent === reasoningContent) && (
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
      <div ref={endRef} />
    </div>
  );
}

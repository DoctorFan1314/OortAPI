"use client";

import { Plus, Send, Loader2, Wrench, Image, X, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "./chat-engine";
import { flatContent } from "./chat-engine";

// ─── Types ─────────────────────────────────────────────────

export interface InputAreaLabels {
  inputMessage: string;
  image: string;
}

export interface InputAreaProps {
  message: string;
  isStreaming: boolean;
  hasModel: boolean;
  hasKey: boolean;
  visionCapable: boolean;
  showToolbar: boolean;
  quoteMessage: ChatMessage | null;
  attachedImages: string[];
  mcpToolCount: number;
  lang: string;
  t: InputAreaLabels;
  toolManagerLabel: string;
  onSetMessage: (text: string) => void;
  onSend: () => void;
  onStop: () => void;
  onToggleToolbar: () => void;
  onImageSelect: () => void;
  onRemoveImage: (idx: number) => void;
  onClearQuote: () => void;
  onOpenToolManager: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

// ─── Component ─────────────────────────────────────────────

export function InputArea({
  message,
  isStreaming,
  hasModel,
  hasKey,
  visionCapable,
  showToolbar,
  quoteMessage,
  attachedImages,
  mcpToolCount,
  lang,
  t,
  toolManagerLabel,
  onSetMessage,
  onSend,
  onStop,
  onToggleToolbar,
  onImageSelect,
  onRemoveImage,
  onClearQuote,
  onOpenToolManager,
  textareaRef,
}: InputAreaProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const sendDisabled = !message.trim() || !hasModel || !hasKey;

  const sendTitle = !hasKey
    ? (lang === "zh" ? "请先在右侧选择 API Key" : "Please select an API Key in the right panel")
    : !hasModel
      ? (lang === "zh" ? "请先选择模型" : "Please select a model")
      : !message.trim()
        ? (lang === "zh" ? "请输入消息" : "Type a message")
        : "";

  return (
    <div className="p-4 bg-background border-t border-border/90">
      {/* Attached images preview */}
      {attachedImages.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto">
          {attachedImages.map((img, i) => (
            <div key={i} className="relative shrink-0">
              <img src={img} className="h-16 w-16 object-cover rounded-md border border-border/50" alt="" />
              <button onClick={() => onRemoveImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center p-0.5"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Quote bar */}
      {quoteMessage && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-md bg-primary/[0.03] border-l-2 border-primary/40 border border-border/40">
          <Quote className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="flex-1 text-xs text-foreground/80 truncate font-medium">{flatContent(quoteMessage.content)}</span>
          <button onClick={onClearQuote} className="p-0.5 rounded hover:bg-destructive/20 shrink-0"><X className="h-3.5 w-3.5 text-destructive/70 hover:text-destructive" /></button>
        </div>
      )}

      <div className="flex gap-2 items-center">
        {/* "+" toolbar button */}
        <div className="relative">
          <button onClick={onToggleToolbar} className="w-9 h-9 rounded-md border border-border/60 bg-muted/20 hover:bg-muted flex items-center justify-center transition-colors shrink-0">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
          {showToolbar && (
            <div className="absolute bottom-full left-0 mb-1 bg-card border border-border/50 rounded-lg shadow-xl p-1.5 space-y-0.5 z-10 min-w-[140px]">
              <button onClick={() => { if (!visionCapable) return; onImageSelect(); }} className={cn("flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-xs transition-colors", visionCapable ? "text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer" : "text-muted-foreground/30 cursor-not-allowed")}><Image className={cn("h-3.5 w-3.5", !visionCapable && "opacity-30")} />{t.image}</button>
            </div>
          )}
        </div>

        {/* Tool manager button */}
        <button onClick={onOpenToolManager} className="relative w-9 h-9 rounded-md border border-border/60 bg-muted/20 hover:bg-muted flex items-center justify-center transition-colors shrink-0" title={toolManagerLabel}>
          <Wrench className="h-4 w-4 text-muted-foreground" />
          {mcpToolCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
              {mcpToolCount}
            </span>
          )}
        </button>

        <Textarea ref={textareaRef} placeholder={t.inputMessage} aria-label={t.inputMessage} value={message} onChange={(e) => onSetMessage(e.target.value)} onKeyDown={handleKeyDown} rows={1} className="resize-none flex-1 min-h-[2.5rem] max-h-32 overflow-y-auto" disabled={isStreaming} />

        <div className="flex flex-col gap-1.5 self-center">
          <div className="flex gap-1.5">
            {isStreaming
              ? <button onClick={onStop} className="w-10 h-full min-h-[2.5rem] rounded-md border border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-center shrink-0 hover:bg-destructive/20 transition-colors"><Loader2 className="h-5 w-5 animate-spin" /></button>
              : <button onClick={onSend} disabled={sendDisabled} title={sendTitle} className="w-10 h-full min-h-[2.5rem] rounded-md border border-primary/30 bg-primary/10 text-primary flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><Send className="h-5 w-5" /></button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

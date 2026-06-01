import type { ToolCall, ToolDefinition } from "@/lib/playground-tools";

// ─── Types ─────────────────────────────────────────────────

export interface Model { id: string; owned_by: string; display_name?: string; tags?: string[]; }
export interface ApiKey { id: number; name: string; key_value: string; enabled: number; }
export interface Usage { prompt_tokens: number; completion_tokens: number; total_tokens: number; tokens_in_cache?: number; }

export type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
export type MessageContent = string | ContentPart[];

export interface ChatMessage {
  role: "user" | "assistant" | "tool";
  content: MessageContent;
  createdAt: string;
  usage?: Usage;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  reasoningContent?: string;
  quote?: { content: string; role: string };
  name?: string;
}

export interface PlaygroundParams {
  temperature: number; max_tokens: number; top_p: number;
  response_format: string; stop: string; seed: number;
  frequency_penalty: number; presence_penalty: number;
}

export interface ChatSession {
  id: string; title: string; messages: ChatMessage[];
  selectedModel: string; selectedKeyId: number | null;
  systemPrompt: string; params: PlaygroundParams;
  activeMcpTools?: ToolDefinition[];
}

export type ApiEndpoint = "openai" | "anthropic";

// ─── Helpers ───────────────────────────────────────────────

const CJK_RE = /[一-鿿㐀-䶿豈-﫿]/g;

export function estimateTokens(text: string): number {
  const cjk = (text.match(CJK_RE) || []).length;
  const ascii = text.length - cjk;
  return Math.max(1, Math.ceil(cjk * 1.5 + ascii * 0.25));
}

export function nowHHMM(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function wordCount(text: string): number {
  const cjk = (text.match(CJK_RE) || []).length;
  const nonCjk = text.replace(CJK_RE, " ").split(/\s+/).filter(Boolean).length;
  return cjk + nonCjk;
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function flatContent(content: MessageContent): string {
  if (typeof content === "string") return content;
  return content.map((p) => (p.type === "text" ? p.text : "[Image]")).join("\n");
}

// ─── Constants ─────────────────────────────────────────────

export const DEFAULT_PARAMS: PlaygroundParams = {
  temperature: 0.7, max_tokens: 32768, top_p: 1,
  response_format: "text", stop: "", seed: -1,
  frequency_penalty: 0, presence_penalty: 0,
};

export const STORAGE_KEY = "oortapi-playground-v3";

export const PRESETS_ZH = ["请你详细介绍你自己", "用 Python 写一个快速排序算法", "解释一下什么是量子计算"];
export const PRESETS_EN = ["Tell me about yourself", "Write a quicksort in Python", "Explain quantum computing"];

export const PARAM_PRESETS = [
  { label: { zh: "均衡", en: "Balanced" }, params: { temperature: 0.7, top_p: 1, frequency_penalty: 0, presence_penalty: 0 } },
  { label: { zh: "创意", en: "Creative" }, params: { temperature: 0.9, top_p: 0.95, frequency_penalty: 0.3, presence_penalty: 0.3 } },
  { label: { zh: "精确", en: "Precise" }, params: { temperature: 0.2, top_p: 0.8, frequency_penalty: 0.1, presence_penalty: 0.1 } },
  { label: { zh: "代码", en: "Code" }, params: { temperature: 0.1, top_p: 0.9, frequency_penalty: 0, presence_penalty: 0 } },
];

export const CAP_COLORS: Record<string, string> = {
  vision: "bg-sky-500/10 text-sky-500",
  reasoning: "bg-amber-500/10 text-amber-500",
  tools: "bg-emerald-500/10 text-emerald-500",
};

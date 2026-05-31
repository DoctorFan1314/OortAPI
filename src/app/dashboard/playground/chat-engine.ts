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

export const LABELS = {
  zh: {
    title: "API 测试场", send: "发送", sending: "发送中...", stop: "停止",
    noResponse: "发送消息以查看响应", error: "错误",
    usage: "Token 用量", inputNonCached: "输入(未命中缓存)", inputCached: "输入(命中缓存)", outputTokens: "输出", totalTokensLabel: "总",
    noKeys: "暂无 API Key", noModels: "暂无可用模型",
    params: "参数设置", temperature: "温度", maxTokens: "最大 Tokens", topP: "Top P",
    systemPrompt: "系统提示词", systemPromptPH: "可选：设置系统提示词",
    refresh: "刷新", endpoint: "API 接口", openai: "OpenAI 格式", anthropic: "Anthropic 格式",
    presets: "常用语", selectModel: "选择模型", selectKey: "API Key", newSession: "新建会话",
    image: "图片", link: "链接", thinking: "思考", tools: "工具设置",
    thinkingOn: "思考中", toolCall: "调用了工具",
    contextLength: "上下文长度", responseFormat: "响应格式", stopSequences: "停止序列",
    seed: "种子值", freqPenalty: "频率惩罚", presPenalty: "存在惩罚",
    jsonObject: "JSON 对象", textFormat: "文本",
    toolSetup: "工具设置", webSearch: "联网搜索", fetchPage: "网页抓取",
    tavilyKey: "Tavily API Key",
    addLink: "添加链接", linkPlaceholder: "输入 URL...", confirm: "确认",
    reasoning: "思考过程", noCapability: "未配置能力", editCap: "编辑能力",
    capVision: "视觉", capReasoning: "推理", capTools: "工具",
    mcpCustom: "自定义 MCP 服务器", mcpAdd: "添加服务器", mcpComing: "即将支持",
    newChat: "新会话", inputMessage: "输入消息... (Shift+Enter 换行)", advanced: "高级参数",
    deleteSession: "删除会话", exportChat: "导出对话", export: "导出",
    quote: "引用", regenerate: "重新生成", copy: "复制",
    toolCallsFailing: "工具调用连续失败，当前模型可能不支持工具操作。请尝试其他模型。已基于已有信息为您回答。",
    searchFallback: "基于搜索结果为您整理：", maxIterations: "工具调用达到最大迭代次数。",
  },
  en: {
    title: "API Playground", send: "Send", sending: "Sending...", stop: "Stop",
    noResponse: "Send a message to see the response", error: "Error",
    usage: "Token Usage", inputNonCached: "Input(non-cached)", inputCached: "Input(cached)", outputTokens: "Output", totalTokensLabel: "Total",
    noKeys: "No API keys found", noModels: "No models available",
    params: "Parameters", temperature: "Temperature", maxTokens: "Max Tokens", topP: "Top P",
    systemPrompt: "System Prompt", systemPromptPH: "Optional: Set a system prompt",
    refresh: "Refresh", endpoint: "API Endpoint", openai: "OpenAI Format", anthropic: "Anthropic Format",
    presets: "Presets", selectModel: "Select Model", selectKey: "API Key", newSession: "New Session",
    image: "Image", link: "Link", thinking: "Thinking", tools: "Tool Settings",
    thinkingOn: "Thinking", toolCall: "Called tool",
    contextLength: "Context Length", responseFormat: "Response Format", stopSequences: "Stop Sequences",
    seed: "Seed", freqPenalty: "Frequency Penalty", presPenalty: "Presence Penalty",
    jsonObject: "JSON Object", textFormat: "Text",
    toolSetup: "Tool Setup", webSearch: "Web Search", fetchPage: "Fetch URL",
    tavilyKey: "Tavily API Key",
    addLink: "Add Link", linkPlaceholder: "Enter URL...", confirm: "Confirm",
    reasoning: "Reasoning", noCapability: "No capabilities configured", editCap: "Edit",
    capVision: "Vision", capReasoning: "Reasoning", capTools: "Tools",
    mcpCustom: "Custom MCP Servers", mcpAdd: "Add Server", mcpComing: "Coming soon",
    newChat: "New Chat", inputMessage: "Type a message... (Shift+Enter newline)", advanced: "Advanced",
    deleteSession: "Delete session", exportChat: "Export conversation", export: "Export",
    quote: "Quote", regenerate: "Regenerate", copy: "Copy",
    toolCallsFailing: "Tool calls keep failing. This model may not support tool calling. Answering based on available information.",
    searchFallback: "Based on the search results:", maxIterations: "Tool execution reached maximum iterations.",
  },
};

export const CAP_COLORS: Record<string, string> = {
  vision: "bg-sky-500/10 text-sky-500",
  reasoning: "bg-amber-500/10 text-amber-500",
  tools: "bg-emerald-500/10 text-emerald-500",
};

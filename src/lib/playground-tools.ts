// ─── Tool System for Playground ───────────────────────────

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ToolConfig {
  tavilyApiKey: string;
  enabledTools: string[];
}

export type ModelCapabilities = Record<string, { vision: boolean; reasoning: boolean; tools: boolean }>;

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export const BUILTIN_TOOLS: Record<string, ToolDefinition> = {
  web_search: {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the internet for current information. Use this when you need up-to-date news, facts, or data from the web.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query string" },
          count: { type: "number", description: "Number of results to return (1-10)", default: 5 },
        },
        required: ["query"],
      },
    },
  },
  fetch_url: {
    type: "function",
    function: {
      name: "fetch_url",
      description: "Fetch and extract the readable text content from a URL. Converts HTML to Markdown.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The full URL (including protocol) to fetch" },
        },
        required: ["url"],
      },
    },
  },
};

export const DEFAULT_TOOL_CONFIG: ToolConfig = {
  tavilyApiKey: "",
  enabledTools: [],
};

export function loadToolConfig(): ToolConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_TOOL_CONFIG };
  try {
    const saved = localStorage.getItem("oortapi-tool-config");
    if (saved) return { ...DEFAULT_TOOL_CONFIG, ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return { ...DEFAULT_TOOL_CONFIG };
}

export function saveToolConfig(config: ToolConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem("oortapi-tool-config", JSON.stringify(config));
  } catch { /* ignore */ }
}

export function getEnabledToolDefinitions(config: ToolConfig): ToolDefinition[] {
  return config.enabledTools
    .filter((name) => BUILTIN_TOOLS[name])
    .map((name) => BUILTIN_TOOLS[name]);
}

const CAPS_STORAGE_KEY = "oortapi-model-caps";

export function loadModelCaps(): ModelCapabilities {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(CAPS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {};
}

export function saveModelCaps(caps: ModelCapabilities): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CAPS_STORAGE_KEY, JSON.stringify(caps));
  } catch { /* ignore */ }
}

export function getModelCaps(modelId: string): { vision: boolean; reasoning: boolean; tools: boolean } {
  const all = loadModelCaps();
  return all[modelId] || { vision: false, reasoning: false, tools: false };
}

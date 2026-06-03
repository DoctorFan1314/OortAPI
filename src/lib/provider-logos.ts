// Provider Logo Registry
// SVG files from @lobehub/icons-static-svg (MIT license)
// https://github.com/lobehub/lobe-icons

export interface ProviderInfo {
  id: string;
  name: string;
  nameZh: string;
  group: "ai" | "cloud" | "tool";
}

export const PROVIDER_GROUPS = {
  ai: {
    label: { zh: "AI 模型", en: "AI Models" },
    providers: [
      { id: "openai", name: "OpenAI", nameZh: "OpenAI" },
      { id: "anthropic", name: "Anthropic", nameZh: "Anthropic" },
      { id: "google", name: "Google", nameZh: "Google" },
      { id: "deepseek", name: "DeepSeek", nameZh: "DeepSeek" },
      { id: "meta", name: "Meta", nameZh: "Meta" },
      { id: "qwen", name: "Qwen", nameZh: "通义千问" },
      { id: "alibaba", name: "Alibaba", nameZh: "阿里" },
      { id: "baidu", name: "Baidu", nameZh: "百度" },
      { id: "bytedance", name: "ByteDance", nameZh: "字节跳动" },
      { id: "mistral", name: "Mistral", nameZh: "Mistral" },
      { id: "cohere", name: "Cohere", nameZh: "Cohere" },
      { id: "groq", name: "Groq", nameZh: "Groq" },
      { id: "zhipu", name: "ZhiPu", nameZh: "智谱" },
      { id: "minimax", name: "MiniMax", nameZh: "MiniMax" },
      { id: "moonshot", name: "Moonshot", nameZh: "月之暗面" },
      { id: "stepfun", name: "StepFun", nameZh: "阶跃星辰" },
      { id: "baichuan", name: "Baichuan", nameZh: "百川" },
      { id: "zeroone", name: "01.AI", nameZh: "零一万物" },
      { id: "perplexity", name: "Perplexity", nameZh: "Perplexity" },
      { id: "xai", name: "xAI", nameZh: "xAI" },
      { id: "stability", name: "Stability AI", nameZh: "Stability AI" },
      { id: "midjourney", name: "Midjourney", nameZh: "Midjourney" },
      { id: "replicate", name: "Replicate", nameZh: "Replicate" },
      { id: "huggingface", name: "HuggingFace", nameZh: "HuggingFace" },
    ],
  },
  cloud: {
    label: { zh: "云服务", en: "Cloud Services" },
    providers: [
      { id: "aws", name: "AWS", nameZh: "AWS" },
      { id: "azure", name: "Azure", nameZh: "Azure" },
      { id: "googlecloud", name: "Google Cloud", nameZh: "Google Cloud" },
      { id: "alibabacloud", name: "Alibaba Cloud", nameZh: "阿里云" },
      { id: "baiducloud", name: "Baidu Cloud", nameZh: "百度云" },
      { id: "tencent", name: "Tencent", nameZh: "腾讯" },
      { id: "huawei", name: "Huawei", nameZh: "华为" },
      { id: "cloudflare", name: "Cloudflare", nameZh: "Cloudflare" },
      { id: "vercel", name: "Vercel", nameZh: "Vercel" },
      { id: "bedrock", name: "AWS Bedrock", nameZh: "AWS Bedrock" },
      { id: "vertexai", name: "Vertex AI", nameZh: "Vertex AI" },
    ],
  },
  tool: {
    label: { zh: "工具/框架", en: "Tools & Frameworks" },
    providers: [
      { id: "ollama", name: "Ollama", nameZh: "Ollama" },
      { id: "lmstudio", name: "LM Studio", nameZh: "LM Studio" },
      { id: "vllm", name: "vLLM", nameZh: "vLLM" },
      { id: "nvidia", name: "NVIDIA", nameZh: "NVIDIA" },
      { id: "togetherai", name: "Together AI", nameZh: "Together AI" },
      { id: "fireworks", name: "Fireworks", nameZh: "Fireworks" },
      { id: "siliconcloud", name: "SiliconCloud", nameZh: "硅基流动" },
      { id: "openrouter", name: "OpenRouter", nameZh: "OpenRouter" },
      { id: "anyscale", name: "Anyscale", nameZh: "Anyscale" },
    ],
  },
} as const;

export type ProviderGroupKey = keyof typeof PROVIDER_GROUPS;

// Get all providers as a flat list
export function getAllProviders(): ProviderInfo[] {
  const result: ProviderInfo[] = [];
  for (const [group, data] of Object.entries(PROVIDER_GROUPS)) {
    for (const p of data.providers) {
      result.push({ ...p, group: group as ProviderGroupKey });
    }
  }
  return result;
}

// Get logo path
export function getProviderLogo(id: string, variant: "color" | "mono" = "color"): string {
  return variant === "color" ? `/providers/${id}-color.svg` : `/providers/${id}.svg`;
}

// Provider name map for display
export const PROVIDER_DISPLAY_NAMES: Record<string, { en: string; zh: string }> = {
  openai: { en: "OpenAI", zh: "OpenAI" },
  anthropic: { en: "Anthropic", zh: "Anthropic" },
  google: { en: "Google", zh: "Google" },
  deepseek: { en: "DeepSeek", zh: "DeepSeek" },
  meta: { en: "Meta", zh: "Meta" },
  qwen: { en: "Qwen", zh: "通义千问" },
  alibaba: { en: "Alibaba", zh: "阿里" },
  baidu: { en: "Baidu", zh: "百度" },
  bytedance: { en: "ByteDance", zh: "字节跳动" },
  mistral: { en: "Mistral", zh: "Mistral" },
  cohere: { en: "Cohere", zh: "Cohere" },
  groq: { en: "Groq", zh: "Groq" },
  xai: { en: "xAI", zh: "xAI" },
  zhipu: { en: "ZhiPu", zh: "智谱" },
  minimax: { en: "MiniMax", zh: "MiniMax" },
  moonshot: { en: "Moonshot", zh: "月之暗面" },
  stepfun: { en: "StepFun", zh: "阶跃星辰" },
  baichuan: { en: "Baichuan", zh: "百川" },
  zeroone: { en: "01.AI", zh: "零一万物" },
  perplexity: { en: "Perplexity", zh: "Perplexity" },
  ollama: { en: "Ollama", zh: "Ollama" },
  aws: { en: "AWS", zh: "AWS" },
  azure: { en: "Azure", zh: "Azure" },
  googlecloud: { en: "Google Cloud", zh: "Google Cloud" },
  alibabacloud: { en: "Alibaba Cloud", zh: "阿里云" },
  tencent: { en: "Tencent", zh: "腾讯" },
  huawei: { en: "Huawei", zh: "华为" },
  cloudflare: { en: "Cloudflare", zh: "Cloudflare" },
  vercel: { en: "Vercel", zh: "Vercel" },
  nvidia: { en: "NVIDIA", zh: "NVIDIA" },
  vllm: { en: "vLLM", zh: "vLLM" },
  togetherai: { en: "Together AI", zh: "Together AI" },
  fireworks: { en: "Fireworks", zh: "Fireworks" },
  siliconcloud: { en: "SiliconCloud", zh: "硅基流动" },
};

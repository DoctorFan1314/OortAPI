"use client";

import { useTheme } from "@/contexts/theme-context";

// Map provider names to logo file IDs
// The logo files follow lobehub naming: {id}.svg (mono) and {id}-color.svg (color)
const PROVIDER_ID_MAP: Record<string, string> = {
  openai: "openai",
  anthropic: "anthropic",
  google: "google",
  deepseek: "deepseek",
  meta: "meta",
  alibaba: "alibaba",
  qwen: "qwen",
  baidu: "baidu",
  bytedance: "bytedance",
  mistral: "mistral",
  cohere: "cohere",
  groq: "groq",
  xai: "xai",
  zhipu: "zhipu",
  minimax: "minimax",
  moonshot: "moonshot",
  stepfun: "stepfun",
  baichuan: "baichuan",
  yi: "zeroone",
  siliconcloud: "siliconcloud",
  togetherai: "togetherai",
  fireworks: "fireworks",
  perplexity: "perplexity",
  azure: "azure",
  aws: "aws",
  bedrock: "bedrock",
  vertexai: "vertexai",
  vercel: "vercel",
  ollama: "ollama",
  lmstudio: "lmstudio",
  vllm: "vllm",
  nvidia: "nvidia",
  intel: "intel",
  huawei: "huawei",
  tencent: "tencent",
  baiducloud: "baiducloud",
  alibabacloud: "alibabacloud",
  googlecloud: "googlecloud",
  cloudflare: "cloudflare",
};

interface ProviderLogoProps {
  provider: string;
  size?: number;
  className?: string;
}

export function ProviderLogo({ provider, size = 16, className = "" }: ProviderLogoProps) {
  const { resolvedTheme } = useTheme();
  const providerId = PROVIDER_ID_MAP[provider.toLowerCase()] || provider.toLowerCase();

  // Use color variant for both themes (color logos look good in both)
  const src = `/providers/${providerId}-color.svg`;

  return (
    <img
      src={src}
      alt={provider}
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      loading="lazy"
      onError={(e) => {
        // Fallback to mono variant if color doesn't exist
        const target = e.target as HTMLImageElement;
        if (target.src.includes("-color")) {
          target.src = `/providers/${providerId}.svg`;
        }
      }}
    />
  );
}

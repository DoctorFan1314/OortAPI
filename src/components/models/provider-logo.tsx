"use client";

import { useState } from "react";

// Map provider names to logo file IDs
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
  huawei: "huawei",
  tencent: "tencent",
  baiducloud: "baiducloud",
  alibabacloud: "alibabacloud",
  googlecloud: "googlecloud",
  cloudflare: "cloudflare",
};

// Providers that only have mono SVGs (no color variant)
const MONO_ONLY = new Set([
  "openai", "anthropic", "groq", "xai", "moonshot", "ollama",
  "lmstudio", "vllm", "nvidia", "vercel", "huawei", "tencent",
  "baiducloud", "alibabacloud", "googlecloud", "cloudflare",
]);

interface ProviderLogoProps {
  provider: string;
  size?: number;
  className?: string;
}

export function ProviderLogo({ provider, size = 16, className = "" }: ProviderLogoProps) {
  const [errored, setErrored] = useState(false);
  const providerId = PROVIDER_ID_MAP[provider.toLowerCase()] || provider.toLowerCase();
  const useMono = MONO_ONLY.has(providerId) || errored;
  const src = useMono ? `/providers/${providerId}.svg` : `/providers/${providerId}-color.svg`;

  if (errored && !MONO_ONLY.has(providerId)) {
    // Both color and mono failed, don't render
    return null;
  }

  return (
    <img
      src={src}
      alt={provider}
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      loading="lazy"
      onError={() => {
        if (!useMono) {
          setErrored(true);
        }
      }}
      style={useMono ? { filter: "brightness(0) invert(0.5)" } : undefined}
    />
  );
}

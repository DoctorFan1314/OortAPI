"use client";

import { useState } from "react";

// Map provider names to best available logo file ID
const PROVIDER_ID_MAP: Record<string, string> = {
  openai: "openai",
  anthropic: "claude",
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
  gemini: "gemini",
};

interface ProviderLogoProps {
  provider: string;
  size?: number;
  className?: string;
}

export function ProviderLogo({ provider, size = 16, className = "" }: ProviderLogoProps) {
  const [variant, setVariant] = useState<"color" | "mono">("color");
  const providerId = PROVIDER_ID_MAP[provider.toLowerCase()] || provider.toLowerCase();

  const src = variant === "color"
    ? `/providers/${providerId}-color.svg`
    : `/providers/${providerId}.svg`;

  return (
    <img
      src={src}
      alt={provider}
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      loading="lazy"
      onError={() => {
        if (variant === "color") setVariant("mono");
      }}
    />
  );
}

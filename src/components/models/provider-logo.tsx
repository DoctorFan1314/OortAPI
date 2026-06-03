"use client";

const PROVIDER_LOGOS: Record<string, string> = {
  openai: "/providers/openai.svg",
  anthropic: "/providers/anthropic.svg",
  google: "/providers/google.svg",
  deepseek: "/providers/deepseek.svg",
  meta: "/providers/meta.svg",
  alibaba: "/providers/alibaba.svg",
  qwen: "/providers/qwen.svg",
};

interface ProviderLogoProps {
  provider: string;
  size?: number;
  className?: string;
}

export function ProviderLogo({ provider, size = 16, className = "" }: ProviderLogoProps) {
  const src = PROVIDER_LOGOS[provider.toLowerCase()];

  if (!src) {
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
    />
  );
}

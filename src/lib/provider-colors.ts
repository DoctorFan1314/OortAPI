/**
 * Provider brand colors — each provider gets text/bg/border colors
 * that work in both light and dark mode.
 * Dark mode uses lower opacity backgrounds for readability.
 */
export const PROVIDER_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  openai:       { text: "text-emerald-600 dark:text-emerald-400",   bg: "bg-emerald-500/10",   border: "border-emerald-500/30" },
  anthropic:    { text: "text-amber-600 dark:text-amber-400",       bg: "bg-amber-500/10",     border: "border-amber-500/30" },
  google:       { text: "text-blue-600 dark:text-blue-400",         bg: "bg-blue-500/10",      border: "border-blue-500/30" },
  deepseek:     { text: "text-cyan-600 dark:text-cyan-400",         bg: "bg-cyan-500/10",      border: "border-cyan-500/30" },
  alibaba:      { text: "text-orange-600 dark:text-orange-400",     bg: "bg-orange-500/10",    border: "border-orange-500/30" },
  midjourney:   { text: "text-violet-600 dark:text-violet-400",     bg: "bg-violet-500/10",    border: "border-violet-500/30" },
  meta:         { text: "text-sky-600 dark:text-sky-400",           bg: "bg-sky-500/10",       border: "border-sky-500/30" },
  suno:         { text: "text-pink-600 dark:text-pink-400",         bg: "bg-pink-500/10",      border: "border-pink-500/30" },
  cohere:       { text: "text-indigo-600 dark:text-indigo-400",     bg: "bg-indigo-500/10",    border: "border-indigo-500/30" },
  unknown:      { text: "text-muted-foreground",                    bg: "bg-muted",            border: "border-border" },
};

export function getProviderColor(provider: string) {
  return PROVIDER_COLORS[provider.toLowerCase()] || PROVIDER_COLORS.unknown;
}

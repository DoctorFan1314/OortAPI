/**
 * Model/Provider color system — matches by model name keywords
 * so qwen*, deepseek*, gpt*, claude* etc each get appropriate colors.
 */
export const COLOR_MAP: { match: (name: string) => boolean; text: string; bg: string; border: string }[] = [
  // Match by model name keyword (checked in priority order)
  { match: n => /^gpt/i.test(n) || /^o1/i.test(n),   text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10",   border: "border-emerald-500/30" },
  { match: n => /^claude/i.test(n),                   text: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10",     border: "border-amber-500/30" },
  { match: n => /^gemini/i.test(n),                   text: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-500/10",      border: "border-blue-500/30" },
  { match: n => /^qwen/i.test(n),                     text: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-500/10",       border: "border-sky-500/30" },
  { match: n => /^deepseek/i.test(n),                 text: "text-cyan-600 dark:text-cyan-400",       bg: "bg-cyan-500/10",      border: "border-cyan-500/30" },
  // Provider name fallbacks
  { match: n => /openai/i.test(n),                    text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10",   border: "border-emerald-500/30" },
  { match: n => /anthropic/i.test(n),                 text: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10",     border: "border-amber-500/30" },
  { match: n => /google/i.test(n),                    text: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-500/10",      border: "border-blue-500/30" },
  { match: n => /deepseek/i.test(n),                  text: "text-cyan-600 dark:text-cyan-400",       bg: "bg-cyan-500/10",      border: "border-cyan-500/30" },
  { match: n => /alibaba|qwen/i.test(n),              text: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-500/10",    border: "border-orange-500/30" },
  { match: n => /midjourney/i.test(n),                text: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-500/10",    border: "border-violet-500/30" },
  { match: n => /meta|llama/i.test(n),                text: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-500/10",       border: "border-sky-500/30" },
  { match: n => /suno/i.test(n),                      text: "text-pink-600 dark:text-pink-400",       bg: "bg-pink-500/10",      border: "border-pink-500/30" },
  { match: n => /cohere/i.test(n),                    text: "text-indigo-600 dark:text-indigo-400",   bg: "bg-indigo-500/10",    border: "border-indigo-500/30" },
];

const DEFAULT_COLOR = { text: "text-muted-foreground", bg: "bg-muted", border: "border-border" };

export function getModelColor(modelName: string) {
  return COLOR_MAP.find(c => c.match(modelName)) || DEFAULT_COLOR;
}

/** Format provider name nicely: "openai" → "OpenAI", "deepseek" → "DeepSeek" */
export function formatProviderName(name: string): string {
  const SPECIAL: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    deepseek: "DeepSeek",
    google: "Google",
    alibaba: "Alibaba",
    meta: "Meta",
    midjourney: "Midjourney",
    suno: "Suno",
    cohere: "Cohere",
    github: "GitHub",
  };
  return SPECIAL[name.toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1);
}

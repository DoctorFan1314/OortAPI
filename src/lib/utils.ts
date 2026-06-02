import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

export function formatDate(dateStr: string, locale: string = "zh-CN"): string {
  try {
    const normalized = dateStr.replace(/\./g, "-");
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return dateStr; // Return raw string if invalid
    return date.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return dateStr;
  }
}

export function getDifficultyLabel(difficulty: string, t: { prompts: { difficultyEasy: string; difficultyMedium: string; difficultyHard: string } }): string {
  switch (difficulty) {
    case "beginner": return t.prompts.difficultyEasy;
    case "intermediate": return t.prompts.difficultyMedium;
    case "advanced": return t.prompts.difficultyHard;
    default: return difficulty;
  }
}

export function canPerformAction(action: string, cooldownMs: number = 3000): boolean {
  if (typeof window === 'undefined') return true;
  const key = `ai-skills-hub-rate-${action}`;
  const last = localStorage.getItem(key);
  if (last && Date.now() - parseInt(last) < cooldownMs) return false;
  localStorage.setItem(key, String(Date.now()));
  return true;
}

export function formatRelativeTime(dateStr: string, locale: string = "en-US"): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 0) return dateStr;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (years > 0) return rtf.format(-years, "year");
    if (months > 0) return rtf.format(-months, "month");
    if (days > 0) return rtf.format(-days, "day");
    if (hours > 0) return rtf.format(-hours, "hour");
    if (minutes > 0) return rtf.format(-minutes, "minute");
    return rtf.format(0, "second");
  } catch {
    // Fallback for environments without Intl support
    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  }
}

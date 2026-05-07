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

export function formatDate(dateStr: string, locale: string): string {
  // Handle "2026.04" (dot-separated year.month) by converting to ISO
  const normalized = dateStr.replace(/^(\d{4})\.(\d{2})(?:\.(\d{2}))?$/, (_, y, m, d) => d ? `${y}-${m}-${d}` : `${y}-${m}-01`);
  return new Date(normalized).toLocaleDateString(locale);
}

export function getDifficultyLabel(difficulty: string, t: { prompts: { difficultyEasy: string; difficultyMedium: string; difficultyHard: string } }): string {
  switch (difficulty) {
    case "beginner": return t.prompts.difficultyEasy;
    case "intermediate": return t.prompts.difficultyMedium;
    case "advanced": return t.prompts.difficultyHard;
    default: return difficulty;
  }
}

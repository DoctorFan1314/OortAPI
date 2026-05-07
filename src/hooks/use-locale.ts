"use client";

import { useI18n } from "@/contexts/i18n-context";

export function useLocale() {
  const { lang } = useI18n();
  return lang === "en" ? "en-US" : "zh-CN";
}

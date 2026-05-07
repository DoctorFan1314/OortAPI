"use client";

import { useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";

export function HtmlLangUpdater() {
  const { lang } = useI18n();
  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en-US" : "zh-CN";
  }, [lang]);
  return null;
}

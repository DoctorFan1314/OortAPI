"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

export function ScrollToTop() {
  const [show, setShow] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    function handleScroll() {
      setShow(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
      aria-label={t.common.backToTop}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}

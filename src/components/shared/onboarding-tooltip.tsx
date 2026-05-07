"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, Sparkles, Compass, Search } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useI18n } from "@/contexts/i18n-context";

const STEPS = [
  { targetId: "hero-section", icon: Sparkles },
  { targetId: "featured-section", icon: Compass },
  { targetId: "search-trigger", icon: Search },
] as const;

export function OnboardingTooltip() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const stepTexts = [
    { title: t.onboarding.step1Title, desc: t.onboarding.step1Desc },
    { title: t.onboarding.step2Title, desc: t.onboarding.step2Desc },
    { title: t.onboarding.step3Title, desc: t.onboarding.step3Desc },
  ];

  const positionTooltip = useCallback((idx: number) => {
    const stepDef = STEPS[idx];
    if (!stepDef) return;
    const el = document.getElementById(stepDef.targetId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const gap = 16;

    setTargetRect({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    });

    // Position tooltip below the target element by default
    const tooltipTop = rect.bottom + window.scrollY + gap;
    const tooltipLeft = rect.left + window.scrollX + rect.width / 2;

    // Clamp so tooltip stays on screen
    const clampedLeft = Math.max(200, Math.min(tooltipLeft, window.innerWidth - 200));

    setTooltipPos({ top: tooltipTop, left: clampedLeft });
  }, []);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEYS.onboardingCompleted);
      if (completed) return;
    } catch {
      // localStorage not available
    }

    // Small delay to let the page render
    const timer = setTimeout(() => {
      setVisible(true);
      positionTooltip(0);
    }, 800);

    return () => clearTimeout(timer);
  }, [positionTooltip]);

  useEffect(() => {
    if (!visible) return;
    positionTooltip(step);
  }, [step, visible, positionTooltip]);

  // Reposition on scroll / resize
  useEffect(() => {
    if (!visible) return;
    const handler = () => positionTooltip(step);
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [visible, step, positionTooltip]);

  const handleSkip = useCallback(() => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true"); } catch {}
  }, []);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setVisible(false);
      try { localStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true"); } catch {}
    }
  }, [step]);

  if (!visible) return null;

  const currentStep = STEPS[step];
  const Icon = currentStep.icon;
  const isLast = step === STEPS.length - 1;
  const { title, desc } = stepTexts[step];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" aria-live="polite">
      {/* Overlay mask */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-auto" onClick={handleSkip} />

      {/* Highlight cutout for target element */}
      <div
        className="absolute pointer-events-none rounded-xl transition-all duration-500 ease-out"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
          borderRadius: "12px",
        }}
      />

      {/* Tooltip card */}
      <div
        className="absolute pointer-events-auto w-[360px] max-w-[calc(100vw-40px)] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <div className="glass-card p-6 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {step + 1} / {STEPS.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t.onboarding.skip}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{desc}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              {t.onboarding.skip}
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
            >
              {isLast ? t.onboarding.finish : t.onboarding.next}
              {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

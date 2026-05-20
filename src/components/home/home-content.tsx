"use client";

import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { ModelWall } from "@/components/home/model-wall";
import { WhyOortapi } from "@/components/home/why-oortapi";
import { TokenPlanSummary } from "@/components/home/token-plan-summary";
import { CTASection } from "@/components/home/cta-section";
import { useI18n } from "@/contexts/i18n-context";
import { useScrollIn } from "@/lib/use-scroll-in";

function ScrollSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollIn<HTMLDivElement>();
  return (
    <div ref={ref} className={`scroll-in ${visible ? "visible" : ""} ${className}`}>
      {children}
    </div>
  );
}

function GradientDivider() {
  return (
    <div className="h-12 bg-gradient-to-b from-background via-muted/[0.03] to-background pointer-events-none select-none" aria-hidden="true" />
  );
}

export function HomeContent() {
  const { lang } = useI18n();

  return (
    <>
      <Hero />
      <ScrollSection><Features lang={lang} /></ScrollSection>
      <GradientDivider />
      <ScrollSection><ModelWall lang={lang} /></ScrollSection>
      <GradientDivider />
      <ScrollSection><WhyOortapi lang={lang} /></ScrollSection>
      <GradientDivider />
      <ScrollSection><TokenPlanSummary lang={lang} /></ScrollSection>
      <GradientDivider />
      <ScrollSection><CTASection lang={lang} /></ScrollSection>
    </>
  );
}

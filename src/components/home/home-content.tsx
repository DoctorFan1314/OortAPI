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

export function HomeContent() {
  const { lang } = useI18n();

  return (
    <>
      <Hero />
      <ScrollSection><Features lang={lang} /></ScrollSection>
      <ScrollSection><ModelWall lang={lang} /></ScrollSection>
      <ScrollSection><WhyOortapi lang={lang} /></ScrollSection>
      <ScrollSection><TokenPlanSummary lang={lang} /></ScrollSection>
      <ScrollSection><CTASection lang={lang} /></ScrollSection>
    </>
  );
}

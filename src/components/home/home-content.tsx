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
  return <div className="h-8 pointer-events-none select-none" aria-hidden="true" />;
}

export function HomeContent() {
  const { lang } = useI18n();

  return (
    <div className="relative">
      {/* Persistent page-level gradient background matching Hero style */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] bg-primary/[0.06] rounded-full blur-[150px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

      <div className="relative">
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
      </div>
    </div>
  );
}

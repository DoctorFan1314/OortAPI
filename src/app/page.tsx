"use client";

import { useState } from "react";
import { Hero } from "@/components/home/hero";
import { FeaturedSection } from "@/components/home/featured-section";
import { CategoryCards } from "@/components/home/category-cards";
import { Testimonials } from "@/components/home/testimonials";
import { ParticleBackground } from "@/components/shared/particle-bg";
import { JsonLd, generateOrganizationJsonLd, generateWebSiteJsonLd } from "@/components/shared/json-ld";
import { OnboardingTooltip } from "@/components/shared/onboarding-tooltip";

export default function HomePage() {
  const [tab, setTab] = useState<"agent" | "prompt">("agent");

  return (
    <>
      <JsonLd data={generateOrganizationJsonLd()} />
      <JsonLd data={generateWebSiteJsonLd()} />
      <ParticleBackground />
      <OnboardingTooltip />
      <Hero />
      <FeaturedSection tab={tab} onTabChange={setTab} />
      <CategoryCards tab={tab} />
      <Testimonials />
    </>
  );
}

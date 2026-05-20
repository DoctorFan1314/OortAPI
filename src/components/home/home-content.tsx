"use client";

import { useState } from "react";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { ModelWall } from "@/components/home/model-wall";
import { PlatformStats } from "@/components/home/platform-stats";
import { ResourceHub } from "@/components/home/resource-hub";
import { Testimonials } from "@/components/home/testimonials";
import { FeaturedSection } from "@/components/home/featured-section";
import { PricingSection } from "@/components/home/pricing-section";
import { useI18n } from "@/contexts/i18n-context";

export function HomeContent() {
  const { lang } = useI18n();
  const [featuredTab, setFeaturedTab] = useState<"agent" | "prompt">("agent");

  return (
    <>
      <Hero />
      <Features lang={lang} />
      <FeaturedSection tab={featuredTab} onTabChange={setFeaturedTab} />
      <ModelWall lang={lang} />
      <PricingSection lang={lang} />
      <PlatformStats lang={lang} />
      <Testimonials />
      <ResourceHub lang={lang} />
    </>
  );
}

"use client";

import { useState } from "react";
import { Hero } from "@/components/home/hero";
import { FeaturedSection } from "@/components/home/featured-section";
import { CategoryCards } from "@/components/home/category-cards";
import { Testimonials } from "@/components/home/testimonials";
import { ParticleBackground } from "@/components/shared/particle-bg";

export default function HomePage() {
  const [tab, setTab] = useState<"agent" | "prompt">("agent");

  return (
    <>
      <ParticleBackground />
      <Hero />
      <FeaturedSection tab={tab} onTabChange={setTab} />
      <CategoryCards tab={tab} />
      <Testimonials />
    </>
  );
}

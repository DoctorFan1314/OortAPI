"use client";

import { useState } from "react";
import { Hero } from "@/components/home/hero";
import { FeaturedSection } from "@/components/home/featured-section";
import { CategoryCards } from "@/components/home/category-cards";
import { Testimonials } from "@/components/home/testimonials";

export default function HomePage() {
  const [tab, setTab] = useState<"agent" | "prompt">("agent");

  return (
    <>
      <Hero />
      <FeaturedSection tab={tab} onTabChange={setTab} />
      <CategoryCards tab={tab} />
      <Testimonials />
    </>
  );
}

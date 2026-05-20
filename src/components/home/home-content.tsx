"use client";

import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { ModelWall } from "@/components/home/model-wall";
import { PlatformStats } from "@/components/home/platform-stats";
import { ResourceHub } from "@/components/home/resource-hub";
import { useI18n } from "@/contexts/i18n-context";

export function HomeContent() {
  const { lang } = useI18n();

  return (
    <>
      <Hero />
      <Features lang={lang} />
      <ModelWall lang={lang} />
      <PlatformStats lang={lang} />
      <ResourceHub lang={lang} />
    </>
  );
}

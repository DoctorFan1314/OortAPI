import { HomeContent } from "@/components/home/home-content";
import { LazyParticleBackground } from "@/components/shared/lazy-particle-bg";
import { JsonLd, generateOrganizationJsonLd, generateWebSiteJsonLd } from "@/components/shared/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd data={generateOrganizationJsonLd()} />
      <JsonLd data={generateWebSiteJsonLd()} />
      <LazyParticleBackground />
      <div className="relative z-10">
        <HomeContent />
      </div>
    </>
  );
}

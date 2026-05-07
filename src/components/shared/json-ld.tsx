export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function generateSkillJsonLd(skill: { id: string; name: string; title: string; description: string; author: string; stars: number; downloads: number; version: string; license: string; lastUpdated: string; tags: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": skill.title || skill.name,
    "description": skill.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform",
    "author": { "@type": "Person", "name": skill.author },
    "version": skill.version,
    "license": skill.license,
    "dateModified": skill.lastUpdated,
    "keywords": skill.tags.join(", "),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": Math.min(5, Math.max(1, skill.stars / 1000)),
      "bestRating": 5,
      "worstRating": 1,
      "ratingCount": skill.downloads,
    },
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  };
}

export function generatePromptJsonLd(prompt: { id: string; title: string; subtitle: string; category: string; rating: number; usageCount: number; difficulty: string; tags: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": prompt.title,
    "description": prompt.subtitle,
    "genre": prompt.category,
    "keywords": prompt.tags.join(", "),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": prompt.rating,
      "bestRating": 5,
      "worstRating": 1,
      "ratingCount": prompt.usageCount,
    },
  };
}

export function generateBreadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      ...(item.url ? { "item": item.url } : {}),
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AI Skills Hub",
    "url": "https://ai-skills-hub.vercel.app",
    "description": "Discover executable Agent Skills and high-quality Prompt Templates",
    "sameAs": [],
  };
}

export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI Skills Hub",
    "url": "https://ai-skills-hub.vercel.app",
    "description": "Agent Skills Marketplace + Prompt Template Platform",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://ai-skills-hub.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

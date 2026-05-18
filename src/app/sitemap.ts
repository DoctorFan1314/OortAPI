import type { MetadataRoute } from "next";
import { skills } from "@/lib/mock-data";
import { agentSkills } from "@/lib/mock-agent-skills";
import { categories } from "@/lib/categories";
import { agentSkillCategories } from "@/lib/agent-skill-categories";
import { getAllTags } from "@/lib/tag-utils";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const staticPages = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/prompts`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/skills`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/skills/compare`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/trending`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/tags`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${base}/guide`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/submit`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${base}/models`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/docs`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/docs/quickstart`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/docs/authentication`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/docs/endpoints`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/docs/sdk`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/docs/streaming`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/docs/pricing`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/docs/errors`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/docs/rate-limits`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/docs/integrations`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/docs/deployment`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/docs/api-reference`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/changelog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/token-plan`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/resources`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const promptPages = skills.map((s) => ({
    url: `${base}/prompts/${s.id}`,
    lastModified: new Date(s.lastUpdated.replace(/\./g, "-").replace(/^(\d{4})-(\d{2})$/, "$1-$2-01")),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const agentSkillPages = agentSkills.map((s) => ({
    url: `${base}/skills/${s.id}`,
    lastModified: new Date(s.lastUpdated),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryPages = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const tags = getAllTags();
  const tagPages = tags.map((t) => ({
    url: `${base}/tags/${encodeURIComponent(t.tag)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const agentCategoryPages = agentSkillCategories.map((c) => ({
    url: `${base}/skills?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...promptPages, ...agentSkillPages, ...categoryPages, ...agentCategoryPages, ...tagPages];
}

import type { MetadataRoute } from "next";
import { skills } from "@/lib/mock-data";
import { agentSkills } from "@/lib/mock-agent-skills";
import { categories } from "@/lib/categories";
import { getAllTags } from "@/lib/tag-utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-skills-hub.vercel.app";

  const staticPages = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/prompts`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/skills`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/trending`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/tags`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${base}/guide`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/submit`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
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

  return [...staticPages, ...promptPages, ...agentSkillPages, ...categoryPages, ...tagPages];
}

import type { MetadataRoute } from "next";
import { skills } from "@/lib/mock-data";
import { categories } from "@/lib/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ai-skills-hub.vercel.app";

  const staticPages = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/skills`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/guide`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${base}/submit`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  const skillPages = skills.map((s) => ({
    url: `${base}/skills/${s.id}`,
    lastModified: new Date(s.lastUpdated.replace(/\./g, "-") + "-01"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryPages = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...skillPages, ...categoryPages];
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSkillById } from "@/lib/mock-data";
import SkillDetailClient from "./client";
import { JsonLd, generatePromptJsonLd, generateBreadcrumbJsonLd } from "@/components/shared/json-ld";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const skill = getSkillById(id);
  if (!skill) return { title: "Prompt 未找到 — AI Skills Hub" };
  return {
    title: `${skill.title} — AI Skills Hub`,
    description: skill.subtitle,
    openGraph: {
      title: `${skill.title} — AI Skills Hub`,
      description: skill.subtitle,
      url: `https://ai-skills-hub.vercel.app/prompts/${id}`,
      type: "article",
    },
    twitter: { card: "summary_large_image", title: `${skill.title} — AI Skills Hub` },
    alternates: { canonical: `https://ai-skills-hub.vercel.app/prompts/${id}` },
  };
}

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = getSkillById(id);
  if (!skill) notFound();

  const promptJsonLd = generatePromptJsonLd({
    id: skill.id,
    title: skill.title,
    subtitle: skill.subtitle,
    category: skill.category,
    rating: skill.rating,
    usageCount: skill.usageCount,
    difficulty: skill.difficulty,
    tags: skill.tags,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://ai-skills-hub.vercel.app" },
    { name: "Prompts", url: "https://ai-skills-hub.vercel.app/prompts" },
    { name: skill.title },
  ]);

  return (
    <>
      <JsonLd data={promptJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <SkillDetailClient id={id} />
    </>
  );
}

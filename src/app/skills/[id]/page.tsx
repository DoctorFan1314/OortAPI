import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgentSkillById } from "@/lib/mock-agent-skills";
import AgentSkillDetailClient from "./client";
import { JsonLd, generateSkillJsonLd, generateBreadcrumbJsonLd } from "@/components/shared/json-ld";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const skill = getAgentSkillById(id);
  if (!skill) return { title: "技能未找到 — AI Skills Hub" };
  return {
    title: `${skill.name} — AI Skills Hub`,
    description: skill.description.split("\n").find(l => l && !l.startsWith("#") && !l.startsWith("-"))?.slice(0, 160) || "",
    openGraph: {
      title: `${skill.name} — AI Skills Hub`,
      description: skill.description.split("\n").find(l => l && !l.startsWith("#") && !l.startsWith("-"))?.slice(0, 300) || "",
      url: `https://ai-skills-hub.vercel.app/skills/${id}`,
      type: "article",
    },
    twitter: { card: "summary_large_image", title: `${skill.name} — AI Skills Hub` },
    alternates: { canonical: `https://ai-skills-hub.vercel.app/skills/${id}` },
  };
}

export default async function AgentSkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = getAgentSkillById(id);
  if (!skill) notFound();

  const skillJsonLd = generateSkillJsonLd({
    id: skill.id,
    name: skill.name,
    title: skill.title,
    description: skill.description.split("\n").find(l => l && !l.startsWith("#") && !l.startsWith("-"))?.slice(0, 300) || "",
    author: skill.author,
    stars: skill.stars,
    downloads: skill.downloads,
    version: skill.version,
    license: skill.license,
    lastUpdated: skill.lastUpdated,
    tags: skill.tags,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "https://ai-skills-hub.vercel.app" },
    { name: "Skills", url: "https://ai-skills-hub.vercel.app/skills" },
    { name: skill.name },
  ]);

  return (
    <>
      <JsonLd data={skillJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <AgentSkillDetailClient id={id} />
    </>
  );
}

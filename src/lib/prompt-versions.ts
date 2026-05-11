import { skills } from "@/lib/mock-data";
import type { Skill, PromptVersion } from "@/lib/types";

const VERSION_KEY_PREFIX = "ai-skills-hub-versions-";

export type { PromptVersion };

export function getVersions(skillId: string): PromptVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${VERSION_KEY_PREFIX}${skillId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function initVersionForSkill(skill: Skill): void {
  if (typeof window === "undefined") return;
  const key = `${VERSION_KEY_PREFIX}${skill.id}`;
  const existing = localStorage.getItem(key);
  if (existing) return;
  const initial: PromptVersion = {
    id: `${skill.id}-v0`,
    skillId: skill.id,
    version: skill.version,
    changelog: "Initial version",
    updatedAt: skill.lastUpdated,
  };
  localStorage.setItem(key, JSON.stringify([initial]));
}

export function getAllVersions(): Map<string, PromptVersion[]> {
  const map = new Map<string, PromptVersion[]>();
  for (const skill of skills) {
    map.set(skill.id, getVersions(skill.id));
  }
  return map;
}

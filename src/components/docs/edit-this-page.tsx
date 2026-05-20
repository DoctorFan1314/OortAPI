"use client";

import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";

const GITHUB_BASE = "https://github.com/DoctorFan1314/OortAPI/tree/main/src/app";

export function EditThisPage() {
  const pathname = usePathname();
  const { lang } = useI18n();

  // Map pathname to GitHub file path
  const filePath = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const githubUrl = `${GITHUB_BASE}${filePath}/page.tsx`;

  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      {lang === "zh" ? "在 GitHub 上编辑此页" : "Edit this page on GitHub"}
    </a>
  );
}

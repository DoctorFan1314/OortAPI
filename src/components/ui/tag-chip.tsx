"use client";
import Link from "next/link";

interface TagChipProps {
  tag: string;
  className?: string;
}

export function TagChip({ tag, className = "" }: TagChipProps) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className={`inline-flex text-xs px-2 py-1.5 min-h-[44px] items-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      {tag}
    </Link>
  );
}

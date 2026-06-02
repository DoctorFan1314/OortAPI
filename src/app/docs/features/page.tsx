import type { Metadata } from "next";
import { FeaturesContent } from "./client";

export const metadata: Metadata = {
  title: "Features — OortAPI Docs",
  description: "Overview of OortAPI relay capabilities: streaming, tool calling, structured outputs, vision, prompt caching, and model routing.",
  alternates: {
    canonical: "/docs/features",
  },
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}

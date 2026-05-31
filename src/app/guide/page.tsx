import type { Metadata } from "next";
import GuideClient from "./client";

export const metadata: Metadata = {
  title: "Getting Started Guide — OortAPI",
  description: "Get started with OortAPI in 3 minutes. Learn about prompts, agent skills, and AI integration.",
};

export default function GuidePage() {
  return <GuideClient />;
}

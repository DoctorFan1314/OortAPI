import type { Metadata } from "next";
import { PlaygroundContent } from "./client";

export const metadata: Metadata = {
  title: "API Playground — OortAPI Docs",
  description:
    "Learn how to use the interactive API Playground to test models, tune parameters, and debug conversations.",
  alternates: {
    canonical: "/docs/playground",
  },
};

export default function PlaygroundPage() {
  return <PlaygroundContent />;
}

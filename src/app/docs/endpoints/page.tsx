import type { Metadata } from "next";
import { EndpointsContent } from "./client";

export const metadata: Metadata = {
  title: "API Endpoints — OortAPI Docs",
  description: "Complete API endpoint reference for chat completions, messages, embeddings, image generation, billing, and user management.",
  alternates: {
    canonical: "/docs/endpoints",
  },
};

export default function EndpointsPage() {
  return <EndpointsContent />;
}

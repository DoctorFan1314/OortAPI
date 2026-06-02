import type { Metadata } from "next";
import { StreamingContent } from "./client";

export const metadata: Metadata = {
  title: "Streaming — OortAPI Docs",
  description: "Implement real-time streaming with OpenAI SSE and Anthropic SSE protocols. SDK examples for Python and Node.js.",
  alternates: {
    canonical: "/docs/streaming",
  },
};

export default function StreamingPage() {
  return <StreamingContent />;
}

import type { Metadata } from "next";
import { SdkContent } from "./client";

export const metadata: Metadata = {
  title: "SDK Integration — OortAPI Docs",
  description: "Integrate OortAPI with OpenAI SDK, Anthropic SDK, LangChain, Vercel AI SDK, and more. Python and Node.js examples.",
  alternates: {
    canonical: "/docs/sdk",
  },
};

export default function SdkPage() {
  return <SdkContent />;
}

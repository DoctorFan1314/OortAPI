import type { Metadata } from "next";
import ClientPage from "./client";

export const metadata: Metadata = {
  title: "Model Marketplace — OortAPI",
  description: "Browse and compare 20+ AI models including GPT-4o, Claude, Gemini, DeepSeek with transparent pricing and real-time availability.",
};

export default function Page() {
  return <ClientPage />;
}

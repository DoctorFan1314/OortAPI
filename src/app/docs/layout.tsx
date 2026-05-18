import type { Metadata } from "next";
import { DocsSidebar } from "@/components/docs/sidebar";

export const metadata: Metadata = {
  title: "API Documentation — OortAPI",
  description: "OortAPI unified AI API relay platform documentation — quick start, API endpoints, SDK integration, pricing, and deployment guides.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <DocsSidebar />
        <main className="flex-1 min-w-0 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}

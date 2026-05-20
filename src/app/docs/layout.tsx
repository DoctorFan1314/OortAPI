import type { Metadata } from "next";
import { DocsSidebar } from "@/components/docs/sidebar";
import { EditThisPage } from "@/components/docs/edit-this-page";
import { LastUpdated } from "@/components/docs/last-updated";

export const metadata: Metadata = {
  title: "API Documentation — OortAPI",
  description: "Complete OortAPI unified AI API relay platform documentation — quick start guides, API endpoints reference, OpenAI & Anthropic SDK integration, streaming, cache-aware pricing tiers, error codes, rate limits, and deployment instructions.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <DocsSidebar />
        <main className="flex-1 min-w-0 max-w-5xl">
          {children}
          <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
            <EditThisPage />
            <LastUpdated />
          </div>
        </main>
      </div>
    </div>
  );
}

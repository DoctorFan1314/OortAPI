import type { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "./client";

export const metadata: Metadata = {
  title: "Search — AI Skills Hub",
  description: "Search across Agent Skills and Prompt Templates",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 animate-pulse">
          <div className="h-8 w-48 bg-secondary rounded mb-6" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-secondary rounded-lg" />
            ))}
          </div>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}

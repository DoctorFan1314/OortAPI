import type { Metadata } from "next";
import { Suspense } from "react";
import UserProfileClient from "./client";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${decodeURIComponent(username)} — AI Skills Hub`,
    description: `View ${decodeURIComponent(username)}'s profile, published skills, and contributions on AI Skills Hub`,
    openGraph: {
      title: `@${decodeURIComponent(username)} — AI Skills Hub`,
      description: `View ${decodeURIComponent(username)}'s profile, published skills, and contributions`,
    },
  };
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-12 lg:px-8 animate-pulse"><div className="flex items-center gap-4 mb-8"><div className="h-20 w-20 bg-secondary rounded-full" /><div className="space-y-2"><div className="h-6 w-48 bg-secondary rounded" /><div className="h-4 w-32 bg-secondary rounded" /></div></div><div className="h-64 bg-secondary rounded-lg" /></div>}>
      <UserProfileClient username={decodeURIComponent(username)} />
    </Suspense>
  );
}

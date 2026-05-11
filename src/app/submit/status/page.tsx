import type { Metadata } from "next";
import { Suspense } from "react";
import SubmitStatusClient from "./client";

export const metadata: Metadata = {
  title: "Submission Status — AI Skills Hub",
  description: "View your template submission history and review status",
};

export default function SubmitStatusPage() {
  return (
    <Suspense>
      <SubmitStatusClient />
    </Suspense>
  );
}

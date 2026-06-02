import type { Metadata } from "next";
import { DeploymentContent } from "./client";

export const metadata: Metadata = {
  title: "Deployment — OortAPI Docs",
  description: "Deploy OortAPI with Docker, VPS, or Nginx. Includes environment variable reference, PM2 setup, and data backup instructions.",
  alternates: {
    canonical: "/docs/deployment",
  },
};

export default function DeploymentPage() {
  return <DeploymentContent />;
}

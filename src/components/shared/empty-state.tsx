import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void } | { label: string; href: string };
  variant?: "default" | "search" | "keys" | "data";
}

const BG_GRADIENTS: Record<string, string> = {
  search: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.06), transparent 70%)",
  keys: "radial-gradient(ellipse at 50% 50%, rgba(234,179,8,0.06), transparent 70%)",
  data: "radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.06), transparent 70%)",
};

const BG_DOTS = (variant: string) => variant !== "default" ? `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='0.8' fill='%23currentColor' opacity='0.08'/%3E%3C/svg%3E")` : "none";

export function EmptyState({ icon: Icon, title, description, action, variant = "default" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-page-fade-in relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: BG_GRADIENTS[variant] || BG_GRADIENTS.default }} />
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: BG_DOTS(variant), backgroundRepeat: "repeat" }} />
      {/* Content */}
      <div className="relative">
        {Icon && (
          <div className="relative mb-4 inline-flex">
            <div className={`absolute inset-0 blur-xl opacity-30 ${variant === "search" ? "bg-blue-500" : variant === "keys" ? "bg-amber-500" : variant === "data" ? "bg-emerald-500" : "bg-primary"}`} />
            <Icon className={`h-12 w-12 text-muted-foreground/40 relative ${variant !== "default" ? "drop-shadow-sm" : ""}`} />
          </div>
        )}
        <h3 className="text-base font-medium text-foreground mb-1">{title}</h3>
        {description && <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">{description}</p>}
        {action && (
          "href" in action ? (
            <Link href={action.href}>
              <Button variant="outline" size="sm">{action.label}</Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" onClick={action.onClick}>{action.label}</Button>
          )
        )}
      </div>
    </div>
  );
}

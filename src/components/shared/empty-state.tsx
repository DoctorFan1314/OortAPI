import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void } | { label: string; href: string };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/30 mb-4" />}
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
  );
}

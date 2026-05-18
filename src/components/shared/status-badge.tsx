interface StatusBadgeProps {
  variant: "success" | "error" | "warning" | "info" | "muted";
  label: string;
}

const variantMap: Record<StatusBadgeProps["variant"], string> = {
  success: "bg-green-500/10 text-green-500",
  error: "bg-red-500/10 text-red-500",
  warning: "bg-amber-500/10 text-amber-500",
  info: "bg-blue-500/10 text-blue-500",
  muted: "bg-muted text-muted-foreground",
};

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${variantMap[variant]}`}>
      {label}
    </span>
  );
}

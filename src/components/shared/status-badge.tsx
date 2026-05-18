interface StatusBadgeProps {
  variant: "success" | "error" | "warning" | "info" | "muted";
  label: string;
}

const variantMap: Record<StatusBadgeProps["variant"], string> = {
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
  error: "bg-red-500/10 text-red-600 dark:text-red-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  muted: "bg-muted text-muted-foreground",
};

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full transition-colors duration-200 ${variantMap[variant]}`}>
      {label}
    </span>
  );
}

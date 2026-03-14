import { cn, STATUS_CONFIG, type Status } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as Status];

  if (!config) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-medium"
        style={{ color: "var(--muted-foreground)" }}
      >
        <span className="h-2 w-2 rounded-full bg-gray-400" />
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={cn("h-2 w-2 rounded-full", config.dotClass)} />
      <span style={{ color: "var(--muted-foreground)" }}>{config.label}</span>
    </span>
  );
}

import { cn, STATUS_CONFIG, type Status } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as Status];

  if (!config) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
        style={{
          backgroundColor: "color-mix(in srgb, gray 12%, transparent)",
          color: "var(--muted-foreground)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        {status}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
        color: config.color,
      }}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Flame, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "trending", label: "Trending", icon: Flame },
  { value: "top", label: "Top Voted", icon: TrendingUp },
  { value: "new", label: "New", icon: Sparkles },
] as const;

export default function SortTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "trending";

  function handleSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "trending") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className="inline-flex rounded-lg border p-1 gap-1"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--muted)",
      }}
    >
      {SORT_OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = currentSort === value;
        return (
          <button
            key={value}
            onClick={() => handleSort(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium",
              "transition-all active:scale-[0.97]"
            )}
            style={{
              backgroundColor: isActive ? "var(--card)" : "transparent",
              color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
              boxShadow: isActive
                ? "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"
                : "none",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

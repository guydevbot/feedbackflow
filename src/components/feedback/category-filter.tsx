"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn, STATUS_CONFIG, type Status } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  current: string | null;
  currentStatus: string | null;
}

export default function CategoryFilter({
  categories,
  current,
  currentStatus,
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Category filter */}
      <div>
        <h4
          className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--muted-foreground)" }}
        >
          Category
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setParam("category", null)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all",
              "hover:opacity-80 active:scale-[0.97]"
            )}
            style={{
              borderColor: !current ? "var(--primary)" : "var(--border)",
              backgroundColor: !current ? "var(--accent)" : "transparent",
              color: !current ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            All
          </button>
          {categories.map((cat) => {
            const isActive = current === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setParam("category", isActive ? null : cat.slug)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all",
                  "hover:opacity-80 active:scale-[0.97]"
                )}
                style={{
                  borderColor: isActive ? cat.color : "var(--border)",
                  backgroundColor: isActive
                    ? `color-mix(in srgb, ${cat.color} 10%, transparent)`
                    : "transparent",
                  color: isActive ? cat.color : "var(--muted-foreground)",
                  boxShadow: isActive
                    ? `0 0 0 1px ${cat.color}`
                    : "none",
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <hr style={{ borderColor: "var(--border)" }} />

      {/* Status filter */}
      <div>
        <h4
          className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--muted-foreground)" }}
        >
          Status
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setParam("status", null)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all",
              "hover:opacity-80 active:scale-[0.97]"
            )}
            style={{
              borderColor: !currentStatus ? "var(--primary)" : "var(--border)",
              backgroundColor: !currentStatus ? "var(--accent)" : "transparent",
              color: !currentStatus ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            All
          </button>
          {(Object.entries(STATUS_CONFIG) as [Status, (typeof STATUS_CONFIG)[Status]][]).map(
            ([key, config]) => {
              const isActive = currentStatus === key;
              return (
                <button
                  key={key}
                  onClick={() => setParam("status", isActive ? null : key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                    "transition-all hover:opacity-80 active:scale-[0.97]"
                  )}
                  style={{
                    borderColor: isActive ? config.color : "var(--border)",
                    backgroundColor: isActive
                      ? `color-mix(in srgb, ${config.color} 10%, transparent)`
                      : "transparent",
                    color: isActive ? config.color : "var(--muted-foreground)",
                    boxShadow: isActive
                      ? `0 0 0 1px ${config.color}`
                      : "none",
                  }}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
                  {config.label}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

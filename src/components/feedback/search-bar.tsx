"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const updateSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set("search", term);
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSearch(newValue);
    }, 300);
  }

  function handleClear() {
    setValue("");
    updateSearch("");
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
        style={{ color: "var(--muted-foreground)" }}
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search ideas..."
        className={cn(
          "w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm outline-none",
          "transition-all placeholder:text-[var(--muted-foreground)]",
          "focus:ring-2"
        )}
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--muted)",
          color: "var(--foreground)",
          ringColor: "var(--primary)",
        } as React.CSSProperties}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 transition-colors hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

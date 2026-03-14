"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Lightbulb, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface DuplicateIdea {
  id: string;
  title: string;
  voteCount: number;
  status: string;
}

interface SubmitIdeaButtonProps {
  categories: Category[];
}

export default function SubmitIdeaButton({ categories }: SubmitIdeaButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateIdea[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setCategoryId("");
    setError(null);
    setDuplicates([]);
  }, []);

  function openModal() {
    setIsOpen(true);
    resetForm();
  }

  function closeModal() {
    setIsOpen(false);
    resetForm();
  }

  // Close on escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Duplicate detection
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (title.trim().length < 3) {
      setDuplicates([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/feedback?search=${encodeURIComponent(title.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setDuplicates(
            (data.ideas ?? data ?? []).slice(0, 3).map((idea: DuplicateIdea) => ({
              id: idea.id,
              title: idea.title,
              voteCount: idea.voteCount,
              status: idea.status,
            }))
          );
        }
      } catch {
        // Silently ignore duplicate detection errors
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          categoryId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to submit idea");
      }

      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={openModal}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold",
          "transition-all hover:opacity-90 active:scale-[0.97] shadow-md hover:shadow-lg"
        )}
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        <Plus className="h-4 w-4" />
        Submit Idea
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <div
            ref={modalRef}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-2xl border p-6 shadow-xl",
              "animate-in fade-in zoom-in-95"
            )}
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" style={{ color: "var(--primary)" }} />
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Submit an Idea
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 transition-colors hover:opacity-70"
                style={{ color: "var(--muted-foreground)" }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="idea-title"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Title
                </label>
                <input
                  id="idea-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="A short, descriptive title"
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-sm outline-none",
                    "transition-all focus:ring-2"
                  )}
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--muted)",
                    color: "var(--foreground)",
                    ringColor: "var(--primary)",
                  } as React.CSSProperties}
                />

                {/* Duplicate suggestions */}
                {duplicates.length > 0 && (
                  <div
                    className="mt-2 rounded-lg border p-3"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--accent)",
                    }}
                  >
                    <p
                      className="mb-2 text-xs font-medium"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Similar ideas already exist:
                    </p>
                    <ul className="space-y-1.5">
                      {duplicates.map((dup) => (
                        <li key={dup.id}>
                          <a
                            href={`/feedback/${dup.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-md px-2 py-1.5 text-sm transition-colors hover:opacity-80"
                            style={{ color: "var(--primary)" }}
                          >
                            {dup.title}
                            <span
                              className="ml-2 text-xs"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              {dup.voteCount} votes
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="idea-description"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Description
                </label>
                <textarea
                  id="idea-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your idea in detail..."
                  rows={4}
                  className={cn(
                    "w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none",
                    "transition-all focus:ring-2"
                  )}
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--muted)",
                    color: "var(--foreground)",
                    ringColor: "var(--primary)",
                  } as React.CSSProperties}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="idea-category"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Category
                </label>
                <select
                  id="idea-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-sm outline-none",
                    "transition-all focus:ring-2 appearance-none"
                  )}
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--muted)",
                    color: categoryId ? "var(--foreground)" : "var(--muted-foreground)",
                    ringColor: "var(--primary)",
                  } as React.CSSProperties}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm" style={{ color: "var(--destructive, #ef4444)" }}>
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium",
                    "transition-all hover:opacity-80"
                  )}
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-md",
                    "transition-all hover:opacity-90 active:scale-[0.97]",
                    "disabled:opacity-50 disabled:pointer-events-none"
                  )}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Submitting..." : "Submit Idea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

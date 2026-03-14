"use client";

import { useState } from "react";

export function CommentForm({ feedbackId }: { feedbackId: string }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/feedback/${feedbackId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to post comment");
        return;
      }

      setContent("");
      // Refresh page to show new comment
      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts..."
        rows={3}
        maxLength={1000}
        className="w-full resize-none rounded-lg border p-3 text-sm outline-none transition-colors focus:ring-2"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          // @ts-expect-error CSS custom property
          "--tw-ring-color": "var(--primary)",
        }}
      />
      {error && (
        <p className="mt-1 text-xs" style={{ color: "var(--destructive)" }}>
          {error}
        </p>
      )}
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
}

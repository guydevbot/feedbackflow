"use client";

import { useState } from "react";

export function VoteButton({
  feedbackId,
  initialCount,
}: {
  feedbackId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleVote() {
    setLoading(true);
    try {
      const res = await fetch(`/api/feedback/${feedbackId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setCount(data.voteCount);
        setVoted(data.voted);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className="flex flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-all hover:shadow-sm disabled:opacity-50"
      style={{
        borderColor: voted ? "var(--primary)" : "var(--border)",
        backgroundColor: voted ? "var(--accent)" : "var(--background)",
        minWidth: "56px",
      }}
    >
      <svg
        className="h-4 w-4"
        fill={voted ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        style={{ color: voted ? "var(--primary)" : "var(--muted-foreground)" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 15l7-7 7 7"
        />
      </svg>
      <span
        className="text-sm font-bold"
        style={{ color: voted ? "var(--primary)" : "var(--foreground)" }}
      >
        {count}
      </span>
    </button>
  );
}

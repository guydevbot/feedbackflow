"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, MessageCircle, Clock } from "lucide-react";
import { cn, STATUS_CONFIG, timeAgo, type Status } from "@/lib/utils";

interface Idea {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  voteCount: number;
  commentCount: number;
  createdAt: string | Date;
  authorName: string | null;
}

export default function IdeaCard({ idea }: { idea: Idea }) {
  const router = useRouter();
  const [votes, setVotes] = useState(idea.voteCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const statusConfig = STATUS_CONFIG[idea.status as Status] ?? STATUS_CONFIG.under_review;

  async function handleVote(e: React.MouseEvent) {
    e.stopPropagation();
    if (isVoting) return;
    setIsVoting(true);
    const prev = { votes, hasVoted };
    setVotes(hasVoted ? votes - 1 : votes + 1);
    setHasVoted(!hasVoted);
    try {
      const res = await fetch(`/api/feedback/${idea.id}/vote`, { method: "POST" });
      if (!res.ok) { setVotes(prev.votes); setHasVoted(prev.hasVoted); }
    } catch { setVotes(prev.votes); setHasVoted(prev.hasVoted); }
    finally { setIsVoting(false); }
  }

  return (
    <div
      onClick={() => router.push(`/feedback/${idea.id}`)}
      style={{
        display: "flex",
        gap: "20px",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        backgroundColor: "var(--card)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.05)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Vote Button */}
      <button
        onClick={handleVote}
        disabled={isVoting}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          minWidth: "68px",
          padding: "16px 12px",
          borderRadius: "14px",
          border: hasVoted ? "none" : "2px solid var(--border)",
          background: hasVoted
            ? "linear-gradient(135deg, #4338ca, #6366f1)"
            : "var(--muted)",
          color: hasVoted ? "#ffffff" : "var(--muted-foreground)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}
      >
        <ChevronUp
          style={{ width: 20, height: 20, transition: "transform 0.2s" }}
        />
        <span style={{ fontSize: "14px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {votes}
        </span>
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Title */}
        <h3 style={{
          fontSize: "16px",
          fontWeight: 600,
          lineHeight: 1.4,
          color: "var(--foreground)",
          letterSpacing: "-0.01em",
        }}>
          {idea.title}
        </h3>

        {/* Description */}
        {idea.description && (
          <p className="line-clamp-2" style={{
            fontSize: "14px",
            lineHeight: 1.6,
            color: "var(--muted-foreground)",
          }}>
            {idea.description}
          </p>
        )}

        {/* Meta row */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "10px",
          paddingTop: "12px",
          marginTop: "auto",
          borderTop: "1px solid var(--border)",
        }}>
          {/* Category badge */}
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 500,
            backgroundColor: "var(--accent)",
            color: "var(--primary)",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              backgroundColor: "var(--primary)",
              flexShrink: 0,
            }} />
            {idea.category}
          </span>

          {/* Status pill */}
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 500,
            backgroundColor: `color-mix(in srgb, ${statusConfig.color} 15%, var(--card))`,
            color: statusConfig.color,
          }}>
            <span className={cn("rounded-full", statusConfig.dotClass)}
              style={{ width: 8, height: 8, flexShrink: 0 }} />
            {statusConfig.label}
          </span>

          {/* Spacer */}
          <span style={{ flex: 1 }} />

          {/* Time */}
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--muted-foreground)" }}>
            <Clock style={{ width: 14, height: 14 }} />
            {timeAgo(new Date(idea.createdAt))}
          </span>

          {/* Comments */}
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--muted-foreground)" }}>
            <MessageCircle style={{ width: 14, height: 14 }} />
            {idea.commentCount}
          </span>
        </div>
      </div>
    </div>
  );
}

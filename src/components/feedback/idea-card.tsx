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

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const router = useRouter();
  const [votes, setVotes] = useState(idea.voteCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const statusConfig = STATUS_CONFIG[idea.status as Status] ?? STATUS_CONFIG.under_review;

  async function handleVote(e: React.MouseEvent) {
    e.stopPropagation();
    if (isVoting) return;

    setIsVoting(true);
    const previousVotes = votes;
    const previousHasVoted = hasVoted;

    setVotes(hasVoted ? votes - 1 : votes + 1);
    setHasVoted(!hasVoted);

    try {
      const res = await fetch(`/api/feedback/${idea.id}/vote`, {
        method: "POST",
      });
      if (!res.ok) {
        setVotes(previousVotes);
        setHasVoted(previousHasVoted);
      }
    } catch {
      setVotes(previousVotes);
      setHasVoted(previousHasVoted);
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div
      onClick={() => router.push(`/feedback/${idea.id}`)}
      className={cn(
        "group flex cursor-pointer gap-5 rounded-2xl border p-5 sm:p-6",
        "transition-all duration-200 animate-fade-in-up",
        "hover:-translate-y-0.5 hover:shadow-lg"
      )}
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      {/* Vote Button */}
      <button
        onClick={handleVote}
        disabled={isVoting}
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 rounded-2xl min-w-[68px] px-4 py-5",
          "transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
        )}
        style={{
          border: hasVoted ? "none" : "2px solid var(--border)",
          background: hasVoted
            ? "linear-gradient(135deg, var(--primary), #6366f1)"
            : "var(--muted)",
          color: hasVoted ? "#ffffff" : "var(--muted-foreground)",
        } as React.CSSProperties}
      >
        <ChevronUp
          className={cn("h-5 w-5 transition-transform", hasVoted && "-translate-y-0.5")}
        />
        <span className="text-sm font-bold leading-none tabular-nums">{votes}</span>
      </button>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Title */}
        <h3
          className="text-base font-semibold leading-snug tracking-[-0.01em] group-hover:underline"
          style={{ color: "var(--foreground)" }}
        >
          {idea.title}
        </h3>

        {/* Description */}
        {idea.description && (
          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            {idea.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 mt-auto border-t" style={{ borderColor: "var(--border)" }}>
          {/* Category badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--primary)",
            }}
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: "var(--primary)" }}
            />
            {idea.category}
          </span>

          {/* Status pill */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: `color-mix(in srgb, ${statusConfig.color} 15%, var(--card))`,
              color: statusConfig.color,
            }}
          >
            <span className={cn("h-2 w-2 rounded-full", statusConfig.dotClass)} />
            {statusConfig.label}
          </span>

          {/* Spacer */}
          <span className="flex-1" />

          {/* Time */}
          <span
            className="inline-flex items-center gap-1.5 text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            <Clock className="h-3.5 w-3.5" />
            {timeAgo(new Date(idea.createdAt))}
          </span>

          {/* Comments */}
          <span
            className="inline-flex items-center gap-1.5 text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {idea.commentCount}
          </span>
        </div>
      </div>
    </div>
  );
}

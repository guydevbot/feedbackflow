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
  const truncatedDescription = idea.description
    ? idea.description.length > 120
      ? idea.description.slice(0, 120) + "..."
      : idea.description
    : "";

  async function handleVote(e: React.MouseEvent) {
    e.stopPropagation();
    if (isVoting) return;

    setIsVoting(true);
    const previousVotes = votes;
    const previousHasVoted = hasVoted;

    // Optimistic update
    setVotes(hasVoted ? votes - 1 : votes + 1);
    setHasVoted(!hasVoted);

    try {
      const res = await fetch(`/api/feedback/${idea.id}/vote`, {
        method: "POST",
      });
      if (!res.ok) {
        // Revert on failure
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
        "group flex cursor-pointer gap-4 rounded-xl border p-4 transition-all",
        "hover:shadow-md hover:-translate-y-0.5"
      )}
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--background)",
      }}
    >
      {/* Vote Button */}
      <button
        onClick={handleVote}
        disabled={isVoting}
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 min-w-[56px]",
          "transition-all hover:scale-105 active:scale-95 shrink-0",
          hasVoted && "ring-2"
        )}
        style={{
          borderColor: hasVoted ? "var(--primary)" : "var(--border)",
          backgroundColor: hasVoted ? "var(--accent)" : "var(--muted)",
          color: hasVoted ? "var(--primary)" : "var(--muted-foreground)",
          ringColor: hasVoted ? "var(--primary)" : undefined,
        } as React.CSSProperties}
      >
        <ChevronUp
          className={cn("h-5 w-5 transition-transform", hasVoted && "-translate-y-0.5")}
        />
        <span className="text-sm font-bold leading-none">{votes}</span>
      </button>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Title */}
        <h3
          className="text-base font-semibold leading-snug group-hover:underline"
          style={{ color: "var(--foreground)" }}
        >
          {idea.title}
        </h3>

        {/* Description */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          {truncatedDescription}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mt-1">
          {/* Category badge */}
          <span
            className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--primary)",
            }}
          >
            {idea.category}
          </span>

          {/* Status */}
          <span className="inline-flex items-center gap-1.5 text-xs font-medium">
            <span className={cn("h-2 w-2 rounded-full", statusConfig.dotClass)} />
            <span style={{ color: "var(--muted-foreground)" }}>
              {statusConfig.label}
            </span>
          </span>

          {/* Time */}
          <span
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            <Clock className="h-3 w-3" />
            {timeAgo(new Date(idea.createdAt))}
          </span>

          {/* Comments */}
          <span
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            <MessageCircle className="h-3 w-3" />
            {idea.commentCount}
          </span>
        </div>
      </div>
    </div>
  );
}

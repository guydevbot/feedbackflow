import { db } from "@/server/db";
import { feedbackItems, users, comments } from "@/server/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Header from "@/components/feedback/header";
import { STATUS_CONFIG, type Status, timeAgo } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { CommentForm } from "./comment-form";
import { VoteButton } from "./vote-button";

type PageProps = { params: Promise<{ id: string }> };

export default async function FeedbackDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const [item] = await db
    .select({
      id: feedbackItems.id,
      title: feedbackItems.title,
      description: feedbackItems.description,
      status: feedbackItems.status,
      category: feedbackItems.category,
      voteCount: feedbackItems.voteCount,
      commentCount: feedbackItems.commentCount,
      statusExplanation: feedbackItems.statusExplanation,
      createdAt: feedbackItems.createdAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(feedbackItems)
    .leftJoin(users, eq(feedbackItems.authorId, users.id))
    .where(eq(feedbackItems.id, id))
    .limit(1);

  if (!item) notFound();

  const itemComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      isAdminResponse: comments.isAdminResponse,
      createdAt: comments.createdAt,
      parentCommentId: comments.parentCommentId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.feedbackItemId, id))
    .orderBy(asc(comments.createdAt));

  const statusConfig = STATUS_CONFIG[item.status as Status];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Back link */}
        <a
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm transition-colors hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Ideas
        </a>

        {/* Main card */}
        <div
          className="rounded-xl border p-6 sm:p-8"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--background)",
          }}
        >
          <div className="flex gap-4 sm:gap-6">
            {/* Vote button */}
            <VoteButton feedbackId={item.id} initialCount={item.voteCount} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Meta */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--primary)",
                  }}
                >
                  {item.category}
                </span>
                {statusConfig && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: "var(--muted)",
                      color: statusConfig.color,
                    }}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
                    {statusConfig.label}
                  </span>
                )}
              </div>

              <h1
                className="mb-2 text-xl font-bold sm:text-2xl"
                style={{ color: "var(--foreground)" }}
              >
                {item.title}
              </h1>

              {item.description && (
                <p
                  className="mb-4 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {item.description}
                </p>
              )}

              {/* Author info */}
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                {item.authorAvatar && (
                  <img
                    src={item.authorAvatar}
                    alt=""
                    className="h-5 w-5 rounded-full"
                  />
                )}
                <span>{item.authorName ?? "Anonymous"}</span>
                <span>&middot;</span>
                <span>{timeAgo(new Date(item.createdAt))}</span>
              </div>
            </div>
          </div>

          {/* Status explanation */}
          {item.statusExplanation && (
            <div
              className="mt-6 rounded-lg border-l-4 px-4 py-3"
              style={{
                borderLeftColor: statusConfig?.color ?? "var(--border)",
                backgroundColor: "var(--muted)",
              }}
            >
              <p
                className="mb-1 text-xs font-semibold uppercase tracking-wide"
                style={{ color: statusConfig?.color ?? "var(--muted-foreground)" }}
              >
                Status Update
              </p>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>
                {item.statusExplanation}
              </p>
            </div>
          )}
        </div>

        {/* Comments section */}
        <div className="mt-8">
          <h2
            className="mb-4 text-lg font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Discussion ({itemComments.length})
          </h2>

          {/* Comment form */}
          {session?.user ? (
            <CommentForm feedbackId={item.id} />
          ) : (
            <div
              className="mb-6 rounded-lg border p-4 text-center text-sm"
              style={{
                borderColor: "var(--border)",
                color: "var(--muted-foreground)",
              }}
            >
              <a
                href="/api/auth/signin"
                className="font-medium underline"
                style={{ color: "var(--primary)" }}
              >
                Sign in
              </a>{" "}
              to join the discussion.
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-4">
            {itemComments.length === 0 ? (
              <p
                className="py-8 text-center text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                No comments yet. Be the first to share your thoughts.
              </p>
            ) : (
              itemComments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border p-4"
                  style={{
                    borderColor: comment.isAdminResponse
                      ? "var(--primary)"
                      : "var(--border)",
                    backgroundColor: comment.isAdminResponse
                      ? "var(--accent)"
                      : "var(--background)",
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {comment.authorAvatar && (
                      <img
                        src={comment.authorAvatar}
                        alt=""
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {comment.authorName ?? "User"}
                    </span>
                    {comment.isAdminResponse && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                        style={{
                          backgroundColor: "var(--primary)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        Team
                      </span>
                    )}
                    <span
                      className="ml-auto text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {timeAgo(new Date(comment.createdAt))}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--foreground)" }}
                  >
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

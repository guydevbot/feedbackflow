import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { feedbackItems, votes } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const session = await auth();
  const body = await request.json().catch(() => ({}));

  const userId = session?.user?.id ?? null;
  const anonymousSessionId = (body.anonymousSessionId as string) ?? null;

  if (!userId && !anonymousSessionId) {
    return NextResponse.json(
      { error: "Must be authenticated or provide anonymousSessionId" },
      { status: 400 }
    );
  }

  // Check if the feedback item exists
  const [item] = await db
    .select({ id: feedbackItems.id, voteCount: feedbackItems.voteCount })
    .from(feedbackItems)
    .where(eq(feedbackItems.id, id))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
  }

  // Check for existing vote
  const voteConditions = [eq(votes.feedbackItemId, id)];
  if (userId) {
    voteConditions.push(eq(votes.userId, userId));
  } else {
    voteConditions.push(eq(votes.anonymousSessionId, anonymousSessionId!));
  }

  const [existingVote] = await db
    .select({ id: votes.id })
    .from(votes)
    .where(and(...voteConditions))
    .limit(1);

  if (existingVote) {
    // Un-vote: delete vote and decrement count atomically
    await db.delete(votes).where(eq(votes.id, existingVote.id));
    await db
      .update(feedbackItems)
      .set({
        voteCount: sql`GREATEST(${feedbackItems.voteCount} - 1, 0)`,
      })
      .where(eq(feedbackItems.id, id));

    const [updated] = await db
      .select({ voteCount: feedbackItems.voteCount })
      .from(feedbackItems)
      .where(eq(feedbackItems.id, id))
      .limit(1);

    return NextResponse.json({
      voted: false,
      voteCount: updated?.voteCount ?? 0,
    });
  } else {
    // Vote: insert vote and increment count atomically
    await db.insert(votes).values({
      feedbackItemId: id,
      userId,
      anonymousSessionId,
    });
    await db
      .update(feedbackItems)
      .set({
        voteCount: sql`${feedbackItems.voteCount} + 1`,
      })
      .where(eq(feedbackItems.id, id));

    const [updated] = await db
      .select({ voteCount: feedbackItems.voteCount })
      .from(feedbackItems)
      .where(eq(feedbackItems.id, id))
      .limit(1);

    return NextResponse.json({
      voted: true,
      voteCount: updated?.voteCount ?? 0,
    });
  }
}

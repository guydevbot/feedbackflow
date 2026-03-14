import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { comments, users, feedbackItems } from "@/server/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  const result = await db
    .select({
      id: comments.id,
      content: comments.content,
      authorId: comments.authorId,
      feedbackItemId: comments.feedbackItemId,
      parentCommentId: comments.parentCommentId,
      isAdminResponse: comments.isAdminResponse,
      createdAt: comments.createdAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.feedbackItemId, id))
    .orderBy(asc(comments.createdAt));

  return NextResponse.json(result);
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { content, parentCommentId } = parsed.data;
  const userRole = (session.user as Record<string, unknown>).role;
  const isAdmin = userRole === "admin";

  const [created] = await db
    .insert(comments)
    .values({
      content,
      authorId: session.user.id,
      feedbackItemId: id,
      parentCommentId: parentCommentId ?? null,
      isAdminResponse: isAdmin,
    })
    .returning();

  // Increment comment count on the feedback item
  await db
    .update(feedbackItems)
    .set({
      commentCount: sql`${feedbackItems.commentCount} + 1`,
    })
    .where(eq(feedbackItems.id, id));

  return NextResponse.json(created, { status: 201 });
}

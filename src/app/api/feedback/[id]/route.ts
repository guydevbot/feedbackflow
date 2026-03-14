import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { feedbackItems, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { updateStatusSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  const [item] = await db
    .select({
      id: feedbackItems.id,
      title: feedbackItems.title,
      description: feedbackItems.description,
      status: feedbackItems.status,
      category: feedbackItems.category,
      voteCount: feedbackItems.voteCount,
      commentCount: feedbackItems.commentCount,
      authorId: feedbackItems.authorId,
      statusExplanation: feedbackItems.statusExplanation,
      isPublic: feedbackItems.isPublic,
      createdAt: feedbackItems.createdAt,
      updatedAt: feedbackItems.updatedAt,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
    })
    .from(feedbackItems)
    .leftJoin(users, eq(feedbackItems.authorId, users.id))
    .where(eq(feedbackItems.id, id))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PATCH(
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

  // Check admin role
  const userRole = (session.user as Record<string, unknown>).role;
  if (userRole !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = updateStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { status, statusExplanation } = parsed.data;

  const [updated] = await db
    .update(feedbackItems)
    .set({
      status,
      statusExplanation: statusExplanation ?? null,
      updatedAt: new Date(),
    })
    .where(eq(feedbackItems.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

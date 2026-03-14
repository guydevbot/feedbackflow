import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { feedbackItems, users } from "@/server/db/schema";
import { eq, desc, ilike, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createFeedbackSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") || "trending";

  const conditions = [eq(feedbackItems.isPublic, true)];

  if (search) {
    conditions.push(ilike(feedbackItems.title, `%${search}%`));
  }
  if (category) {
    conditions.push(eq(feedbackItems.category, category));
  }
  if (status) {
    conditions.push(eq(feedbackItems.status, status));
  }

  const orderBy =
    sort === "top"
      ? desc(feedbackItems.voteCount)
      : sort === "new"
        ? desc(feedbackItems.createdAt)
        : desc(feedbackItems.voteCount); // trending

  const items = await db
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
      createdAt: feedbackItems.createdAt,
      updatedAt: feedbackItems.updatedAt,
      authorName: users.name,
    })
    .from(feedbackItems)
    .leftJoin(users, eq(feedbackItems.authorId, users.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(50);

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = createFeedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { title, description, category } = parsed.data;

  const [created] = await db
    .insert(feedbackItems)
    .values({
      title,
      description: description ?? null,
      category,
      authorId: session.user.id,
      status: "under_review",
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}

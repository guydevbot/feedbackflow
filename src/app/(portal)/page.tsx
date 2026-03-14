import { db } from "@/server/db";
import { feedbackItems, categories, users } from "@/server/db/schema";
import { desc, asc, eq, ilike, sql } from "drizzle-orm";
import IdeaCard from "@/components/feedback/idea-card";
import SearchBar from "@/components/feedback/search-bar";
import CategoryFilter from "@/components/feedback/category-filter";
import SortTabs from "@/components/feedback/sort-tabs";
import SubmitIdeaButton from "@/components/feedback/submit-idea-button";
import Header from "@/components/feedback/header";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function IdeasFeed({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sort = (params.sort as string) || "trending";
  const category = params.category as string | undefined;
  const search = params.search as string | undefined;
  const status = params.status as string | undefined;

  const orderBy =
    sort === "top"
      ? desc(feedbackItems.voteCount)
      : sort === "new"
        ? desc(feedbackItems.createdAt)
        : desc(feedbackItems.voteCount); // trending = top voted for now

  const conditions = [eq(feedbackItems.isPublic, true)];
  if (category) {
    conditions.push(eq(feedbackItems.category, category));
  }
  if (status) {
    conditions.push(eq(feedbackItems.status, status));
  }
  if (search) {
    conditions.push(ilike(feedbackItems.title, `%${search}%`));
  }

  const ideas = await db
    .select({
      id: feedbackItems.id,
      title: feedbackItems.title,
      description: feedbackItems.description,
      status: feedbackItems.status,
      category: feedbackItems.category,
      voteCount: feedbackItems.voteCount,
      commentCount: feedbackItems.commentCount,
      createdAt: feedbackItems.createdAt,
      authorName: users.name,
    })
    .from(feedbackItems)
    .leftJoin(users, eq(feedbackItems.authorId, users.id))
    .where(sql`${sql.join(conditions, sql` AND `)}`)
    .orderBy(orderBy)
    .limit(50);

  const cats = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.displayOrder));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
                  Ideas
                </h1>
                <span
                  className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {ideas.length}
                </span>
              </div>
              <p className="mt-1.5 text-sm" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
                Shape what we build next
              </p>
            </div>
            <SubmitIdeaButton categories={cats} />
          </div>
        </div>

        {/* Controls Panel */}
        <div
          className="space-y-5"
          style={{
            marginBottom: "32px",
            borderRadius: "16px",
            border: "1px solid var(--border)",
            padding: "24px",
            backgroundColor: "var(--card)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <SearchBar />
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <SortTabs />
            <div className="flex-1">
              <CategoryFilter categories={cats} current={category ?? null} currentStatus={status ?? null} />
            </div>
          </div>
        </div>

        {/* Ideas List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {ideas.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl border-2 border-dashed"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-lg font-medium" style={{ color: "var(--muted-foreground)" }}>
                No ideas found
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                Try adjusting your filters or be the first to submit one!
              </p>
            </div>
          ) : (
            ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
          )}
        </div>
      </main>
    </div>
  );
}

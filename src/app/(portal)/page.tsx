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
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Ideas</h1>
          <SubmitIdeaButton categories={cats} />
        </div>

        <SearchBar />

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SortTabs />
          <CategoryFilter categories={cats} current={category ?? null} currentStatus={status ?? null} />
        </div>

        <div className="space-y-3">
          {ideas.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted-foreground)]">
              <p className="text-lg">No ideas found</p>
              <p className="text-sm mt-1">Be the first to submit one!</p>
            </div>
          ) : (
            ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
          )}
        </div>
      </main>
    </div>
  );
}

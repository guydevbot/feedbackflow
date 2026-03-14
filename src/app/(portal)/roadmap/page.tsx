import { db } from "@/server/db";
import { feedbackItems } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Header from "@/components/feedback/header";
import { STATUS_CONFIG, type Status } from "@/lib/utils";

const COLUMNS: { key: Status; heading: string }[] = [
  { key: "in_progress", heading: "Now" },
  { key: "planned", heading: "Next" },
  { key: "under_review", heading: "Later" },
  { key: "shipped", heading: "Shipped" },
];

export default async function RoadmapPage() {
  const allItems = await db
    .select({
      id: feedbackItems.id,
      title: feedbackItems.title,
      status: feedbackItems.status,
      category: feedbackItems.category,
      voteCount: feedbackItems.voteCount,
    })
    .from(feedbackItems)
    .where(eq(feedbackItems.isPublic, true));

  const grouped: Record<string, typeof allItems> = {};
  for (const item of allItems) {
    if (!grouped[item.status]) grouped[item.status] = [];
    grouped[item.status].push(item);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1
          className="mb-2 text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Product Roadmap
        </h1>
        <p
          className="mb-8 text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          See what we are working on and what is coming next.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => {
            const config = STATUS_CONFIG[col.key];
            const items = grouped[col.key] ?? [];

            return (
              <div key={col.key} className="flex flex-col">
                {/* Column header */}
                <div
                  className="mb-4 flex items-center gap-2 rounded-lg px-4 py-3"
                  style={{ backgroundColor: "var(--muted)" }}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {col.heading}
                  </span>
                  <span
                    className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: "var(--border)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3">
                  {items.length === 0 ? (
                    <p
                      className="px-4 py-6 text-center text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      No items yet
                    </p>
                  ) : (
                    items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/feedback/${item.id}`}
                        className="group rounded-lg border p-4 transition-all hover:shadow-md"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "var(--background)",
                        }}
                      >
                        <h3
                          className="mb-2 text-sm font-medium leading-snug group-hover:underline"
                          style={{ color: "var(--foreground)" }}
                        >
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: "var(--accent)",
                              color: "var(--primary)",
                            }}
                          >
                            {item.category}
                          </span>
                          <span
                            className="flex items-center gap-1 text-xs font-medium"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            {item.voteCount}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

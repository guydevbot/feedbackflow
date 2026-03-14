import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { feedbackItems, users } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import Header from "@/components/feedback/header";
import { STATUS_CONFIG, type Status, timeAgo } from "@/lib/utils";
import { AdminStatusDropdown } from "./status-dropdown";

export default async function AdminDashboardPage() {
  const session = await auth();
  const userRole = (session?.user as Record<string, unknown> | undefined)?.role;

  if (!session?.user || userRole !== "admin") {
    redirect("/");
  }

  const items = await db
    .select({
      id: feedbackItems.id,
      title: feedbackItems.title,
      status: feedbackItems.status,
      category: feedbackItems.category,
      voteCount: feedbackItems.voteCount,
      createdAt: feedbackItems.createdAt,
      authorName: users.name,
    })
    .from(feedbackItems)
    .leftJoin(users, eq(feedbackItems.authorId, users.id))
    .orderBy(desc(feedbackItems.createdAt));

  const needsReviewCount = items.filter(
    (i) => i.status === "under_review"
  ).length;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              Admin Dashboard
            </h1>
            {needsReviewCount > 0 && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: "var(--destructive)",
                  color: "#fff",
                }}
              >
                {needsReviewCount} Needs Review
              </span>
            )}
          </div>
          <a
            href="/admin/integrations"
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            Integrations
          </a>
        </div>

        {/* Table */}
        <div
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--muted)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">Votes</th>
                  <th className="px-4 py-3 text-left font-medium">Author</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const config = STATUS_CONFIG[item.status as Status];
                  return (
                    <tr
                      key={item.id}
                      className="border-t transition-colors hover:opacity-90"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--background)",
                      }}
                    >
                      <td className="px-4 py-3">
                        <a
                          href={`/feedback/${item.id}`}
                          className="font-medium hover:underline"
                          style={{ color: "var(--foreground)" }}
                        >
                          {item.title}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: "var(--accent)",
                            color: "var(--primary)",
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <AdminStatusDropdown
                          feedbackId={item.id}
                          currentStatus={item.status as Status}
                        />
                      </td>
                      <td
                        className="px-4 py-3 text-center font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {item.voteCount}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {item.authorName ?? "Unknown"}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {timeAgo(new Date(item.createdAt))}
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      No feedback items yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

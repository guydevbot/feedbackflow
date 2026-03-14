import Header from "@/components/feedback/header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const STATUS_MAPPING = [
  { portal: "Under Review", jira: "To Do", synced: true },
  { portal: "Planned", jira: "Selected for Development", synced: true },
  { portal: "In Development", jira: "In Progress", synced: true },
  { portal: "Shipped", jira: "Done", synced: true },
  { portal: "Not Planned", jira: "Won't Do", synced: false },
];

const SYNC_LOG = [
  {
    id: 1,
    action: "Status sync: FB-1042 moved to In Progress",
    timestamp: "2 minutes ago",
    status: "success" as const,
  },
  {
    id: 2,
    action: 'New issue created: "Dark mode support" (PROJ-892)',
    timestamp: "15 minutes ago",
    status: "success" as const,
  },
  {
    id: 3,
    action: "Status sync: FB-1038 moved to Done",
    timestamp: "1 hour ago",
    status: "success" as const,
  },
  {
    id: 4,
    action: 'Comment sync pending: "API rate limiting" (PROJ-887)',
    timestamp: "2 hours ago",
    status: "pending" as const,
  },
  {
    id: 5,
    action: "Bulk import: 12 items synced from backlog",
    timestamp: "1 day ago",
    status: "success" as const,
  },
];

export default async function IntegrationsPage() {
  const session = await auth();
  const userRole = (session?.user as Record<string, unknown> | undefined)?.role;

  if (!session?.user || userRole !== "admin") {
    redirect("/");
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              Integrations
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Manage external service connections
            </p>
          </div>
          <a
            href="/admin"
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            Back to Dashboard
          </a>
        </div>

        {/* Demo banner */}
        <div
          className="mb-8 flex items-center gap-3 rounded-lg border px-4 py-3"
          style={{
            borderColor: "var(--primary)",
            backgroundColor: "var(--accent)",
          }}
        >
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: "var(--primary)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm" style={{ color: "var(--primary)" }}>
            <strong>Concept Demo</strong> &mdash; This page demonstrates the
            planned Jira integration. No real Jira connectivity is active.
          </p>
        </div>

        {/* Connection status */}
        <div
          className="mb-8 rounded-xl border p-6"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Jira icon placeholder */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--primary)",
                }}
              >
                J
              </div>
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Jira Cloud
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  acme-corp.atlassian.net &middot; Project: PROJ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                Connected
              </span>
            </div>
          </div>

          <div
            className="mt-4 grid grid-cols-3 gap-4 rounded-lg p-4"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <div className="text-center">
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--foreground)" }}
              >
                148
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Items Synced
              </p>
            </div>
            <div className="text-center">
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--foreground)" }}
              >
                3
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Pending
              </p>
            </div>
            <div className="text-center">
              <p
                className="text-2xl font-bold"
                style={{ color: "var(--foreground)" }}
              >
                99.2%
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Sync Rate
              </p>
            </div>
          </div>
        </div>

        {/* Status mapping table */}
        <div
          className="mb-8 overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="px-4 py-3"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Status Mapping
            </h3>
            <p
              className="text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              How portal statuses map to Jira workflow states
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                <th className="border-t px-4 py-2 text-left font-medium" style={{ borderColor: "var(--border)" }}>
                  Portal Status
                </th>
                <th className="border-t px-4 py-2 text-center font-medium" style={{ borderColor: "var(--border)" }}>
                  Direction
                </th>
                <th className="border-t px-4 py-2 text-left font-medium" style={{ borderColor: "var(--border)" }}>
                  Jira Status
                </th>
                <th className="border-t px-4 py-2 text-center font-medium" style={{ borderColor: "var(--border)" }}>
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              {STATUS_MAPPING.map((mapping) => (
                <tr
                  key={mapping.portal}
                  className="border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="px-4 py-2.5" style={{ color: "var(--foreground)" }}>
                    {mapping.portal}
                  </td>
                  <td className="px-4 py-2.5 text-center" style={{ color: "var(--muted-foreground)" }}>
                    &harr;
                  </td>
                  <td className="px-4 py-2.5" style={{ color: "var(--foreground)" }}>
                    {mapping.jira}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {mapping.synced ? (
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent sync activity */}
        <div
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="px-4 py-3"
            style={{ backgroundColor: "var(--muted)" }}
          >
            <h3
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Recent Sync Activity
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {SYNC_LOG.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderColor: "var(--border)" }}
              >
                {entry.status === "success" ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <svg
                      className="h-3.5 w-3.5 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                ) : (
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    <span
                      className="h-2 w-2 animate-pulse rounded-full"
                      style={{ backgroundColor: "var(--primary)" }}
                    />
                  </span>
                )}
                <span
                  className="flex-1 text-sm"
                  style={{ color: "var(--foreground)" }}
                >
                  {entry.action}
                </span>
                <span
                  className="shrink-0 text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {entry.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

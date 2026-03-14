import Link from "next/link";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LogIn, MessageSquareText } from "lucide-react";

export default async function Header() {
  const session = await auth();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full shadow-sm",
        "border-b"
      )}
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <MessageSquareText className="h-4 w-4" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            FeedbackFlow
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              "hover:opacity-80"
            )}
            style={{
              color: "var(--foreground)",
              borderBottom: "2px solid var(--primary)",
              borderRadius: "0",
              paddingBottom: "4px",
            }}
          >
            Ideas
          </Link>
          <Link
            href="/roadmap"
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:opacity-80"
            )}
            style={{ color: "var(--muted-foreground)" }}
          >
            Roadmap
          </Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center">
          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "User"}
                  className="h-8 w-8 rounded-full ring-2 transition-shadow hover:ring-4"
                  style={{ ringColor: "var(--border)" } as React.CSSProperties}
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {(session.user.name ?? session.user.email ?? "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
                "transition-all hover:opacity-90 active:scale-[0.98]"
              )}
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

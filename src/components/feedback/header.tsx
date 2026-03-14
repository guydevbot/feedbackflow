import Link from "next/link";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LogIn, MessageSquareText } from "lucide-react";

export default async function Header() {
  const session = await auth();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b"
      )}
      style={{
        background: "linear-gradient(135deg, #111827 0%, #1e1b4b 100%)",
        color: "var(--header-text)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <MessageSquareText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl tracking-tight" style={{ color: "var(--header-text)" }}>
            <span className="font-bold" style={{ fontFamily: "var(--font-body)" }}>Feedback</span>
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>Flow</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "text-sm font-semibold transition-colors",
              "bg-white/10 rounded-full px-4 py-1.5"
            )}
            style={{
              color: "#ffffff",
            }}
          >
            Ideas
          </Link>
          <Link
            href="/roadmap"
            className={cn(
              "text-sm font-medium transition-colors rounded-full px-4 py-1.5",
              "hover:bg-white/10"
            )}
            style={{ color: "rgba(255,255,255,0.65)" }}
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
                  style={{ ringColor: "rgba(255,255,255,0.3)" } as React.CSSProperties}
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#ffffff",
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
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                "transition-all hover:bg-white/10 active:scale-[0.98] border"
              )}
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
                backgroundColor: "transparent",
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

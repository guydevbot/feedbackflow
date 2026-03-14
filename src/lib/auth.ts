import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Upsert user on sign in
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(users).values({
          email: user.email,
          name: user.name ?? null,
          avatarUrl: user.image ?? null,
          role: "customer",
        });
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1);

        if (dbUser[0]) {
          session.user.id = dbUser[0].id;
          (session.user as unknown as Record<string, unknown>).role = dbUser[0].role;
        }
      }
      return session;
    },
  },
});

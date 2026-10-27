import type { NextAuthConfig } from "next-auth";

/**
 * Auth configuration shared by the full NextAuth setup (`src/lib/auth.ts`) and
 * the lightweight instance used in `src/proxy.ts`.
 *
 * The proxy only needs to decode the JWT, so it must stay free of database
 * access — the Prisma adapter lives exclusively in `src/lib/auth.ts`.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    newUser: "/dashboard",
  },
  providers: [],
  callbacks: {
    /** Persist the user id into the JWT on sign-in. */
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    /** Expose the id + plan to the client via `useSession()`. */
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.plan = (token.plan as "FREE" | "PRO") ?? "FREE";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

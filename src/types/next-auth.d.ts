import type { DefaultSession } from "next-auth";

/**
 * Module augmentation so `session.user.id` and `session.user.plan` are typed
 * across the app (server components and client components alike).
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: "FREE" | "PRO";
    } & DefaultSession["user"];
  }

  interface User {
    plan?: "FREE" | "PRO";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    plan?: "FREE" | "PRO";
  }
}

export {};

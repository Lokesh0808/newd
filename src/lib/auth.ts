import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { isGoogleAuthEnabled } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * NextAuth (Auth.js v5) configuration.
 *
 * - Credentials provider: email + password, passwords hashed with bcrypt.
 * - Google provider: only registered when OAuth credentials are present, so
 *   the login screen can hide the button instead of failing at runtime.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });

        // Always run a comparison so the response time does not reveal
        // whether an account exists.
        const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
        const valid = await bcrypt.compare(parsed.data.password, hash);

        if (!user || !user.passwordHash || !valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    ...(isGoogleAuthEnabled
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Refresh the subscription plan on every token refresh so an upgrade in
     * Stripe is reflected without forcing the user to sign in again.
     */
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true },
        });
        if (dbUser) token.plan = dbUser.plan;
      }
      return token;
    },
  },
});

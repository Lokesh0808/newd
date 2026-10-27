import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { withErrorHandling, apiError } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

/**
 * Create an account with an email + password.
 *
 * The account is created with a bcrypt hash — the raw password is never
 * stored or logged. The client then signs in with the credentials provider.
 */
export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid details.", 422, "VALIDATION_ERROR");
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return apiError("An account with that email already exists.", 409, "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name.trim(),
      passwordHash,
    },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json({ user }, { status: 201 });
});

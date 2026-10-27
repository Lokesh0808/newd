import { NextResponse } from "next/server";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

/** Load a session with all of its questions. */
export const GET = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const user = await requireUser();
  const { id } = await context.params;

  const session = await prisma.interviewSession.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!session || session.userId !== user.id) {
    return apiError("Interview session not found.", 404, "NOT_FOUND");
  }

  return NextResponse.json({ session });
});

/** Delete a session (and its questions). */
export const DELETE = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const user = await requireUser();
  const { id } = await context.params;

  const session = await prisma.interviewSession.findUnique({ where: { id }, select: { userId: true } });
  if (!session || session.userId !== user.id) {
    return apiError("Interview session not found.", 404, "NOT_FOUND");
  }

  await prisma.interviewSession.delete({ where: { id } });

  return NextResponse.json({ ok: true });
});

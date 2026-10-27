import { NextResponse } from "next/server";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { normaliseResumeData } from "@/lib/resume/schema";
import { getAccent, getFont, getTemplate } from "@/lib/resume/templates";

type RouteContext = { params: Promise<{ id: string }> };

/** Load a single resume. */
export const GET = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const user = await requireUser();
  const { id } = await context.params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== user.id) {
    return apiError("Resume not found.", 404, "NOT_FOUND");
  }

  return NextResponse.json({ resume: { ...resume, data: normaliseResumeData(resume.data) } });
});

/** Update the resume content, design or job description. */
export const PATCH = withErrorHandling(async (request: Request, context: RouteContext) => {
  const user = await requireUser();
  const { id } = await context.params;

  const existing = await prisma.resume.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return apiError("Resume not found.", 404, "NOT_FOUND");
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    data?: unknown;
    template?: string;
    accentColor?: string;
    fontFamily?: string;
    jobDescription?: string;
    atsScore?: number | null;
    atsMatched?: string[];
    atsMissing?: string[];
  };

  const update: Record<string, unknown> = {};

  if (body.title !== undefined) update.title = body.title.trim() || "Untitled resume";
  if (body.data !== undefined) update.data = normaliseResumeData(body.data) as object;
  if (body.template !== undefined) update.template = getTemplate(body.template).id;
  if (body.accentColor !== undefined) update.accentColor = getAccent(body.accentColor).id;
  if (body.fontFamily !== undefined) update.fontFamily = getFont(body.fontFamily).id;
  if (body.jobDescription !== undefined) update.jobDescription = body.jobDescription;
  if (body.atsScore !== undefined) update.atsScore = body.atsScore;
  if (body.atsMatched !== undefined) update.atsMatched = body.atsMatched;
  if (body.atsMissing !== undefined) update.atsMissing = body.atsMissing;

  const resume = await prisma.resume.update({ where: { id }, data: update });

  return NextResponse.json({ resume: { ...resume, data: normaliseResumeData(resume.data) } });
});

/** Permanently delete a resume. */
export const DELETE = withErrorHandling(async (_request: Request, context: RouteContext) => {
  const user = await requireUser();
  const { id } = await context.params;

  const existing = await prisma.resume.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return apiError("Resume not found.", 404, "NOT_FOUND");
  }

  await prisma.resume.delete({ where: { id } });

  return NextResponse.json({ ok: true });
});

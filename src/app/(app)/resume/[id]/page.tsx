import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResumeEditor } from "@/components/resume/resume-editor";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normaliseResumeData } from "@/lib/resume/schema";

export const metadata: Metadata = {
  title: "Resume editor",
  description: "Edit your resume with live preview and AI improvements.",
};

export default async function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const resume = userId
    ? await prisma.resume.findUnique({ where: { id }, select: { userId: true } })
    : null;

  if (!resume || resume.userId !== userId) notFound();

  const full = await prisma.resume.findUnique({ where: { id } });
  if (!full) notFound();

  return (
    <ResumeEditor
      resume={{
        id: full.id,
        title: full.title,
        data: normaliseResumeData(full.data),
        template: full.template,
        accentColor: full.accentColor,
        fontFamily: full.fontFamily,
        jobDescription: full.jobDescription,
        atsScore: full.atsScore,
        atsMatched: full.atsMatched,
        atsMissing: full.atsMissing,
      }}
    />
  );
}

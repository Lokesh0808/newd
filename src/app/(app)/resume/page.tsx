import type { Metadata } from "next";

import { ResumeLibrary, type ResumeListItem } from "@/components/resume/resume-library";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normaliseResumeData } from "@/lib/resume/schema";

export const metadata: Metadata = {
  title: "Resume Maker",
  description: "Build an ATS-friendly resume with AI, tailor it to any job description and export to PDF or DOCX.",
};

export default async function ResumeListPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const rows = userId
    ? await prisma.resume.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          template: true,
          accentColor: true,
          fontFamily: true,
          atsScore: true,
          createdAt: true,
          updatedAt: true,
          data: true,
        },
      })
    : [];

  const resumes: ResumeListItem[] = rows.map((row) => {
    const data = normaliseResumeData(row.data);
    return {
      id: row.id,
      title: row.title,
      template: row.template,
      accentColor: row.accentColor,
      fontFamily: row.fontFamily,
      atsScore: row.atsScore,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      preview: {
        name: data.personal.fullName || row.title,
        title: data.personal.title,
        experienceCount: data.experience.length,
      },
    };
  });

  return <ResumeLibrary resumes={resumes} />;
}

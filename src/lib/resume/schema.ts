import { z } from "zod";
import { createId } from "@/lib/utils";

/**
 * The structured resume payload.
 *
 * It is stored as a JSON column (`Resume.data`) and is the single source of
 * truth for: the live preview, the PDF/DOCX exports, the ATS scan and every
 * AI prompt.
 */

export const personalInfoSchema = z.object({
  fullName: z.string().default(""),
  title: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  website: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  summary: z.string().default(""),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().default(""),
  position: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  /** Newline separated bullet points. */
  description: z.string().default(""),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  description: z.string().default(""),
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  description: z.string().default(""),
  tech: z.string().default(""),
  link: z.string().default(""),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  credentialId: z.string().default(""),
});

export const resumeDataSchema = z.object({
  personal: personalInfoSchema,
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  projects: z.array(projectSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type ResumeData = z.infer<typeof resumeDataSchema>;

/** A blank resume to start from. */
export function emptyResumeData(): ResumeData {
  return {
    personal: { ...personalInfoSchema.parse({}) },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };
}

export function newExperience(): Experience {
  return {
    id: createId("exp"),
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

export function newEducation(): Education {
  return {
    id: createId("edu"),
    institution: "",
    degree: "",
    field: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  };
}

export function newSkill(): Skill {
  return { id: createId("skill"), name: "" };
}

export function newProject(): Project {
  return { id: createId("prj"), name: "", description: "", tech: "", link: "" };
}

export function newCertification(): Certification {
  return { id: createId("cert"), name: "", issuer: "", date: "", credentialId: "" };
}

/**
 * Normalise an unknown object (e.g. coming back from the database or from an
 * AI response) into a valid `ResumeData`, filling in defaults.
 */
export function normaliseResumeData(input: unknown): ResumeData {
  const parsed = resumeDataSchema.safeParse(input);
  if (parsed.success) {
    // Guarantee every collection entry has a stable id.
    return {
      ...parsed.data,
      experience: parsed.data.experience.map((e) => ({ ...e, id: e.id || createId("exp") })),
      education: parsed.data.education.map((e) => ({ ...e, id: e.id || createId("edu") })),
      skills: parsed.data.skills.map((s) => ({ ...s, id: s.id || createId("skill") })),
      projects: parsed.data.projects.map((p) => ({ ...p, id: p.id || createId("prj") })),
      certifications: parsed.data.certifications.map((c) => ({ ...c, id: c.id || createId("cert") })),
    };
  }

  // Tolerate partially invalid payloads (e.g. AI returned a partial object).
  const raw = (input ?? {}) as Record<string, unknown>;
  const personal = (raw.personal ?? {}) as Record<string, unknown>;
  return {
    personal: {
      fullName: String(personal.fullName ?? ""),
      title: String(personal.title ?? ""),
      email: String(personal.email ?? ""),
      phone: String(personal.phone ?? ""),
      location: String(personal.location ?? ""),
      website: String(personal.website ?? ""),
      linkedin: String(personal.linkedin ?? ""),
      github: String(personal.github ?? ""),
      summary: String(personal.summary ?? ""),
    },
    experience: Array.isArray(raw.experience) ? raw.experience.map((e) => ({ ...newExperience(), ...(e as object) })) : [],
    education: Array.isArray(raw.education) ? raw.education.map((e) => ({ ...newEducation(), ...(e as object) })) : [],
    skills: Array.isArray(raw.skills) ? raw.skills.map((s) => ({ ...newSkill(), ...(s as object) })) : [],
    projects: Array.isArray(raw.projects) ? raw.projects.map((p) => ({ ...newProject(), ...(p as object) })) : [],
    certifications: Array.isArray(raw.certifications)
      ? raw.certifications.map((c) => ({ ...newCertification(), ...(c as object) }))
      : [],
  };
}

/** Flatten a resume into plain text — used by the ATS scanner and AI prompts. */
export function resumeToPlainText(data: ResumeData): string {
  const lines: string[] = [];
  const p = data.personal;
  lines.push(p.fullName, p.title, p.email, p.phone, p.location, p.website, p.linkedin, p.github);
  if (p.summary) lines.push("Summary", p.summary);

  if (data.experience.length) {
    lines.push("Experience");
    for (const exp of data.experience) {
      lines.push(`${exp.position} — ${exp.company} (${exp.startDate} – ${exp.current ? "Present" : exp.endDate})`);
      lines.push(exp.description);
    }
  }

  if (data.education.length) {
    lines.push("Education");
    for (const edu of data.education) {
      lines.push(`${edu.degree} ${edu.field} — ${edu.institution}`);
      if (edu.description) lines.push(edu.description);
    }
  }

  if (data.skills.length) {
    lines.push("Skills", data.skills.map((s) => s.name).join(", "));
  }

  if (data.projects.length) {
    lines.push("Projects");
    for (const proj of data.projects) {
      lines.push(`${proj.name}${proj.tech ? ` (${proj.tech})` : ""} — ${proj.description}`);
    }
  }

  if (data.certifications.length) {
    lines.push("Certifications");
    for (const cert of data.certifications) lines.push(`${cert.name} — ${cert.issuer}`);
  }

  return lines.filter((line) => line && line.trim().length > 0).join("\n");
}

/** Every skill across the resume, flattened (used by the ATS scanner). */
export function collectResumeSkills(data: ResumeData): string[] {
  return data.skills.map((s) => s.name).filter(Boolean);
}

import { claudeJson, aiAvailable } from "@/lib/ai/client";
import { normaliseResumeData, type ResumeData } from "@/lib/resume/schema";
import { scoreResumeForJob, type AtsReport } from "@/lib/resume/ats";

/**
 * Every AI-powered resume operation lives here.
 *
 * Each function has a deterministic "demo" fallback so the product remains
 * fully explorable when no ANTHROPIC_API_KEY is configured — the UI clearly
 * labels those responses as demo output.
 */

// ---------------------------------------------------------------------------
// 1. "Improve with AI" — rewrite one section of the resume
// ---------------------------------------------------------------------------

export type ResumeSection =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "personal";

export interface ImproveSectionInput {
  section: ResumeSection;
  content: string;
  /** Optional job title, used to tune the vocabulary. */
  role?: string;
  /** Optional job description, used to mirror the target vocabulary. */
  jobDescription?: string;
}

export interface ImproveSectionResult {
  improved: string;
  /** Short explanation of what changed (shown in a tooltip). */
  notes: string;
  demo: boolean;
}

const STRONG_VERBS = [
  "Led","Built","Delivered","Designed","Scaled","Owned","Drove","Launched","Automated","Optimized","Improved",
  "Reduced","Increased","Migrated","Implemented","Architected","Spearheaded","Coordinated","Streamlined","Negotiated",
];

/** Per-section instructions so the AI returns the shape the form expects. */
const SECTION_GUIDANCE: Record<ResumeSection, string> = {
  summary:
    "Return 2-3 sentences in a single paragraph. No bullet points, no line breaks.",
  experience:
    "Return one bullet point per line. Keep the original number of bullets unless a bullet is empty.",
  education:
    "Return one bullet point per line describing achievements (honours, thesis, societies, teaching).",
  skills:
    "Return a single comma-separated list of skill names only — no sentences, no explanations. " +
    "Keep the original skills and add closely related, truthful ones.",
  projects:
    "Return one bullet point per line. Keep the original number of bullets unless a bullet is empty.",
  certifications:
    "Return a single line formatted as `Certification name — Issuer`. Nothing else.",
  personal:
    "Return the improved personal details as a single line formatted as `Full Name — Job Title`. Nothing else.",
};

export async function improveResumeSection(input: ImproveSectionInput): Promise<ImproveSectionResult> {
  if (!aiAvailable) return demoImproveSection(input);

  const schema = {
    type: "object",
    properties: {
      improved: { type: "string", description: "The rewritten section, newline separated bullets where relevant." },
      notes: { type: "string", description: "One or two sentences explaining the improvements." },
    },
    required: ["improved", "notes"],
  };

  const result = await claudeJson<{ improved: string; notes: string }>({
    system: [
      "You are an expert technical resume writer and hiring manager.",
      "You rewrite resume sections so they are: (1) impact driven, (2) quantified, (3) ATS friendly,",
      "(4) concise, and (5) written with strong action verbs.",
      "Never invent employers, dates, degrees or metrics that are not implied by the input.",
      "If the input lacks metrics, either keep the claim generic or use a bracketed placeholder",
      "like [X%] that the candidate can fill in — never fabricate a number.",
    ].join(" "),
    prompt: [
      `Rewrite the following "${input.section}" section of a resume.`,
      `Output format: ${SECTION_GUIDANCE[input.section]}`,
      input.role ? `Target role: ${input.role}.` : "",
      input.jobDescription ? `Target job description:\n${input.jobDescription.slice(0, 4000)}` : "",
      "",
      "Original content:",
      input.content.slice(0, 6000),
      "",
      "Rules:",
      "- Start each bullet with a strong past-tense action verb.",
      "- Prefer measurable outcomes (numbers, %, time saved, scale, revenue).",
      "- Keep the original facts; never fabricate specifics.",
      "- Keep it under 3 lines per bullet.",
      "- Return the rewritten content only (bullets separated by newlines) in `improved`.",
    ]
      .filter(Boolean)
      .join("\n"),
    toolName: "rewrite_section",
    toolDescription: "Return the improved resume section and a short explanation.",
    schema,
    creativity: 0.5,
  });

  return {
    improved: result.improved?.trim() || input.content,
    notes: result.notes?.trim() || "Rewritten with stronger action verbs and outcome focus.",
    demo: false,
  };
}

/** Deterministic fallback used when no API key is configured. */
function demoImproveSection(input: ImproveSectionInput): ImproveSectionResult {
  const lines = input.content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return {
      improved: "",
      notes: "Nothing to improve yet — add some content first.",
      demo: true,
    };
  }

  // Skills and certifications are lists, not prose — do not add verbs to them.
  if (input.section === "skills" || input.section === "certifications") {
    const improved = lines.join(", ");
    return {
      improved,
      notes:
        "Demo mode: list normalised. Connect an Anthropic API key to have AI suggest related, truthful skills.",
      demo: true,
    };
  }

  const improved = lines
    .map((line, index) => {
      const verb = STRONG_VERBS[index % STRONG_VERBS.length];
      // Strip a leading weak verb so we do not stack verbs.
      const cleaned = line.replace(/^(responsible for|worked on|helped with|did|involved in|assisted with)\s+/i, "");
      const capitalised = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      return `${verb} ${capitalised}`;
    })
    .join("\n");

  return {
    improved,
    notes:
      "Demo mode: added strong action verbs. Connect an Anthropic API key to get quantified, role-aware rewrites.",
    demo: true,
  };
}

// ---------------------------------------------------------------------------
// 2. Tailor a resume to a job description (+ ATS score)
// ---------------------------------------------------------------------------

export interface TailorResult {
  resume: ResumeData;
  ats: AtsReport;
  notes: string;
  demo: boolean;
}

export async function tailorResume(
  resume: ResumeData,
  jobDescription: string,
): Promise<TailorResult> {
  // The ATS score is computed locally — it is deterministic and explainable.
  const ats = scoreResumeForJob(resume, jobDescription);

  if (!aiAvailable) {
    return {
      resume,
      ats,
      notes:
        "Demo mode: the ATS score is fully calculated, but the content was not rewritten. Add an Anthropic API key to tailor the wording.",
      demo: true,
    };
  }

  const schema = {
    type: "object",
    properties: {
      resume: {
        type: "object",
        description: "The complete tailored resume, same shape as the input.",
      },
      notes: { type: "string", description: "A short summary of the changes made." },
    },
    required: ["resume", "notes"],
  };

  const result = await claudeJson<{ resume: unknown; notes: string }>({
    system: [
      "You are an ATS optimisation expert.",
      "You rewrite a resume so that it matches a specific job description while remaining truthful.",
      "Rules:",
      "- Mirror the job description's terminology and keywords naturally.",
      "- Reorder and emphasise the most relevant experience.",
      "- Rewrite the professional summary to target the role.",
      "- Never invent employers, job titles, dates, degrees or certifications.",
      "- Never add a skill the candidate did not list.",
      "- Return the FULL resume object with the same keys as the input.",
    ].join(" "),
    prompt: [
      "Current resume (JSON):",
      JSON.stringify(resume).slice(0, 20000),
      "",
      "Target job description:",
      jobDescription.slice(0, 8000),
      "",
      "Tailor the resume for this job description and return the complete updated resume JSON.",
    ].join("\n"),
    toolName: "tailor_resume",
    toolDescription: "Return the tailored resume JSON and a summary of the changes.",
    schema,
    maxTokens: 8000,
    creativity: 0.3,
  });

  return {
    resume: normaliseResumeData(result.resume),
    ats,
    notes: result.notes?.trim() || "Tailored to the job description.",
    demo: false,
  };
}

// ---------------------------------------------------------------------------
// 3. Cover letter
// ---------------------------------------------------------------------------

export interface CoverLetterInput {
  resume: ResumeData;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  tone?: "professional" | "enthusiastic" | "concise";
}

export interface CoverLetterResult {
  content: string;
  demo: boolean;
}

export async function generateCoverLetter(input: CoverLetterInput): Promise<CoverLetterResult> {
  const jobTitle = input.jobTitle?.trim() || "the role";
  const company = input.company?.trim() || "your company";

  if (!aiAvailable) {
    return {
      content: demoCoverLetter(input.resume, jobTitle, company),
      demo: true,
    };
  }

  const schema = {
    type: "object",
    properties: {
      content: {
        type: "string",
        description: "The full cover letter, starting with a greeting and ending with a closing.",
      },
    },
    required: ["content"],
  };

  const result = await claudeJson<{ content: string }>({
    system: [
      "You write concise, specific cover letters that sound like a human — never generic or padded.",
      "Structure: greeting, 1 short paragraph on fit, 1 paragraph with a concrete achievement,",
      "1 paragraph on motivation for the company, and a short closing.",
      "Reference only experiences present in the resume. Never invent facts.",
    ].join(" "),
    prompt: [
      `Write a cover letter for the ${jobTitle} position at ${company}.`,
      `Tone: ${input.tone ?? "professional"}. Keep it under 320 words.`,
      "",
      "Candidate resume (JSON):",
      JSON.stringify(input.resume).slice(0, 20000),
      "",
      "Job description:",
      input.jobDescription.slice(0, 8000),
    ].join("\n"),
    toolName: "write_cover_letter",
    toolDescription: "Return the finished cover letter.",
    schema,
    maxTokens: 2000,
    creativity: 0.7,
  });

  return { content: result.content?.trim() || "", demo: false };
}

/** Deterministic cover letter used in demo mode. */
function demoCoverLetter(resume: ResumeData, jobTitle: string, company: string): string {
  const name = resume.personal.fullName || "your name";
  const title = resume.personal.title || jobTitle;
  const strongest = resume.experience.find((e) => e.description.trim()) ?? resume.experience[0];
  const rawBullet = strongest?.description
    .split("\n")
    .find((line) => line.trim())
    ?.replace(/^[\s•\-*]+/, "")
    .trim();
  // Lower-case the first letter so it reads mid-sentence, and drop any
  // trailing full stop so we do not double up punctuation.
  const bullet = rawBullet
    ? rawBullet.replace(/\.+$/, "").replace(/^./, (character) => character.toLowerCase())
    : "";

  return [
    `Dear Hiring Manager,`,
    ``,
    `I am applying for the ${jobTitle} position at ${company}. As a ${title}, I have spent my career doing exactly the kind of work your team is hiring for — and I would be glad to bring that experience to the role.`,
    ``,
    strongest
      ? `In my most recent role as ${strongest.position} at ${strongest.company}, I ${bullet}.`
      : `I bring hands-on experience and a track record of shipping results.`,
    ``,
    `What draws me to ${company} is the scale of the problems your team takes on and the investment in engineering excellence. I would welcome the chance to bring that same energy to ${jobTitle}.`,
    ``,
    `Thank you for your time and consideration. I would love to talk about how I can help ${company} achieve its goals.`,
    ``,
    `Sincerely,`,
    name,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// 4. Parse an uploaded resume into structured data
// ---------------------------------------------------------------------------

export interface ParseResumeResult {
  resume: ResumeData;
  warnings: string[];
  demo: boolean;
}

export async function parseResumeText(text: string, fileName: string): Promise<ParseResumeResult> {
  if (!aiAvailable) {
    return {
      resume: normaliseResumeData({ personal: { fullName: fileName.replace(/\.[^.]+$/, "") } }),
      warnings: [
        "Demo mode: without an Anthropic API key the uploaded file cannot be parsed automatically. The file name was used as the name field.",
      ],
      demo: true,
    };
  }

  const schema = {
    type: "object",
    properties: {
      fullName: { type: "string" },
      title: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      location: { type: "string" },
      website: { type: "string" },
      linkedin: { type: "string" },
      github: { type: "string" },
      summary: { type: "string" },
      experience: {
        type: "array",
        items: {
          type: "object",
          properties: {
            company: { type: "string" },
            position: { type: "string" },
            location: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            current: { type: "boolean" },
            description: { type: "string", description: "Bullet points, one per line." },
          },
          required: ["company", "position", "description"],
        },
      },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: {
            institution: { type: "string" },
            degree: { type: "string" },
            field: { type: "string" },
            location: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            description: { type: "string" },
          },
          required: ["institution", "degree"],
        },
      },
      skills: { type: "array", items: { type: "string" } },
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            tech: { type: "string" },
            link: { type: "string" },
          },
          required: ["name", "description"],
        },
      },
      certifications: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            issuer: { type: "string" },
            date: { type: "string" },
            credentialId: { type: "string" },
          },
          required: ["name", "issuer"],
        },
      },
      warnings: { type: "array", items: { type: "string" } },
    },
    required: ["fullName", "summary", "experience", "education", "skills"],
  };

  const result = await claudeJson<{
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    summary: string;
    experience: Array<Record<string, unknown>>;
    education: Array<Record<string, unknown>>;
    skills: string[];
    projects: Array<Record<string, unknown>>;
    certifications: Array<Record<string, unknown>>;
    warnings: string[];
  }>({
    system: [
      "You extract structured data from resume text.",
      "Copy facts exactly as written — never invent a company, date, degree or metric.",
      "If a field is missing use an empty string. Add a short note to `warnings` when the text was",
      "ambiguous so the candidate can double-check it.",
    ].join(" "),
    prompt: [
      "Parse the following resume text into structured fields.",
      "",
      text.slice(0, 30000),
    ].join("\n"),
    toolName: "parse_resume",
    toolDescription: "Return the structured resume fields.",
    schema,
    maxTokens: 8000,
    creativity: 0.1,
  });

  const resume = normaliseResumeData({
    personal: {
      fullName: result.fullName ?? "",
      title: result.title ?? "",
      email: result.email ?? "",
      phone: result.phone ?? "",
      location: result.location ?? "",
      website: result.website ?? "",
      linkedin: result.linkedin ?? "",
      github: result.github ?? "",
      summary: result.summary ?? "",
    },
    experience: result.experience ?? [],
    education: result.education ?? [],
    skills: (result.skills ?? []).map((name) => ({ name })),
    projects: result.projects ?? [],
    certifications: result.certifications ?? [],
  });

  return {
    resume,
    warnings: result.warnings ?? [],
    demo: false,
  };
}

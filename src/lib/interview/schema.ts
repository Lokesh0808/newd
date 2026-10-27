/**
 * Shared interview domain types.
 */

export const INTERVIEW_TYPES = [
  { id: "hr", name: "HR / Recruiter", description: "Motivation, culture fit, salary expectations and availability." },
  { id: "technical", name: "Technical", description: "Deep dive on your stack, architecture decisions and debugging." },
  { id: "behavioral", name: "Behavioral", description: "STAR-format stories about conflict, leadership and failure." },
  { id: "system-design", name: "System Design", description: "Scalability, data modelling, trade-offs and APIs." },
  { id: "mixed", name: "Mixed", description: "A realistic blend of every question type." },
] as const;

export type InterviewTypeId = (typeof INTERVIEW_TYPES)[number]["id"];

export const EXPERIENCE_LEVELS = [
  { id: "junior", name: "Junior", description: "0-2 years — fundamentals and learning mindset." },
  { id: "mid", name: "Mid-level", description: "2-5 years — independent delivery and ownership." },
  { id: "senior", name: "Senior", description: "5+ years — system design, mentorship and impact." },
  { id: "lead", name: "Lead / Manager", description: "Technical leadership, strategy and team building." },
] as const;

export type ExperienceLevelId = (typeof EXPERIENCE_LEVELS)[number]["id"];

export interface InterviewScores {
  clarity: number;
  relevance: number;
  confidence: number;
  structure: number;
}

export interface StarCoverage {
  situation: boolean;
  task: boolean;
  action: boolean;
  result: boolean;
}

export interface QuestionFeedback {
  scores: InterviewScores;
  /** Overall 0-100 score for this answer. */
  score: number;
  /** Short written feedback (2-4 sentences). */
  feedback: string;
  /** A model answer the candidate can learn from. */
  betterAnswer: string;
  /** Which STAR elements the answer covered. */
  star: StarCoverage;
}

export interface SampleAnswer {
  question: string;
  answer: string;
}

export interface SessionReport {
  overallScore: number;
  scores: InterviewScores;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  sampleAnswers: SampleAnswer[];
}

/** Human readable label for an interview type id. */
export function interviewTypeLabel(id: string): string {
  return INTERVIEW_TYPES.find((t) => t.id === id)?.name ?? "Mixed";
}

/** Human readable label for an experience level id. */
export function experienceLevelLabel(id: string): string {
  return EXPERIENCE_LEVELS.find((l) => l.id === id)?.name ?? "Mid-level";
}

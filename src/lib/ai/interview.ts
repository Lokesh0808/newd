import { claudeJson, aiAvailable } from "@/lib/ai/client";
import { resumeToPlainText, type ResumeData } from "@/lib/resume/schema";
import type { InterviewScores, QuestionFeedback, SampleAnswer, StarCoverage, SessionReport } from "@/lib/interview/schema";

/**
 * AI operations for the mock interview:
 *  1. question generation (context aware, one at a time, with follow-ups),
 *  2. instant answer feedback (clarity / relevance / confidence / structure + STAR),
 *  3. the end-of-session report.
 *
 * Every function ships with a deterministic fallback so the product works
 * without an Anthropic API key.
 */

// ---------------------------------------------------------------------------
// 1. Question generation
// ---------------------------------------------------------------------------

export interface QuestionContext {
  role: string;
  experienceLevel: string;
  interviewType: string;
  /** How many questions have already been asked. */
  askedCount: number;
  /** Total number of questions the candidate asked for. */
  targetCount: number;
  /** Plain-text resume (optional) used to personalise questions. */
  resumeText?: string;
  /** The previous question + the candidate's answer (used for follow-ups). */
  lastQuestion?: string;
  lastAnswer?: string;
  /** Questions already asked, so Claude does not repeat itself. */
  previousQuestions: string[];
}

export interface GeneratedQuestion {
  question: string;
  category: string;
  isFollowUp: boolean;
  /** What the interviewer is probing for (shown as a small hint). */
  intent: string;
  demo: boolean;
}

const QUESTION_BANK: Record<string, string[]> = {
  hr: [
    "Walk me through your background and what made you choose this field.",
    "Why are you interested in this role, and why now?",
    "Tell me about a time you had to learn something quickly. How did you approach it?",
    "What does a great working environment look like for you?",
    "How do you handle disagreement with a teammate?",
    "What are your salary expectations for this role?",
    "Where do you want to grow in the next two years?",
  ],
  technical: [
    "Explain the core concepts you use most often in your day-to-day work.",
    "How would you debug a production issue that only appears under load?",
    "Describe a technical decision you made where a simpler option was rejected.",
    "How do you balance shipping quickly against writing maintainable code?",
    "What is the most complex system you have worked on? What did you own?",
    "How do you approach testing and code quality on a team?",
  ],
  behavioral: [
    "Tell me about a time you had a conflict with a colleague. How did you resolve it?",
    "Describe a project that failed. What was your role and what did you change afterwards?",
    "Tell me about a time you had to lead a project without formal authority.",
    "Give me an example of a time you received difficult feedback.",
    "Describe a situation where you had to deliver under a tight deadline.",
  ],
  "system-design": [
    "Design a URL shortener. How would you scale it to a million requests per second?",
    "How would you design a notification system that reaches a billion users?",
    "Walk me through designing a read-heavy job board with real-time updates.",
    "How would you architect a file upload pipeline that handles petabyte scale?",
    "Design the data model for a messaging app with read receipts.",
  ],
};

export async function generateNextQuestion(ctx: QuestionContext): Promise<GeneratedQuestion> {
  const isFollowUp = Boolean(ctx.lastQuestion && ctx.lastAnswer && ctx.lastAnswer.trim().length > 30);

  if (!aiAvailable) {
    return demoQuestion(ctx, isFollowUp);
  }

  const schema = {
    type: "object",
    properties: {
      question: { type: "string" },
      category: { type: "string" },
      isFollowUp: { type: "boolean" },
      intent: { type: "string", description: "What this question is really assessing." },
    },
    required: ["question", "category", "isFollowUp", "intent"],
  };

  const result = await claudeJson<{
    question: string;
    category: string;
    isFollowUp: boolean;
    intent: string;
  }>({
    system: [
      "You are an experienced interviewer running a live mock interview.",
      "Ask ONE question at a time. Keep it conversational, specific and under 45 words.",
      "Never ask a question that was already asked.",
      "If the candidate's previous answer was thin, ask a focused follow-up that digs deeper",
      "(for example: 'You mentioned X — how exactly did you measure the impact?').",
      "Do not include numbering, preamble or any meta commentary.",
    ].join(" "),
    prompt: [
      `Role: ${ctx.role}`,
      `Experience level: ${ctx.experienceLevel}`,
      `Interview type: ${ctx.interviewType}`,
      `Question ${ctx.askedCount + 1} of ${ctx.targetCount}.`,
      ctx.resumeText ? `Candidate resume (use it to personalise the question):\n${ctx.resumeText.slice(0, 6000)}` : "",
      ctx.previousQuestions.length
        ? `Questions already asked:\n${ctx.previousQuestions.map((q) => `- ${q}`).join("\n")}`
        : "",
      ctx.lastQuestion ? `\nPrevious question: ${ctx.lastQuestion}` : "",
      ctx.lastAnswer ? `Candidate's answer: ${ctx.lastAnswer.slice(0, 2500)}` : "",
      `\nWrite the next question.`,
    ]
      .filter(Boolean)
      .join("\n"),
    toolName: "next_question",
    toolDescription: "The next interview question.",
    schema,
    creativity: 0.8,
    maxTokens: 1000,
  });

  return {
    question: result.question?.trim() || "Tell me about a recent project you are proud of.",
    category: result.category ?? ctx.interviewType,
    isFollowUp: result.isFollowUp ?? isFollowUp,
    intent: result.intent ?? "",
    demo: false,
  };
}

/** Deterministic question used in demo mode. */
function demoQuestion(ctx: QuestionContext, isFollowUp: boolean): GeneratedQuestion {
  if (isFollowUp) {
    const followUps = [
      "Can you walk me through that in more detail — what specifically did you do?",
      "How did you measure the outcome of that?",
      "What would you do differently if you started again today?",
      "What was the hardest part of that, and how did you get past it?",
    ];
    const index = ctx.askedCount % followUps.length;
    return {
      question: followUps[index],
      category: ctx.interviewType,
      isFollowUp: true,
      intent: "Follow-up probing the depth of the previous answer.",
      demo: true,
    };
  }

  const bank = QUESTION_BANK[ctx.interviewType] ?? QUESTION_BANK.mixed ?? QUESTION_BANK.hr!;
  const alreadyAsked = new Set(ctx.previousQuestions.map((q) => q.toLowerCase().trim()));
  const question = bank.find((q) => !alreadyAsked.has(q.toLowerCase().trim())) ?? bank[ctx.askedCount % bank.length]!;

  return {
    question,
    category: ctx.interviewType,
    isFollowUp: false,
    intent: "Assess depth and communication.",
    demo: true,
  };
}

// ---------------------------------------------------------------------------
// 2. Instant answer feedback
// ---------------------------------------------------------------------------

export interface AnswerEvaluationInput {
  question: string;
  answer: string;
  role: string;
  experienceLevel: string;
  interviewType: string;
  resumeText?: string;
}

export async function evaluateAnswer(input: AnswerEvaluationInput): Promise<QuestionFeedback & { demo: boolean }> {
  if (!aiAvailable) return demoEvaluateAnswer(input);

  const schema = {
    type: "object",
    properties: {
      scores: {
        type: "object",
        properties: {
          clarity: { type: "number", description: "0-100" },
          relevance: { type: "number", description: "0-100" },
          confidence: { type: "number", description: "0-100" },
          structure: { type: "number", description: "0-100" },
        },
        required: ["clarity", "relevance", "confidence", "structure"],
      },
      score: { type: "number", description: "Overall 0-100" },
      feedback: { type: "string", description: "2-4 sentences of specific, actionable feedback." },
      betterAnswer: { type: "string", description: "A stronger version of the candidate's answer." },
      star: {
        type: "object",
        properties: {
          situation: { type: "boolean" },
          task: { type: "boolean" },
          action: { type: "boolean" },
          result: { type: "boolean" },
        },
        required: ["situation", "task", "action", "result"],
      },
    },
    required: ["scores", "score", "feedback", "betterAnswer", "star"],
  };

  const result = await claudeJson<{
    scores: InterviewScores;
    score: number;
    feedback: string;
    betterAnswer: string;
    star: StarCoverage;
  }>({
    system: [
      "You are a supportive but rigorous interview coach giving instant feedback on a candidate's answer.",
      "Score each dimension 0-100:",
      "- clarity: is the answer easy to follow and free of rambling?",
      "- relevance: does it actually answer the question?",
      "- confidence: does it sound decisive and self-assured (not apologetic)?",
      "- structure: for behavioural questions, does it follow Situation/Task/Action/Result?",
      "Be specific and actionable. Reference what the candidate actually said.",
      "The `betterAnswer` must preserve the candidate's real facts and only improve the framing.",
    ].join(" "),
    prompt: [
      `Role: ${input.role} (${input.experienceLevel})`,
      `Interview type: ${input.interviewType}`,
      `Question: ${input.question}`,
      input.resumeText ? `Candidate resume (for context):\n${input.resumeText.slice(0, 5000)}` : "",
      `Candidate's answer:\n${input.answer.slice(0, 6000)}`,
      "",
      "Score and critique this answer.",
    ]
      .filter(Boolean)
      .join("\n"),
    toolName: "evaluate_answer",
    toolDescription: "Scores, feedback and a better answer.",
    schema,
    creativity: 0.4,
    maxTokens: 2000,
  });

  return {
    scores: result.scores,
    score: Math.round(result.score),
    feedback: result.feedback?.trim() ?? "",
    betterAnswer: result.betterAnswer?.trim() ?? "",
    star: result.star ?? { situation: false, task: false, action: false, result: false },
    demo: false,
  };
}

/** Matches an answer that opens with a strong past-tense action verb. */
const ACTION_VERB =
  /^(led|built|designed|drove|shipped|launched|owned|increased|reduced|improved|migrated|scaled|automated|negotiated|mentored|delivered|created|introduced|wrote|set up|established|rewrote|architected|implemented|optimised|optimized|resolved|handled|coordinated|streamlined|rebuilt|modernised|modernized)\b/i;

/** Deterministic feedback used in demo mode. */
function demoEvaluateAnswer(input: AnswerEvaluationInput): QuestionFeedback & { demo: boolean } {
  const words = input.answer.trim().split(/\s+/).filter(Boolean);
  const sentences = input.answer
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const hasMetric = /\d+\s*(%|percent|k|m|b|x|ms|s\b)/i.test(input.answer);
  // True when *any* sentence opens with a strong action verb.
  const opensWithVerb = sentences.some((sentence) => ACTION_VERB.test(sentence));

  const clarity = Math.max(35, Math.min(95, 100 - Math.max(0, sentences.length - 6) * 6 + (words.length < 25 ? 12 : 0)));
  const relevance = Math.max(40, Math.min(95, 65 + (words.length > 60 ? 15 : words.length > 25 ? 5 : -10)));
  const confidence = opensWithVerb ? 82 : 68;
  const structure = sentences.length >= 3 && words.length > 45 ? 80 : 58;

  const star: StarCoverage = {
    situation: /^(in |at |when |during |while |as a |as an |my )/i.test(input.answer.trim()),
    task: /(my role|i was responsible|i owned|the goal|we needed|i had to|my job)/i.test(input.answer),
    action: opensWithVerb || /(i led|i built|i designed|i shipped|i created|i drove|i introduced|i wrote|i set up|i reduced|i increased)/i.test(input.answer),
    result: hasMetric,
  };

  const score = Math.round((clarity + relevance + confidence + structure) / 4);

  const feedbackBits: string[] = [];
  if (!hasMetric) feedbackBits.push("Add a measurable outcome (a %, a time saved, or a scale) so the impact is obvious.");
  if (!opensWithVerb) feedbackBits.push("Open with a strong action verb such as 'Led', 'Built' or 'Reduced'.");
  if (sentences.length > 6) feedbackBits.push("Trim the answer — aim for under 90 seconds of speech.");
  if (!star.result) feedbackBits.push("Close with the result; candidates often stop at the task.");
  if (!feedbackBits.length) feedbackBits.push("Good answer — push the result metric higher and add one concrete detail.");

  // Rebuild the answer with an explicit Situation / Action / Result shape.
  const betterAnswer = input.answer.trim()
    ? [
        "Rewritten with structure:",
        "",
        `Situation: ${sentences[0] ?? input.answer.trim()}`,
        `Action: ${sentences.length > 1 ? sentences.slice(1).join(" ") : input.answer.trim()}`,
        `Result: ${hasMetric ? sentences[sentences.length - 1] : "[add the measurable impact here — e.g. 35% fewer UI bugs]"}`,
      ].join("\n")
    : "No answer was given.";

  return {
    scores: { clarity, relevance, confidence, structure },
    score,
    feedback: `${feedbackBits.join(" ")} (Demo scoring — connect an Anthropic API key for AI-written critique.)`,
    betterAnswer,
    star,
    demo: true,
  };
}

// ---------------------------------------------------------------------------
// 3. End-of-session report
// ---------------------------------------------------------------------------

export interface ReportInput {
  role: string;
  experienceLevel: string;
  interviewType: string;
  questions: Array<{
    question: string;
    answer: string | null;
    score: number | null;
    scores: InterviewScores | null;
  }>;
  resumeText?: string;
}

export async function generateSessionReport(input: ReportInput): Promise<SessionReport & { demo: boolean }> {
  const answered = input.questions.filter((q) => q.answer && q.answer.trim());
  const scored = answered.filter((q) => q.scores);

  const aggregate: InterviewScores = {
    clarity: Math.round(
      scored.reduce((sum, q) => sum + (q.scores?.clarity ?? 0), 0) / Math.max(1, scored.length),
    ),
    relevance: Math.round(
      scored.reduce((sum, q) => sum + (q.scores?.relevance ?? 0), 0) / Math.max(1, scored.length),
    ),
    confidence: Math.round(
      scored.reduce((sum, q) => sum + (q.scores?.confidence ?? 0), 0) / Math.max(1, scored.length),
    ),
    structure: Math.round(
      scored.reduce((sum, q) => sum + (q.scores?.structure ?? 0), 0) / Math.max(1, scored.length),
    ),
  };

  const baseOverall = Math.round(
    answered.length
      ? answered.reduce((sum, q) => sum + (q.score ?? 0), 0) / answered.length
      : 0,
  );

  if (!aiAvailable) {
    return {
      overallScore: baseOverall,
      scores: aggregate,
      strengths: demoStrengths(aggregate),
      weaknesses: demoWeaknesses(aggregate),
      tips: demoTips(aggregate),
      sampleAnswers: answered.slice(0, 3).map((q) => ({
        question: q.question,
        answer: "Demo model answer — connect an Anthropic API key to generate personalised sample answers.",
      })),
      demo: true,
    };
  }

  const schema = {
    type: "object",
    properties: {
      overallScore: { type: "number", description: "0-100 overall score for the session" },
      scores: {
        type: "object",
        properties: {
          clarity: { type: "number" },
          relevance: { type: "number" },
          confidence: { type: "number" },
          structure: { type: "number" },
        },
        required: ["clarity", "relevance", "confidence", "structure"],
      },
      strengths: { type: "array", items: { type: "string" } },
      weaknesses: { type: "array", items: { type: "string" } },
      tips: { type: "array", items: { type: "string" }, description: "3-6 concrete next steps." },
      sampleAnswers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
          required: ["question", "answer"],
        },
      },
    },
    required: ["overallScore", "scores", "strengths", "weaknesses", "tips", "sampleAnswers"],
  };

  const transcript = input.questions
    .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer ?? "(not answered)"}`)
    .join("\n\n");

  const result = await claudeJson<{
    overallScore: number;
    scores: InterviewScores;
    strengths: string[];
    weaknesses: string[];
    tips: string[];
    sampleAnswers: SampleAnswer[];
  }>({
    system: [
      "You are an interview coach producing an end-of-session report.",
      "Be honest, specific and encouraging. Reference the actual questions and answers.",
      "- strengths: 2-4 things the candidate genuinely did well.",
      "- weaknesses: 2-4 concrete gaps (e.g. missing metrics, no STAR structure).",
      "- tips: 3-6 actionable next steps, ordered by impact.",
      "- sampleAnswers: 2-3 strong model answers written for the questions actually asked.",
      "Never invent facts that are not in the transcript.",
    ].join(" "),
    prompt: [
      `Role: ${input.role} (${input.experienceLevel}), type: ${input.interviewType}`,
      "",
      "Transcript:",
      transcript.slice(0, 30000),
      "",
      "Produce the session report.",
    ].join("\n"),
    toolName: "session_report",
    toolDescription: "The overall assessment of the interview session.",
    schema,
    maxTokens: 4000,
    creativity: 0.5,
  });

  return {
    overallScore: Math.round(result.overallScore ?? baseOverall),
    scores: result.scores ?? aggregate,
    strengths: result.strengths ?? [],
    weaknesses: result.weaknesses ?? [],
    tips: result.tips ?? [],
    sampleAnswers: result.sampleAnswers ?? [],
    demo: false,
  };
}

function demoStrengths(scores: InterviewScores): string[] {
  const list: string[] = [];
  if (scores.relevance >= 70) list.push("Your answers stayed on topic and addressed what was asked.");
  if (scores.clarity >= 70) list.push("You explained your thinking clearly and concisely.");
  if (scores.confidence >= 70) list.push("You sounded confident and decisive.");
  if (scores.structure >= 70) list.push("You used a clear narrative structure across your answers.");
  if (!list.length) list.push("You completed every question — keep that momentum going.");
  return list;
}

function demoWeaknesses(scores: InterviewScores): string[] {
  const list: string[] = [];
  if (scores.relevance < 70) list.push("Some answers drifted from the actual question.");
  if (scores.clarity < 70) list.push("Longer answers would benefit from a tighter structure.");
  if (scores.confidence < 70) list.push("Use decisive language instead of hedging.");
  if (scores.structure < 70) list.push("Answer behavioural questions with Situation → Task → Action → Result.");
  if (!list.length) list.push("No major weaknesses detected — focus on adding more measurable results.");
  return list;
}

function demoTips(scores: InterviewScores): string[] {
  const tips = [
    "Rehearse three STAR stories — conflict, failure and a personal win — and reuse the structure.",
    "Prepare one quantified achievement per role so you can always answer 'what was the impact?'.",
  ];
  if (scores.structure < 70) tips.push("Open with one sentence of context, then go straight to your action.");
  if (scores.confidence < 70) tips.push("Replace 'I guess' / 'probably' with a confident statement of what you did.");
  return tips;
}

/** Flatten a resume into the plain text we send to the AI. */
export function resumeTextForAi(resume: ResumeData | null | undefined): string | undefined {
  if (!resume) return undefined;
  return resumeToPlainText(resume);
}

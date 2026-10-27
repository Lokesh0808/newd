import { resumeToPlainText, type ResumeData } from "@/lib/resume/schema";

/**
 * ATS keyword-match scanner.
 *
 * It extracts the "important" keywords from a job description (skills, tools,
 * technologies and role nouns), then checks which of them appear in the
 * resume text. The score is the percentage of important keywords that are
 * matched, with a small penalty for an empty resume.
 *
 * This mirrors what commercial ATS scanners approximate — it is intentionally
 * transparent and explainable rather than a black box.
 */

export interface AtsReport {
  /** 0-100 keyword match score. */
  score: number;
  /** Keywords found in the job description and present in the resume. */
  matched: string[];
  /** Important job-description keywords that are missing from the resume. */
  missing: string[];
  /** All keywords extracted from the job description. */
  keywords: string[];
  /** Actionable suggestions for improving the score. */
  suggestions: string[];
}

/** Words that are too generic to be useful ATS keywords. */
const STOP_WORDS = new Set([
  "a","about","above","across","after","all","also","an","and","any","are","as","at","be","because","been","before",
  "being","below","best","better","between","both","but","by","can","could","do","does","each","else","etc","even",
  "every","few","for","from","further","had","has","have","having","he","her","here","hers","him","his","how","if",
  "in","into","is","it","its","itself","just","like","make","many","may","me","might","more","most","much","must",
  "my","no","nor","not","now","of","off","on","once","only","or","other","our","ours","out","over","own","per","same",
  "she","should","so","some","such","than","that","the","their","theirs","them","then","there","these","they","this",
  "those","through","to","too","under","until","up","us","use","used","very","via","was","we","were","what","when",
  "where","which","while","who","whom","why","will","with","within","without","would","you","your","yours","work",
  "working","role","job","jobs","candidate","candidates","team","teams","company","opportunity","including","include",
  "includes","based","across","years","year","ability","strong","excellent","good","great","plus","must","should",
  "will","would","help","helping","ensure","ensuring","provide","providing","position","positions","environment",
]);

/** High-signal terms we always want to detect, even if phrased oddly. */
const TECH_HINTS = [
  "javascript","typescript","react","next.js","nextjs","vue","angular","svelte","node.js","nodejs","python","java",
  "c#","c++","golang","rust","ruby","php","swift","kotlin","django","flask","fastapi","spring","rails","express",
  "graphql","rest","grpc","websockets","postgresql","postgres","mysql","mongodb","redis","elasticsearch","kafka",
  "aws","gcp","azure","docker","kubernetes","terraform","ci/cd","cicd","jenkins","github actions","git","linux",
  "microservices","serverless","lambda","s3","ecs","ec2","cloudfront","datadog","prometheus","grafana","splunk",
  "machine learning","deep learning","nlp","llm","pytorch","tensorflow","pandas","numpy","scikit-learn","sql",
  "nosql","figma","sketch","tailwind","css","html","sass","redux","zustand","testing","jest","pytest","cypress",
  "playwright","accessibility","a11y","seo","performance","webpack","vite","babel","agile","scrum","jira",
  "product management","stakeholder","roadmap","wireframes","user research","a/b testing","analytics","tableau",
  "leadership","mentoring","recruiting","onboarding","budget","forecasting","negotiation","strategy",
];

/** Escape a string so it can be embedded in a RegExp. */
function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Match a technology hint on word boundaries.
 *
 * A plain `includes()` would match "go" inside "google" and "ml" inside
 * "email", which floods the keyword list with false positives.
 */
function containsHint(text: string, hint: string): boolean {
  const pattern = new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(hint)}([^a-z0-9+#]|$)`, "i");
  return pattern.test(text);
}

/** Words that disqualify a multi-word candidate phrase (too generic to be a keyword). */
const GENERIC_TAILS = new Set([
  "experience","experiences","skill","skills","knowledge","familiarity","understanding","exposure",
  "ability","requirement","requirements","plus","preferred","nice","bonus","working","work","use",
  "using","excellent","strong","solid","good","great","team","teams","product","products","customer",
  "customers","dashboard","application","applications","software","web","mobile","app","apps","etc",
  "role","roles","job","position","candidate","candidates","year","years","month","months","day","days",
  "building","build","develop","developing","create","creating","maintain","maintaining","support",
  "supporting","help","helping","ensure","ensuring","provide","providing","must","should","will",
  "would","including","include","includes","background","professional","proven","track","familiar",
  "api","apis","action","actions","optimization","optimizations","optimise","service",
  "services","system","systems","tool","tools","technologies","technology","framework","frameworks",
  "library","libraries","platform","platforms","solution","solutions","infrastructure","pipeline",
  "pipelines","component","components","interface","interfaces","design","designs","pattern","patterns",
  "senior","junior","mid","principal","staff","hiring","hire","portfolio","opening","vacancy",
  "applicant","resumes","cv","knowledge","skills","requirements",
]);

/** Split a job description into candidate keyword phrases. */
export function extractJobKeywords(jobDescription: string): string[] {
  const text = jobDescription.toLowerCase();

  // 1. Multi-word tech phrases that are written without spaces ("next.js").
  const found = new Set<string>();
  for (const hint of TECH_HINTS) {
    if (containsHint(text, hint)) found.add(hint);
  }

  // 2. Capitalised / technical tokens: React, GraphQL, Kubernetes …
  //    Scanned against the original text so camelCase detection works.
  const techTokens = jobDescription.match(/[A-Za-z][A-Za-z0-9+#.\-]{2,}/g) ?? [];
  for (const token of techTokens) {
    const clean = token.replace(/[.\-]+$/, "");
    if (clean.length < 3) continue;
    const lower = clean.toLowerCase();
    if (STOP_WORDS.has(lower)) continue;
    // Keep tokens that look like a skill (contains a digit, is camelCase, or
    // is a known technology).
    if (/\d/.test(clean) || /[a-z][A-Z]/.test(clean) || TECH_HINTS.includes(lower)) {
      found.add(lower);
    }
  }

  // 3. Quoted phrases in the JD ("GraphQL", "AWS Lambda").
  const quoted = jobDescription.match(/["“]([^"”]{2,40})["”]/g) ?? [];
  for (const q of quoted) {
    const clean = q.replace(/["“”]/g, "").trim().toLowerCase();
    if (clean && !STOP_WORDS.has(clean)) found.add(clean);
  }

  // 4. Requirement lines — keep the meaningful noun phrases.
  //
  // Lines are also split on commas, semicolons and the word "and", because a
  // list like "Next.js, GraphQL and REST APIs" contains three separate
  // technologies, not the phrase "Next.js GraphQL".
  //
  // Every line is then split into runs of "content words" (neither stop words
  // nor generic filler) so we never glue unrelated words together.
  const segments = jobDescription
    .split(/[\n\r,;/]|\band\b/i)
    .map((line) => line.replace(/^[\s•\-*\d.)\]]+/, "").trim())
    .filter((line) => line.length > 2 && line.length < 140);

  for (const segment of segments) {
    const rawWords = segment
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      // Strip trailing punctuation so "dashboard." is recognised as "dashboard".
      .map((word) => word.replace(/^[.\-]+|[.\-]+$/g, ""))
      .filter(Boolean);

    // Split the segment into maximal runs of content words.
    const runs: string[][] = [];
    let current: string[] = [];
    for (const word of rawWords) {
      const isFiller = STOP_WORDS.has(word) || GENERIC_TAILS.has(word);
      if (isFiller || word.length < 3) {
        if (current.length) runs.push(current);
        current = [];
      } else {
        current.push(word);
      }
    }
    if (current.length) runs.push(current);

    for (const run of runs) {
      if (run.length >= 2) {
        // Skip a phrase that only combines two keywords we already know.
        if (run.every((word) => found.has(word))) continue;
        found.add(run.join(" "));
      } else if (!found.has(run[0])) {
        found.add(run[0]);
      }
    }
  }

  // 5. Clean-up: trim punctuation and drop anything that is only punctuation.
  return Array.from(found)
    .map((keyword) => keyword.replace(/^[.\-]+|[.\-]+$/g, "").trim())
    .filter((keyword) => keyword.length > 1 && !/^\.+$/.test(keyword))
    .slice(0, 60);
}

/** Does the resume text mention this keyword? */
function resumeMentions(text: string, keyword: string): boolean {
  const needle = keyword.toLowerCase().trim();
  if (!needle) return false;
  if (text.includes(needle)) return true;

  // Multi-word keywords: require every word to appear somewhere in the
  // resume, tolerating a singular/plural difference ("design system" vs
  // "design systems") — real ATS parsers do the same.
  const parts = needle.split(/\s+/);
  if (parts.length > 1) {
    return parts.every((part) => {
      if (text.includes(part)) return true;
      const plural = part.endsWith("s") ? part.slice(0, -1) : `${part}s`;
      return text.includes(plural);
    });
  }

  // Single word: allow a plural/singular match (react -> reactjs is not a
  // match, but "react" -> "react." is).
  const plural = needle.endsWith("s") ? needle.slice(0, -1) : `${needle}s`;
  return text.includes(plural) || text.includes(`${needle}-`) || text.includes(`.${needle}`);
}

/**
 * Compute the ATS keyword match score for a resume against a job description.
 */
export function scoreResumeForJob(data: ResumeData, jobDescription: string): AtsReport {
  const keywords = extractJobKeywords(jobDescription);
  const text = resumeToPlainText(data).toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of keywords) {
    if (resumeMentions(text, keyword)) matched.push(keyword);
    else missing.push(keyword);
  }

  const total = keywords.length;
  const raw = total === 0 ? 0 : (matched.length / total) * 100;

  // Penalise resumes with very little content — but only mildly, since a
  // keyword match is the primary signal.
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const densityPenalty = wordCount < 80 ? Math.max(0, 10 - wordCount / 8) : 0;

  const score = Math.max(0, Math.min(100, Math.round(raw - densityPenalty)));

  const suggestions: string[] = [];
  if (missing.length) {
    suggestions.push(
      `Add these missing keywords where they are truthful: ${missing.slice(0, 8).join(", ")}.`,
    );
  }
  if (wordCount < 80) {
    suggestions.push("Your resume is short — add measurable achievements to each role.");
  }
  if (!data.personal.summary.trim()) {
    suggestions.push("Add a 2-3 line professional summary; many ATS filters key off it.");
  }
  if (!data.skills.length) {
    suggestions.push("Add a skills section — it is the section ATS matches most often.");
  }
  if (!suggestions.length) {
    suggestions.push("Strong match. Tailor the summary ordering to mirror the job description's top requirements.");
  }

  return { score, matched, missing, keywords, suggestions };
}

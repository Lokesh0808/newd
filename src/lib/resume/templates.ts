/**
 * Resume templates, accent colours and font options.
 *
 * Every template is ATS friendly: single column, standard section headings,
 * no tables, no images, no text boxes — which is exactly what applicant
 * tracking systems parse reliably.
 */

export type ResumeTemplateId = "modern" | "classic" | "minimal" | "compact" | "executive" | "technical";

export interface ResumeTemplate {
  id: ResumeTemplateId;
  name: string;
  description: string;
  /** Tailwind classes applied to the A4 preview page. */
  pageClass: string;
  accentClass: string;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean single column with a coloured header band. Great all-round choice.",
    pageClass: "font-sans",
    accentClass: "text-brand-600",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional serif headings and centred header. Ideal for finance and law.",
    pageClass: "font-serif",
    accentClass: "text-slate-700",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Maximum whitespace, no rules or boxes. Recruiters love the breathing room.",
    pageClass: "font-sans",
    accentClass: "text-slate-600",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Tighter spacing that fits two pages of experience onto one.",
    pageClass: "font-sans",
    accentClass: "text-emerald-600",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Confident header with a summary panel, sized for senior roles.",
    pageClass: "font-serif",
    accentClass: "text-amber-700",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Skills-first layout with a highlighted tech stack. Built for engineers.",
    pageClass: "font-mono",
    accentClass: "text-cyan-700",
  },
];

export function getTemplate(id: string | null | undefined): ResumeTemplate {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0];
}

/** Accent colour options offered in the design panel. */
export const ACCENT_COLORS = [
  { id: "indigo", name: "Indigo", text: "text-indigo-600", hex: "#4f46e5", bg: "bg-indigo-600" },
  { id: "violet", name: "Violet", text: "text-violet-600", hex: "#7c3aed", bg: "bg-violet-600" },
  { id: "blue", name: "Blue", text: "text-blue-600", hex: "#2563eb", bg: "bg-blue-600" },
  { id: "cyan", name: "Cyan", text: "text-cyan-600", hex: "#0891b2", bg: "bg-cyan-600" },
  { id: "emerald", name: "Emerald", text: "text-emerald-600", hex: "#059669", bg: "bg-emerald-600" },
  { id: "amber", name: "Amber", text: "text-amber-600", hex: "#d97706", bg: "bg-amber-600" },
  { id: "rose", name: "Rose", text: "text-rose-600", hex: "#e11d48", bg: "bg-rose-600" },
  { id: "slate", name: "Slate", text: "text-slate-700", hex: "#334155", bg: "bg-slate-700" },
] as const;

export type AccentColorId = (typeof ACCENT_COLORS)[number]["id"];

export function getAccent(id: string | null | undefined) {
  return ACCENT_COLORS.find((c) => c.id === id) ?? ACCENT_COLORS[0];
}

/** Font options offered in the design panel (all ATS safe). */
export const FONT_OPTIONS = [
  { id: "inter", name: "Inter", className: "font-sans", family: "Inter, sans-serif" },
  { id: "georgia", name: "Georgia", className: "font-serif", family: "Georgia, serif" },
  { id: "arial", name: "Arial", className: "font-sans", family: "Arial, sans-serif" },
  { id: "calibri", name: "Calibri", className: "font-sans", family: "Calibri, sans-serif" },
  { id: "mono", name: "Roboto Mono", className: "font-mono", family: "Roboto Mono, monospace" },
  { id: "merriweather", name: "Merriweather", className: "font-serif", family: "Merriweather, serif" },
] as const;

export type FontOptionId = (typeof FONT_OPTIONS)[number]["id"];

export function getFont(id: string | null | undefined) {
  return FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0];
}

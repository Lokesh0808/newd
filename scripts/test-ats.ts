import { scoreResumeForJob, extractJobKeywords } from "@/lib/resume/ats";
import { emptyResumeData, type ResumeData } from "@/lib/resume/schema";

const JD = `We are hiring a Senior Product Designer.

Requirements:
- 5+ years of product design experience with Figma
- Strong portfolio of B2B SaaS work
- Experience with design systems and prototyping
- Familiarity with user research and usability testing
- Excellent communication and mentoring skills
- Sketch experience a plus`;

console.log("Keywords:", extractJobKeywords(JD).join(" | "));

const resume: ResumeData = {
  ...emptyResumeData(),
  personal: {
    fullName: "Test Person",
    title: "Product Designer",
    email: "t@example.com",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary:
      "Product designer with 5 years of experience in B2B SaaS. Led a design system rollout that cut design-to-dev handoff time by 40%. Ran 30+ user interviews and shipped onboarding that lifted activation 22%.",
  },
  experience: [
    {
      id: "e1",
      company: "Nova Software",
      position: "Senior Product Designer",
      location: "",
      startDate: "2021",
      endDate: "",
      current: true,
      description:
        "Led the redesign of the onboarding flow, lifting activation by 22%.\nBuilt a design system used by 6 teams, cutting handoff time by 40%.",
    },
  ],
  education: [],
  skills: [
    { id: "s1", name: "Figma" },
    { id: "s2", name: "Design Systems" },
    { id: "s3", name: "Prototyping" },
  ],
  projects: [],
  certifications: [],
};

const report = scoreResumeForJob(resume, JD);
console.log("\nscore:", report.score);
console.log("matched:", report.matched.join(", "));
console.log("missing:", report.missing.join(", "));
console.log("suggestions:", report.suggestions.join(" | "));

// --- Second case: a frontend engineering role ----------------------------
const FRONTEND_JD = `We are hiring a Senior Frontend Engineer to build our customer dashboard.

Requirements:
- 5+ years of experience with React and TypeScript
- Strong experience with Next.js, GraphQL and REST APIs
- Solid understanding of PostgreSQL and Redis
- Experience with AWS, Docker and Kubernetes
- Familiarity with CI/CD pipelines and GitHub Actions
- Excellent communication and mentoring skills
- Experience with accessibility and web performance optimization
- Tailwind CSS and Figma experience a plus`;

const frontendResume: ResumeData = {
  ...emptyResumeData(),
  personal: {
    fullName: "Alex Rivera",
    title: "Senior Frontend Engineer",
    email: "a@example.com",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary:
      "Frontend engineer with 6 years of experience building accessible, high-traffic web applications. Led the redesign of a checkout flow that increased conversion by 18%, and cut bundle size by 40% through performance work.",
  },
  experience: [
    {
      id: "e1",
      company: "Acme Corp",
      position: "Senior Frontend Engineer",
      location: "",
      startDate: "2022",
      endDate: "",
      current: true,
      description:
        "Led the migration of 40 screens to a shared design system, reducing UI bugs by 35%.\nShipped a checkout redesign that lifted conversion 18%.\nMentored 3 junior engineers through weekly code reviews.",
    },
  ],
  education: [],
  skills: [
    { id: "s1", name: "TypeScript" },
    { id: "s2", name: "React" },
    { id: "s3", name: "Next.js" },
    { id: "s4", name: "Node.js" },
    { id: "s5", name: "PostgreSQL" },
    { id: "s6", name: "GraphQL" },
    { id: "s7", name: "AWS" },
    { id: "s8", name: "Docker" },
    { id: "s9", name: "Figma" },
    { id: "s10", name: "Accessibility" },
  ],
  projects: [],
  certifications: [],
};

const frontendReport = scoreResumeForJob(frontendResume, FRONTEND_JD);
console.log("\n--- frontend case ---");
console.log("keywords:", extractJobKeywords(FRONTEND_JD).join(" | "));
console.log("score:", frontendReport.score);
console.log("matched:", frontendReport.matched.join(", "));
console.log("missing:", frontendReport.missing.join(", "));

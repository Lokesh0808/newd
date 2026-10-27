import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";

const FAQS = [
  {
    q: "How does the ATS score work?",
    a: "We extract the important keywords from the job description — technologies, skills, tools and role terms — then check which ones actually appear in your resume. The score is the percentage of those keywords you match, with a small penalty for resumes that are too short. You also get the exact list of matched and missing keywords so you can fix gaps deliberately instead of guessing.",
  },
  {
    q: "Will the AI make up things about me?",
    a: "No. Our prompts explicitly forbid inventing employers, dates, degrees, certifications or metrics. When a section is missing a number, the AI suggests a placeholder like [X%] for you to fill in rather than fabricating a result. You always review the resume before exporting it.",
  },
  {
    q: "Can I upload a resume I already have?",
    a: "Yes. Upload a PDF or DOCX and CareerAI extracts the text, parses it into the structured editor, and then you can use Improve with AI on any section and tailor the whole document to a job description.",
  },
  {
    q: "What does the mock interview actually ask?",
    a: "You choose the job role, your experience level and the interview type — HR, technical, behavioural or system design. The AI asks one question at a time, and if your answer is thin it follows up with a focused probe. If you have a resume saved, the questions are personalised around your real experience.",
  },
  {
    q: "How is my answer scored?",
    a: "Each answer is rated from 0-100 on clarity, relevance, confidence and structure. Behavioural questions are additionally checked against the STAR method, so you can see whether you covered Situation, Task, Action and Result. You get written feedback and a model answer for every question.",
  },
  {
    q: "Can I answer with my voice?",
    a: "Yes. Use the microphone button to dictate your answer with browser speech-to-text, or enable read-aloud so the interviewer speaks each question to you. A per-question timer helps you practise answering within a realistic time limit.",
  },
  {
    q: "Which file formats can I download?",
    a: "PDF for submitting to ATS platforms and a DOCX version when a recruiter or hiring manager asks for an editable Word file. Cover letters can be copied to clipboard or downloaded as a plain text document.",
  },
  {
    q: "What happens to my data?",
    a: "Your resumes and interview sessions belong to you. You can export everything as JSON from Settings at any time, and permanently delete your account and all associated data with one click. We never sell your data or use your resume to train models.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — 3 saved resumes, 5 mock interviews per month, 10 resume uploads and every template and export format. Pro removes the limits and adds personalised interview questions built from your resume.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
            FAQ
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Questions, answered
          </h2>
        </Reveal>

        <Reveal delay={100} className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="text-left text-[15px] font-semibold">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

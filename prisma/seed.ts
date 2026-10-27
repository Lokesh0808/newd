import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seed the database with a demo account and some sample data.
 *
 * Run with: `npm run db:seed`
 */
const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@careerai.app";
const DEMO_PASSWORD = "demo1234";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Demo user ------------------------------------------------------------
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash },
    create: {
      email: DEMO_EMAIL,
      name: "Alex Rivera",
      passwordHash,
      plan: "FREE",
    },
  });

  console.log(`✓ Demo user ready → ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  // --- Sample resume --------------------------------------------------------
  const existingResume = await prisma.resume.findFirst({
    where: { userId: user.id, title: "Frontend Engineer — Acme" },
  });

  if (!existingResume) {
    await prisma.resume.create({
      data: {
        userId: user.id,
        title: "Frontend Engineer — Acme",
        template: "modern",
        accentColor: "indigo",
        fontFamily: "inter",
        data: {
          personal: {
            fullName: "Alex Rivera",
            title: "Frontend Engineer",
            email: "alex.rivera@example.com",
            phone: "+1 555 0142",
            location: "Lisbon, Portugal",
            website: "alexrivera.dev",
            linkedin: "linkedin.com/in/alexrivera",
            github: "github.com/alexrivera",
            summary:
              "Frontend engineer with 6 years of experience building accessible, high-traffic web applications. Led the redesign of a checkout flow that increased conversion by 18%, and cut bundle size by 40% through performance work.",
          },
          experience: [
            {
              id: "exp_1",
              company: "Acme Corp",
              position: "Senior Frontend Engineer",
              location: "Remote",
              startDate: "Mar 2022",
              endDate: "",
              current: true,
              description:
                "Led the migration of 40 screens to a shared design system, reducing UI bugs by 35%.\nShipped a checkout redesign that lifted conversion 18% in one quarter.\nCut main bundle from 340 kB to 205 kB by code-splitting and dependency pruning.\nMentored 3 junior engineers through weekly code reviews.",
            },
            {
              id: "exp_2",
              company: "Northwind Labs",
              position: "Frontend Engineer",
              location: "Berlin, Germany",
              startDate: "Jun 2019",
              endDate: "Feb 2022",
              current: false,
              description:
                "Built a real-time dashboard used by 12,000 daily active users with React and WebSockets.\nIntroduced visual regression testing, catching 60+ layout defects per quarter.\nReduced page load time from 4.2 s to 1.6 s by streaming and image optimisation.",
            },
          ],
          education: [
            {
              id: "edu_1",
              institution: "University of Lisbon",
              degree: "BSc",
              field: "Computer Science",
              location: "Lisbon, Portugal",
              startDate: "2015",
              endDate: "2019",
              description: "First class honours. Dissertation on incremental static analysis.",
            },
          ],
          skills: [
            { id: "skill_1", name: "TypeScript" },
            { id: "skill_2", name: "React" },
            { id: "skill_3", name: "Next.js" },
            { id: "skill_4", name: "Node.js" },
            { id: "skill_5", name: "PostgreSQL" },
            { id: "skill_6", name: "GraphQL" },
            { id: "skill_7", name: "AWS" },
            { id: "skill_8", name: "Docker" },
            { id: "skill_9", name: "Figma" },
            { id: "skill_10", name: "Accessibility" },
          ],
          projects: [
            {
              id: "prj_1",
              name: "Open Source Design System",
              description:
                "Maintained a component library used by 40 engineers across 6 teams.\nCut UI bugs by 35% by adding contract tests to every component.",
              tech: "React, TypeScript, Storybook",
              link: "github.com/alexrivera/design-system",
            },
          ],
          certifications: [
            {
              id: "cert_1",
              name: "AWS Certified Solutions Architect",
              issuer: "Amazon Web Services",
              date: "Mar 2024",
              credentialId: "AWS-4417-2290",
            },
          ],
        },
      },
    });
    console.log("✓ Sample resume created");
  }

  // --- Sample interview session --------------------------------------------
  const existingSession = await prisma.interviewSession.findFirst({
    where: { userId: user.id, role: "Frontend Engineer" },
  });

  if (!existingSession) {
    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        role: "Frontend Engineer",
        experienceLevel: "senior",
        interviewType: "behavioral",
        questionCount: 3,
        status: "completed",
        overallScore: 78,
        scores: { clarity: 80, relevance: 82, confidence: 74, structure: 76 },
        strengths: [
          "You answered the question directly in the first sentence.",
          "You used concrete numbers from your work to show impact.",
        ],
        weaknesses: [
          "Two answers skipped the Result step of the STAR method.",
          "Your answers ran long — aim for 90 seconds.",
        ],
        tips: [
          "Rehearse three STAR stories and reuse the structure every time.",
          "State the result in the first ten seconds to anchor the interviewer.",
        ],
        sampleAnswers: [
          {
            question: "Tell me about a conflict with a colleague.",
            answer:
              "Situation: Two teams owned the checkout API and both were changing it in the same sprint. Task: I had to unblock the release without a rewrite. Action: I wrote a one-page contract with the other team, split ownership by endpoint, and added a shared test suite. Result: We shipped on time and cut duplicate endpoints from 14 to 6.",
          },
        ],
        perQuestionFeedback: {
          q1: "Clear and well structured, but add the measurable result earlier in the answer.",
        },
        completedAt: new Date(),
      },
    });

    await prisma.interviewQuestion.createMany({
      data: [
        {
          sessionId: session.id,
          order: 1,
          question: "Tell me about a time you had a conflict with a colleague. How did you resolve it?",
          category: "behavioral",
          answer:
            "At Acme, two teams owned the checkout API and both were changing it in the same sprint. I wrote a one-page contract, split ownership by endpoint and added a shared test suite. We shipped on time and cut duplicate endpoints from 14 to 6.",
          score: 82,
          durationSeconds: 74,
          scores: { clarity: 84, relevance: 86, confidence: 78, structure: 80 },
          feedback:
            "Good use of Situation / Action. Quantify the outcome earlier and name the conflicting teams explicitly.",
          betterAnswer:
            "Situation: Two teams owned the checkout API and both were changing it in the same sprint. Action: I wrote a one-page contract, split ownership by endpoint and added a shared test suite. Result: We shipped on time and cut duplicate endpoints from 14 to 6.",
          starCoverage: { situation: true, task: true, action: true, result: true },
        },
        {
          sessionId: session.id,
          order: 2,
          question: "Describe a project that failed. What did you change afterwards?",
          category: "behavioral",
          answer:
            "I led the migration of 40 screens to a design system. We missed the deadline because we built components before agreeing on the API. Afterwards I introduced a design review step and shipped the components in small batches so we could validate early.",
          score: 74,
          durationSeconds: 92,
          scores: { clarity: 76, relevance: 80, confidence: 72, structure: 68 },
          feedback:
            "Honest and specific, but the Result was missing — say what the new process delivered.",
          betterAnswer:
            "Situation: A 40-screen migration to a design system shipped two weeks late. Action: We had built components before agreeing on the API, so I introduced a mandatory design review and shipped components in small batches. Result: The next migration landed on time and the process became our default.",
          starCoverage: { situation: true, task: false, action: true, result: false },
        },
      ],
    });

    console.log("✓ Sample interview session created");
  }

  console.log("\nSeed complete. Sign in with:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

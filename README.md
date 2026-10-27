# CareerAI

**AI Resume Builder & Mock Interview Coach.**

CareerAI does the two things that decide most job applications: it writes a
resume that clears the ATS filter, and it rehearses you for the interview so
the real one is not the first time you say it out loud.

- **Resume Maker** — guided 6-step form, live A4 preview, AI rewrites, ATS
  keyword-match score, 6 ATS-friendly templates, PDF/DOCX export, resume
  import and AI cover letters.
- **AI Interview** — a realistic interviewer that asks one question at a time
  and follows up when your answer is thin, with voice input, read-aloud
  questions, a per-question timer, instant structured feedback and an
  end-of-session report.

---

## Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, React 19, Turbopack)                  |
| Styling    | Tailwind CSS v4 + hand-rolled shadcn/ui-style components (Radix)|
| Language   | TypeScript (strict)                                            |
| Database   | PostgreSQL via Prisma ORM (works with Supabase as-is)         |
| Auth       | Auth.js (NextAuth v5) — email/password + Google OAuth          |
| AI         | Anthropic Claude API (`@anthropic-ai/sdk`)                     |
| PDF        | `@react-pdf/renderer`                                          |
| DOCX       | `docx`                                                         |
| Charts     | Recharts                                                       |
| Speech     | Web Speech API (SpeechRecognition + SpeechSynthesis)            |
| Billing    | Stripe Checkout + Billing Portal + webhooks                    |

---

## Quick start

### 1. Prerequisites

- Node.js 20+ (developed on Node 24)
- PostgreSQL 15+ (or Docker, or Supabase)

### 2. Install

```bash
npm install
```

### 3. Configure

```bash
cp .env.example .env
```

Then edit `.env`:

```env
DATABASE_URL="postgresql://careerai:careerai@127.0.0.1:5432/careerai?schema=public"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
ANTHROPIC_API_KEY="sk-ant-..."        # optional — see "Demo mode" below
```

Everything except `DATABASE_URL` is optional. The app boots and is fully
usable without any API keys (see **Demo mode**).

### 4. Database

```bash
# Local PostgreSQL
npm run db:migrate      # create the schema
npm run db:seed         # optional demo account + sample data
```

Or use Docker:

```bash
docker compose up -d db
npm run db:migrate
npm run db:seed
```

### 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

**Demo account:** `demo@careerai.app` / `demo1234` (created by `npm run db:seed`).

---

## Demo mode

CareerAI never hard-fails when an integration is missing:

| Missing credential     | What happens                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`    | Questions come from a built-in bank; answers are scored with a deterministic heuristic; the UI shows a clear "Demo mode" badge. The **ATS score is always real** — it is computed locally and does not need the API. |
| `AUTH_GOOGLE_ID/SECRET`| The "Continue with Google" button is hidden instead of failing.      |
| `STRIPE_SECRET_KEY`    | The upgrade button explains that billing is not configured.          |

To enable the real thing, add the key and restart the dev server — no code
changes needed.

---

## Project structure

```
src/
├─ app/
│  ├─ page.tsx                     # Landing page (hero, features, steps, testimonials, pricing, FAQ)
│  ├─ (auth)/                      # Login + signup (split-screen brand panel)
│  │  ├─ login/page.tsx
│  │  └─ signup/page.tsx
│  ├─ (app)/                       # Authenticated app shell
│  │  ├─ layout.tsx                # Sidebar + top bar
│  │  ├─ dashboard/page.tsx        # Resumes, interviews, scores, progress charts
│  │  ├─ resume/page.tsx           # Resume library
│  │  ├─ resume/[id]/page.tsx      # Resume editor (form + live preview)
│  │  ├─ interview/page.tsx        # Interview setup + history
│  │  ├─ interview/[id]/page.tsx   # Live mock interview
│  │  ├─ interview/[id]/report/    # End-of-session report
│  │  └─ settings/page.tsx         # Profile, billing, privacy
│  ├─ api/
│  │  ├─ auth/[...nextauth]/       # Auth.js handlers
│  │  ├─ auth/register/            # Email + password sign-up
│  │  ├─ ai/resume-improve/        # "Improve with AI"
│  │  ├─ ai/resume-tailor/         # Tailor + ATS score
│  │  ├─ ai/cover-letter/          # Cover letter generator
│  │  ├─ ai/parse-resume/          # Upload + parse PDF/DOCX
│  │  ├─ resumes/                  # CRUD + PDF/DOCX export
│  │  ├─ interviews/               # Session CRUD, questions, answers, report
│  │  ├─ billing/                  # Stripe checkout, portal, webhook
│  │  └─ data/                     # Export + delete
│  ├─ sitemap.ts, robots.ts, not-found.tsx
│  └─ proxy.ts                     # Next.js 16 route protection
├─ components/
│  ├─ landing/                     # Marketing sections
│  ├─ auth/, app/                  # Auth form, app shell, user menu
│  ├─ resume/                      # Editor, sections, preview, design + ATS panels
│  ├─ interview/                   # Setup, live session, feedback, report
│  ├─ dashboard/, charts/, settings/
│  └─ ui/                          # Button, Input, Dialog, Tabs, … (Radix + CVA)
├─ hooks/                          # Speech recognition/synthesis, countdown
└─ lib/
   ├─ ai/                          # Claude client + all AI operations
   ├─ resume/                      # Schema, templates, ATS scanner, PDF renderer
   ├─ interview/                   # Domain types
   ├─ auth.ts, auth.config.ts      # Auth.js setup
   ├─ entitlements.ts              # Free vs Pro limits
   ├─ prisma.ts, stripe.ts, api.ts
```

---

## How the key pieces work

### ATS scoring

`src/lib/resume/ats.ts` extracts high-signal keywords from a job
description (technologies, tools, skill phrases) and checks which of them
appear in the resume. The score is the percentage matched, minus a small
penalty for resumes that are too short. It is deterministic and explainable —
you always see the matched and missing keyword lists, never just a number.

### AI integration

`src/lib/ai/client.ts` wraps the Anthropic API and forces a **tool call** for
every request, so responses are always valid JSON (no markdown-fence
stripping). If the configured model is unavailable it falls back through a
list of known model ids.

Every AI operation lives in `src/lib/ai/resume.ts` or `src/lib/ai/interview.ts`
and ships with a deterministic fallback, which is what makes demo mode work.

### Resume rendering

The PDF (`src/lib/resume/pdf-document.tsx`) and the live preview
(`src/components/resume/resume-preview.tsx`) are separate renderers that
mirror each other. Both are single-column, real-text, standard-headings —
which is what applicant tracking systems parse reliably.

### Autosave

The editor keeps the newest payload in a ref and PATCHes the resume 1.2 s
after the last edit. Pending changes are flushed on unmount, and again before
a PDF/DOCX export, so nothing is ever lost.

---

## API reference

| Method   | Route                              | Purpose                                    |
| -------- | ---------------------------------- | ------------------------------------------ |
| `POST`   | `/api/auth/register`               | Create an email + password account         |
| `GET`    | `/api/resumes`                     | List saved resumes                         |
| `POST`   | `/api/resumes`                     | Create a resume                             |
| `GET`    | `/api/resumes/[id]`                | Load a resume                               |
| `PATCH`  | `/api/resumes/[id]`                | Save content / design / ATS report          |
| `DELETE` | `/api/resumes/[id]`                | Delete a resume                             |
| `GET`    | `/api/resumes/[id]/pdf`            | Download PDF                                |
| `GET`    | `/api/resumes/[id]/docx`           | Download DOCX                               |
| `POST`   | `/api/ai/resume-improve`           | Rewrite one section                         |
| `POST`   | `/api/ai/resume-tailor`            | Tailor to a JD + compute the ATS score      |
| `POST`   | `/api/ai/cover-letter`             | Generate a cover letter                     |
| `POST`   | `/api/ai/parse-resume`             | Upload and parse PDF/DOCX                   |
| `GET`    | `/api/interviews`                  | List sessions                               |
| `POST`   | `/api/interviews`                  | Start a session                             |
| `GET`    | `/api/interviews/[id]`             | Load a session with its questions           |
| `DELETE` | `/api/interviews/[id]`             | Delete a session                            |
| `POST`   | `/api/interviews/[id]/question`    | Ask for the next question                   |
| `POST`   | `/api/interviews/[id]/answer`      | Submit an answer, get instant feedback      |
| `POST`   | `/api/interviews/[id]/complete`    | Build the end-of-session report             |
| `POST`   | `/api/billing/checkout`            | Start a Stripe Checkout session             |
| `POST`   | `/api/billing/portal`              | Open the Stripe Billing Portal              |
| `POST`   | `/api/billing/webhook`             | Stripe webhook (plan sync)                  |
| `GET`    | `/api/data/export`                 | Download everything as JSON                 |
| `POST`   | `/api/data/delete`                 | Delete data or the whole account            |

All API routes authorise independently of the page proxy and return JSON
errors with a friendly message.

---

## Plans & limits

| | Free | Pro |
| --- | --- | --- |
| Saved resumes | 3 | Unlimited |
| Mock interviews | 5 / month | Unlimited |
| Resume uploads | 10 / month | Unlimited |
| Templates, colours, fonts | All | All |
| PDF / DOCX export | Yes | Yes |
| Personalised interview questions | — | Yes |
| Priority AI processing | — | Yes |

Stripe checkout is wired up; set `STRIPE_SECRET_KEY`,
`STRIPE_PRICE_PRO_MONTHLY` and `STRIPE_PRICE_PRO_YEARLY`, then point a
webhook at `/api/billing/webhook`.

---

## Privacy

- Export everything as JSON: `GET /api/data/export`.
- Delete only your content, or your whole account: `POST /api/data/delete`
  (requires typing your email address to confirm).
- Passwords are hashed with bcrypt and never logged.
- AI prompts explicitly forbid inventing employers, dates, degrees or metrics.

---

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run start        # serve the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run db:migrate   # create/apply a migration
npm run db:seed      # demo account + sample data
npm run db:studio    # Prisma Studio
npm run db:reset     # drop, re-migrate and re-seed
```

---

## Deployment

Works on any Node host (Vercel, Railway, Fly, a VPS). Remember to:

1. Set `DATABASE_URL`, `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL`.
2. Run `npm run db:deploy` (applies migrations) during the release step.
3. Add `ANTHROPIC_API_KEY` to enable real AI features.

---

## Notes

- Next.js 16 renamed `middleware.ts` to `proxy.ts` — route protection lives in
  `src/proxy.ts`.
- `speechRecognition` is not available in Firefox; the app detects this and
  hides the microphone button instead of failing.
- The Anthropic SDK v1 removed `temperature`; creativity is mapped onto the
  new `output_config.effort` scale instead.

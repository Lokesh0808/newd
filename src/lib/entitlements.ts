import { prisma } from "@/lib/prisma";

/**
 * Free vs Pro entitlements.
 *
 * The free tier is intentionally generous enough to be useful but limited
 * enough to convert: 3 saved resumes and 5 mock interviews per month.
 */

export const FREE_LIMITS = {
  /** Saved resumes. */
  resumes: 3,
  /** Completed mock interview sessions per calendar month. */
  interviewsPerMonth: 5,
  /** Resume uploads (AI parsing) per calendar month. */
  uploadsPerMonth: 10,
} as const;

export const PRO_LIMITS = {
  resumes: Number.POSITIVE_INFINITY,
  interviewsPerMonth: Number.POSITIVE_INFINITY,
  uploadsPerMonth: Number.POSITIVE_INFINITY,
} as const;

export interface UsageSnapshot {
  plan: "FREE" | "PRO";
  resumes: { used: number; limit: number };
  interviews: { used: number; limit: number };
  uploads: { used: number; limit: number };
}

/** Start of the current calendar month (UTC). */
function startOfMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Count how many times a resume was imported from an upload this month. */
async function countUploadsThisMonth(userId: string) {
  // We store uploads as resumes whose title starts with the import marker,
  // which keeps the schema lean while still allowing accurate counting.
  const since = startOfMonth();
  return prisma.resume.count({
    where: { userId, createdAt: { gte: since }, title: { startsWith: "[imported]" } },
  });
}

/** Current usage for a user, used by the dashboard and the upgrade banners. */
export async function getUsage(userId: string, plan: "FREE" | "PRO"): Promise<UsageSnapshot> {
  const limits = plan === "PRO" ? PRO_LIMITS : FREE_LIMITS;

  const [resumes, interviews, uploads] = await Promise.all([
    prisma.resume.count({ where: { userId } }),
    prisma.interviewSession.count({
      where: { userId, createdAt: { gte: startOfMonth() }, status: "completed" },
    }),
    countUploadsThisMonth(userId),
  ]);

  return {
    plan,
    resumes: { used: resumes, limit: limits.resumes },
    interviews: { used: interviews, limit: limits.interviewsPerMonth },
    uploads: { used: uploads, limit: limits.uploadsPerMonth },
  };
}

export interface LimitCheck {
  allowed: boolean;
  used: number;
  limit: number;
  message?: string;
}

/**
 * Check whether the user may create one more item of the given kind.
 */
export async function checkLimit(
  userId: string,
  plan: "FREE" | "PRO",
  kind: "resumes" | "interviews" | "uploads",
): Promise<LimitCheck> {
  const usage = await getUsage(userId, plan);
  const entry = usage[kind];
  const allowed = entry.used < entry.limit;

  return {
    allowed,
    used: entry.used,
    limit: entry.limit,
    message: allowed
      ? undefined
      : `You have reached the free-tier limit of ${entry.limit} ${
          kind === "resumes" ? "saved resumes" : kind === "interviews" ? "mock interviews" : "resume uploads"
        } this month. Upgrade to Pro for unlimited access.`,
  };
}

import type { Metadata } from "next";
import { Suspense } from "react";

import { SettingsView } from "@/components/settings/settings-view";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/env";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your CareerAI profile, subscription and data.",
};

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const dbUser = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          plan: true,
          createdAt: true,
          subscriptionStatus: true,
          subscriptionRenewsAt: true,
        },
      })
    : null;

  const user = {
    name: dbUser?.name ?? session?.user?.name ?? null,
    email: dbUser?.email ?? session?.user?.email ?? "",
    plan: dbUser?.plan ?? "FREE",
    createdAt: (dbUser?.createdAt ?? new Date()).toISOString(),
    subscriptionStatus: dbUser?.subscriptionStatus ?? null,
    subscriptionRenewsAt: dbUser?.subscriptionRenewsAt?.toISOString() ?? null,
    billingEnabled: isBillingEnabled,
  };

  // `useSearchParams` needs a Suspense boundary during prerendering.
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading settings…</div>}>
      <SettingsView user={user} />
    </Suspense>
  );
}

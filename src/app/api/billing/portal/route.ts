import { NextResponse } from "next/server";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { getStripe } from "@/lib/stripe";
import { env, isBillingEnabled } from "@/lib/env";
import { prisma } from "@/lib/prisma";

/**
 * Create a Stripe Billing Portal link so the user can manage or cancel
 * their subscription.
 */
export const POST = withErrorHandling(async () => {
  const user = await requireUser();

  if (!isBillingEnabled) {
    return apiError("Billing is not configured on this deployment.", 503, "BILLING_NOT_CONFIGURED");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) {
    return apiError("You do not have an active subscription.", 400, "NO_SUBSCRIPTION");
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${env.appUrl}/settings#billing`,
  });

  return NextResponse.json({ url: session.url });
});

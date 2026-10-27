import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireUser, withErrorHandling } from "@/lib/api";
import { getStripe, priceIdFor } from "@/lib/stripe";
import { env, isBillingEnabled } from "@/lib/env";

const bodySchema = z.object({
  period: z.enum(["monthly", "yearly"]).default("monthly"),
});

/**
 * Start a Stripe Checkout session for the Pro plan.
 */
export const POST = withErrorHandling(async (request: Request) => {
  const user = await requireUser();

  if (!isBillingEnabled) {
    return apiError(
      "Billing is not configured on this deployment. Add STRIPE_SECRET_KEY and the Pro price ids to enable the Pro plan.",
      503,
      "BILLING_NOT_CONFIGURED",
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  const period = parsed.success ? parsed.data.period : "monthly";

  const stripe = getStripe();
  const price = priceIdFor(period);

  // Make sure the customer exists so the portal link works later.
  let customerId = (await stripe.customers.list({ email: user.email ?? undefined, limit: 1 })).data[0]
    ?.id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${env.appUrl}/settings?billing=success`,
    cancel_url: `${env.appUrl}/settings?billing=cancelled`,
    allow_promotion_codes: true,
    metadata: { userId: user.id },
    subscription_data: { metadata: { userId: user.id } },
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
});

import Stripe from "stripe";
import { env, isBillingEnabled } from "@/lib/env";

/**
 * Stripe client.
 *
 * Billing is optional: when `STRIPE_SECRET_KEY` is not configured the app
 * still works, the upgrade button simply shows a "not configured" message
 * instead of creating a checkout session.
 */
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!isBillingEnabled) {
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY (and the price ids) to enable the Pro plan.",
    );
  }
  if (!cached) {
    cached = new Stripe(env.stripeSecretKey);
  }
  return cached;
}

/** Price id for the requested billing period. */
export function priceIdFor(period: "monthly" | "yearly"): string {
  const id = period === "yearly" ? env.stripePriceYearly : env.stripePriceMonthly;
  if (!id) {
    throw new Error(
      `No Stripe price configured for the ${period} plan. Set STRIPE_PRICE_PRO_${period.toUpperCase()}.`,
    );
  }
  return id;
}

import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe";
import { env, isBillingEnabled } from "@/lib/env";
import { prisma } from "@/lib/prisma";

/**
 * Stripe webhook — keeps the user's plan in sync.
 *
 * Handled events:
 *  - checkout.session.completed  → activate Pro
 *  - customer.subscription.updated → update status / renewal date
 *  - customer.subscription.deleted → downgrade to Free
 */
export async function POST(request: Request) {
  if (!isBillingEnabled) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: "PRO",
              stripeCustomerId:
                typeof session.customer === "string" ? session.customer : session.customer?.id,
              stripeSubscriptionId:
                typeof session.subscription === "string"
                  ? session.subscription
                  : session.subscription?.id,
              subscriptionStatus: "active",
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          // Since API version 2026-05-27 the billing period lives on the
          // subscription item rather than the subscription itself.
          const item = subscription.items.data[0];
          const periodEnd = item?.current_period_end;

          await prisma.user.update({
            where: { id: userId },
            data: {
              plan:
                subscription.status === "active" || subscription.status === "trialing" ? "PRO" : "FREE",
              stripeSubscriptionId: subscription.id,
              stripePriceId: item?.price?.id,
              subscriptionStatus: subscription.status,
              subscriptionRenewsAt: periodEnd ? new Date(periodEnd * 1000) : null,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: "FREE",
              subscriptionStatus: "canceled",
              stripeSubscriptionId: null,
            },
          });
        }
        break;
      }

      default:
        // Unhandled events are acknowledged so Stripe does not retry.
        break;
    }
  } catch (error) {
    console.error("[careerai] Stripe webhook handler failed:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

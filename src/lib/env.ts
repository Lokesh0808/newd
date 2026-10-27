/**
 * Centralised environment access.
 *
 * Nothing in the app reads `process.env` directly except this module, which
 * keeps configuration in one place and makes "feature not configured" states
 * explicit (e.g. Google sign-in is hidden when no OAuth credentials exist).
 */

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  authSecret: process.env.AUTH_SECRET ?? "dev-only-secret",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5",

  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  stripePriceYearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",

  googleClientId: process.env.AUTH_GOOGLE_ID ?? "",
  googleClientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
} as const;

/** True when Google OAuth has been configured for this deployment. */
export const isGoogleAuthEnabled = Boolean(env.googleClientId && env.googleClientSecret);

/** True when the Claude API is reachable; otherwise the app runs in demo mode. */
export const isAiEnabled = Boolean(env.anthropicApiKey);

/** True when Stripe has been configured for the Pro plan. */
export const isBillingEnabled = Boolean(env.stripeSecretKey);

import Stripe from "stripe";

import type { PlanInterval } from "@/types/billing";

function normalizePlanSlug(planSlug: string) {
  return planSlug
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function isPublishableStripeKey(value: string | undefined) {
  return value?.startsWith("pk_") ?? false;
}

export function hasStripeBillingEnv() {
  return Boolean(process.env.STRIPE_SECRET_KEY && !isPublishableStripeKey(process.env.STRIPE_SECRET_KEY));
}

export function getStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY to enable live checkout.");
  }

  if (isPublishableStripeKey(secretKey)) {
    throw new Error(
      "Stripe server configuration is using a publishable key. Replace STRIPE_SECRET_KEY with an sk_test_ or sk_live_ secret key."
    );
  }

  return secretKey;
}

export function hasStripeWebhookSecret() {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "Stripe webhook signing secret is missing. Set STRIPE_WEBHOOK_SECRET to process Stripe events."
    );
  }

  return webhookSecret;
}

export function createStripeClient() {
  return new Stripe(getStripeSecretKey());
}

export function getStripePriceIdForPlan(planSlug: string, billingInterval: PlanInterval) {
  const slugKey = normalizePlanSlug(planSlug);
  const candidates =
    billingInterval === "none"
      ? [`STRIPE_PRICE_ID_${slugKey}`]
      : [`STRIPE_PRICE_ID_${slugKey}_${billingInterval.toUpperCase()}`, `STRIPE_PRICE_ID_${slugKey}`];

  for (const candidate of candidates) {
    const value = process.env[candidate];

    if (value) {
      return value;
    }
  }

  throw new Error(
    `No Stripe price ID is configured for the "${planSlug}" plan. Set one of: ${candidates.join(", ")}.`
  );
}

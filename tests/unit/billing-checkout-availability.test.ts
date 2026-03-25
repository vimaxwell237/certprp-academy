import assert from "node:assert/strict";
import test from "node:test";

import { getBillingCheckoutAvailability } from "@/features/billing/data/billing-service";
import type { BillingPlan } from "@/types/billing";

function buildPlan(slug: string, billingInterval: BillingPlan["billingInterval"]): BillingPlan {
  return {
    id: `${slug}-id`,
    name: slug,
    slug,
    description: `${slug} description`,
    priceAmount: slug === "free" ? 0 : 4900,
    priceCurrency: "USD",
    billingInterval,
    isActive: true,
    features: {}
  };
}

function withEnv(updates: Record<string, string | undefined>) {
  const previous = new Map<string, string | undefined>();

  for (const [key, value] of Object.entries(updates)) {
    previous.set(key, process.env[key]);

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  return () => {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
}

test("checkout availability stays enabled when Stripe is configured without a service role key", () => {
  const restoreEnv = withEnv({
    BILLING_PROVIDER: "stripe",
    STRIPE_SECRET_KEY: "sk_test_123456",
    STRIPE_PRICE_ID_PREMIUM_MONTH: "price_premium_month",
    STRIPE_PRICE_ID_TUTOR_PLAN_MONTH: "price_tutor_plan_month",
    SUPABASE_SERVICE_ROLE_KEY: undefined
  });

  try {
    const availability = getBillingCheckoutAvailability([
      buildPlan("free", "none"),
      buildPlan("premium", "month"),
      buildPlan("tutor-plan", "month")
    ]);

    assert.equal(availability.activeProvider, "stripe");
    assert.equal(availability.isReady, true);
    assert.equal(availability.globalMessage, null);
    assert.equal(availability.planMessages.premium, null);
    assert.equal(availability.planMessages["tutor-plan"], null);
  } finally {
    restoreEnv();
  }
});

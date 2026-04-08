import assert from "node:assert/strict";
import test from "node:test";

import { selectCurrentSubscriptionRecord } from "@/features/billing/data/billing-service";

function buildSubscriptionRow(input: {
  id: string;
  status: "active" | "trialing" | "canceled" | "expired" | "past_due";
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: input.id,
    user_id: "user-1",
    plan_id: "plan-1",
    status: input.status,
    provider: "dev_checkout" as const,
    provider_customer_id: null,
    provider_subscription_id: `${input.id}-provider`,
    current_period_start: input.createdAt,
    current_period_end: null,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
    plan: {
      id: "plan-1",
      name: "Premium",
      slug: "premium",
      description: "Premium plan",
      price_amount: 2900,
      price_currency: "USD",
      billing_interval: "month" as const,
      is_active: true,
      features_json: {
        full_quiz_access: true
      }
    }
  };
}

test("subscription selection prefers an active row over an expired row with the same update time", () => {
  const sharedUpdatedAt = "2026-04-02T12:00:00.000Z";

  const selected = selectCurrentSubscriptionRecord([
    buildSubscriptionRow({
      id: "expired-row",
      status: "expired",
      createdAt: "2026-03-01T12:00:00.000Z",
      updatedAt: sharedUpdatedAt
    }),
    buildSubscriptionRow({
      id: "active-row",
      status: "active",
      createdAt: "2026-04-02T12:00:00.000Z",
      updatedAt: sharedUpdatedAt
    })
  ]);

  assert.equal(selected?.id, "active-row");
});

test("subscription selection falls back to the newest row when no usable subscription exists", () => {
  const selected = selectCurrentSubscriptionRecord([
    buildSubscriptionRow({
      id: "older-expired-row",
      status: "expired",
      createdAt: "2026-02-01T12:00:00.000Z",
      updatedAt: "2026-02-10T12:00:00.000Z"
    }),
    buildSubscriptionRow({
      id: "newer-canceled-row",
      status: "canceled",
      createdAt: "2026-03-01T12:00:00.000Z",
      updatedAt: "2026-03-10T12:00:00.000Z"
    })
  ]);

  assert.equal(selected?.id, "newer-canceled-row");
});

import test from "node:test";
import assert from "node:assert/strict";

import {
  canAccessCliModule,
  canAccessLabModule,
  canAccessQuizModule,
  getBillingFeatureLabel,
  hasBillingFeature
} from "@/features/billing/lib/access-control";
import type { BillingAccessState } from "@/types/billing";

function buildAccessState(
  slug: "free" | "premium" | "tutor-plan",
  features: Record<string, boolean>
): BillingAccessState {
  return {
    currentPeriodEnd: null,
    currentPeriodStart: null,
    features,
    hasTutorPlan: slug === "tutor-plan",
    isActive: true,
    isPaid: slug !== "free",
    plan: {
      billingInterval: slug === "free" ? "none" : "month",
      description: `${slug} plan`,
      features,
      id: slug,
      isActive: true,
      name: slug,
      priceAmount: slug === "free" ? 0 : 4900,
      priceCurrency: "USD",
      slug
    },
    status: slug === "free" ? "free" : "active",
    subscription: null
  };
}

test("free learners keep preview access to the network fundamentals module", () => {
  const accessState = buildAccessState("free", {
    cli_access: false,
    exam_simulator_access: false,
    full_quiz_access: false,
    lab_access: false,
    tutor_support_access: false
  });

  assert.equal(hasBillingFeature(accessState, "exam_simulator_access"), false);
  assert.equal(canAccessQuizModule(accessState, "network-fundamentals"), true);
  assert.equal(canAccessLabModule(accessState, "network-fundamentals"), true);
  assert.equal(canAccessCliModule(accessState, "network-fundamentals"), true);
  assert.equal(canAccessQuizModule(accessState, "security-fundamentals"), false);
});

test("premium learners unlock self-study features", () => {
  const accessState = buildAccessState("premium", {
    cli_access: true,
    exam_simulator_access: true,
    full_quiz_access: true,
    lab_access: true,
    tutor_support_access: false
  });

  assert.equal(hasBillingFeature(accessState, "full_quiz_access"), true);
  assert.equal(canAccessQuizModule(accessState, "security-fundamentals"), true);
  assert.equal(canAccessLabModule(accessState, "security-fundamentals"), true);
  assert.equal(canAccessCliModule(accessState, "security-fundamentals"), true);
  assert.equal(getBillingFeatureLabel("tutor_support_access"), "Tutor Support");
});

export type PlanInterval = "none" | "month" | "year";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "expired"
  | "past_due";

export type BillingProvider = "dev_checkout" | "stripe";

export type BillingFeatureKey =
  | "full_quiz_access"
  | "exam_simulator_access"
  | "lab_access"
  | "cli_access"
  | "tutor_support_access";

export interface BillingPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  billingInterval: PlanInterval;
  isActive: boolean;
  features: Record<string, boolean>;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  provider: BillingProvider;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingAccessState {
  plan: BillingPlan;
  subscription: UserSubscription | null;
  status: SubscriptionStatus | "free";
  isPaid: boolean;
  isActive: boolean;
  hasTutorPlan: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  features: Record<string, boolean>;
}

export interface PricingPlanCardData extends BillingPlan {
  isCurrentPlan: boolean;
  currentStatus: BillingAccessState["status"] | null;
  callToAction: "current" | "upgrade";
}

export interface BillingCheckoutSession {
  provider: BillingProvider;
  sessionToken: string;
  checkoutUrl: string;
}

export interface DashboardBillingSnapshot {
  currentPlanName: string;
  currentPlanSlug: string;
  subscriptionStatus: BillingAccessState["status"];
  currentPeriodEnd: string | null;
  isPaid: boolean;
  lockedFeatures: Array<{
    feature: BillingFeatureKey;
    label: string;
  }>;
}

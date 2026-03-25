import { APP_ROUTES } from "@/lib/auth/redirects";
import type {
  BillingAccessState,
  BillingFeatureKey,
  BillingPlan,
  PricingPlanCardData
} from "@/types/billing";

const FREE_PREVIEW_MODULE_SLUGS = new Set(["network-fundamentals"]);

export function getBillingFeatureLabel(feature: BillingFeatureKey) {
  switch (feature) {
    case "full_quiz_access":
      return "Full Quiz Library";
    case "exam_simulator_access":
      return "Exam Simulator";
    case "lab_access":
      return "Packet Tracer Labs";
    case "cli_access":
      return "CLI Practice";
    case "tutor_support_access":
      return "Tutor Support";
  }
}

export function hasBillingFeature(
  access: BillingAccessState,
  feature: BillingFeatureKey
) {
  return access.isActive && Boolean(access.features[feature]);
}

export function canAccessQuizModule(
  access: BillingAccessState,
  moduleSlug: string | null
) {
  return hasBillingFeature(access, "full_quiz_access") || Boolean(moduleSlug && FREE_PREVIEW_MODULE_SLUGS.has(moduleSlug));
}

export function canAccessLabModule(
  access: BillingAccessState,
  moduleSlug: string
) {
  return hasBillingFeature(access, "lab_access") || FREE_PREVIEW_MODULE_SLUGS.has(moduleSlug);
}

export function canAccessCliModule(
  access: BillingAccessState,
  moduleSlug: string
) {
  return hasBillingFeature(access, "cli_access") || FREE_PREVIEW_MODULE_SLUGS.has(moduleSlug);
}

export function getLockedFeatureList(access: BillingAccessState) {
  const features: BillingFeatureKey[] = [
    "full_quiz_access",
    "exam_simulator_access",
    "lab_access",
    "cli_access",
    "tutor_support_access"
  ];

  return features
    .filter((feature) => !hasBillingFeature(access, feature))
    .map((feature) => ({
      feature,
      label: getBillingFeatureLabel(feature)
    }));
}

export function formatPrice(plan: BillingPlan) {
  if (plan.priceAmount === 0) {
    return "Free";
  }

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.priceCurrency
  }).format(plan.priceAmount / 100);

  return plan.billingInterval === "month" ? `${amount}/mo` : `${amount}/yr`;
}

export function getPlanCallToActionLabel(plan: PricingPlanCardData) {
  if (plan.isCurrentPlan) {
    return "Current Plan";
  }

  return "Upgrade";
}

export function getUpgradeHref() {
  return APP_ROUTES.pricing;
}

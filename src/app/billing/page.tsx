import { redirect } from "next/navigation";

import { BillingSummaryCard } from "@/features/billing/components/billing-summary-card";
import { PricingCard } from "@/features/billing/components/pricing-card";
import {
  fetchPricingPlansForUser,
  getBillingCheckoutAvailability
} from "@/features/billing/data/billing-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";
import type { BillingAccessState, PricingPlanCardData } from "@/types/billing";

export default async function BillingPage({
  searchParams
}: {
  searchParams: Promise<{ billingError?: string }>;
}) {
  const user = await getCurrentUser();
  const { billingError } = await searchParams;

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  let plans: PricingPlanCardData[] = [];
  let accessState: BillingAccessState | null = null;
  let loadErrorMessage: string | null = null;

  try {
    const pricingData = await fetchPricingPlansForUser(user.id);
    plans = pricingData.plans;
    accessState = pricingData.accessState;
  } catch (error) {
    loadErrorMessage = getPublicErrorMessage(
      error,
      "Billing data could not be loaded right now."
    );
  }

  const checkoutAvailability = getBillingCheckoutAvailability(plans);

  if (!accessState) {
    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            Billing
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
            Subscription and access
          </h1>
        </div>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load billing data.</p>
          <p className="mt-2 text-sm">
            Run the Phase 8 billing migration and plan seed SQL in Supabase, then refresh
            this page.
          </p>
          {loadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">
              {loadErrorMessage}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  const lockedFeatures = Object.entries(accessState.features)
    .filter(([, enabled]) => !enabled)
    .map(([feature]) => feature.replaceAll("_", " "));

  return (
    <section className="w-full max-w-6xl space-y-8 pb-12">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
          Billing
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Subscription and access
        </h1>
        <p className="max-w-2xl text-base text-slate">
          Review your current plan, renewal state, and the premium features still locked on
          your account.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <BillingSummaryCard accessState={accessState} />

        <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            Feature Access
          </p>
          {lockedFeatures.length > 0 ? (
            <ul className="mt-4 space-y-3 text-sm text-slate">
              {lockedFeatures.map((feature) => (
                <li className="rounded-2xl bg-pearl px-4 py-4" key={feature}>
                  {feature}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
              All plan-based features are currently unlocked.
            </div>
          )}
        </div>
      </div>

      {billingError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Checkout could not start.</p>
          <p className="mt-2 text-sm">{billingError}</p>
        </div>
      ) : null}

      {checkoutAvailability.globalMessage ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-semibold">Payment setup status</p>
          <p className="mt-2 text-sm">{checkoutAvailability.globalMessage}</p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard
            accessState={accessState}
            checkoutDisabledReason={checkoutAvailability.planMessages[plan.slug] ?? null}
            key={plan.id}
            plan={plan}
            returnTo={APP_ROUTES.billing}
          />
        ))}
      </div>
    </section>
  );
}

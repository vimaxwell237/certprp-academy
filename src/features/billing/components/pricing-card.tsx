import { Card } from "@/components/ui/card";
import { createCheckoutSessionAction } from "@/features/billing/actions/billing-actions";
import { CurrentPlanBadge } from "@/features/billing/components/current-plan-badge";
import {
  formatPrice,
  getPlanCallToActionLabel
} from "@/features/billing/lib/access-control";
import type { BillingAccessState, PricingPlanCardData } from "@/types/billing";

function formatFeatureLabel(feature: string) {
  return feature
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function PricingCard({
  plan,
  accessState,
  checkoutDisabledReason,
  returnTo
}: {
  plan: PricingPlanCardData;
  accessState: BillingAccessState | null;
  checkoutDisabledReason?: string | null;
  returnTo?: string;
}) {
  const features = Object.entries(plan.features).filter(([, enabled]) => Boolean(enabled));
  const isCurrent = plan.isCurrentPlan;
  const isCheckoutDisabled = Boolean(checkoutDisabledReason) || isCurrent;

  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {isCurrent && accessState ? <CurrentPlanBadge accessState={accessState} /> : null}
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            {plan.billingInterval === "none" ? "Starter" : plan.billingInterval}
          </span>
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-3xl font-semibold text-ink">{plan.name}</h2>
          <p className="text-base text-slate">{plan.description}</p>
        </div>
        <p className="font-display text-4xl font-bold text-ink">{formatPrice(plan)}</p>
      </div>

      <ul className="space-y-2 text-sm text-slate">
        {features.length > 0 ? (
          features.map(([feature]) => (
            <li key={feature}>- {formatFeatureLabel(feature)}</li>
          ))
        ) : (
          <li>- Lessons and limited preview content</li>
        )}
      </ul>

      {plan.slug === "free" ? (
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          The free plan is the default starting point for all learners.
        </div>
      ) : (
        <form action={createCheckoutSessionAction} className="space-y-3">
          <input name="planSlug" type="hidden" value={plan.slug} />
          <input name="returnTo" type="hidden" value={returnTo ?? "/pricing"} />
          <button
            className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCheckoutDisabled}
            type="submit"
          >
            {getPlanCallToActionLabel(plan)}
          </button>
          {checkoutDisabledReason && !isCurrent ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              {checkoutDisabledReason}
            </div>
          ) : null}
        </form>
      )}
    </Card>
  );
}

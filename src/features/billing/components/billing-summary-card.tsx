import Link from "next/link";

import { Card } from "@/components/ui/card";
import { CurrentPlanBadge } from "@/features/billing/components/current-plan-badge";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type { BillingAccessState } from "@/types/billing";

export function BillingSummaryCard({
  accessState
}: {
  accessState: BillingAccessState;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Current Plan
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <CurrentPlanBadge accessState={accessState} />
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            {accessState.status}
          </span>
        </div>
        <h2 className="font-display text-3xl font-semibold text-ink">{accessState.plan.name}</h2>
        <p className="text-base text-slate">{accessState.plan.description}</p>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Status</p>
          <p className="font-semibold text-ink">{accessState.status}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Renewal / End</p>
          <p className="font-semibold text-ink">
            {accessState.currentPeriodEnd
              ? new Date(accessState.currentPeriodEnd).toLocaleDateString()
              : "No renewal date"}
          </p>
        </div>
      </div>

      <Link
        className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
        href={APP_ROUTES.pricing}
      >
        Compare Plans
      </Link>
    </Card>
  );
}

import type { BillingAccessState } from "@/types/billing";

export function CurrentPlanBadge({
  accessState
}: {
  accessState: BillingAccessState;
}) {
  const className =
    accessState.plan.slug === "tutor-plan"
      ? "bg-emerald-100 text-emerald-900"
      : accessState.plan.slug === "premium"
        ? "bg-cyan/10 text-cyan"
        : "bg-pearl text-slate";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${className}`}
    >
      {accessState.plan.name}
    </span>
  );
}

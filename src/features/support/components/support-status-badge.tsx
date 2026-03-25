import { getSupportStatusLabel } from "@/features/support/lib/support-display";
import type { SupportStatus } from "@/types/support";

export function SupportStatusBadge({ status }: { status: SupportStatus }) {
  const className =
    status === "open"
      ? "bg-cyan/10 text-cyan"
      : status === "in_progress"
        ? "bg-amber-100 text-amber-900"
        : status === "resolved"
          ? "bg-emerald-100 text-emerald-900"
          : "bg-slate-200 text-slate-800";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${className}`}
    >
      {getSupportStatusLabel(status)}
    </span>
  );
}

import { getSupportPriorityLabel } from "@/features/support/lib/support-display";
import type { SupportPriority } from "@/types/support";

export function SupportPriorityBadge({ priority }: { priority: SupportPriority }) {
  const className =
    priority === "high"
      ? "bg-rose-100 text-rose-900"
      : priority === "medium"
        ? "bg-amber-100 text-amber-900"
        : "bg-pearl text-slate";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${className}`}
    >
      {getSupportPriorityLabel(priority)}
    </span>
  );
}

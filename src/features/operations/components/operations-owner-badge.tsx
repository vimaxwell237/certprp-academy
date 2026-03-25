import { cn } from "@/lib/utils";

export function OperationsOwnerBadge({
  ownerLabel,
  isCurrentAdmin
}: {
  ownerLabel: string | null;
  isCurrentAdmin?: boolean;
}) {
  if (!ownerLabel) {
    return (
      <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
        Unassigned
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        isCurrentAdmin
          ? "border-cyan-200 bg-cyan-50 text-cyan-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      )}
    >
      {isCurrentAdmin ? "Mine" : ownerLabel}
    </span>
  );
}

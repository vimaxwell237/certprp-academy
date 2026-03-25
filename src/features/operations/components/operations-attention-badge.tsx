import { cn } from "@/lib/utils";

export function OperationsAttentionBadge({
  active,
  label = "Needs Attention"
}: {
  active: boolean;
  label?: string;
}) {
  if (!active) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-900"
      )}
    >
      {label}
    </span>
  );
}

import { cn } from "@/lib/utils";
import type { TutorSessionStatus } from "@/types/scheduling";
import { getTutorSessionStatusLabel } from "@/features/scheduling/lib/scheduling-display";

const STATUS_STYLES: Record<TutorSessionStatus, string> = {
  requested: "bg-amber-100 text-amber-900",
  confirmed: "bg-cyan/15 text-cyan-900",
  completed: "bg-emerald-100 text-emerald-900",
  canceled: "bg-rose-100 text-rose-900"
};

export function SessionStatusBadge({ status }: { status: TutorSessionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        STATUS_STYLES[status]
      )}
    >
      {getTutorSessionStatusLabel(status)}
    </span>
  );
}

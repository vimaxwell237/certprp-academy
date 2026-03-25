import { cn } from "@/lib/utils";
import type {
  NotificationDeliveryStatus,
  ScheduledJobStatus
} from "@/types/delivery";

type OperationsStatus = NotificationDeliveryStatus | ScheduledJobStatus;

const labelMap: Record<OperationsStatus, string> = {
  pending: "Pending",
  sent: "Sent",
  failed: "Failed",
  ignored: "Ignored",
  processed: "Processed",
  canceled: "Canceled"
};

const classMap: Record<OperationsStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-900",
  sent: "border-emerald-200 bg-emerald-50 text-emerald-900",
  failed: "border-rose-200 bg-rose-50 text-rose-900",
  ignored: "border-slate-200 bg-slate-100 text-slate-700",
  processed: "border-cyan-200 bg-cyan-50 text-cyan-900",
  canceled: "border-slate-200 bg-slate-100 text-slate-700"
};

export function OperationsStatusBadge({
  status,
  className
}: {
  status: OperationsStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        classMap[status],
        className
      )}
    >
      {labelMap[status]}
    </span>
  );
}

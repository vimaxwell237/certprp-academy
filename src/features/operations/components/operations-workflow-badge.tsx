import { cn } from "@/lib/utils";
import type { OperationWorkflowState } from "@/types/operations";

const labelMap: Record<OperationWorkflowState, string> = {
  open: "Open",
  investigating: "Investigating",
  waiting: "Waiting",
  resolved: "Resolved"
};

const classMap: Record<OperationWorkflowState, string> = {
  open: "border-slate-200 bg-slate-100 text-slate-800",
  investigating: "border-cyan-200 bg-cyan-50 text-cyan-900",
  waiting: "border-amber-200 bg-amber-50 text-amber-900",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-900"
};

export function OperationsWorkflowBadge({
  workflowState,
  className
}: {
  workflowState: OperationWorkflowState;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        classMap[workflowState],
        className
      )}
    >
      {labelMap[workflowState]}
    </span>
  );
}

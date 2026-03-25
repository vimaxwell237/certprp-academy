import type { LabStatus } from "@/types/lab";

const statusStyles: Record<LabStatus, string> = {
  not_started: "bg-pearl text-slate",
  in_progress: "bg-amber-100 text-amber-900",
  completed: "bg-emerald-100 text-emerald-900"
};

const statusLabels: Record<LabStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed"
};

export function LabStatusBadge({ status }: { status: LabStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

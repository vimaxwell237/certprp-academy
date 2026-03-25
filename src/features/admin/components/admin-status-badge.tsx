import { cn } from "@/lib/utils";

type AdminStatusKind = "published" | "draft" | "active" | "inactive";

const labelMap: Record<AdminStatusKind, string> = {
  published: "Published",
  draft: "Draft",
  active: "Active",
  inactive: "Inactive"
};

const classMap: Record<AdminStatusKind, string> = {
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  draft: "border-amber-200 bg-amber-50 text-amber-800",
  active: "border-cyan-200 bg-cyan-50 text-cyan-800",
  inactive: "border-slate-200 bg-slate-100 text-slate-700"
};

export function AdminStatusBadge({
  status,
  className
}: {
  status: AdminStatusKind;
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

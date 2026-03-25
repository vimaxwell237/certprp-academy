import { cn } from "@/lib/utils";

export function CompletionBadge({ completed }: { completed: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        completed
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-800"
      )}
    >
      {completed ? "Completed" : "In Progress"}
    </span>
  );
}


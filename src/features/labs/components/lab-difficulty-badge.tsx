import type { LabListItem } from "@/types/lab";

const difficultyStyles: Record<LabListItem["difficulty"], string> = {
  beginner: "bg-cyan/10 text-cyan",
  intermediate: "bg-violet-100 text-violet-900",
  advanced: "bg-rose-100 text-rose-900"
};

export function LabDifficultyBadge({
  difficulty
}: {
  difficulty: LabListItem["difficulty"];
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${difficultyStyles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

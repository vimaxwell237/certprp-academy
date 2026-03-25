import type { RecommendationSeverity } from "@/types/guidance";

const severityStyles: Record<RecommendationSeverity, string> = {
  high: "bg-rose-100 text-rose-900",
  medium: "bg-amber-100 text-amber-900",
  low: "bg-cyan/10 text-cyan"
};

export function SeverityBadge({
  severity
}: {
  severity: RecommendationSeverity;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${severityStyles[severity]}`}
    >
      {severity}
    </span>
  );
}

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { dismissRecommendationAction } from "@/features/guidance/actions/guidance-actions";
import { SeverityBadge } from "@/features/guidance/components/severity-badge";
import type { RecommendationItem } from "@/types/guidance";

export function RecommendationCard({
  recommendation
}: {
  recommendation: RecommendationItem;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={recommendation.severity} />
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            {recommendation.recommendationType.replaceAll("_", " ")}
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {recommendation.title}
          </h2>
          <p className="text-base text-slate">{recommendation.description}</p>
          <p className="text-sm text-slate">{recommendation.rationale}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {recommendation.link ? (
          <Link
            className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
            href={recommendation.link.href}
          >
            {recommendation.link.label}
          </Link>
        ) : null}

        <form action={dismissRecommendationAction}>
          <input name="recommendationId" type="hidden" value={recommendation.id} />
          <button
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            type="submit"
          >
            Dismiss
          </button>
        </form>
      </div>
    </Card>
  );
}

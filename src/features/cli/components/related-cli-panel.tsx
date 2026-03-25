import Link from "next/link";

import { Card } from "@/components/ui/card";
import { LabDifficultyBadge } from "@/features/labs/components/lab-difficulty-badge";
import { LabStatusBadge } from "@/features/labs/components/lab-status-badge";
import type { RelatedCliChallengeSummary } from "@/types/cli";

export function RelatedCliPanel({
  challenges,
  title = "CLI Practice"
}: {
  challenges: RelatedCliChallengeSummary[];
  title?: string;
}) {
  if (challenges.length === 0) {
    return null;
  }

  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Guided Command Practice
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div
            className="flex flex-col gap-3 rounded-2xl border border-ink/5 bg-pearl p-4 md:flex-row md:items-center md:justify-between"
            key={challenge.id}
          >
            <div className="space-y-2">
              <p className="font-semibold text-ink">{challenge.title}</p>
              <div className="flex flex-wrap items-center gap-2">
                <LabDifficultyBadge difficulty={challenge.difficulty} />
                <LabStatusBadge status={challenge.status} />
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  {challenge.estimatedMinutes} min
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  {challenge.stepCount} steps
                </span>
              </div>
            </div>

            <Link
              className="inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={`/cli-practice/${challenge.slug}`}
            >
              Open CLI Practice
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}

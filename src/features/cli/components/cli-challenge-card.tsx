import Link from "next/link";

import { Card } from "@/components/ui/card";
import { LabDifficultyBadge } from "@/features/labs/components/lab-difficulty-badge";
import { LabStatusBadge } from "@/features/labs/components/lab-status-badge";
import type { CliChallengeListItem } from "@/types/cli";

export function CliChallengeCard({
  challenge,
  locked = false
}: {
  challenge: CliChallengeListItem;
  locked?: boolean;
}) {
  const actionLabel = challenge.status === "in_progress" ? "Continue Practice" : "Open Challenge";

  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <LabDifficultyBadge difficulty={challenge.difficulty} />
          <LabStatusBadge status={challenge.status} />
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            {challenge.estimatedMinutes} min
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink">{challenge.title}</h2>
        <p className="text-base text-slate">{challenge.summary}</p>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Module</p>
          <p className="font-semibold text-ink">{challenge.moduleTitle}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Lesson</p>
          <p className="font-semibold text-ink">
            {challenge.lessonTitle ?? "Module-level CLI practice"}
          </p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Steps</p>
          <p className="font-semibold text-ink">{challenge.stepCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate">
          {challenge.currentStep
            ? `Current step: ${challenge.currentStep} of ${challenge.stepCount}`
            : "Ready to start"}
        </p>

        <Link
          className={`inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${
            locked
              ? "bg-amber-500 text-white hover:bg-amber-400"
              : "bg-ink text-white hover:bg-slate-900"
          }`}
          href={locked ? "/pricing" : `/cli-practice/${challenge.slug}`}
        >
          {locked ? "Upgrade to Unlock" : actionLabel}
        </Link>
      </div>
    </Card>
  );
}

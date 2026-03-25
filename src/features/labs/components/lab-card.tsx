import Link from "next/link";

import { Card } from "@/components/ui/card";
import { LabDifficultyBadge } from "@/features/labs/components/lab-difficulty-badge";
import { LabProgressForm } from "@/features/labs/components/lab-progress-form";
import { LabStatusBadge } from "@/features/labs/components/lab-status-badge";
import type { LabListItem } from "@/types/lab";

export function LabCard({
  lab,
  returnPath,
  locked = false
}: {
  lab: LabListItem;
  returnPath: string;
  locked?: boolean;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <LabDifficultyBadge difficulty={lab.difficulty} />
          <LabStatusBadge status={lab.status} />
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            {lab.estimatedMinutes} min
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink">{lab.title}</h2>
        <p className="text-base text-slate">{lab.summary}</p>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Module</p>
          <p className="font-semibold text-ink">{lab.moduleTitle}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Related Lesson</p>
          <p className="font-semibold text-ink">{lab.lessonTitle ?? "Module-level lab"}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Files</p>
          <p className="font-semibold text-ink">{lab.fileCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {locked ? (
          <Link
            className="inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-amber-400"
            href="/pricing"
          >
            Upgrade to Unlock
          </Link>
        ) : (
          <LabProgressForm
            labId={lab.id}
            labSlug={lab.slug}
            returnPath={returnPath}
            status={lab.status}
          />
        )}

        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
          href={locked ? "/pricing" : `/labs/${lab.slug}`}
        >
          {locked ? "View Plans" : "Open Lab"}
        </Link>
      </div>
    </Card>
  );
}

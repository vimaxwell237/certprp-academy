import Link from "next/link";

import { Card } from "@/components/ui/card";
import { updateStudyPlanItemCompletionAction } from "@/features/guidance/actions/guidance-actions";
import type { ActiveStudyPlan, StudyPlanItem } from "@/types/guidance";

function StudyPlanItemRow({
  item
}: {
  item: StudyPlanItem;
}) {
  return (
    <div className="rounded-2xl bg-pearl px-4 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
            Step {item.orderIndex}
          </p>
          <h3 className="font-semibold text-ink">{item.title}</h3>
          <p className="text-sm text-slate">{item.description}</p>
        </div>

        <form action={updateStudyPlanItemCompletionAction} className="flex items-center gap-3">
          <input name="itemId" type="hidden" value={item.id} />
          <input
            name="isCompleted"
            type="hidden"
            value={item.isCompleted ? "false" : "true"}
          />
          <button
            className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            type="submit"
          >
            {item.isCompleted ? "Mark Incomplete" : "Mark Complete"}
          </button>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
            item.isCompleted ? "bg-emerald-100 text-emerald-900" : "bg-white text-slate"
          }`}
        >
          {item.isCompleted ? "Completed" : "Pending"}
        </span>
        {item.link ? (
          <Link
            className="text-sm font-semibold text-cyan transition hover:text-teal"
            href={item.link.href}
          >
            {item.actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function StudyPlanCard({
  plan
}: {
  plan: ActiveStudyPlan;
}) {
  return (
    <Card className="space-y-6 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Active Study Plan
        </p>
        <h2 className="font-display text-3xl font-semibold text-ink">{plan.title}</h2>
        <p className="text-base text-slate">{plan.description}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium text-slate">
          <span>Progress</span>
          <span>{plan.progressPercentage}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-pearl">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(8,145,178,0.95),rgba(14,116,144,0.85))]"
            style={{ width: `${plan.progressPercentage}%` }}
          />
        </div>
        <p className="text-sm text-slate">
          {plan.completedItems} of {plan.totalItems} actions completed
        </p>
      </div>

      <div className="grid gap-4">
        {plan.items.map((item) => (
          <StudyPlanItemRow item={item} key={item.id} />
        ))}
      </div>
    </Card>
  );
}

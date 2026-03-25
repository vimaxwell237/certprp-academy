"use client";

import { Button } from "@/components/ui/button";
import type { SubnetCalculationStep } from "@/types/subnetting";

export function SubnetStepByStepPanel({
  mode,
  onRevealAll,
  onRevealNext,
  revealedStepCount,
  steps
}: {
  mode: "quick" | "guided";
  onRevealAll: () => void;
  onRevealNext: () => void;
  revealedStepCount: number;
  steps: SubnetCalculationStep[];
}) {
  const visibleSteps = mode === "quick" ? steps : steps.slice(0, revealedStepCount);

  return (
    <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            Guided Learning
          </p>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Step-by-Step Walkthrough
          </h3>
          <p className="text-sm text-slate">
            {mode === "quick"
              ? "Quick mode shows the full walkthrough immediately."
              : "Guided mode reveals the logic one step at a time so you can follow the reasoning."}
          </p>
        </div>

        {mode === "guided" ? (
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={revealedStepCount >= steps.length}
              onClick={onRevealNext}
              variant="secondary"
            >
              Reveal Next Step
            </Button>
            <Button onClick={onRevealAll}>Show Full Solution</Button>
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        {visibleSteps.map((step, index) => (
          <div className="rounded-2xl bg-pearl px-4 py-4 text-sm" key={step.id}>
            <p className="font-semibold text-ink">
              {index + 1}. {step.title}
            </p>
            <p className="mt-2 text-slate">{step.description}</p>
          </div>
        ))}

        {mode === "guided" && revealedStepCount < steps.length ? (
          <div className="rounded-2xl border border-dashed border-ink/10 px-4 py-4 text-sm text-slate">
            More steps are hidden until you reveal them.
          </div>
        ) : null}
      </div>
    </div>
  );
}

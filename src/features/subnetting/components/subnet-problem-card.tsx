import { Card } from "@/components/ui/card";
import type { GeneratedSubnetProblem } from "@/types/subnetting";

export function SubnetProblemCard({
  problem
}: {
  problem: GeneratedSubnetProblem;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Active Problem
        </p>
        <h2 className="font-display text-3xl font-semibold text-ink">
          {problem.questionLabel}
        </h2>
        <p className="text-base text-slate">{problem.prompt}</p>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-2xl bg-pearl px-4 py-4">
          <p className="text-slate">Difficulty</p>
          <p className="font-semibold capitalize text-ink">{problem.difficulty}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-4">
          <p className="text-slate">Problem Type</p>
          <p className="font-semibold capitalize text-ink">
            {problem.type === "vlsm" ? "VLSM Scenario" : "Direct Subnet"}
          </p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-4">
          <p className="text-slate">Target Prefix</p>
          <p className="font-semibold text-ink">/{problem.prefixLength}</p>
        </div>
      </div>

      {problem.type === "vlsm" && problem.baseNetwork && problem.basePrefix ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950">
          <p className="text-sm font-semibold uppercase tracking-[0.16em]">
            Advanced Prompt
          </p>
          <p className="mt-2 text-sm">
            Base block: {problem.baseNetwork}/{problem.basePrefix}
          </p>
          <p className="mt-1 text-sm">
            Required hosts: {problem.requiredHosts ?? 0}
          </p>
        </div>
      ) : null}
    </Card>
  );
}

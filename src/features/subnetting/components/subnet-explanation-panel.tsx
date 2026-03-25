import { Card } from "@/components/ui/card";
import type { SubnetValidationResult } from "@/types/subnetting";

export function SubnetExplanationPanel({
  hintVisible,
  result
}: {
  hintVisible: boolean;
  result: SubnetValidationResult | null;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Step-by-Step Explanation
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">
          {result?.explanation.headline ?? "Explanation appears after you submit a problem."}
        </h3>
        <p className="text-sm text-slate">
          {result?.explanation.overview ??
            "The trainer will break down host bits, block size, subnet mask, network range, and usable hosts."}
        </p>
      </div>

      {result ? (
        <>
          <ol className="space-y-3">
            {result.explanation.steps.map((step, index) => (
              <li className="rounded-2xl bg-pearl px-4 py-4 text-sm text-ink" key={step}>
                <span className="font-semibold text-cyan">{index + 1}.</span> {step}
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border border-cyan/20 bg-cyan/5 px-4 py-4 text-sm text-ink">
            <p className="font-semibold">Correct values</p>
            <p className="mt-2">Subnet mask: {result.solution.subnetMask}</p>
            <p className="mt-1">Network address: {result.solution.networkAddress}</p>
            <p className="mt-1">First usable host: {result.solution.firstUsableHost}</p>
            <p className="mt-1">Last usable host: {result.solution.lastUsableHost}</p>
            <p className="mt-1">Broadcast address: {result.solution.broadcastAddress}</p>
            <p className="mt-1">Usable hosts: {result.solution.totalUsableHosts}</p>
          </div>

          {hintVisible ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
              <p className="font-semibold">Hint</p>
              <p className="mt-2">{result.explanation.hint}</p>
            </div>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

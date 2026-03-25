import { Card } from "@/components/ui/card";
import type { SubnetVisualCalculationResult } from "@/types/subnetting";

export function SubnetResultCard({
  result
}: {
  result: SubnetVisualCalculationResult;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Final Result
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">
          Subnet Summary
        </h3>
        <p className="text-sm text-slate">{result.summary}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
          <p className="text-slate">Network</p>
          <p className="mt-1 font-semibold text-ink">{result.networkAddress}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
          <p className="text-slate">First Host</p>
          <p className="mt-1 font-semibold text-ink">{result.firstUsableHost}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
          <p className="text-slate">Last Host</p>
          <p className="mt-1 font-semibold text-ink">{result.lastUsableHost}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
          <p className="text-slate">Broadcast</p>
          <p className="mt-1 font-semibold text-ink">{result.broadcastAddress}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
          <p className="text-slate">Usable Hosts</p>
          <p className="mt-1 font-semibold text-ink">{result.usableHosts}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-cyan/5 px-4 py-4 text-sm text-ink">
          <p className="font-semibold text-cyan">Total addresses</p>
          <p className="mt-2">{result.totalAddresses}</p>
        </div>
        <div className="rounded-2xl bg-cyan/5 px-4 py-4 text-sm text-ink">
          <p className="font-semibold text-cyan">Subnet mask</p>
          <p className="mt-2">{result.subnetMask}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        <p className="font-semibold">Common Mistake Check</p>
        <ul className="mt-3 space-y-2">
          {result.commonMistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

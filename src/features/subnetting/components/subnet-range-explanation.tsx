import { Card } from "@/components/ui/card";

export function SubnetRangeExplanation({
  containingSubnetEnd,
  containingSubnetStart,
  inputAddress,
  rangeExplanation
}: {
  containingSubnetEnd: string;
  containingSubnetStart: string;
  inputAddress: string;
  rangeExplanation: string;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Range Explanation
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">
          Where the Address Falls
        </h3>
        <p className="text-sm text-slate">{rangeExplanation}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
          <p className="text-slate">Input address</p>
          <p className="mt-1 font-semibold text-ink">{inputAddress}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
          <p className="text-slate">Containing subnet block</p>
          <p className="mt-1 font-semibold text-ink">
            {containingSubnetStart} - {containingSubnetEnd}
          </p>
        </div>
      </div>
    </Card>
  );
}

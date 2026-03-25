import { Card } from "@/components/ui/card";

export function SubnetBlockSizePanel({
  blockSize,
  interestingOctetLabel,
  interestingOctetValue,
  subnetBoundaries
}: {
  blockSize: number;
  interestingOctetLabel: string;
  interestingOctetValue: number;
  subnetBoundaries: number[];
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Block Size
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">
          Interesting Octet and Subnet Blocks
        </h3>
        <p className="text-sm text-slate">
          The interesting octet is the {interestingOctetLabel}. Its mask value is{" "}
          {interestingOctetValue}, so the block size comes from `256 - {interestingOctetValue}`.
        </p>
      </div>

      <div className="rounded-2xl bg-pearl px-4 py-4">
        <p className="text-sm text-slate">Formula</p>
        <p className="mt-1 font-display text-3xl font-semibold text-ink">
          256 - {interestingOctetValue} = {blockSize}
        </p>
      </div>

      <div className="rounded-2xl bg-cyan/5 px-4 py-4 text-sm text-ink">
        <p className="font-semibold text-cyan">Subnet boundaries</p>
        <p className="mt-2 leading-7">{subnetBoundaries.join(", ")}</p>
      </div>
    </Card>
  );
}

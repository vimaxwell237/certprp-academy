import { Card } from "@/components/ui/card";
import type { BinaryOctetBreakdown } from "@/types/subnetting";

export function SubnetMaskVisualization({
  hostBits,
  maskBinaryOctets,
  prefixLength,
  subnetMask
}: {
  hostBits: number;
  maskBinaryOctets: BinaryOctetBreakdown[];
  prefixLength: number;
  subnetMask: string;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Mask Visualization
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">
          Prefix to Subnet Mask
        </h3>
        <p className="text-sm text-slate">
          /{prefixLength} means {prefixLength} network bits and {hostBits} host bits.
        </p>
      </div>

      <div className="rounded-2xl bg-pearl px-4 py-4">
        <p className="text-sm text-slate">Subnet mask</p>
        <p className="mt-1 font-display text-3xl font-semibold text-ink">{subnetMask}</p>
        <p className="mt-3 font-mono text-sm text-slate">
          {maskBinaryOctets.map((octet) => octet.binary).join(".")}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-cyan/5 px-4 py-4 text-sm text-ink">
          <p className="font-semibold text-cyan">Network portion</p>
          <p className="mt-2">
            The leftmost {prefixLength} bits stay fixed for the network and subnet ID.
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-semibold">Host portion</p>
          <p className="mt-2">
            The remaining {hostBits} bits change inside the subnet to create host addresses.
          </p>
        </div>
      </div>
    </Card>
  );
}

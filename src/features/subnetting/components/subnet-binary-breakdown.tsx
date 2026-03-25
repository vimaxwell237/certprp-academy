import { Card } from "@/components/ui/card";
import type { BinaryOctetBreakdown } from "@/types/subnetting";

function renderBitGroup(octet: BinaryOctetBreakdown) {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-ink/10 bg-white">
      {octet.networkBits ? (
        <span className="bg-cyan/10 px-3 py-3 font-mono text-sm font-semibold text-cyan">
          {octet.networkBits}
        </span>
      ) : null}
      {octet.hostBits ? (
        <span className="bg-amber-100/70 px-3 py-3 font-mono text-sm font-semibold text-amber-900">
          {octet.hostBits}
        </span>
      ) : null}
    </div>
  );
}

export function SubnetBinaryBreakdown({
  ipAddress,
  octets,
  title
}: {
  ipAddress: string;
  octets: BinaryOctetBreakdown[];
  title: string;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Binary Breakdown
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
        <p className="text-sm text-slate">{ipAddress}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {octets.map((octet) => (
          <div className="space-y-3 rounded-2xl bg-pearl px-4 py-4" key={`${title}-${octet.index}`}>
            <p className="text-sm font-semibold text-ink">Octet {octet.index + 1}</p>
            <p className="font-display text-2xl font-semibold text-ink">{octet.decimal}</p>
            {renderBitGroup(octet)}
            <p className="font-mono text-xs text-slate">{octet.binary}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <span className="rounded-full bg-cyan/10 px-3 py-1 font-semibold text-cyan">
          Network bits
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-900">
          Host bits
        </span>
      </div>
    </Card>
  );
}

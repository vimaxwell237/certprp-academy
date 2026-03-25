import Link from "next/link";

import { Card } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/auth/redirects";

export function RelatedSubnettingPanel() {
  return (
    <Card className="space-y-4 border-cyan/20 bg-cyan/5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">Subnetting Tools</p>
        <h3 className="font-display text-2xl font-semibold text-ink">
          Practice and Visualize Subnetting
        </h3>
        <p className="text-sm text-slate">
          Use the trainer for scored practice or open the visual calculator to see binary
          breakdowns, subnet masks, block sizes, and host ranges explained step by step.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          href={APP_ROUTES.subnettingPractice}
        >
          Open Trainer
        </Link>
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/50 hover:text-cyan"
          href={APP_ROUTES.subnettingCalculator}
        >
          Open Calculator
        </Link>
      </div>
    </Card>
  );
}

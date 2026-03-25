import { Card } from "@/components/ui/card";
import type { DashboardCardData } from "@/types/dashboard";

export function DashboardCard({
  description,
  detail,
  title
}: DashboardCardData) {
  return (
    <Card className="border-ink/5">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">
            Coming Soon
          </p>
          <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
        </div>
        <p className="text-base text-slate">{description}</p>
        <p className="rounded-2xl bg-pearl px-4 py-3 text-sm font-medium text-ink">
          {detail}
        </p>
      </div>
    </Card>
  );
}


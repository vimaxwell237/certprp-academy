import { Card } from "@/components/ui/card";
import type { AdminOperationsSummary } from "@/types/operations";

const toneMap = {
  default: "bg-pearl text-ink",
  warning: "bg-amber-50 text-amber-950",
  danger: "bg-rose-50 text-rose-950",
  success: "bg-emerald-50 text-emerald-950"
} as const;

export function OperationsSummaryGrid({
  summary
}: {
  summary: AdminOperationsSummary;
}) {
  const cards = [
    {
      label: "Pending Deliveries",
      value: summary.deliveries.pending,
      tone: "warning" as const
    },
    {
      label: "Failed Deliveries",
      value: summary.deliveries.failed,
      tone: "danger" as const
    },
    {
      label: "Pending Jobs",
      value: summary.jobs.pending,
      tone: "warning" as const
    },
    {
      label: "Failed Jobs",
      value: summary.jobs.failed,
      tone: "danger" as const
    },
    {
      label: "Delivery Attention",
      value: summary.deliveries.needingAttention,
      tone: "default" as const
    },
    {
      label: "Job Attention",
      value: summary.jobs.needingAttention,
      tone: "default" as const
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card className="border-ink/5" key={card.label}>
          <div className={`rounded-3xl px-5 py-5 ${toneMap[card.tone]}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.16em]">
              {card.label}
            </p>
            <p className="mt-3 font-display text-4xl font-semibold">{card.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

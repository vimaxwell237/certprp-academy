import { Card } from "@/components/ui/card";
import type { AdminOperationsSummary } from "@/types/operations";

const metricCards = [
  {
    key: "deliveryAttention",
    label: "Failed Deliveries Needing Attention",
    description: "Failed delivery rows that now need operator intervention."
  },
  {
    key: "staleDeliveries",
    label: "Stale Pending Deliveries",
    description: "Delivery rows that have stayed pending longer than expected."
  },
  {
    key: "jobAttention",
    label: "Failed Jobs Needing Attention",
    description: "Failed reminder jobs that now need operator intervention."
  },
  {
    key: "staleJobs",
    label: "Stale Pending Jobs",
    description: "Reminder jobs that have stayed pending longer than expected."
  },
  {
    key: "pendingDeliveries",
    label: "Pending Deliveries",
    description: "Email sends still waiting for automation pickup."
  },
  {
    key: "pendingJobs",
    label: "Pending Jobs",
    description: "Reminder jobs still queued for processing."
  },
  {
    key: "investigating",
    label: "Investigating",
    description: "Incidents actively being worked by an operator."
  },
  {
    key: "waiting",
    label: "Waiting",
    description: "Incidents waiting on another system, operator, or outcome."
  },
  {
    key: "resolvedToday",
    label: "Resolved Today",
    description: "Incidents moved into a resolved workflow state today."
  }
] as const;

export function OperationsSummaryCards({
  summary
}: {
  summary: AdminOperationsSummary;
}) {
  const values = {
    deliveryAttention: summary.deliveries.failedNeedingAttention,
    staleDeliveries: summary.deliveries.stalePending,
    jobAttention: summary.jobs.failedNeedingAttention,
    staleJobs: summary.jobs.stalePending,
    pendingDeliveries: summary.deliveries.pending,
    pendingJobs: summary.jobs.pending,
    investigating: summary.investigating,
    waiting: summary.waiting,
    resolvedToday: summary.resolvedToday
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {metricCards.map((card) => (
        <Card className="border-ink/5" key={card.key}>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">
              {card.label}
            </p>
            <div>
              <p className="font-display text-4xl font-bold text-ink">{values[card.key]}</p>
              <p className="mt-2 text-sm text-slate">{card.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

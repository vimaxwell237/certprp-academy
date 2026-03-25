import { OperationsAttentionBadge } from "@/features/operations/components/operations-attention-badge";
import type { AdminTriageIssue } from "@/types/operations";

export function OperationsTriagePanel({
  needsAttention,
  issues
}: {
  needsAttention: boolean;
  issues: AdminTriageIssue[];
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="flex flex-wrap items-center gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
            Triage
          </p>
          <h3 className="font-display text-2xl font-semibold text-ink">Attention State</h3>
        </div>
        <OperationsAttentionBadge active={needsAttention} />
      </div>

      {issues.length === 0 ? (
        <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
          No current triage flags on this record.
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              className={
                issue.severity === "danger"
                  ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900"
                  : "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900"
              }
              key={issue.code}
            >
              {issue.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

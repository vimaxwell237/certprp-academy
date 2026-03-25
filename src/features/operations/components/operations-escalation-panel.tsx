import { updateIncidentEscalationAction } from "@/features/operations/actions/operations-actions";
import { OperationsEscalationBadge } from "@/features/operations/components/operations-escalation-badge";
import type { OperationEntityType } from "@/types/operations";

export function OperationsEscalationPanel({
  entityType,
  entityId,
  isEscalated,
  escalatedAt,
  escalatedByAdminUserLabel,
  escalationReason,
  returnTo
}: {
  entityType: OperationEntityType;
  entityId: string;
  isEscalated: boolean;
  escalatedAt: string | null;
  escalatedByAdminUserLabel: string | null;
  escalationReason: string | null;
  returnTo: string;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
          Escalation
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">Escalation State</h3>
        <p className="text-sm text-slate">
          Mark incidents that need broader team attention without changing ownership or workflow state.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
        <OperationsEscalationBadge isEscalated={isEscalated} />
        {isEscalated ? (
          <>
            <p>
              Escalated {escalatedAt ? new Date(escalatedAt).toLocaleString() : "recently"}
              {escalatedByAdminUserLabel ? ` by ${escalatedByAdminUserLabel}` : ""}.
            </p>
            {escalationReason ? <p className="text-rose-900">{escalationReason}</p> : null}
          </>
        ) : (
          <p>This incident is not currently escalated.</p>
        )}
      </div>

      {isEscalated ? (
        <form action={updateIncidentEscalationAction}>
          <input name="entityType" type="hidden" value={entityType} />
          <input name="entityId" type="hidden" value={entityId} />
          <input name="isEscalated" type="hidden" value="false" />
          <input name="returnTo" type="hidden" value={returnTo} />
          <button
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
            type="submit"
          >
            Clear Escalation
          </button>
        </form>
      ) : (
        <form action={updateIncidentEscalationAction} className="space-y-3">
          <input name="entityType" type="hidden" value={entityType} />
          <input name="entityId" type="hidden" value={entityId} />
          <input name="isEscalated" type="hidden" value="true" />
          <input name="returnTo" type="hidden" value={returnTo} />
          <input
            className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
            name="escalationReason"
            placeholder="Optional escalation reason"
            type="text"
          />
          <button
            className="inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            type="submit"
          >
            Mark Escalated
          </button>
        </form>
      )}
    </div>
  );
}

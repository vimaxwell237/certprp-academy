import type { OperationAssignmentHistoryRecord } from "@/types/operations";

export function OperationsAssignmentHistory({
  history
}: {
  history: OperationAssignmentHistoryRecord[];
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
          Assignment History
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">Ownership Changes</h3>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          No assignment changes have been recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate" key={entry.id}>
              <p className="font-semibold text-ink">
                {entry.previousAdminUserLabel ?? "Unassigned"} {"->"}{" "}
                {entry.newAdminUserLabel ?? "Unassigned"}
              </p>
              <p className="mt-2 text-xs">
                {new Date(entry.createdAt).toLocaleString()} by {entry.changedByAdminUserLabel}
              </p>
              {entry.handoffNote ? (
                <p className="mt-3 rounded-2xl bg-white px-3 py-3 text-xs text-slate">
                  {entry.handoffNote}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

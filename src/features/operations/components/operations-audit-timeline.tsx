import type { OperationAuditEventRecord } from "@/types/operations";

export function OperationsAuditTimeline({
  events
}: {
  events: OperationAuditEventRecord[];
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
          Audit Trail
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">Recent Activity</h3>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          No audit events have been recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate" key={event.id}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{event.eventSummary}</p>
                <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                  {event.eventType.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-xs">
                {new Date(event.createdAt).toLocaleString()}
                {event.adminUserLabel ? ` by ${event.adminUserLabel}` : ""}
              </p>
              {event.metadataPreview ? (
                <p className="mt-3 rounded-2xl bg-white px-3 py-3 text-xs text-slate">
                  {event.metadataPreview}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import {
  updateAutomationAcknowledgementAction,
  updateAutomationReminderLifecycleAction,
  updateAutomationVerificationAction
} from "@/features/operations/actions/operations-actions";
import type {
  AdminOperatorOption,
  OperationAutomationAcknowledgementRecord,
  OperationAutomationAcknowledgementStatus,
  OperationAutomationEntityType,
  OperationAutomationVerificationStatus,
  OperationPostRerunVerificationGuidance,
  OperationRerunReadiness
} from "@/types/operations";

function acknowledgementStatusClassName(status: OperationAutomationAcknowledgementStatus) {
  switch (status) {
    case "resolved":
      return "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900";
    case "fixed_pending_rerun":
      return "rounded-full bg-cyan/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-900";
    case "investigating":
      return "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900";
    case "acknowledged":
      return "rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700";
    default:
      return "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-900";
  }
}

function verificationStatusClassName(status: OperationAutomationVerificationStatus) {
  switch (status) {
    case "completed":
      return "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900";
    case "failed":
      return "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-900";
    case "pending":
      return "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900";
    default:
      return "rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700";
  }
}

function rerunReadinessClassName(status: OperationRerunReadiness["status"]) {
  if (status === "ready") {
    return "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900";
  }

  if (status === "blocked") {
    return "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900";
  }

  return "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900";
}

function formatLocalDateTimeInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMinutes = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offsetMinutes * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function describeReminderState(acknowledgement: OperationAutomationAcknowledgementRecord | null) {
  if (!acknowledgement) {
    return "No follow-up reminder scheduled.";
  }

  if (acknowledgement.reminderSnoozedUntil) {
    const snoozedUntil = new Date(acknowledgement.reminderSnoozedUntil);
    if (snoozedUntil.getTime() > Date.now()) {
      return `Snoozed until ${snoozedUntil.toLocaleString()}.`;
    }
  }

  if (acknowledgement.reminderState === "dismissed") {
    return acknowledgement.reminderDismissedAt
      ? `Dismissed on ${new Date(acknowledgement.reminderDismissedAt).toLocaleString()}.`
      : "Dismissed.";
  }

  if (acknowledgement.remindAt) {
    return `Due ${new Date(acknowledgement.remindAt).toLocaleString()}.`;
  }

  return "No follow-up reminder scheduled.";
}

export function OperationsAcknowledgementPanel({
  entityType,
  entityId,
  returnTo,
  acknowledgement,
  acknowledgementHistory,
  rerunReadiness,
  verificationGuidance,
  operators
}: {
  entityType: OperationAutomationEntityType;
  entityId: string;
  returnTo: string;
  acknowledgement: OperationAutomationAcknowledgementRecord | null;
  acknowledgementHistory: OperationAutomationAcknowledgementRecord[];
  rerunReadiness: OperationRerunReadiness;
  verificationGuidance: OperationPostRerunVerificationGuidance | null;
  operators: AdminOperatorOption[];
}) {
  const currentStatus = acknowledgement?.status ?? "unacknowledged";
  const currentVerificationStatus = acknowledgement?.verificationStatus ?? "not_started";

  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
          Acknowledgement
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">Recovery Workflow</h3>
        <p className="text-sm text-slate">
          Keep ownership, reminders, verification, and next-step guidance visible while unhealthy
          automation is being worked.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={acknowledgementStatusClassName(currentStatus)}>{currentStatus}</span>
        <span className={verificationStatusClassName(currentVerificationStatus)}>
          verification {currentVerificationStatus}
        </span>
        {acknowledgement?.isOverdue ? (
          <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-900">
            overdue
          </span>
        ) : null}
        {acknowledgement ? (
          <span className="text-xs text-slate">
            Last updated by {acknowledgement.adminUserLabel} on{" "}
            {new Date(acknowledgement.createdAt).toLocaleString()}
          </span>
        ) : (
          <span className="text-xs text-slate">No acknowledgement recorded yet.</span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            Assignee
          </p>
          <p className="mt-2 font-semibold text-ink">
            {acknowledgement?.assignedAdminUserLabel ?? "Unassigned"}
          </p>
          <p className="mt-1 text-xs text-slate">
            {acknowledgement?.assignedAt
              ? `Assigned ${new Date(acknowledgement.assignedAt).toLocaleString()}`
              : "No operator is currently responsible."}
          </p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            Reminder Lifecycle
          </p>
          <p className="mt-2 font-semibold text-ink">
            {acknowledgement?.reminderLastAction ?? "none"}
          </p>
          <p className="mt-1 text-xs text-slate">{describeReminderState(acknowledgement)}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            Verification
          </p>
          <p className="mt-2 font-semibold text-ink">{currentVerificationStatus}</p>
          <p className="mt-1 text-xs text-slate">
            {acknowledgement?.verificationCompletedAt
              ? `Completed ${new Date(acknowledgement.verificationCompletedAt).toLocaleString()} by ${acknowledgement.verificationCompletedByAdminUserLabel ?? "operator"}`
              : acknowledgement?.verificationSummary ?? "No explicit verification has been recorded yet."}
          </p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            Next Follow-up
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {acknowledgement?.nextFollowUpAction ?? "No follow-up is pending."}
          </p>
        </div>
      </div>

      <div className={rerunReadinessClassName(rerunReadiness.status)}>
        <p className="font-semibold uppercase tracking-[0.16em]">{rerunReadiness.status}</p>
        <p className="mt-2">{rerunReadiness.summary}</p>
      </div>

      {acknowledgement?.rerunOutcome ? (
        <div className="rounded-2xl border border-cyan/20 bg-cyan/5 px-4 py-4 text-sm text-cyan-950">
          <p className="font-semibold uppercase tracking-[0.16em]">Latest Rerun Outcome</p>
          <p className="mt-2">
            {acknowledgement.rerunOutcome} on{" "}
            {acknowledgement.lastRerunAt
              ? new Date(acknowledgement.lastRerunAt).toLocaleString()
              : "unknown time"}
          </p>
          {acknowledgement.verificationSummary ? (
            <p className="mt-2 text-sm text-slate">{acknowledgement.verificationSummary}</p>
          ) : null}
        </div>
      ) : null}

      {verificationGuidance ? (
        <div className="rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm text-slate">
          <p className="font-semibold uppercase tracking-[0.16em] text-ink">
            {verificationGuidance.title}
          </p>
          <p className="mt-2">{verificationGuidance.summary}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate">
            {verificationGuidance.steps.map((step) => (
              <li key={step}>- {step}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <form
        action={updateAutomationAcknowledgementAction}
        className="grid gap-3 rounded-2xl border border-ink/10 bg-pearl p-4"
      >
        <input name="entityType" type="hidden" value={entityType} />
        <input name="entityId" type="hidden" value={entityId} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <select
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={currentStatus}
          name="status"
        >
          <option value="unacknowledged">Unacknowledged</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="investigating">Investigating</option>
          <option value="fixed_pending_rerun">Fixed Pending Rerun</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={acknowledgement?.assignedAdminUserId ?? ""}
          name="assignedAdminUserId"
        >
          <option value="">Unassigned</option>
          {operators.map((operator) => (
            <option key={operator.userId} value={operator.userId}>
              {operator.label}
            </option>
          ))}
        </select>
        <input
          className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={formatLocalDateTimeInput(acknowledgement?.remindAt ?? null)}
          name="remindAt"
          type="datetime-local"
        />
        <textarea
          className="min-h-24 rounded-2xl border border-ink/10 px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/40"
          defaultValue={acknowledgement?.note ?? ""}
          name="note"
          placeholder="Operator note about remediation progress or rerun readiness"
        />
        <button
          className="inline-flex w-fit rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          type="submit"
        >
          Update Acknowledgement
        </button>
      </form>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
              Reminder Controls
            </p>
            <p className="text-sm text-slate">
              Dismiss, snooze, or reschedule reminder follow-up without losing workflow context.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <form action={updateAutomationReminderLifecycleAction} className="space-y-3">
              <input name="entityType" type="hidden" value={entityType} />
              <input name="entityId" type="hidden" value={entityId} />
              <input name="returnTo" type="hidden" value={returnTo} />
              <input name="lifecycleAction" type="hidden" value="reschedule" />
              <input
                className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                defaultValue={formatLocalDateTimeInput(acknowledgement?.remindAt ?? null)}
                name="remindAt"
                type="datetime-local"
              />
              <input
                className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                defaultValue={acknowledgement?.reminderSnoozeReason ?? ""}
                name="reason"
                placeholder="Reason for reschedule"
                type="text"
              />
              <button
                className="inline-flex rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm font-semibold text-cyan-900 transition hover:bg-cyan/20"
                type="submit"
              >
                Reschedule Reminder
              </button>
            </form>

            <form action={updateAutomationReminderLifecycleAction} className="space-y-3">
              <input name="entityType" type="hidden" value={entityType} />
              <input name="entityId" type="hidden" value={entityId} />
              <input name="returnTo" type="hidden" value={returnTo} />
              <input name="lifecycleAction" type="hidden" value="snooze" />
              <input
                className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                defaultValue={formatLocalDateTimeInput(acknowledgement?.reminderSnoozedUntil ?? null)}
                name="snoozedUntil"
                type="datetime-local"
              />
              <input
                className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                defaultValue={acknowledgement?.reminderSnoozeReason ?? ""}
                name="reason"
                placeholder="Reason for snooze"
                type="text"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                  type="submit"
                >
                  Snooze Custom
                </button>
                {(["1h", "6h", "24h", "3d"] as const).map((preset) => (
                  <button
                    key={preset}
                    className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-50"
                    name="snoozePreset"
                    type="submit"
                    value={preset}
                  >
                    Snooze {preset}
                  </button>
                ))}
              </div>
            </form>

            <form action={updateAutomationReminderLifecycleAction}>
              <input name="entityType" type="hidden" value={entityType} />
              <input name="entityId" type="hidden" value={entityId} />
              <input name="returnTo" type="hidden" value={returnTo} />
              <input name="lifecycleAction" type="hidden" value="dismiss" />
              <button
                className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                type="submit"
              >
                Dismiss Reminder
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
              Verification Controls
            </p>
            <p className="text-sm text-slate">
              Explicitly record whether post-rerun verification is still pending, completed, or failed.
            </p>
          </div>

          <form action={updateAutomationVerificationAction} className="mt-4 space-y-3">
            <input name="entityType" type="hidden" value={entityType} />
            <input name="entityId" type="hidden" value={entityId} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <textarea
              className="min-h-24 w-full rounded-2xl border border-ink/10 px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/40"
              defaultValue={acknowledgement?.verificationNotes ?? ""}
              name="verificationNotes"
              placeholder="Verification notes, queue observations, or why the rerun still looks unhealthy"
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                name="verificationStatus"
                type="submit"
                value="pending"
              >
                Mark Pending
              </button>
              <button
                className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                name="verificationStatus"
                type="submit"
                value="completed"
              >
                Mark Verified
              </button>
              <button
                className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                name="verificationStatus"
                type="submit"
                value="failed"
              >
                Mark Verification Failed
              </button>
            </div>
          </form>
        </div>
      </div>

      {acknowledgementHistory.length === 0 ? (
        <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
          No acknowledgement history recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {acknowledgementHistory.slice(0, 8).map((entry) => (
            <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate" key={entry.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={acknowledgementStatusClassName(entry.status)}>{entry.status}</span>
                <span className={verificationStatusClassName(entry.verificationStatus)}>
                  verification {entry.verificationStatus}
                </span>
                <p className="font-semibold text-ink">{entry.adminUserLabel}</p>
              </div>
              <p className="mt-2 text-xs text-slate">
                Assignee: {entry.assignedAdminUserLabel ?? "Unassigned"}
                {entry.remindAt ? ` | Reminder ${new Date(entry.remindAt).toLocaleString()}` : ""}
                {entry.reminderSnoozedUntil
                  ? ` | Snoozed until ${new Date(entry.reminderSnoozedUntil).toLocaleString()}`
                  : ""}
                {entry.rerunOutcome ? ` | Rerun ${entry.rerunOutcome}` : ""}
              </p>
              {entry.note ? <p className="mt-2 text-sm text-slate">{entry.note}</p> : null}
              {entry.verificationNotes ? (
                <p className="mt-2 text-sm text-slate">{entry.verificationNotes}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate">{new Date(entry.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

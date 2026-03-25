import {
  assignOwnershipAction,
  claimOwnershipAction,
  releaseOwnershipAction,
  updateWorkflowStateAction
} from "@/features/operations/actions/operations-actions";
import { OperationsOwnerBadge } from "@/features/operations/components/operations-owner-badge";
import { OperationsWorkflowBadge } from "@/features/operations/components/operations-workflow-badge";
import type {
  AdminOperatorOption,
  OperationEntityType,
  OperationWorkflowState
} from "@/types/operations";

export function OperationsOwnershipPanel({
  entityType,
  entityId,
  returnTo,
  currentAdminUserId,
  assignedAdminUserId,
  assignedAdminUserLabel,
  assignedAt,
  handoffNote,
  workflowState,
  workflowStateUpdatedAt,
  operators
}: {
  entityType: OperationEntityType;
  entityId: string;
  returnTo: string;
  currentAdminUserId: string;
  assignedAdminUserId: string | null;
  assignedAdminUserLabel: string | null;
  assignedAt: string | null;
  handoffNote: string | null;
  workflowState: OperationWorkflowState;
  workflowStateUpdatedAt: string | null;
  operators: AdminOperatorOption[];
}) {
  const isMine = assignedAdminUserId === currentAdminUserId;

  return (
    <div className="space-y-4 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
          Ownership
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink">Incident Owner</h3>
      </div>

      <div className="space-y-3 rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
        <OperationsOwnerBadge
          isCurrentAdmin={isMine}
          ownerLabel={assignedAdminUserLabel}
        />
        <OperationsWorkflowBadge workflowState={workflowState} />
        <p>
          <span className="font-semibold text-ink">Assigned at:</span>{" "}
          {assignedAt ? new Date(assignedAt).toLocaleString() : "Not assigned"}
        </p>
        <p>
          <span className="font-semibold text-ink">Workflow updated:</span>{" "}
          {workflowStateUpdatedAt
            ? new Date(workflowStateUpdatedAt).toLocaleString()
            : "Not updated yet"}
        </p>
        <p>
          <span className="font-semibold text-ink">Handoff note:</span>{" "}
          {handoffNote ?? "No handoff note recorded."}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {!assignedAdminUserId ? (
          <form action={claimOwnershipAction}>
            <input name="entityType" type="hidden" value={entityType} />
            <input name="entityId" type="hidden" value={entityId} />
            <input
              name="expectedAssignedAdminUserId"
              type="hidden"
              value={assignedAdminUserId ?? ""}
            />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
              type="submit"
            >
              Claim
            </button>
          </form>
        ) : null}

        {assignedAdminUserId ? (
          <form action={releaseOwnershipAction}>
            <input name="entityType" type="hidden" value={entityType} />
            <input name="entityId" type="hidden" value={entityId} />
            <input
              name="expectedAssignedAdminUserId"
              type="hidden"
              value={assignedAdminUserId ?? ""}
            />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              type="submit"
            >
              Release
            </button>
          </form>
        ) : null}
      </div>

      <form action={assignOwnershipAction} className="space-y-3">
        <input name="entityType" type="hidden" value={entityType} />
        <input name="entityId" type="hidden" value={entityId} />
        <input
          name="expectedAssignedAdminUserId"
          type="hidden"
          value={assignedAdminUserId ?? ""}
        />
        <input name="returnTo" type="hidden" value={returnTo} />
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            Assign To
          </label>
          <select
            className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
            defaultValue={assignedAdminUserId ?? ""}
            name="assignedAdminUserId"
            required
          >
            <option value="" disabled>
              Select an admin
            </option>
            {operators.map((operator) => (
              <option key={operator.userId} value={operator.userId}>
                {operator.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            Handoff Note
          </label>
          <textarea
            className="min-h-24 w-full rounded-3xl border border-ink/10 px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/40"
            defaultValue={handoffNote ?? ""}
            name="handoffNote"
            placeholder="Capture context for the next operator."
          />
        </div>
        <button
          className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          type="submit"
        >
          Save Assignment
        </button>
      </form>

      <form action={updateWorkflowStateAction} className="space-y-3">
        <input name="entityType" type="hidden" value={entityType} />
        <input name="entityId" type="hidden" value={entityId} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            Workflow State
          </label>
          <select
            className="w-full rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
            defaultValue={workflowState}
            name="workflowState"
          >
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="waiting">Waiting</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <button
          className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          type="submit"
        >
          Update Workflow
        </button>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import {
  bulkAssignOwnershipAction,
  bulkCancelJobsAction,
  bulkClaimOwnershipAction,
  bulkReleaseOwnershipAction,
  bulkReplayJobsAction,
  bulkUnwatchIncidentsAction,
  bulkUpdateWatchPreferencesAction,
  bulkWorkflowStateAction,
  bulkWatchIncidentsAction,
  claimOwnershipAction,
  releaseOwnershipAction
} from "@/features/operations/actions/operations-actions";
import { JobActionButtons } from "@/features/operations/components/operations-action-buttons";
import { OperationsAttentionBadge } from "@/features/operations/components/operations-attention-badge";
import { OperationsEscalationBadge } from "@/features/operations/components/operations-escalation-badge";
import { OperationsOwnerBadge } from "@/features/operations/components/operations-owner-badge";
import { OperationsStatusBadge } from "@/features/operations/components/operations-status-badge";
import { OperationsTeamFollowBadge } from "@/features/operations/components/operations-team-follow-badge";
import { OperationsWorkflowBadge } from "@/features/operations/components/operations-workflow-badge";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type { AdminOperatorOption, AdminScheduledJobRecord } from "@/types/operations";

function HiddenSelections({ selectedIds }: { selectedIds: string[] }) {
  return (
    <>
      {selectedIds.map((selectedId) => (
        <input key={selectedId} name="selectedIds" type="hidden" value={selectedId} />
      ))}
    </>
  );
}

export function OperationsJobsTable({
  jobs,
  returnTo,
  currentAdminUserId,
  operators
}: {
  jobs: AdminScheduledJobRecord[];
  returnTo: string;
  currentAdminUserId: string;
  operators: AdminOperatorOption[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    );
  }

  function toggleAll() {
    setSelectedIds((current) =>
      current.length === jobs.length ? [] : jobs.map((job) => job.id)
    );
  }

  return (
    <Card className="overflow-hidden border-ink/5 p-0">
      <div className="space-y-4 border-b border-ink/5 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Reminder Queue</h2>
            <p className="text-sm text-slate">
              Select rows for bulk replay, force replay, or cancel workflows.
            </p>
          </div>
          <div className="text-sm text-slate">
            {selectedIds.length} selected
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <form action={bulkClaimOwnershipAction}>
            <HiddenSelections selectedIds={selectedIds} />
            <input name="entityType" type="hidden" value="scheduled_job" />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-60"
              disabled={selectedIds.length === 0}
              type="submit"
            >
              Bulk Claim
            </button>
          </form>

          <form action={bulkReleaseOwnershipAction}>
            <HiddenSelections selectedIds={selectedIds} />
            <input name="entityType" type="hidden" value="scheduled_job" />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-60"
              disabled={selectedIds.length === 0}
              type="submit"
            >
              Bulk Release
            </button>
          </form>

          <form action={bulkReplayJobsAction}>
            <HiddenSelections selectedIds={selectedIds} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={selectedIds.length === 0}
              type="submit"
            >
              Bulk Replay
            </button>
          </form>

          <form action={bulkReplayJobsAction}>
            <HiddenSelections selectedIds={selectedIds} />
            <input name="force" type="hidden" value="true" />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-60"
              disabled={selectedIds.length === 0}
              type="submit"
            >
              Bulk Force Replay
            </button>
          </form>

          <form action={bulkCancelJobsAction}>
            <HiddenSelections selectedIds={selectedIds} />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={selectedIds.length === 0}
              type="submit"
            >
              Bulk Cancel
            </button>
          </form>

          <form action={bulkWatchIncidentsAction}>
            <HiddenSelections selectedIds={selectedIds} />
            <input name="entityType" type="hidden" value="scheduled_job" />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-60"
              disabled={selectedIds.length === 0}
              type="submit"
            >
              Bulk Watch
            </button>
          </form>

          <form action={bulkUnwatchIncidentsAction}>
            <HiddenSelections selectedIds={selectedIds} />
            <input name="entityType" type="hidden" value="scheduled_job" />
            <input name="returnTo" type="hidden" value={returnTo} />
            <button
              className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-60"
              disabled={selectedIds.length === 0}
              type="submit"
            >
              Bulk Unwatch
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-3">
          {(["open", "investigating", "waiting", "resolved"] as const).map((workflowState) => (
            <form action={bulkWorkflowStateAction} key={workflowState}>
              <HiddenSelections selectedIds={selectedIds} />
              <input name="entityType" type="hidden" value="scheduled_job" />
              <input name="workflowState" type="hidden" value={workflowState} />
              <input name="returnTo" type="hidden" value={returnTo} />
              <button
                className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-60"
                disabled={selectedIds.length === 0}
                type="submit"
              >
                Set {workflowState.replace("_", " ")}
              </button>
            </form>
          ))}
        </div>

        <form action={bulkAssignOwnershipAction} className="grid gap-3 md:grid-cols-[1fr_1.2fr_auto]">
          <HiddenSelections selectedIds={selectedIds} />
          <input name="entityType" type="hidden" value="scheduled_job" />
          <input name="returnTo" type="hidden" value={returnTo} />
          <select
            className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
            defaultValue=""
            name="assignedAdminUserId"
            required
          >
            <option disabled value="">
              Assign selected jobs to...
            </option>
            {operators.map((operator) => (
              <option key={operator.userId} value={operator.userId}>
                {operator.label}
              </option>
            ))}
          </select>
          <input
            className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
            name="handoffNote"
            placeholder="Optional handoff note for the assignee"
            type="text"
          />
          <button
            className="inline-flex rounded-full bg-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={selectedIds.length === 0}
            type="submit"
          >
            Bulk Assign
          </button>
        </form>

        <form
          action={bulkUpdateWatchPreferencesAction}
          className="grid gap-3 md:grid-cols-[1fr_140px_auto]"
        >
          <HiddenSelections selectedIds={selectedIds} />
          <input name="entityType" type="hidden" value="scheduled_job" />
          <input name="returnTo" type="hidden" value={returnTo} />
          <select
            className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
            defaultValue="isMuted"
            name="preferenceKey"
          >
            <option value="isMuted">Mute</option>
            <option value="notifyOnComment">Comment notices</option>
            <option value="notifyOnOwnerChange">Owner-change notices</option>
            <option value="notifyOnWorkflowChange">Workflow notices</option>
            <option value="notifyOnResolve">Resolve notices</option>
          </select>
          <select
            className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
            defaultValue="true"
            name="preferenceValue"
          >
            <option value="true">Enable</option>
            <option value="false">Disable</option>
          </select>
          <button
            className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-60"
            disabled={selectedIds.length === 0}
            type="submit"
          >
            Bulk Watch Prefs
          </button>
        </form>
      </div>

      {jobs.length === 0 ? (
        <div className="px-6 py-10 text-sm text-slate">No scheduled jobs match this filter yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink/5 text-sm">
            <thead className="bg-pearl/80">
              <tr>
                <th className="px-4 py-3 text-left" scope="col">
                  <input
                    aria-label="Select all jobs on page"
                    checked={selectedIds.length > 0 && selectedIds.length === jobs.length}
                    className="h-4 w-4 rounded border border-ink/20 text-cyan focus:ring-cyan"
                    onChange={toggleAll}
                    type="checkbox"
                  />
                </th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-[0.16em] text-slate">
                  Job
                </th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-[0.16em] text-slate">
                  Owner
                </th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-[0.16em] text-slate">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-[0.16em] text-slate">
                  Workflow
                </th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-[0.16em] text-slate">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 bg-white">
              {jobs.map((job) => {
                const isMine = job.assignedAdminUserId === currentAdminUserId;

                return (
                  <tr key={job.id}>
                    <td className="px-4 py-4 align-top">
                      <input
                        checked={selectedSet.has(job.id)}
                        className="h-4 w-4 rounded border border-ink/20 text-cyan focus:ring-cyan"
                        onChange={() => toggleSelected(job.id)}
                        type="checkbox"
                      />
                    </td>
                    <td className="px-6 py-4 align-top text-slate">
                      <div className="space-y-1">
                        <p className="font-semibold text-ink">{job.jobType}</p>
                        <div className="flex flex-wrap gap-2">
                          <OperationsEscalationBadge isEscalated={job.isEscalated} />
                          <OperationsTeamFollowBadge
                            teamAttention={job.teamAttention}
                            watcherCount={job.watcherCount}
                          />
                        </div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate">
                          {job.relatedEntityType} {job.relatedEntityId}
                        </p>
                        <p className="text-xs text-slate break-all">{job.payloadPreview}</p>
                        <p className="text-xs text-slate">
                          Scheduled {new Date(job.scheduledFor).toLocaleString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-slate">
                      <div className="space-y-3">
                        <OperationsOwnerBadge
                          isCurrentAdmin={isMine}
                          ownerLabel={job.assignedAdminUserLabel}
                        />
                        <div className="flex flex-wrap gap-2">
                          {!job.assignedAdminUserId ? (
                            <form action={claimOwnershipAction}>
                              <input name="entityType" type="hidden" value="scheduled_job" />
                              <input name="entityId" type="hidden" value={job.id} />
                              <input
                                name="expectedAssignedAdminUserId"
                                type="hidden"
                                value={job.assignedAdminUserId ?? ""}
                              />
                              <input name="returnTo" type="hidden" value={returnTo} />
                              <button
                                className="inline-flex rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink transition hover:border-cyan/30 hover:text-cyan"
                                type="submit"
                              >
                                Claim
                              </button>
                            </form>
                          ) : null}
                          {job.assignedAdminUserId ? (
                            <form action={releaseOwnershipAction}>
                              <input name="entityType" type="hidden" value="scheduled_job" />
                              <input name="entityId" type="hidden" value={job.id} />
                              <input
                                name="expectedAssignedAdminUserId"
                                type="hidden"
                                value={job.assignedAdminUserId ?? ""}
                              />
                              <input name="returnTo" type="hidden" value={returnTo} />
                              <button
                                className="inline-flex rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink transition hover:border-cyan/30 hover:text-cyan"
                                type="submit"
                              >
                                Release
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-slate">
                      <div className="space-y-2">
                        <OperationsStatusBadge status={job.status} />
                        <OperationsAttentionBadge active={job.needsAttention} />
                        <p className="text-xs text-slate">
                          Retry {job.retryCount} of {job.maxRetries}
                        </p>
                        {job.triageIssues[0] ? (
                          <p className="text-xs text-rose-700">{job.triageIssues[0].label}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-slate">
                      <div className="space-y-2">
                        <OperationsWorkflowBadge workflowState={job.workflowState} />
                        {job.escalationReason ? (
                          <p className="text-xs text-rose-700">{job.escalationReason}</p>
                        ) : null}
                        <p className="text-xs text-slate">
                          Updated{" "}
                          {job.workflowStateUpdatedAt
                            ? new Date(job.workflowStateUpdatedAt).toLocaleString()
                            : "not yet"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-slate">
                      <div className="space-y-3">
                        <JobActionButtons
                          allowCancel={job.status === "pending"}
                          allowForceReplay={job.status === "failed" && job.retryCount >= job.maxRetries}
                          allowReplay={job.status === "failed" && job.retryCount < job.maxRetries}
                          jobId={job.id}
                          returnTo={returnTo}
                        />
                        <Link
                          className="inline-flex text-sm font-semibold text-cyan transition hover:text-teal"
                          href={`${APP_ROUTES.adminOperationsJobs}/${job.id}`}
                        >
                          Open Detail
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

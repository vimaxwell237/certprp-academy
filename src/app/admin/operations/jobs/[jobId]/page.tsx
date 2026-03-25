import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { AdminSectionHeader } from "@/features/admin/components/admin-section-header";
import { JobActionButtons } from "@/features/operations/components/operations-action-buttons";
import { OperationsAssignmentHistory } from "@/features/operations/components/operations-assignment-history";
import { OperationsAuditTimeline } from "@/features/operations/components/operations-audit-timeline";
import { OperationsCommentsPanel } from "@/features/operations/components/operations-comments-panel";
import { OperationsEscalationPanel } from "@/features/operations/components/operations-escalation-panel";
import { OperationsNotesPanel } from "@/features/operations/components/operations-notes-panel";
import { OperationsOwnershipPanel } from "@/features/operations/components/operations-ownership-panel";
import { OperationsStatusBadge } from "@/features/operations/components/operations-status-badge";
import { OperationsTriagePanel } from "@/features/operations/components/operations-triage-panel";
import { OperationsWatchersPanel } from "@/features/operations/components/operations-watchers-panel";
import { OperationsWorkflowBadge } from "@/features/operations/components/operations-workflow-badge";
import {
  fetchAdminJobDetail,
  fetchAdminOperators
} from "@/features/operations/data/operations-service";
import { FlashBanner } from "@/features/scheduling/components/flash-banner";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { requireAdminUser } from "@/lib/auth/roles";

export default async function AdminJobDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const adminUser = await requireAdminUser();
  const { jobId } = await params;
  const resolvedSearchParams = await searchParams;
  const success =
    (Array.isArray(resolvedSearchParams.success)
      ? resolvedSearchParams.success[0]
      : resolvedSearchParams.success) ?? "";
  const error =
    (Array.isArray(resolvedSearchParams.error)
      ? resolvedSearchParams.error[0]
      : resolvedSearchParams.error) ?? "";
  const warning =
    (Array.isArray(resolvedSearchParams.warning)
      ? resolvedSearchParams.warning[0]
      : resolvedSearchParams.warning) ?? "";
  const [job, operators] = await Promise.all([
    fetchAdminJobDetail(jobId, adminUser.id),
    fetchAdminOperators(adminUser.id)
  ]);

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {success ? <FlashBanner message={success} tone="success" /> : null}
      {error ? <FlashBanner message={error} tone="error" /> : null}
      {warning ? <FlashBanner message={warning} tone="warning" /> : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Inspect reminder scheduling metadata and replay or cancel the job only when the linked session state still allows it."
          eyebrow="Queue Ops"
          title="Scheduled Job Detail"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminOperationsJobs}
        >
          Back to Jobs
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5 border-ink/5">
          <div className="flex flex-wrap items-center gap-3">
            <OperationsStatusBadge status={job.status} />
            <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              {job.jobType}
            </span>
            <OperationsWorkflowBadge workflowState={job.workflowState} />
          </div>

          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div className="rounded-2xl bg-pearl px-4 py-3">
              <p className="text-slate">Job ID</p>
              <p className="break-all font-semibold text-ink">{job.id}</p>
            </div>
            <div className="rounded-2xl bg-pearl px-4 py-3">
              <p className="text-slate">User ID</p>
              <p className="break-all font-semibold text-ink">{job.userId}</p>
            </div>
            <div className="rounded-2xl bg-pearl px-4 py-3">
              <p className="text-slate">Related Entity</p>
              <p className="break-all font-semibold text-ink">
                {job.relatedEntityType} {job.relatedEntityId}
              </p>
            </div>
            <div className="rounded-2xl bg-pearl px-4 py-3">
              <p className="text-slate">Retry State</p>
              <p className="font-semibold text-ink">
                {job.retryCount} of {job.maxRetries}
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-xs text-slate md:grid-cols-2">
            <div className="rounded-2xl border border-ink/5 px-4 py-3">
              Created {new Date(job.createdAt).toLocaleString()}
            </div>
            <div className="rounded-2xl border border-ink/5 px-4 py-3">
              Scheduled for {new Date(job.scheduledFor).toLocaleString()}
            </div>
            <div className="rounded-2xl border border-ink/5 px-4 py-3">
              Last attempted{" "}
              {job.lastAttemptedAt ? new Date(job.lastAttemptedAt).toLocaleString() : "Never"}
            </div>
            <div className="rounded-2xl border border-ink/5 px-4 py-3">
              Processed at{" "}
              {job.processedAt ? new Date(job.processedAt).toLocaleString() : "Not processed"}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
            <p>
              <span className="font-semibold text-ink">Dedupe key:</span>{" "}
              {job.dedupeKey ?? "No dedupe key recorded"}
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-ink">Payload preview</p>
              <pre className="overflow-x-auto rounded-2xl bg-white px-4 py-4 text-xs text-slate">
                {job.payload}
              </pre>
            </div>
          </div>

          {job.errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900">
              <p className="font-semibold">Last error</p>
              <p className="mt-2 whitespace-pre-wrap break-words">{job.errorMessage}</p>
            </div>
          ) : null}

          <OperationsAuditTimeline events={job.auditEvents} />
          <OperationsAssignmentHistory history={job.assignmentHistory} />
        </Card>

        <div className="space-y-6">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Operator Actions
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">Job Controls</h2>
              <p className="text-sm leading-7 text-slate">
                Replay failed jobs when the reminder target is still valid, or cancel pending
                rows that should no longer fire.
              </p>
            </div>

            <JobActionButtons
              allowCancel={job.status === "pending"}
              allowForceReplay={job.status === "failed" && job.retryCount >= job.maxRetries}
              allowReplay={job.status === "failed" && job.retryCount < job.maxRetries}
              jobId={job.id}
              returnTo={`${APP_ROUTES.adminOperationsJobs}/${job.id}`}
            />

            <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
              <p className="font-semibold text-ink">Safety notes</p>
              <ul className="mt-3 space-y-2">
                <li>Replay is blocked when the job is not in a failed state.</li>
                <li>Reminder jobs tied to expired or unconfirmed sessions cannot be replayed.</li>
                <li>Cancel is limited to pending rows so processed history remains intact.</li>
              </ul>
            </div>
          </Card>

          <OperationsTriagePanel issues={job.triageIssues} needsAttention={job.needsAttention} />

          <OperationsOwnershipPanel
            assignedAdminUserId={job.assignedAdminUserId}
            assignedAdminUserLabel={job.assignedAdminUserLabel}
            assignedAt={job.assignedAt}
            currentAdminUserId={adminUser.id}
            entityId={job.id}
            entityType="scheduled_job"
            handoffNote={job.handoffNote}
            operators={operators}
            returnTo={`${APP_ROUTES.adminOperationsJobs}/${job.id}`}
            workflowState={job.workflowState}
            workflowStateUpdatedAt={job.workflowStateUpdatedAt}
          />

          <OperationsEscalationPanel
            entityId={job.id}
            entityType="scheduled_job"
            escalatedAt={job.escalatedAt}
            escalatedByAdminUserLabel={job.escalatedByAdminUserLabel}
            escalationReason={job.escalationReason}
            isEscalated={job.isEscalated}
            returnTo={`${APP_ROUTES.adminOperationsJobs}/${job.id}`}
          />

          <OperationsWatchersPanel
            currentAdminUserId={adminUser.id}
            entityId={job.id}
            entityType="scheduled_job"
            matchingSubscriptions={job.matchingSubscriptions}
            returnTo={`${APP_ROUTES.adminOperationsJobs}/${job.id}`}
            watchers={job.watchers}
          />

          <OperationsNotesPanel
            entityId={job.id}
            entityType="scheduled_job"
            notes={job.notes}
            returnTo={`${APP_ROUTES.adminOperationsJobs}/${job.id}`}
          />

          <OperationsCommentsPanel
            comments={job.comments}
            entityId={job.id}
            entityType="scheduled_job"
            operators={operators}
            returnTo={`${APP_ROUTES.adminOperationsJobs}/${job.id}`}
          />
        </div>
      </div>
    </div>
  );
}

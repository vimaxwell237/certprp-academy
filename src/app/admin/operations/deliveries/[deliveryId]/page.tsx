import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { AdminSectionHeader } from "@/features/admin/components/admin-section-header";
import { DeliveryActionButtons } from "@/features/operations/components/operations-action-buttons";
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
  fetchAdminDeliveryDetail,
  fetchAdminOperators
} from "@/features/operations/data/operations-service";
import { FlashBanner } from "@/features/scheduling/components/flash-banner";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { requireAdminUser } from "@/lib/auth/roles";

export default async function AdminDeliveryDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ deliveryId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const adminUser = await requireAdminUser();
  const { deliveryId } = await params;
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
  const [delivery, operators] = await Promise.all([
    fetchAdminDeliveryDetail(deliveryId, adminUser.id),
    fetchAdminOperators(adminUser.id)
  ]);

  if (!delivery) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {success ? <FlashBanner message={success} tone="success" /> : null}
      {error ? <FlashBanner message={error} tone="error" /> : null}
      {warning ? <FlashBanner message={warning} tone="warning" /> : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Inspect delivery metadata, replay state, and the linked notification context before resending."
          eyebrow="Queue Ops"
          title="Delivery Detail"
        />
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
          href={APP_ROUTES.adminOperationsDeliveries}
        >
          Back to Deliveries
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5 border-ink/5">
          <div className="flex flex-wrap items-center gap-3">
            <OperationsStatusBadge status={delivery.status} />
            <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              {delivery.templateKey}
            </span>
            <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              {delivery.channel}
            </span>
            <OperationsWorkflowBadge workflowState={delivery.workflowState} />
          </div>

          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div className="rounded-2xl bg-pearl px-4 py-3">
              <p className="text-slate">Delivery ID</p>
              <p className="break-all font-semibold text-ink">{delivery.id}</p>
            </div>
            <div className="rounded-2xl bg-pearl px-4 py-3">
              <p className="text-slate">User ID</p>
              <p className="break-all font-semibold text-ink">{delivery.userId}</p>
            </div>
            <div className="rounded-2xl bg-pearl px-4 py-3">
              <p className="text-slate">Retry State</p>
              <p className="font-semibold text-ink">
                {delivery.retryCount} of {delivery.maxRetries}
              </p>
            </div>
            <div className="rounded-2xl bg-pearl px-4 py-3">
              <p className="text-slate">External Message ID</p>
              <p className="break-all font-semibold text-ink">
                {delivery.externalMessageId ?? "Not sent yet"}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
            <p>
              <span className="font-semibold text-ink">Notification title:</span>{" "}
              {delivery.notificationTitle ?? "Unavailable"}
            </p>
            <p>
              <span className="font-semibold text-ink">Notification message:</span>{" "}
              {delivery.notificationMessage ?? "Unavailable"}
            </p>
            <p>
              <span className="font-semibold text-ink">Link URL:</span>{" "}
              {delivery.linkUrl ? (
                <Link className="font-semibold text-cyan hover:text-teal" href={delivery.linkUrl}>
                  {delivery.linkUrl}
                </Link>
              ) : (
                "No link recorded"
              )}
            </p>
            <p>
              <span className="font-semibold text-ink">Related entity:</span>{" "}
              {delivery.relatedEntityType && delivery.relatedEntityId
                ? `${delivery.relatedEntityType} ${delivery.relatedEntityId}`
                : "No related entity reference"}
            </p>
          </div>

          <div className="grid gap-3 text-xs text-slate md:grid-cols-2">
            <div className="rounded-2xl border border-ink/5 px-4 py-3">
              Created {new Date(delivery.createdAt).toLocaleString()}
            </div>
            <div className="rounded-2xl border border-ink/5 px-4 py-3">
              Last attempted{" "}
              {delivery.lastAttemptedAt
                ? new Date(delivery.lastAttemptedAt).toLocaleString()
                : "Never"}
            </div>
            <div className="rounded-2xl border border-ink/5 px-4 py-3">
              Next attempt{" "}
              {delivery.nextAttemptAt
                ? new Date(delivery.nextAttemptAt).toLocaleString()
                : "Not scheduled"}
            </div>
            <div className="rounded-2xl border border-ink/5 px-4 py-3">
              Sent at {delivery.sentAt ? new Date(delivery.sentAt).toLocaleString() : "Not sent"}
            </div>
          </div>

          {delivery.errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900">
              <p className="font-semibold">Last error</p>
              <p className="mt-2 whitespace-pre-wrap break-words">{delivery.errorMessage}</p>
            </div>
          ) : null}

          <OperationsAuditTimeline events={delivery.auditEvents} />
          <OperationsAssignmentHistory history={delivery.assignmentHistory} />
        </Card>

        <div className="space-y-6">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Operator Actions
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">Replay Controls</h2>
              <p className="text-sm leading-7 text-slate">
                Retry failed or ignored rows, or mark pending and failed rows ignored when
                the event should no longer send.
              </p>
            </div>

            <DeliveryActionButtons
              allowForceRetry={
                (delivery.status === "failed" || delivery.status === "ignored") &&
                delivery.retryCount >= delivery.maxRetries
              }
              allowIgnore={delivery.status === "pending" || delivery.status === "failed"}
              allowRetry={
                (delivery.status === "failed" || delivery.status === "ignored") &&
                delivery.retryCount < delivery.maxRetries
              }
              deliveryId={delivery.id}
              returnTo={`${APP_ROUTES.adminOperationsDeliveries}/${delivery.id}`}
            />

            <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
              <p className="font-semibold text-ink">Safety notes</p>
              <ul className="mt-3 space-y-2">
                <li>Reminder sends are blocked if the linked session is no longer confirmed.</li>
                <li>Force retry is required after the delivery exhausts its retry budget.</li>
                <li>Ignored deliveries stay visible for operator audit and can be retried later.</li>
              </ul>
            </div>
          </Card>

          <OperationsTriagePanel
            issues={delivery.triageIssues}
            needsAttention={delivery.needsAttention}
          />

          <OperationsOwnershipPanel
            assignedAdminUserId={delivery.assignedAdminUserId}
            assignedAdminUserLabel={delivery.assignedAdminUserLabel}
            assignedAt={delivery.assignedAt}
            currentAdminUserId={adminUser.id}
            entityId={delivery.id}
            entityType="notification_delivery"
            handoffNote={delivery.handoffNote}
            operators={operators}
            returnTo={`${APP_ROUTES.adminOperationsDeliveries}/${delivery.id}`}
            workflowState={delivery.workflowState}
            workflowStateUpdatedAt={delivery.workflowStateUpdatedAt}
          />

          <OperationsEscalationPanel
            entityId={delivery.id}
            entityType="notification_delivery"
            escalatedAt={delivery.escalatedAt}
            escalatedByAdminUserLabel={delivery.escalatedByAdminUserLabel}
            escalationReason={delivery.escalationReason}
            isEscalated={delivery.isEscalated}
            returnTo={`${APP_ROUTES.adminOperationsDeliveries}/${delivery.id}`}
          />

          <OperationsWatchersPanel
            currentAdminUserId={adminUser.id}
            entityId={delivery.id}
            entityType="notification_delivery"
            matchingSubscriptions={delivery.matchingSubscriptions}
            returnTo={`${APP_ROUTES.adminOperationsDeliveries}/${delivery.id}`}
            watchers={delivery.watchers}
          />

          <OperationsNotesPanel
            entityId={delivery.id}
            entityType="notification_delivery"
            notes={delivery.notes}
            returnTo={`${APP_ROUTES.adminOperationsDeliveries}/${delivery.id}`}
          />

          <OperationsCommentsPanel
            comments={delivery.comments}
            entityId={delivery.id}
            entityType="notification_delivery"
            operators={operators}
            returnTo={`${APP_ROUTES.adminOperationsDeliveries}/${delivery.id}`}
          />
        </div>
      </div>
    </div>
  );
}

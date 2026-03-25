import Link from "next/link";

import { Card } from "@/components/ui/card";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { AdminSectionHeader } from "@/features/admin/components/admin-section-header";
import { OperationsOwnerBadge } from "@/features/operations/components/operations-owner-badge";
import { OperationsStatusBadge } from "@/features/operations/components/operations-status-badge";
import { OperationsSummaryCards } from "@/features/operations/components/operations-summary-cards";
import { OperationsWorkflowBadge } from "@/features/operations/components/operations-workflow-badge";
import { fetchAdminOperationsOverview } from "@/features/operations/data/operations-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { requireAdminUser } from "@/lib/auth/roles";

function buildOperationsHref(
  basePath: string,
  params: Record<string, string | boolean | null | undefined>
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) {
      searchParams.set(key, value);
    } else if (value === true) {
      searchParams.set(key, "true");
    }
  }

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export default async function AdminOperationsOverviewPage() {
  try {
    const adminUser = await requireAdminUser();
    const overview = await fetchAdminOperationsOverview(adminUser.id);

    return (
      <div className="space-y-8">
        <AdminSectionHeader
          description="Review queue health, inspect failures, and hand off replay or cancel actions without leaving the admin surface."
          eyebrow="Queue Ops"
          title="Operations Overview"
        />

        {overview.warning ? (
          <Card className="border-amber-200 bg-amber-50 text-amber-950">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Summary Warning
              </p>
              <p className="text-sm">
                Queue summary counts could not be loaded completely. Recent rows are still
                shown below if available.
              </p>
              <p className="rounded-2xl bg-white/80 px-4 py-3 text-xs">{overview.warning}</p>
            </div>
          </Card>
        ) : null}

        <OperationsSummaryCards summary={overview.summary} />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Assigned To Me
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.myAssignedIncidents}
              </p>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Unassigned Attention
              </p>
              <p className="font-display text-4xl font-bold text-amber-950">
                {overview.summary.unassignedNeedingAttention}
              </p>
            </div>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Recent Hand-offs
              </p>
              <p className="font-display text-4xl font-bold text-emerald-950">
                {overview.summary.recentlyHandedOff}
              </p>
            </div>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Investigating
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.investigating}
              </p>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Waiting
              </p>
              <p className="font-display text-4xl font-bold text-amber-950">
                {overview.summary.waiting}
              </p>
            </div>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Resolved Today
              </p>
              <p className="font-display text-4xl font-bold text-emerald-950">
                {overview.summary.resolvedToday}
              </p>
            </div>
          </Card>
          <Card className="border-ink/5 bg-white/90">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">
                Recent Comments
              </p>
              <p className="font-display text-4xl font-bold text-ink">
                {overview.summary.recentComments}
              </p>
            </div>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Incidents I Watch
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.watchedIncidents}
              </p>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Muted Watches
              </p>
              <p className="font-display text-4xl font-bold text-amber-950">
                {overview.summary.mutedWatchedIncidents}
              </p>
            </div>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Watched Unresolved
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.watchedUnresolvedIncidents}
              </p>
            </div>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Active Subscriptions
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.activeSubscriptions}
              </p>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Active Escalation Rules
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.activeEscalationRules}
              </p>
            </div>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Active Automated Rules
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.activeAutomatedRules}
              </p>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Escalated Incidents
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.escalatedIncidents}
              </p>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Team Followed
              </p>
              <p className="font-display text-4xl font-bold text-amber-950">
                {overview.summary.watchedByTeamIncidents}
              </p>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Unassigned Escalated
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.unassignedEscalatedIncidents}
              </p>
            </div>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Recent Rule Runs
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.recentRuleRuns}
              </p>
            </div>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Recent Digest Runs
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.recentDigestRuns}
              </p>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Rules In Cooldown
              </p>
              <p className="font-display text-4xl font-bold text-amber-950">
                {overview.summary.rulesInCooldown}
              </p>
            </div>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Subscriptions With Matches
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.subscriptionsWithActiveMatches}
              </p>
            </div>
          </Card>
          <Card className="border-slate-200 bg-slate-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
                Muted Rules
              </p>
              <p className="font-display text-4xl font-bold text-slate-950">
                {overview.summary.mutedRules}
              </p>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Snoozed Subscriptions
              </p>
              <p className="font-display text-4xl font-bold text-amber-950">
                {overview.summary.snoozedSubscriptions}
              </p>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Unhealthy Rules
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.unhealthyRules}
              </p>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Unhealthy Subscriptions
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.unhealthySubscriptions}
              </p>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Recent Skipped Runs
              </p>
              <p className="font-display text-4xl font-bold text-amber-950">
                {overview.summary.recentSkippedRuns}
              </p>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Recent Failed Runs
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.recentFailedRuns}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-emerald-200 bg-emerald-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Healthy Automation
              </p>
              <p className="font-display text-4xl font-bold text-emerald-950">
                {overview.summary.healthyAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-orange-200 bg-orange-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">
                Warning Automation
              </p>
              <p className="font-display text-4xl font-bold text-orange-950">
                {overview.summary.warningAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Unhealthy Automation
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.unhealthyAutomation}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Needs Acknowledgement
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.unacknowledgedUnhealthyAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Acknowledged Open
              </p>
              <p className="font-display text-4xl font-bold text-amber-950">
                {overview.summary.acknowledgedUnresolvedAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Fixed Pending Rerun
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.fixedPendingRerunAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Resolved Recently
              </p>
              <p className="font-display text-4xl font-bold text-emerald-950">
                {overview.summary.resolvedRecentlyAutomation}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Assigned Unhealthy
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.assignedUnhealthyAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Unassigned Unhealthy
              </p>
              <p className="font-display text-4xl font-bold text-amber-950">
                {overview.summary.unassignedUnhealthyAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Overdue Reminders
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.overdueAcknowledgementReminders}
              </p>
            </div>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Awaiting Verification
              </p>
              <p className="font-display text-4xl font-bold text-emerald-950">
                {overview.summary.fixedPendingRerunAwaitingVerification}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Overdue Assigned
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.overdueAssignedAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Verification Pending
              </p>
              <p className="font-display text-4xl font-bold text-cyan-950">
                {overview.summary.verificationPendingAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Verification Failed
              </p>
              <p className="font-display text-4xl font-bold text-rose-950">
                {overview.summary.verificationFailedAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-slate-200 bg-slate-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
                Dismissed Reminders
              </p>
              <p className="font-display text-4xl font-bold text-slate-950">
                {overview.summary.dismissedReminderAutomation}
              </p>
            </div>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Snoozed Reminders
              </p>
              <p className="font-display text-4xl font-bold text-amber-950">
                {overview.summary.snoozedReminderAutomation}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">
                Skip Trends
              </p>
              {overview.topSkipReasons.length === 0 ? (
                <p className="text-sm text-slate">No recent skip reasons recorded.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {overview.topSkipReasons.map((reason) => (
                    <span
                      className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"
                      key={`skip-${reason.reason}`}
                    >
                      {reason.reason} ({reason.count})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">
                Failure Trends
              </p>
              {overview.topFailureReasons.length === 0 ? (
                <p className="text-sm text-slate">No recent failure reasons recorded.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {overview.topFailureReasons.map((reason) => (
                    <span
                      className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-900"
                      key={`failure-${reason.reason}`}
                    >
                      {reason.reason} ({reason.count})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">
                Unhealthy Automation
              </p>
              {overview.unhealthyAutomationRules.length === 0 &&
              overview.unhealthyAutomationSubscriptions.length === 0 ? (
                <p className="text-sm text-slate">No warning or unhealthy automation items yet.</p>
              ) : (
                <div className="space-y-2">
                  {overview.unhealthyAutomationRules.map((rule) => (
                    <Link
                      className="block rounded-2xl border border-ink/10 px-3 py-3 text-sm text-ink transition hover:border-cyan/30 hover:text-cyan"
                      href={`${APP_ROUTES.adminOperationsRules}/${rule.id}`}
                      key={`rule-${rule.id}`}
                    >
                      {rule.name} ({rule.healthStatus})
                    </Link>
                  ))}
                  {overview.unhealthyAutomationSubscriptions.map((subscription) => (
                    <Link
                      className="block rounded-2xl border border-ink/10 px-3 py-3 text-sm text-ink transition hover:border-cyan/30 hover:text-cyan"
                      href={`${APP_ROUTES.adminOperationsSubscriptions}/${subscription.id}`}
                      key={`subscription-${subscription.id}`}
                    >
                      {subscription.name} ({subscription.healthStatus})
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Rules Needing Acknowledgement
              </p>
              {overview.needingAcknowledgementRules.length === 0 ? (
                <p className="text-sm text-slate">No unhealthy rules are waiting for acknowledgement.</p>
              ) : (
                <div className="space-y-2">
                  {overview.needingAcknowledgementRules.map((rule) => (
                    <Link
                      className="block rounded-2xl border border-ink/10 px-4 py-3 text-sm text-ink transition hover:border-cyan/30 hover:text-cyan"
                      href={`${APP_ROUTES.adminOperationsRules}/${rule.id}`}
                      key={rule.id}
                    >
                      {rule.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Subscriptions Needing Acknowledgement
              </p>
              {overview.needingAcknowledgementSubscriptions.length === 0 ? (
                <p className="text-sm text-slate">No unhealthy subscriptions are waiting for acknowledgement.</p>
              ) : (
                <div className="space-y-2">
                  {overview.needingAcknowledgementSubscriptions.map((subscription) => (
                    <Link
                      className="block rounded-2xl border border-ink/10 px-4 py-3 text-sm text-ink transition hover:border-cyan/30 hover:text-cyan"
                      href={`${APP_ROUTES.adminOperationsSubscriptions}/${subscription.id}`}
                      key={subscription.id}
                    >
                      {subscription.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Rules Needing Follow-up
              </p>
              {overview.overdueFollowUpRules.length === 0 ? (
                <p className="text-sm text-slate">No rule reminders or verification follow-up are overdue.</p>
              ) : (
                <div className="space-y-2">
                  {overview.overdueFollowUpRules.map((rule) => (
                    <Link
                      className="block rounded-2xl border border-ink/10 px-4 py-3 text-sm text-ink transition hover:border-cyan/30 hover:text-cyan"
                      href={`${APP_ROUTES.adminOperationsRules}/${rule.id}`}
                      key={`followup-rule-${rule.id}`}
                    >
                      {rule.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Subscriptions Needing Follow-up
              </p>
              {overview.overdueFollowUpSubscriptions.length === 0 ? (
                <p className="text-sm text-slate">No subscription reminders or verification follow-up are overdue.</p>
              ) : (
                <div className="space-y-2">
                  {overview.overdueFollowUpSubscriptions.map((subscription) => (
                    <Link
                      className="block rounded-2xl border border-ink/10 px-4 py-3 text-sm text-ink transition hover:border-cyan/30 hover:text-cyan"
                      href={`${APP_ROUTES.adminOperationsSubscriptions}/${subscription.id}`}
                      key={`followup-subscription-${subscription.id}`}
                    >
                      {subscription.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Saved Views
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Default Delivery View
              </h2>
              <p className="text-sm text-slate">
                {overview.defaultDeliveryView
                  ? overview.defaultDeliveryView.name
                  : "No default delivery view saved yet."}
              </p>
              {overview.defaultDeliveryView ? (
                <Link
                  className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  href={buildOperationsHref(APP_ROUTES.adminOperationsDeliveries, {
                    ...overview.defaultDeliveryView.filters,
                    savedView: overview.defaultDeliveryView.id
                  })}
                >
                  Open Default Delivery View
                </Link>
              ) : null}
            </div>
          </Card>

          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Saved Views
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Default Job View
              </h2>
              <p className="text-sm text-slate">
                {overview.defaultJobView
                  ? overview.defaultJobView.name
                  : "No default job view saved yet."}
              </p>
              {overview.defaultJobView ? (
                <Link
                  className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  href={buildOperationsHref(APP_ROUTES.adminOperationsJobs, {
                    ...overview.defaultJobView.filters,
                    savedView: overview.defaultJobView.id
                  })}
                >
                  Open Default Job View
                </Link>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-slate-200 bg-slate-50">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
                Automation Shortcuts
              </p>
              <p className="text-sm text-slate">
                Review muted rules and resume delivery-side automation from the queue panel.
              </p>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                href={APP_ROUTES.adminOperationsDeliveries}
              >
                Delivery Automation
              </Link>
            </div>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Snoozed Queues
              </p>
              <p className="text-sm text-amber-950">
                Inspect snoozed subscriptions and decide whether to resume or extend them.
              </p>
              <Link
                className="inline-flex rounded-full border border-amber-200 bg-white px-5 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                href={APP_ROUTES.adminOperationsJobs}
              >
                Job Automation
              </Link>
            </div>
          </Card>

          <Card className="border-rose-100 bg-rose-50">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Unhealthy Automation
              </p>
              <p className="text-sm text-rose-950">
                Use the delivery and job queue panels to inspect skipped and failed rule or digest history.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  className="inline-flex rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                  href={APP_ROUTES.adminOperationsDeliveries}
                >
                  Deliveries
                </Link>
                <Link
                  className="inline-flex rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                  href={APP_ROUTES.adminOperationsJobs}
                >
                  Jobs
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminDataTable
            columns={[
              {
                header: "Rule Run",
                cell: (run) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{run.runSummary}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {run.triggeredBy} · {run.runStatus}
                      {run.triggeredByAdminUserLabel ? ` by ${run.triggeredByAdminUserLabel}` : ""}
                    </p>
                    {run.skipReason ? (
                      <p className="text-xs text-amber-900">{run.skipReason}</p>
                    ) : null}
                    {run.failureReason ? (
                      <p className="text-xs text-rose-700">{run.failureReason}</p>
                    ) : null}
                  </div>
                )
              },
              {
                header: "Created",
                cell: (run) => (
                  <span className="text-sm text-slate">
                    {new Date(run.createdAt).toLocaleString()}
                  </span>
                ),
                className: "w-40"
              }
            ]}
            emptyMessage="No escalation-rule runs recorded yet."
            getKey={(run) => run.id}
            items={overview.recentEscalationRuleRuns}
            title="Recent Escalation Rule Runs"
          />

          <AdminDataTable
            columns={[
              {
                header: "Digest",
                cell: (run) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{run.digestSummary}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {run.deliveredVia} · {run.triggeredBy} · {run.runStatus}
                    </p>
                    {run.skipReason ? (
                      <p className="text-xs text-amber-900">{run.skipReason}</p>
                    ) : null}
                    {run.failureReason ? (
                      <p className="text-xs text-rose-700">{run.failureReason}</p>
                    ) : null}
                  </div>
                )
              },
              {
                header: "Created",
                cell: (run) => (
                  <span className="text-sm text-slate">
                    {new Date(run.createdAt).toLocaleString()}
                  </span>
                ),
                className: "w-40"
              }
            ]}
            emptyMessage="No subscription digests generated yet."
            getKey={(run) => run.id}
            items={overview.recentSubscriptionDigestRuns}
            title="Recent Subscription Digests"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Queue Subscriptions
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Delivery Subscriptions
              </h2>
              {overview.subscribedDeliveryViews.length === 0 ? (
                <p className="text-sm text-slate">No active delivery subscriptions yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {overview.subscribedDeliveryViews.map((subscription) => (
                    <Link
                      className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                      href={buildOperationsHref(APP_ROUTES.adminOperationsDeliveries, {
                        ...subscription.filters
                      })}
                      key={subscription.id}
                    >
                      {subscription.name} ({subscription.currentMatchCount})
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Queue Subscriptions
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Job Subscriptions
              </h2>
              {overview.subscribedJobViews.length === 0 ? (
                <p className="text-sm text-slate">No active job subscriptions yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {overview.subscribedJobViews.map((subscription) => (
                    <Link
                      className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                      href={buildOperationsHref(APP_ROUTES.adminOperationsJobs, {
                        ...subscription.filters
                      })}
                      key={subscription.id}
                    >
                      {subscription.name} ({subscription.currentMatchCount})
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Escalation Rules
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Delivery Rules
              </h2>
              {overview.escalationDeliveryRules.length === 0 ? (
                <p className="text-sm text-slate">No active delivery escalation rules yet.</p>
              ) : (
                <div className="space-y-2">
                  {overview.escalationDeliveryRules.map((rule) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3"
                      key={rule.id}
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-ink">{rule.name}</p>
                        <p className="text-xs text-rose-700">{rule.escalationReason}</p>
                      </div>
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900">
                        Matches {rule.currentMatchCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
                Escalation Rules
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Job Rules
              </h2>
              {overview.escalationJobRules.length === 0 ? (
                <p className="text-sm text-slate">No active job escalation rules yet.</p>
              ) : (
                <div className="space-y-2">
                  {overview.escalationJobRules.map((rule) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3"
                      key={rule.id}
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-ink">{rule.name}</p>
                        <p className="text-xs text-rose-700">{rule.escalationReason}</p>
                      </div>
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900">
                        Matches {rule.currentMatchCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminDataTable
            columns={[
              {
                header: "Delivery",
                cell: (delivery) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{delivery.templateKey}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {delivery.channel} to {delivery.userId}
                    </p>
                    <p className="text-xs text-slate">
                      Created {new Date(delivery.createdAt).toLocaleString()}
                    </p>
                  </div>
                )
              },
              {
                header: "Status",
                cell: (delivery) => <OperationsStatusBadge status={delivery.status} />,
                className: "w-36"
              },
              {
                header: "Detail",
                cell: (delivery) => (
                  <Link
                    className="font-semibold text-cyan hover:text-teal"
                    href={`${APP_ROUTES.adminOperationsDeliveries}/${delivery.id}`}
                  >
                    Inspect
                  </Link>
                ),
                className: "w-24"
              }
            ]}
            emptyMessage="No delivery rows have been created yet."
            getKey={(delivery) => delivery.id}
            items={overview.recentDeliveries}
            title="Recent Deliveries"
          />

          <AdminDataTable
            columns={[
              {
                header: "Job",
                cell: (job) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{job.jobType}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {job.relatedEntityType} {job.relatedEntityId}
                    </p>
                    <p className="text-xs text-slate">
                      Scheduled {new Date(job.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                )
              },
              {
                header: "Status",
                cell: (job) => <OperationsStatusBadge status={job.status} />,
                className: "w-36"
              },
              {
                header: "Detail",
                cell: (job) => (
                  <Link
                    className="font-semibold text-cyan hover:text-teal"
                    href={`${APP_ROUTES.adminOperationsJobs}/${job.id}`}
                  >
                    Inspect
                  </Link>
                ),
                className: "w-24"
              }
            ]}
            emptyMessage="No scheduled jobs have been created yet."
            getKey={(job) => job.id}
            items={overview.recentJobs}
            title="Recent Jobs"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminDataTable
            columns={[
              {
                header: "Escalated Delivery",
                cell: (delivery) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{delivery.templateKey}</p>
                    <p className="text-xs text-rose-700">
                      {delivery.escalationReason ?? "Escalated for team review"}
                    </p>
                  </div>
                )
              },
              {
                header: "Workflow",
                cell: (delivery) => <OperationsWorkflowBadge workflowState={delivery.workflowState} />,
                className: "w-40"
              }
            ]}
            emptyMessage="No escalated deliveries right now."
            getKey={(delivery) => delivery.id}
            items={overview.escalatedDeliveries}
            title="Escalated Deliveries"
          />

          <AdminDataTable
            columns={[
              {
                header: "Escalated Job",
                cell: (job) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{job.jobType}</p>
                    <p className="text-xs text-rose-700">
                      {job.escalationReason ?? "Escalated for team review"}
                    </p>
                  </div>
                )
              },
              {
                header: "Workflow",
                cell: (job) => <OperationsWorkflowBadge workflowState={job.workflowState} />,
                className: "w-40"
              }
            ]}
            emptyMessage="No escalated jobs right now."
            getKey={(job) => job.id}
            items={overview.escalatedJobs}
            title="Escalated Jobs"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminDataTable
            columns={[
              {
                header: "Delivery",
                cell: (delivery) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{delivery.templateKey}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {delivery.channel} to {delivery.userId}
                    </p>
                  </div>
                )
              },
              {
                header: "Owner",
                cell: (delivery) => (
                  <div className="space-y-2">
                    <OperationsOwnerBadge
                      isCurrentAdmin={delivery.assignedAdminUserId === adminUser.id}
                      ownerLabel={delivery.assignedAdminUserLabel}
                    />
                    <OperationsWorkflowBadge workflowState={delivery.workflowState} />
                  </div>
                ),
                className: "w-36"
              }
            ]}
            emptyMessage="No deliveries are assigned to you right now."
            getKey={(delivery) => delivery.id}
            items={overview.myAssignedDeliveries}
            title="My Assigned Deliveries"
          />

          <AdminDataTable
            columns={[
              {
                header: "Job",
                cell: (job) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{job.jobType}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {job.relatedEntityType} {job.relatedEntityId}
                    </p>
                  </div>
                )
              },
              {
                header: "Owner",
                cell: (job) => (
                  <div className="space-y-2">
                    <OperationsOwnerBadge
                      isCurrentAdmin={job.assignedAdminUserId === adminUser.id}
                      ownerLabel={job.assignedAdminUserLabel}
                    />
                    <OperationsWorkflowBadge workflowState={job.workflowState} />
                  </div>
                ),
                className: "w-36"
              }
            ]}
            emptyMessage="No jobs are assigned to you right now."
            getKey={(job) => job.id}
            items={overview.myAssignedJobs}
            title="My Assigned Jobs"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminDataTable
            columns={[
              {
                header: "Delivery",
                cell: (delivery) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{delivery.templateKey}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {delivery.assignedAdminUserLabel ?? "Unassigned"}
                    </p>
                  </div>
                )
              },
              {
                header: "Workflow",
                cell: (delivery) => (
                  <OperationsWorkflowBadge workflowState={delivery.workflowState} />
                ),
                className: "w-40"
              }
            ]}
            emptyMessage="No recent delivery hand-offs to review."
            getKey={(delivery) => delivery.id}
            items={overview.recentlyHandedOffDeliveries}
            title="Recently Handed Off Deliveries"
          />

          <AdminDataTable
            columns={[
              {
                header: "Job",
                cell: (job) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{job.jobType}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {job.assignedAdminUserLabel ?? "Unassigned"}
                    </p>
                  </div>
                )
              },
              {
                header: "Workflow",
                cell: (job) => <OperationsWorkflowBadge workflowState={job.workflowState} />,
                className: "w-40"
              }
            ]}
            emptyMessage="No recent job hand-offs to review."
            getKey={(job) => job.id}
            items={overview.recentlyHandedOffJobs}
            title="Recently Handed Off Jobs"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminDataTable
            columns={[
              {
                header: "Delivery",
                cell: (delivery) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{delivery.templateKey}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {delivery.channel} to {delivery.userId}
                    </p>
                  </div>
                )
              },
              {
                header: "Workflow",
                cell: (delivery) => (
                  <div className="space-y-2">
                    <OperationsOwnerBadge
                      isCurrentAdmin={delivery.assignedAdminUserId === adminUser.id}
                      ownerLabel={delivery.assignedAdminUserLabel}
                    />
                    <OperationsWorkflowBadge workflowState={delivery.workflowState} />
                  </div>
                ),
                className: "w-36"
              }
            ]}
            emptyMessage="You are not watching any deliveries right now."
            getKey={(delivery) => delivery.id}
            items={overview.watchedDeliveries}
            title="Watched Deliveries"
          />

          <AdminDataTable
            columns={[
              {
                header: "Job",
                cell: (job) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{job.jobType}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {job.relatedEntityType} {job.relatedEntityId}
                    </p>
                  </div>
                )
              },
              {
                header: "Workflow",
                cell: (job) => (
                  <div className="space-y-2">
                    <OperationsOwnerBadge
                      isCurrentAdmin={job.assignedAdminUserId === adminUser.id}
                      ownerLabel={job.assignedAdminUserLabel}
                    />
                    <OperationsWorkflowBadge workflowState={job.workflowState} />
                  </div>
                ),
                className: "w-36"
              }
            ]}
            emptyMessage="You are not watching any jobs right now."
            getKey={(job) => job.id}
            items={overview.watchedJobs}
            title="Watched Jobs"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminDataTable
            columns={[
              {
                header: "Action",
                cell: (event) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{event.eventSummary}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {event.eventType.replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-slate">
                      {new Date(event.createdAt).toLocaleString()}
                      {event.adminUserLabel ? ` by ${event.adminUserLabel}` : ""}
                    </p>
                  </div>
                )
              },
              {
                header: "Entity",
                cell: (event) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{event.entityType}</p>
                    <p className="text-xs text-slate break-all">{event.entityId}</p>
                  </div>
                ),
                className: "w-56"
              }
            ]}
            emptyMessage="No operator actions have been recorded yet."
            getKey={(event) => event.id}
            items={overview.recentActions}
            title="Recent Operator Actions"
          />

          <AdminDataTable
            columns={[
              {
                header: "Failure Category",
                cell: (category) => (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">{category.label}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate">
                      {category.entityType.replaceAll("_", " ")}
                    </p>
                  </div>
                )
              },
              {
                header: "Count",
                cell: (category) => (
                  <span className="font-semibold text-ink">{category.count}</span>
                ),
                className: "w-24"
              }
            ]}
            emptyMessage="No failed delivery or job categories need surfacing right now."
            getKey={(category) => `${category.entityType}:${category.label}`}
            items={overview.topFailureCategories}
            title="Top Failure Categories"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Delivery Queue
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Delivery Operations
              </h2>
              <p className="text-sm leading-7 text-slate">
                Filter pending, failed, sent, or ignored outbound deliveries and resend
                them when the underlying session state is still valid.
              </p>
              <Link
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                href={APP_ROUTES.adminOperationsDeliveries}
              >
                Open Deliveries
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                href={buildOperationsHref(APP_ROUTES.adminOperationsDeliveries, {
                  ownership: "assigned_to_me",
                  workflowState: "investigating"
                })}
              >
                My Investigating Queue
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                href={buildOperationsHref(APP_ROUTES.adminOperationsDeliveries, {
                  watchedOnly: true
                })}
              >
                Deliveries I Watch
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                href={buildOperationsHref(APP_ROUTES.adminOperationsDeliveries, {
                  watchedOnly: true,
                  workflowState: "investigating"
                })}
              >
                Watched Investigating
              </Link>
              <Link
                className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                href={buildOperationsHref(APP_ROUTES.adminOperationsDeliveries, {
                  escalatedOnly: true,
                  ownership: "unassigned"
                })}
              >
                Unassigned Escalated
              </Link>
            </div>
          </Card>

          <Card className="border-ink/5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Reminder Queue
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">Job Operations</h2>
              <p className="text-sm leading-7 text-slate">
                Review failed reminder scheduling work, replay valid jobs, or cancel
                pending reminders that should no longer run.
              </p>
              <Link
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                href={APP_ROUTES.adminOperationsJobs}
              >
                Open Jobs
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                href={buildOperationsHref(APP_ROUTES.adminOperationsJobs, {
                  ownership: "assigned_to_me",
                  workflowState: "investigating"
                })}
              >
                My Investigating Queue
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                href={buildOperationsHref(APP_ROUTES.adminOperationsJobs, {
                  watchedOnly: true
                })}
              >
                Jobs I Watch
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                href={buildOperationsHref(APP_ROUTES.adminOperationsJobs, {
                  watchedOnly: true,
                  needsAttention: true
                })}
              >
                Watched Needs Attention
              </Link>
              <Link
                className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
                href={buildOperationsHref(APP_ROUTES.adminOperationsJobs, {
                  escalatedOnly: true,
                  ownership: "unassigned"
                })}
              >
                Unassigned Escalated
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown operations error.";

    return (
      <div className="space-y-8">
        <AdminSectionHeader
          description="Review queue health, inspect failures, and hand off replay or cancel actions without leaving the admin surface."
          eyebrow="Queue Ops"
          title="Operations Overview"
        />

        <Card className="border-rose-200 bg-rose-50 text-rose-950">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
              Unable to load operations data
            </p>
            <p className="text-sm">
              Confirm the Phase 15 migration has been applied and the service-role
              automation variables are configured in this environment.
            </p>
            <p className="rounded-2xl bg-white/80 px-4 py-3 text-xs">{message}</p>
          </div>
        </Card>
      </div>
    );
  }
}

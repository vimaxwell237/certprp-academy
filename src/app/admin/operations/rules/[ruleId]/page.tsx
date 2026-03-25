import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { AdminSectionHeader } from "@/features/admin/components/admin-section-header";
import { applyEscalationRuleAction, updateEscalationRuleAutomationControlAction } from "@/features/operations/actions/operations-actions";
import { OperationsAcknowledgementPanel } from "@/features/operations/components/operations-acknowledgement-panel";
import { OperationsAutomationDrilldown } from "@/features/operations/components/operations-automation-drilldown";
import { OperationsRemediationPlaybooksPanel } from "@/features/operations/components/operations-remediation-playbooks-panel";
import { fetchAdminOperators, fetchOperationEscalationRuleDetail } from "@/features/operations/data/operations-service";
import { FlashBanner } from "@/features/scheduling/components/flash-banner";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { requireAdminUser } from "@/lib/auth/roles";

function resolveBackHref(entityType: "notification_delivery" | "scheduled_job") {
  return entityType === "notification_delivery"
    ? APP_ROUTES.adminOperationsDeliveries
    : APP_ROUTES.adminOperationsJobs;
}

export default async function AdminOperationsRuleDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ ruleId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const adminUser = await requireAdminUser();
  const { ruleId } = await params;
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

  const [detail, operators] = await Promise.all([
    fetchOperationEscalationRuleDetail(ruleId, adminUser.id),
    fetchAdminOperators(adminUser.id)
  ]);

  if (!detail) {
    notFound();
  }

  const {
    rule,
    recentRuns,
    rerunGuidance,
    trendWindows,
    acknowledgement,
    acknowledgementHistory,
    remediationPlaybooks,
    rerunReadiness,
    verificationGuidance
  } = detail;
  const returnTo = `${APP_ROUTES.adminOperationsRules}/${rule.id}`;

  return (
    <div className="space-y-8">
      {success ? <FlashBanner message={success} tone="success" /> : null}
      {error ? <FlashBanner message={error} tone="error" /> : null}
      {warning ? <FlashBanner message={warning} tone="warning" /> : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Inspect recent escalation-rule execution patterns, drill into skip and failure reasons, and rerun only with clear operator context."
          eyebrow="Queue Ops"
          title="Escalation Rule Drill-down"
        />
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
            href={resolveBackHref(rule.entityType)}
          >
            Back to Queue
          </Link>
          <Link
            className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
            href={APP_ROUTES.adminOperations}
          >
            Back to Overview
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <OperationsAutomationDrilldown
          automationState={rule.automationState}
          consecutiveFailureCount={rule.consecutiveFailureCount}
          consecutiveSkipCount={rule.consecutiveSkipCount}
          currentMatchCount={rule.currentMatchCount}
          description="This drill-down focuses on execution health for one escalation rule, including recent runs, recurring skip and failure patterns, and manual rerun safety guidance."
          eyebrow="Execution Health"
          guidance={rerunGuidance}
          healthStatus={rule.healthStatus}
          lastFailureAt={rule.lastFailureAt}
          lastSkipReason={rule.lastSkipReason}
          lastSuccessAt={rule.lastSuccessAt}
          metadata={
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-pearl px-4 py-3 text-sm text-slate">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Run Mode</p>
                <p className="mt-2 font-semibold text-ink">{rule.runMode}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3 text-sm text-slate">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Cooldown</p>
                <p className="mt-2 font-semibold text-ink">{rule.cooldownMinutes} min</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3 text-sm text-slate">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Max Matches</p>
                <p className="mt-2 font-semibold text-ink">{rule.maxMatchesPerRun}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3 text-sm text-slate">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Next Eligible</p>
                <p className="mt-2 font-semibold text-ink">
                  {rule.nextRunAt ? new Date(rule.nextRunAt).toLocaleString() : "Now"}
                </p>
              </div>
            </div>
          }
          mutedOrSnoozedReason={rule.mutedOrSnoozedReason}
          quickActions={
            <Card className="space-y-4 border-ink/5">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                  Quick Actions
                </p>
                <p className="text-sm text-slate">
                  Manual reruns can override mute or snooze state when needed, but the acknowledgement state and playbook below should be reviewed first.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={applyEscalationRuleAction}>
                  <input name="ruleId" type="hidden" value={rule.id} />
                  <input name="returnTo" type="hidden" value={returnTo} />
                  {rule.automationState !== "active" ? (
                    <input name="overrideAutomationState" type="hidden" value="true" />
                  ) : null}
                  <button
                    className="inline-flex rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                    type="submit"
                  >
                    {rule.automationState === "active" ? "Apply Rule" : "Apply Rule With Override"}
                  </button>
                </form>
              </div>
              <form
                action={updateEscalationRuleAutomationControlAction}
                className="grid gap-3 rounded-2xl bg-pearl px-4 py-4 md:grid-cols-[1fr_220px_auto_auto_auto]"
              >
                <input name="ruleId" type="hidden" value={rule.id} />
                <input name="returnTo" type="hidden" value={returnTo} />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={rule.mutedOrSnoozedReason ?? ""}
                  name="automationReason"
                  placeholder="Reason for mute or snooze"
                  type="text"
                />
                <input
                  className="rounded-2xl border border-ink/10 px-4 py-2.5 text-sm text-ink outline-none transition focus:border-cyan/40"
                  defaultValue={rule.snoozedUntil ? new Date(rule.snoozedUntil).toISOString().slice(0, 16) : ""}
                  name="snoozedUntil"
                  type="datetime-local"
                />
                <button
                  className="inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
                  name="automationAction"
                  type="submit"
                  value={rule.isMuted ? "unmute" : "mute"}
                >
                  {rule.isMuted ? "Unmute" : "Mute"}
                </button>
                <button
                  className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                  name="automationAction"
                  type="submit"
                  value="snooze"
                >
                  Snooze Custom
                </button>
                <button
                  className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                  name="automationAction"
                  type="submit"
                  value="resume"
                >
                  Resume
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {(["1h", "6h", "24h", "3d"] as const).map((preset) => (
                  <form action={updateEscalationRuleAutomationControlAction} key={preset}>
                    <input name="ruleId" type="hidden" value={rule.id} />
                    <input name="returnTo" type="hidden" value={returnTo} />
                    <input name="automationAction" type="hidden" value="snooze" />
                    <button
                      className="inline-flex rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-50"
                      name="snoozePreset"
                      type="submit"
                      value={preset}
                    >
                      Snooze {preset}
                    </button>
                  </form>
                ))}
              </div>
            </Card>
          }
          recentRuns={recentRuns.slice(0, 10).map((run) => ({
            id: run.id,
            triggeredBy: run.triggeredBy,
            triggeredByAdminUserLabel: run.triggeredByAdminUserLabel,
            runStatus: run.runStatus,
            skipReason: run.skipReason,
            failureReason: run.failureReason,
            durationMs: run.durationMs,
            createdAt: run.createdAt,
            summary: run.runSummary,
            matchCount: run.matchedCount
          }))}
          snoozedUntil={rule.snoozedUntil}
          title={rule.name}
          trendWindows={trendWindows}
        />

        <div className="space-y-6">
          <OperationsAcknowledgementPanel
            acknowledgement={acknowledgement}
            acknowledgementHistory={acknowledgementHistory}
            entityId={rule.id}
            entityType="operation_escalation_rule"
            rerunReadiness={rerunReadiness}
            verificationGuidance={verificationGuidance}
            operators={operators}
            returnTo={returnTo}
          />
          <OperationsRemediationPlaybooksPanel playbooks={remediationPlaybooks} />
        </div>
      </div>
    </div>
  );
}

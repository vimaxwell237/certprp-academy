import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { getAutomationHealthMeta } from "@/features/operations/lib/health";
import type {
  OperationAutomationGuidance,
  OperationAutomationHealthStatus,
  OperationAutomationReasonSummary,
  OperationAutomationTrendSummary,
  OperationEscalationRuleRunRecord
} from "@/types/operations";

type DrilldownRun = Pick<
  OperationEscalationRuleRunRecord,
  | "id"
  | "triggeredBy"
  | "triggeredByAdminUserLabel"
  | "runStatus"
  | "skipReason"
  | "failureReason"
  | "durationMs"
  | "createdAt"
> & {
  summary: string;
  matchCount: number;
};

function automationStateClassName(state: "active" | "muted" | "snoozed") {
  if (state === "muted") {
    return "rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white";
  }

  if (state === "snoozed") {
    return "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900";
  }

  return "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900";
}

function automationStateLabel(state: "active" | "muted" | "snoozed") {
  return state === "active" ? "Automation Active" : state === "muted" ? "Muted" : "Snoozed";
}

function runStatusClassName(status: DrilldownRun["runStatus"]) {
  if (status === "failed") {
    return "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-900";
  }

  if (status === "skipped") {
    return "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900";
  }

  return "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900";
}

function guidanceClassName(tone: OperationAutomationGuidance["tone"]) {
  if (tone === "danger") {
    return "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900";
  }

  if (tone === "warning") {
    return "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900";
  }

  return "rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-900";
}

function renderReasonList(label: string, items: OperationAutomationReasonSummary[]) {
  if (items.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">{label}</p>
        <p className="text-sm text-slate">No recent reasons recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            className={
              item.kind === "failure"
                ? "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-900"
                : "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900"
            }
            key={`${item.kind}-${item.reason}`}
          >
            {item.reason} ({item.count})
          </span>
        ))}
      </div>
    </div>
  );
}

export function OperationsAutomationDrilldown({
  eyebrow,
  title,
  description,
  automationState,
  healthStatus,
  currentMatchCount,
  lastSuccessAt,
  lastFailureAt,
  lastSkipReason,
  consecutiveSkipCount,
  consecutiveFailureCount,
  mutedOrSnoozedReason,
  snoozedUntil,
  guidance,
  trendWindows,
  recentRuns,
  quickActions,
  metadata
}: {
  eyebrow: string;
  title: string;
  description: string;
  automationState: "active" | "muted" | "snoozed";
  healthStatus: OperationAutomationHealthStatus;
  currentMatchCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastSkipReason: string | null;
  consecutiveSkipCount: number;
  consecutiveFailureCount: number;
  mutedOrSnoozedReason: string | null;
  snoozedUntil: string | null;
  guidance: OperationAutomationGuidance[];
  trendWindows: OperationAutomationTrendSummary[];
  recentRuns: DrilldownRun[];
  quickActions?: ReactNode;
  metadata?: ReactNode;
}) {
  const healthMeta = getAutomationHealthMeta(healthStatus);

  return (
    <div className="space-y-6">
      <Card className="space-y-5 border-ink/5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl font-semibold text-ink">{title}</h2>
          <p className="text-sm leading-7 text-slate">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={healthMeta.className}>{healthMeta.label}</span>
          <span className={automationStateClassName(automationState)}>
            {automationStateLabel(automationState)}
          </span>
          <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
            Matches {currentMatchCount}
          </span>
        </div>

        {metadata}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-pearl px-4 py-3 text-sm text-slate">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              Last Success
            </p>
            <p className="mt-2 font-semibold text-ink">
              {lastSuccessAt ? new Date(lastSuccessAt).toLocaleString() : "Not recorded"}
            </p>
          </div>
          <div className="rounded-2xl bg-pearl px-4 py-3 text-sm text-slate">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              Last Failure
            </p>
            <p className="mt-2 font-semibold text-ink">
              {lastFailureAt ? new Date(lastFailureAt).toLocaleString() : "Not recorded"}
            </p>
          </div>
          <div className="rounded-2xl bg-pearl px-4 py-3 text-sm text-slate">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              Consecutive Failures
            </p>
            <p className="mt-2 font-semibold text-ink">{consecutiveFailureCount}</p>
          </div>
          <div className="rounded-2xl bg-pearl px-4 py-3 text-sm text-slate">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              Consecutive Skips
            </p>
            <p className="mt-2 font-semibold text-ink">{consecutiveSkipCount}</p>
          </div>
        </div>

        {snoozedUntil || mutedOrSnoozedReason || lastSkipReason ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            <p className="font-semibold">Current automation notes</p>
            {snoozedUntil ? (
              <p className="mt-2">Snoozed until {new Date(snoozedUntil).toLocaleString()}.</p>
            ) : null}
            {mutedOrSnoozedReason ? <p className="mt-2">Reason: {mutedOrSnoozedReason}</p> : null}
            {lastSkipReason ? <p className="mt-2">Last skip reason: {lastSkipReason}</p> : null}
          </div>
        ) : null}

        {quickActions}
      </Card>

      <Card className="space-y-4 border-ink/5">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
            Rerun Guidance
          </p>
          <p className="text-sm text-slate">
            Guidance is based on recent run history, mute or snooze state, and repeated skip or failure patterns.
          </p>
        </div>
        <div className="space-y-3">
          {guidance.map((item, index) => (
            <p className={guidanceClassName(item.tone)} key={`${item.tone}-${index}`}>
              {item.message}
            </p>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {trendWindows.map((trend) => (
          <Card className="space-y-4 border-ink/5" key={trend.key}>
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                {trend.label}
              </p>
              <p className="text-xs text-slate">
                {trend.totalRuns} runs · {trend.successes} success · {trend.skipped} skipped · {trend.failures} failed
              </p>
            </div>
            <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl bg-pearl px-4 py-3 text-slate">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  Latest Match Count
                </p>
                <p className="mt-2 font-semibold text-ink">
                  {trend.latestMatchCount ?? "No runs"}
                </p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3 text-slate">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  Average Match Count
                </p>
                <p className="mt-2 font-semibold text-ink">
                  {trend.averageMatchCount ?? "No runs"}
                </p>
              </div>
            </div>
            {renderReasonList("Top Skip Reasons", trend.topSkipReasons)}
            {renderReasonList("Top Failure Reasons", trend.topFailureReasons)}
          </Card>
        ))}
      </div>

      <Card className="space-y-4 border-ink/5">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
            Recent Activity
          </p>
          <p className="text-sm text-slate">
            Recent chronological run history for operator drill-down.
          </p>
        </div>

        {recentRuns.length === 0 ? (
          <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
            No run history recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentRuns.map((run) => (
              <div className="rounded-2xl bg-pearl px-4 py-4" key={run.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cyan/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-900">
                    {run.triggeredBy}
                  </span>
                  <span className={runStatusClassName(run.runStatus)}>{run.runStatus}</span>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                    Matches {run.matchCount}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">{run.summary}</p>
                {run.skipReason ? (
                  <p className="mt-2 text-xs text-amber-900">{run.skipReason}</p>
                ) : null}
                {run.failureReason ? (
                  <p className="mt-2 text-xs text-rose-700">{run.failureReason}</p>
                ) : null}
                <p className="mt-2 text-xs text-slate">
                  {new Date(run.createdAt).toLocaleString()}
                  {run.triggeredByAdminUserLabel ? ` by ${run.triggeredByAdminUserLabel}` : ""}
                  {run.durationMs !== null ? ` · ${run.durationMs} ms` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

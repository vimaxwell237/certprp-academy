import type {
  OperationAutomationControlState,
  OperationAutomationGuidance,
  OperationAutomationHealthStatus,
  OperationAutomationReasonSummary,
  OperationAutomationTrendSummary,
  OperationAutomationRunStatus
} from "@/types/operations";

type AutomationRecordLike = {
  automationState: OperationAutomationControlState;
  consecutiveSkipCount: number;
  consecutiveFailureCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastSkipReason: string | null;
};

type AutomationRunLike = {
  runStatus: OperationAutomationRunStatus;
  skipReason: string | null;
  failureReason: string | null;
  createdAt: string;
  matchCount?: number | null;
};

const SNOOZE_PRESET_HOURS = {
  "1h": 1,
  "6h": 6,
  "24h": 24,
  "3d": 72
} as const;

export type SnoozePreset = keyof typeof SNOOZE_PRESET_HOURS;

function normalizeReason(reason: string | null | undefined) {
  const value = reason?.trim();
  return value ? value.replace(/\.+$/, "") : null;
}

export function classifyAutomationHealthStatus(
  record: Pick<
    AutomationRecordLike,
    | "automationState"
    | "consecutiveSkipCount"
    | "consecutiveFailureCount"
    | "lastSuccessAt"
    | "lastFailureAt"
    | "lastSkipReason"
  >
): OperationAutomationHealthStatus {
  if (record.automationState === "muted") {
    return "muted";
  }

  if (record.automationState === "snoozed") {
    return "snoozed";
  }

  if (record.consecutiveFailureCount >= 2 || record.consecutiveSkipCount >= 4) {
    return "unhealthy";
  }

  if (record.consecutiveFailureCount > 0 || record.consecutiveSkipCount > 0) {
    return "warning";
  }

  const lastFailureTime = record.lastFailureAt ? new Date(record.lastFailureAt).getTime() : -1;
  const lastSuccessTime = record.lastSuccessAt ? new Date(record.lastSuccessAt).getTime() : -1;

  if (lastFailureTime > lastSuccessTime || Boolean(normalizeReason(record.lastSkipReason))) {
    return "warning";
  }

  return "healthy";
}

export function getAutomationHealthMeta(status: OperationAutomationHealthStatus) {
  switch (status) {
    case "muted":
      return {
        label: "Muted",
        className:
          "rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
      };
    case "snoozed":
      return {
        label: "Snoozed",
        className:
          "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900"
      };
    case "unhealthy":
      return {
        label: "Unhealthy",
        className:
          "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-900"
      };
    case "warning":
      return {
        label: "Warning",
        className:
          "rounded-full bg-orange-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-900"
      };
    default:
      return {
        label: "Healthy",
        className:
          "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900"
      };
  }
}

export function summarizeAutomationReasons(
  runs: AutomationRunLike[],
  kind: "skip" | "failure",
  limit = 3
): OperationAutomationReasonSummary[] {
  const counts = new Map<string, number>();

  for (const run of runs) {
    const reason =
      kind === "skip" ? normalizeReason(run.skipReason) : normalizeReason(run.failureReason);

    if (!reason) {
      continue;
    }

    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([reason, count]) => ({ reason, count, kind }));
}

export function buildAutomationTrendSummary(record: AutomationRecordLike) {
  const parts: string[] = [];

  if (record.consecutiveFailureCount > 0) {
    parts.push(`${record.consecutiveFailureCount} consecutive failure${record.consecutiveFailureCount === 1 ? "" : "s"}`);
  }

  if (record.consecutiveSkipCount > 0) {
    parts.push(`${record.consecutiveSkipCount} consecutive skip${record.consecutiveSkipCount === 1 ? "" : "s"}`);
  }

  if (parts.length === 0) {
    return "No recent skip or failure trend.";
  }

  return parts.join(" · ");
}

export function buildManualRerunGuidance(
  record: AutomationRecordLike,
  runs: AutomationRunLike[],
  options?: { manualOverride?: boolean }
): OperationAutomationGuidance[] {
  const guidance: OperationAutomationGuidance[] = [];
  const status = classifyAutomationHealthStatus(record);
  const skipReasons = summarizeAutomationReasons(runs, "skip", 4).map((item) =>
    item.reason.toLowerCase()
  );
  const topFailureReason = summarizeAutomationReasons(runs, "failure", 1)[0]?.reason ?? null;

  if (record.automationState === "muted") {
    guidance.push({
      tone: "warning",
      message: "Automation is muted. A manual rerun should only be used if you intend to override the mute."
    });
  }

  if (record.automationState === "snoozed") {
    guidance.push({
      tone: "warning",
      message: "Automation is snoozed. A manual rerun should only be used if you need to bypass the snooze window."
    });
  }

  if (record.consecutiveFailureCount >= 3) {
    guidance.push({
      tone: "danger",
      message: "Consecutive failures are high. Check filters, queue state, and dependent incident data before rerunning."
    });
  } else if (record.consecutiveFailureCount > 0) {
    guidance.push({
      tone: "warning",
      message: "Recent failures were recorded. Validate the queue slice and escalation or digest settings before rerunning."
    });
  }

  if (topFailureReason) {
    guidance.push({
      tone: "info",
      message: `Recent failure pattern: ${topFailureReason}.`
    });
  }

  if (skipReasons.some((reason) => reason.includes("cooldown"))) {
    guidance.push({
      tone: "info",
      message: "Recent runs were skipped by cooldown. A manual rerun is unlikely to help unless the cooldown window has changed."
    });
  }

  if (
    skipReasons.some(
      (reason) => reason.includes("zero matches") || reason.includes("no meaningful changes")
    )
  ) {
    guidance.push({
      tone: "info",
      message: "Recent runs found nothing actionable. Review filters or wait for queue state to change before rerunning."
    });
  }

  if (skipReasons.some((reason) => reason.includes("max-match"))) {
    guidance.push({
      tone: "info",
      message: "Recent runs hit the max-match cap. Consider whether the configured run limit is too low for this queue."
    });
  }

  if (options?.manualOverride) {
    guidance.push({
      tone: "warning",
      message: "Manual override is enabled for this run. That bypasses mute or snooze controls, but not other safety checks."
    });
  }

  if (guidance.length === 0) {
    guidance.push({
      tone: status === "healthy" ? "info" : "warning",
      message:
        status === "healthy"
          ? "Automation health looks stable. Manual rerun should be low risk if the queue state needs immediate processing."
          : "Automation health has some recent drift. Review the latest run details before rerunning."
    });
  }

  return guidance.slice(0, 4);
}

export function buildSnoozePresetTimestamp(
  preset: SnoozePreset,
  now = new Date()
): string {
  const hours = SNOOZE_PRESET_HOURS[preset];

  if (!hours) {
    throw new Error("Invalid snooze preset.");
  }

  return new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export function buildAutomationTrendWindows(
  runs: AutomationRunLike[],
  now = new Date()
): OperationAutomationTrendSummary[] {
  const windows: Array<{
    key: OperationAutomationTrendSummary["key"];
    label: string;
    filter: (run: AutomationRunLike, index: number) => boolean;
  }> = [
    {
      key: "24h",
      label: "Last 24 Hours",
      filter: (run) => new Date(run.createdAt).getTime() >= now.getTime() - 24 * 60 * 60 * 1000
    },
    {
      key: "7d",
      label: "Last 7 Days",
      filter: (run) => new Date(run.createdAt).getTime() >= now.getTime() - 7 * 24 * 60 * 60 * 1000
    },
    {
      key: "30runs",
      label: "Last 30 Runs",
      filter: (_run, index) => index < 30
    }
  ];

  return windows.map((window) => {
    const windowRuns = runs.filter(window.filter);
    const runsWithMatches = windowRuns.filter(
      (run): run is AutomationRunLike & { matchCount: number } =>
        typeof run.matchCount === "number" && Number.isFinite(run.matchCount)
    );
    const totalMatches = runsWithMatches.reduce((sum, run) => sum + run.matchCount, 0);

    return {
      key: window.key,
      label: window.label,
      totalRuns: windowRuns.length,
      successes: windowRuns.filter((run) => run.runStatus === "success").length,
      skipped: windowRuns.filter((run) => run.runStatus === "skipped").length,
      failures: windowRuns.filter((run) => run.runStatus === "failed").length,
      latestMatchCount: runsWithMatches[0]?.matchCount ?? null,
      averageMatchCount:
        runsWithMatches.length > 0 ? Number((totalMatches / runsWithMatches.length).toFixed(1)) : null,
      topSkipReasons: summarizeAutomationReasons(windowRuns, "skip", 3),
      topFailureReasons: summarizeAutomationReasons(windowRuns, "failure", 3)
    };
  });
}

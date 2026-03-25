import type {
  OperationAutomationAcknowledgementRecord,
  OperationAutomationGuidance,
  OperationAutomationHealthStatus,
  OperationAutomationRunStatus,
  OperationPostRerunVerificationGuidance,
  OperationRemediationPlaybook,
  OperationRerunReadiness
} from "@/types/operations";

type AutomationRecordLike = {
  automationState: "active" | "muted" | "snoozed";
  healthStatus: OperationAutomationHealthStatus;
  currentMatchCount: number;
  consecutiveSkipCount: number;
  consecutiveFailureCount: number;
};

type AutomationRunLike = {
  skipReason: string | null;
  failureReason: string | null;
};

function normalizedReasons(runs: AutomationRunLike[], kind: "skip" | "failure") {
  return runs
    .map((run) => (kind === "skip" ? run.skipReason : run.failureReason))
    .map((reason) => reason?.trim().toLowerCase() ?? "")
    .filter(Boolean);
}

export function buildRemediationPlaybooks(
  record: AutomationRecordLike,
  runs: AutomationRunLike[]
): OperationRemediationPlaybook[] {
  const playbooks: OperationRemediationPlaybook[] = [];
  const skipReasons = normalizedReasons(runs, "skip");
  const failureReasons = normalizedReasons(runs, "failure");
  const repeatedFailureReason = failureReasons.find(
    (reason) => failureReasons.filter((candidate) => candidate === reason).length >= 2
  );

  if (record.automationState !== "active") {
    playbooks.push({
      category: "muted_or_snoozed",
      title: "Muted or Snoozed Automation",
      summary: "Automation is currently paused by operator controls.",
      steps: [
        "Confirm whether the mute or snooze state is still intentional.",
        "Review the note and current queue state before resuming automation.",
        "Resume or use a one-off rerun only after the pause reason is understood."
      ],
      severity: "warning"
    });
  }

  if (skipReasons.filter((reason) => reason.includes("cooldown")).length >= 2) {
    playbooks.push({
      category: "cooldown_active",
      title: "Repeated Cooldown Skips",
      summary: "Recent automated runs are being suppressed by the configured cooldown window.",
      steps: [
        "Verify the cooldown duration matches the queue volatility you expect.",
        "Wait for the next eligible run if the cooldown is deliberate.",
        "Reduce the cooldown only if the queue genuinely needs more frequent automation."
      ],
      severity: "info"
    });
  }

  if (
    skipReasons.filter(
      (reason) => reason.includes("zero matches") || reason.includes("no meaningful changes")
    ).length >= 2
  ) {
    playbooks.push({
      category: "zero_match_pattern",
      title: "Repeated Zero-match or No-change Runs",
      summary: "The automation is repeatedly scanning a queue slice without finding actionable work.",
      steps: [
        "Check whether the filters are too narrow or no longer relevant.",
        "Pause or snooze the automation if the queue is expected to stay quiet.",
        "Only rerun manually after confirming the slice should now contain meaningful matches."
      ],
      severity: "warning"
    });
  }

  if (skipReasons.some((reason) => reason.includes("max-match"))) {
    playbooks.push({
      category: "max_match_capped",
      title: "Max-match Cap Reached",
      summary: "Recent runs hit the per-run match cap and left part of the queue untouched.",
      steps: [
        "Review whether the queue scope is too broad for the current cap.",
        "Increase the cap carefully only if the downstream action is safe at higher volume.",
        "Consider narrowing the rule or subscription filters before rerunning."
      ],
      severity: "warning"
    });
  }

  if (record.currentMatchCount === 0 && record.consecutiveSkipCount >= 2) {
    playbooks.push({
      category: "stale_filter_pattern",
      title: "Potentially Stale Filter Pattern",
      summary: "The current queue slice may no longer be producing useful matches.",
      steps: [
        "Re-check the queue filters against current operational needs.",
        "Compare the slice with a broader queue view to confirm the rule or subscription still has value.",
        "Pause or rename the automation if the slice is no longer operationally relevant."
      ],
      severity: "warning"
    });
  }

  if (record.consecutiveFailureCount >= 2) {
    playbooks.push({
      category: "repeated_automation_failure",
      title: "Repeated Automation Failures",
      summary: "The automation has failed repeatedly and now needs operator review before another rerun.",
      steps: [
        "Review the most recent failure reason and surrounding queue state.",
        "Check configuration, dependencies, and any related incident references.",
        "Mark the item as fixed pending rerun only after you have taken a remediation step."
      ],
      severity: "danger"
    });
  }

  if (repeatedFailureReason) {
    playbooks.push({
      category: "same_failure_pattern",
      title: "Repeated Same Failure Reason",
      summary: "Recent failures are repeating the same underlying problem.",
      steps: [
        `Investigate the recurring issue: ${repeatedFailureReason}.`,
        "Fix the root cause instead of repeatedly rerunning the same failing automation.",
        "Use a guarded rerun only after the suspected cause has been addressed."
      ],
      severity: "danger"
    });
  }

  return playbooks.slice(0, 4);
}

export function buildAutomationRerunReadiness(input: {
  record: AutomationRecordLike;
  acknowledgement: OperationAutomationAcknowledgementRecord | null;
  playbooks: OperationRemediationPlaybook[];
  guidance: OperationAutomationGuidance[];
}): OperationRerunReadiness {
  const { record, acknowledgement, playbooks } = input;

  if (record.automationState !== "active" && acknowledgement?.status !== "fixed_pending_rerun") {
    return {
      status: "blocked",
      summary: "Automation is muted or snoozed. Resume it or explicitly move it to fixed pending rerun before rerunning."
    };
  }

  if (!acknowledgement || acknowledgement.status === "unacknowledged") {
    return {
      status: "caution",
      summary: "This unhealthy automation has not been acknowledged yet. Review the playbook and acknowledge ownership before rerunning."
    };
  }

  if (!acknowledgement.assignedAdminUserId) {
    return {
      status: "caution",
      summary: "No assignee is set for this unhealthy automation. Assign an operator before rerunning so follow-up work stays owned."
    };
  }

  if (acknowledgement.status === "investigating") {
    return {
      status: "caution",
      summary: "An operator is still investigating this issue. Confirm the remediation steps are complete before rerunning."
    };
  }

  if (acknowledgement.status === "fixed_pending_rerun") {
    return {
      status: "ready",
      summary: "The issue is marked fixed pending rerun. Review the latest playbook notes and rerun with care."
    };
  }

  if (playbooks.some((playbook) => playbook.severity === "danger")) {
    return {
      status: "caution",
      summary: "High-severity remediation remains relevant. A rerun may be valid, but only after confirming the underlying cause is addressed."
    };
  }

  return {
    status: "ready",
    summary: "Automation looks ready for an operator-driven rerun."
  };
}

export function buildPostRerunVerificationGuidance(input: {
  acknowledgement: OperationAutomationAcknowledgementRecord | null;
  outcome: OperationAutomationRunStatus | null;
  playbooks: OperationRemediationPlaybook[];
  currentMatchCount: number;
  automationState: AutomationRecordLike["automationState"];
  lastSkipReason: string | null;
  lastFailureAt: string | null;
}): OperationPostRerunVerificationGuidance | null {
  const { acknowledgement, outcome, playbooks, currentMatchCount, automationState, lastSkipReason } =
    input;

  if (!acknowledgement || !outcome) {
    return null;
  }

  if (outcome === "success") {
    const steps = [
      "Confirm the queue now reflects the expected match count for this automation.",
      "Verify the previously repeated skip or failure pattern is no longer active.",
      "Move the acknowledgement to resolved only after that follow-up check is complete."
    ];

    if (currentMatchCount === 0) {
      steps.splice(
        1,
        0,
        "Double-check that a zero-match outcome is now acceptable and not a stale-filter symptom."
      );
    }

    return {
      tone: "success",
      title: "Post-rerun verification needed",
      summary:
        acknowledgement.status === "fixed_pending_rerun"
          ? "The rerun succeeded. Review the queue and verify the underlying issue is actually cleared before resolving."
          : "The rerun succeeded, but the acknowledgement workflow still needs operator verification before closure.",
      steps
    };
  }

  if (outcome === "skipped") {
    return {
      tone: "warning",
      title: "Rerun was skipped",
      summary:
        lastSkipReason ?? "The rerun did not execute. Review the current automation controls and recent queue conditions before trying again.",
      steps: [
        automationState !== "active"
          ? "Resume or explicitly override the muted or snoozed state only if the pause is no longer needed."
          : "Check whether cooldown or no-change conditions make another immediate rerun unnecessary.",
        "Review the latest playbook guidance before scheduling another rerun.",
        "Keep the acknowledgement open until a real rerun result is captured."
      ]
    };
  }

  const repeatedFailurePlaybook = playbooks.find(
    (playbook) =>
      playbook.category === "same_failure_pattern" ||
      playbook.category === "repeated_automation_failure"
  );

  return {
    tone: "warning",
    title: "Rerun failed again",
    summary:
      repeatedFailurePlaybook?.summary ??
      "The unhealthy automation failed again. Keep the acknowledgement open and continue investigation before another rerun.",
    steps: [
      "Check the latest failure reason and confirm the intended remediation was actually applied.",
      "Update the acknowledgement note with what changed and what still looks unresolved.",
      "Only move to fixed pending rerun again after the next remediation step is complete."
    ]
  };
}

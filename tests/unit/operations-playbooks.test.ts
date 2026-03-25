import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPostRerunVerificationGuidance,
  buildAutomationRerunReadiness,
  buildRemediationPlaybooks
} from "@/features/operations/lib/playbooks";

test("buildRemediationPlaybooks surfaces repeated cooldown and zero-match guidance", () => {
  const playbooks = buildRemediationPlaybooks(
    {
      automationState: "active",
      healthStatus: "warning",
      currentMatchCount: 0,
      consecutiveSkipCount: 3,
      consecutiveFailureCount: 0
    },
    [
      {
        skipReason: "Cooldown window is still active.",
        failureReason: null
      },
      {
        skipReason: "Cooldown window is still active.",
        failureReason: null
      },
      {
        skipReason: "Zero matches for the current queue slice.",
        failureReason: null
      },
      {
        skipReason: "No meaningful changes since the previous run.",
        failureReason: null
      }
    ]
  );

  assert.ok(playbooks.some((playbook) => playbook.category === "cooldown_active"));
  assert.ok(playbooks.some((playbook) => playbook.category === "zero_match_pattern"));
  assert.ok(playbooks.some((playbook) => playbook.category === "stale_filter_pattern"));
});

test("buildRemediationPlaybooks surfaces repeated failure and max-match guidance", () => {
  const playbooks = buildRemediationPlaybooks(
    {
      automationState: "active",
      healthStatus: "unhealthy",
      currentMatchCount: 18,
      consecutiveSkipCount: 0,
      consecutiveFailureCount: 3
    },
    [
      {
        skipReason: "Max-match cap applied; 5 incident(s) were skipped this run.",
        failureReason: null
      },
      {
        skipReason: null,
        failureReason: "Provider timeout"
      },
      {
        skipReason: null,
        failureReason: "Provider timeout"
      }
    ]
  );

  assert.ok(playbooks.some((playbook) => playbook.category === "max_match_capped"));
  assert.ok(playbooks.some((playbook) => playbook.category === "repeated_automation_failure"));
  assert.ok(playbooks.some((playbook) => playbook.category === "same_failure_pattern"));
});

test("buildAutomationRerunReadiness blocks muted automation until fix-pending-rerun is set", () => {
  const readiness = buildAutomationRerunReadiness({
    record: {
      automationState: "muted",
      healthStatus: "muted",
      currentMatchCount: 0,
      consecutiveSkipCount: 1,
      consecutiveFailureCount: 0
    },
    acknowledgement: null,
    playbooks: [],
    guidance: []
  });

  assert.equal(readiness.status, "blocked");
  assert.match(readiness.summary, /muted or snoozed/i);
});

test("buildAutomationRerunReadiness distinguishes investigating, fixed pending rerun, and danger playbooks", () => {
  const cautionFromInvestigation = buildAutomationRerunReadiness({
    record: {
      automationState: "active",
      healthStatus: "warning",
      currentMatchCount: 4,
      consecutiveSkipCount: 0,
      consecutiveFailureCount: 0
    },
    acknowledgement: {
      id: "ack-1",
      entityType: "operation_escalation_rule",
      entityId: "rule-1",
      adminUserId: "admin-1",
      adminUserLabel: "Admin One",
      status: "investigating",
      note: null,
      assignedAdminUserId: "admin-2",
      assignedAdminUserLabel: "Admin Two",
      assignedAt: "2026-03-12T11:00:00.000Z",
      remindAt: null,
      reminderState: "none",
      lastRemindedAt: null,
      reminderDismissedAt: null,
      reminderSnoozedUntil: null,
      reminderSnoozeReason: null,
      reminderLastAction: "none",
      rerunOutcome: null,
      lastRerunAt: null,
      verificationState: "not_ready",
      verificationSummary: null,
      verificationStatus: "not_started",
      verificationCompletedAt: null,
      verificationCompletedByAdminUserId: null,
      verificationCompletedByAdminUserLabel: null,
      verificationNotes: null,
      isOverdue: false,
      nextFollowUpAction: null,
      createdAt: "2026-03-12T12:00:00.000Z",
      updatedAt: "2026-03-12T12:00:00.000Z"
    },
    playbooks: [],
    guidance: []
  });

  const readyFromFix = buildAutomationRerunReadiness({
    record: {
      automationState: "active",
      healthStatus: "warning",
      currentMatchCount: 4,
      consecutiveSkipCount: 0,
      consecutiveFailureCount: 0
    },
    acknowledgement: {
      id: "ack-2",
      entityType: "operation_queue_subscription",
      entityId: "subscription-1",
      adminUserId: "admin-1",
      adminUserLabel: "Admin One",
      status: "fixed_pending_rerun",
      note: "Config updated.",
      assignedAdminUserId: "admin-1",
      assignedAdminUserLabel: "Admin One",
      assignedAt: "2026-03-12T11:00:00.000Z",
      remindAt: null,
      reminderState: "none",
      lastRemindedAt: null,
      reminderDismissedAt: null,
      reminderSnoozedUntil: null,
      reminderSnoozeReason: null,
      reminderLastAction: "none",
      rerunOutcome: null,
      lastRerunAt: null,
      verificationState: "not_ready",
      verificationSummary: null,
      verificationStatus: "not_started",
      verificationCompletedAt: null,
      verificationCompletedByAdminUserId: null,
      verificationCompletedByAdminUserLabel: null,
      verificationNotes: null,
      isOverdue: false,
      nextFollowUpAction: null,
      createdAt: "2026-03-12T12:00:00.000Z",
      updatedAt: "2026-03-12T12:00:00.000Z"
    },
    playbooks: [],
    guidance: []
  });

  const cautionFromDanger = buildAutomationRerunReadiness({
    record: {
      automationState: "active",
      healthStatus: "unhealthy",
      currentMatchCount: 4,
      consecutiveSkipCount: 0,
      consecutiveFailureCount: 2
    },
    acknowledgement: {
      id: "ack-3",
      entityType: "operation_escalation_rule",
      entityId: "rule-2",
      adminUserId: "admin-1",
      adminUserLabel: "Admin One",
      status: "acknowledged",
      note: null,
      assignedAdminUserId: "admin-1",
      assignedAdminUserLabel: "Admin One",
      assignedAt: "2026-03-12T11:00:00.000Z",
      remindAt: null,
      reminderState: "none",
      lastRemindedAt: null,
      reminderDismissedAt: null,
      reminderSnoozedUntil: null,
      reminderSnoozeReason: null,
      reminderLastAction: "none",
      rerunOutcome: null,
      lastRerunAt: null,
      verificationState: "not_ready",
      verificationSummary: null,
      verificationStatus: "not_started",
      verificationCompletedAt: null,
      verificationCompletedByAdminUserId: null,
      verificationCompletedByAdminUserLabel: null,
      verificationNotes: null,
      isOverdue: false,
      nextFollowUpAction: null,
      createdAt: "2026-03-12T12:00:00.000Z",
      updatedAt: "2026-03-12T12:00:00.000Z"
    },
    playbooks: [
      {
        category: "repeated_automation_failure",
        title: "Repeated Automation Failures",
        summary: "The automation is failing repeatedly.",
        steps: ["Check provider state."],
        severity: "danger"
      }
    ],
    guidance: []
  });

  assert.equal(cautionFromInvestigation.status, "caution");
  assert.match(cautionFromInvestigation.summary, /investigating/i);
  assert.equal(readyFromFix.status, "ready");
  assert.match(readyFromFix.summary, /fixed pending rerun/i);
  assert.equal(cautionFromDanger.status, "caution");
  assert.match(cautionFromDanger.summary, /high-severity remediation/i);
});

test("buildAutomationRerunReadiness warns when unhealthy automation has no assignee", () => {
  const readiness = buildAutomationRerunReadiness({
    record: {
      automationState: "active",
      healthStatus: "warning",
      currentMatchCount: 2,
      consecutiveSkipCount: 0,
      consecutiveFailureCount: 0
    },
    acknowledgement: {
      id: "ack-4",
      entityType: "operation_escalation_rule",
      entityId: "rule-4",
      adminUserId: "admin-1",
      adminUserLabel: "Admin One",
      status: "acknowledged",
      note: null,
      assignedAdminUserId: null,
      assignedAdminUserLabel: null,
      assignedAt: null,
      remindAt: null,
      reminderState: "none",
      lastRemindedAt: null,
      reminderDismissedAt: null,
      reminderSnoozedUntil: null,
      reminderSnoozeReason: null,
      reminderLastAction: "none",
      rerunOutcome: null,
      lastRerunAt: null,
      verificationState: "not_ready",
      verificationSummary: null,
      verificationStatus: "not_started",
      verificationCompletedAt: null,
      verificationCompletedByAdminUserId: null,
      verificationCompletedByAdminUserLabel: null,
      verificationNotes: null,
      isOverdue: false,
      nextFollowUpAction: null,
      createdAt: "2026-03-12T12:00:00.000Z",
      updatedAt: "2026-03-12T12:00:00.000Z"
    },
    playbooks: [],
    guidance: []
  });

  assert.equal(readiness.status, "caution");
  assert.match(readiness.summary, /assign an operator/i);
});

test("buildPostRerunVerificationGuidance gives explicit next steps for success, skip, and failure", () => {
  const baseAcknowledgement = {
    id: "ack-5",
    entityType: "operation_queue_subscription" as const,
    entityId: "subscription-5",
    adminUserId: "admin-1",
    adminUserLabel: "Admin One",
    status: "fixed_pending_rerun" as const,
    note: "Config updated.",
    assignedAdminUserId: "admin-1",
    assignedAdminUserLabel: "Admin One",
    assignedAt: "2026-03-12T11:00:00.000Z",
      remindAt: null,
      reminderState: "none" as const,
      lastRemindedAt: null,
      reminderDismissedAt: null,
      reminderSnoozedUntil: null,
      reminderSnoozeReason: null,
      reminderLastAction: "none" as const,
      rerunOutcome: null,
      lastRerunAt: null,
      verificationState: "not_ready" as const,
      verificationSummary: null,
      verificationStatus: "not_started" as const,
      verificationCompletedAt: null,
      verificationCompletedByAdminUserId: null,
      verificationCompletedByAdminUserLabel: null,
      verificationNotes: null,
      isOverdue: false,
      nextFollowUpAction: null,
      createdAt: "2026-03-12T12:00:00.000Z",
      updatedAt: "2026-03-12T12:00:00.000Z"
  };

  const successGuidance = buildPostRerunVerificationGuidance({
    acknowledgement: baseAcknowledgement,
    outcome: "success",
    playbooks: [],
    currentMatchCount: 0,
    automationState: "active",
    lastSkipReason: null,
    lastFailureAt: null
  });

  const skippedGuidance = buildPostRerunVerificationGuidance({
    acknowledgement: baseAcknowledgement,
    outcome: "skipped",
    playbooks: [],
    currentMatchCount: 0,
    automationState: "snoozed",
    lastSkipReason: "Cooldown window is still active.",
    lastFailureAt: null
  });

  const failedGuidance = buildPostRerunVerificationGuidance({
    acknowledgement: baseAcknowledgement,
    outcome: "failed",
    playbooks: [
      {
        category: "repeated_automation_failure",
        title: "Repeated Automation Failures",
        summary: "The automation is failing repeatedly.",
        steps: ["Inspect provider state."],
        severity: "danger"
      }
    ],
    currentMatchCount: 3,
    automationState: "active",
    lastSkipReason: null,
    lastFailureAt: "2026-03-12T12:05:00.000Z"
  });

  assert.equal(successGuidance?.tone, "success");
  assert.match(successGuidance?.summary ?? "", /rerun succeeded/i);
  assert.equal(skippedGuidance?.tone, "warning");
  assert.match(skippedGuidance?.summary ?? "", /cooldown window is still active/i);
  assert.equal(failedGuidance?.tone, "warning");
  assert.match(failedGuidance?.summary ?? "", /failing repeatedly/i);
});

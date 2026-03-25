import assert from "node:assert/strict";
import test from "node:test";

import {
  OperationsError,
  BULK_VIEW_CONFIRMATION_THRESHOLD,
  canTransitionAutomationAcknowledgementStatus,
  canTransitionAutomationVerificationStatus,
  canTransitionWorkflowState,
  canCancelJob,
  canIgnoreDelivery,
  canReplayJob,
  canRetryDelivery,
  validateBulkViewExecution
} from "@/features/operations/lib/validation";
import type { AdminDeliveryDetail, AdminScheduledJobDetail } from "@/types/operations";

function createDelivery(
  overrides: Partial<AdminDeliveryDetail> = {}
): AdminDeliveryDetail {
  return {
    id: "delivery-1",
    notificationId: "notification-1",
    userId: "user-1",
    channel: "email",
    templateKey: "session_confirmed",
    status: "failed",
    retryCount: 1,
    maxRetries: 3,
    errorMessage: "Timeout",
    sentAt: null,
    lastAttemptedAt: null,
    createdAt: "2026-03-10T12:00:00.000Z",
    nextAttemptAt: null,
    relatedEntityType: "tutor_session",
    relatedEntityId: "session-1",
    assignedAdminUserId: null,
    assignedAdminUserLabel: null,
    assignedAt: null,
    handoffNote: null,
    workflowState: "open",
    workflowStateUpdatedAt: "2026-03-10T12:00:00.000Z",
    isEscalated: false,
    escalatedAt: null,
    escalatedByAdminUserId: null,
    escalatedByAdminUserLabel: null,
    escalationReason: null,
    watcherCount: 0,
    watchedByTeam: false,
    teamAttention: false,
    needsAttention: false,
    triageIssues: [],
    notificationTitle: "Test",
    notificationMessage: "Test body",
    linkUrl: "/notifications",
    externalMessageId: null,
    notes: [],
    comments: [],
    watchers: [],
    matchingSubscriptions: [],
    auditEvents: [],
    assignmentHistory: [],
    ...overrides
  };
}

function createJob(overrides: Partial<AdminScheduledJobDetail> = {}): AdminScheduledJobDetail {
  return {
    id: "job-1",
    userId: "user-1",
    jobType: "session_reminder_24h",
    relatedEntityType: "tutor_session",
    relatedEntityId: "session-1",
    status: "failed",
    retryCount: 1,
    maxRetries: 3,
    scheduledFor: "2026-03-11T12:00:00.000Z",
    processedAt: null,
    errorMessage: "Timeout",
    lastAttemptedAt: null,
    createdAt: "2026-03-10T12:00:00.000Z",
    payloadPreview: "{}",
    assignedAdminUserId: null,
    assignedAdminUserLabel: null,
    assignedAt: null,
    handoffNote: null,
    workflowState: "open",
    workflowStateUpdatedAt: "2026-03-10T12:00:00.000Z",
    isEscalated: false,
    escalatedAt: null,
    escalatedByAdminUserId: null,
    escalatedByAdminUserLabel: null,
    escalationReason: null,
    watcherCount: 0,
    watchedByTeam: false,
    teamAttention: false,
    needsAttention: false,
    triageIssues: [],
    dedupeKey: "session_reminder_24h:session-1:user-1",
    payload: "{}",
    notes: [],
    comments: [],
    watchers: [],
    matchingSubscriptions: [],
    auditEvents: [],
    assignmentHistory: [],
    ...overrides
  };
}

test("failed and ignored deliveries can be retried while within retry limits", () => {
  assert.doesNotThrow(() => canRetryDelivery(createDelivery({ status: "failed" }), false));
  assert.doesNotThrow(() => canRetryDelivery(createDelivery({ status: "ignored" }), false));
});

test("retrying a delivery after retry exhaustion requires force", () => {
  assert.throws(
    () => canRetryDelivery(createDelivery({ retryCount: 3, maxRetries: 3 }), false),
    OperationsError
  );
  assert.doesNotThrow(() =>
    canRetryDelivery(createDelivery({ retryCount: 3, maxRetries: 3 }), true)
  );
});

test("only pending or failed deliveries can be ignored", () => {
  assert.doesNotThrow(() => canIgnoreDelivery(createDelivery({ status: "pending" })));
  assert.doesNotThrow(() => canIgnoreDelivery(createDelivery({ status: "failed" })));
  assert.throws(() => canIgnoreDelivery(createDelivery({ status: "sent" })), OperationsError);
});

test("only failed jobs can be replayed unless force is used for exhaustion only", () => {
  assert.doesNotThrow(() => canReplayJob(createJob({ status: "failed" }), false));
  assert.throws(() => canReplayJob(createJob({ status: "pending" }), false), OperationsError);
  assert.throws(
    () => canReplayJob(createJob({ status: "failed", retryCount: 3, maxRetries: 3 }), false),
    OperationsError
  );
  assert.doesNotThrow(() =>
    canReplayJob(createJob({ status: "failed", retryCount: 3, maxRetries: 3 }), true)
  );
});

test("only pending jobs can be canceled", () => {
  assert.doesNotThrow(() => canCancelJob(createJob({ status: "pending" })));
  assert.throws(() => canCancelJob(createJob({ status: "processed" })), OperationsError);
});

test("workflow transitions block invalid resolved-to-waiting changes", () => {
  assert.doesNotThrow(() => canTransitionWorkflowState("open", "investigating"));
  assert.throws(
    () => canTransitionWorkflowState("resolved", "waiting"),
    OperationsError
  );
});

test("view-wide execution requires confirmation for larger matched views", () => {
  assert.throws(
    () => validateBulkViewExecution(BULK_VIEW_CONFIRMATION_THRESHOLD + 1, false),
    OperationsError
  );
  assert.doesNotThrow(() =>
    validateBulkViewExecution(BULK_VIEW_CONFIRMATION_THRESHOLD + 1, true)
  );
});

test("automation acknowledgement transitions allow fix workflow but block invalid regressions", () => {
  assert.doesNotThrow(() =>
    canTransitionAutomationAcknowledgementStatus("unacknowledged", "acknowledged")
  );
  assert.doesNotThrow(() =>
    canTransitionAutomationAcknowledgementStatus("investigating", "fixed_pending_rerun")
  );
  assert.throws(
    () => canTransitionAutomationAcknowledgementStatus("resolved", "fixed_pending_rerun"),
    OperationsError
  );
});

test("automation verification transitions allow completion flow but block invalid regressions", () => {
  assert.doesNotThrow(() =>
    canTransitionAutomationVerificationStatus("not_started", "pending")
  );
  assert.doesNotThrow(() =>
    canTransitionAutomationVerificationStatus("pending", "completed")
  );
  assert.doesNotThrow(() =>
    canTransitionAutomationVerificationStatus("failed", "pending")
  );
  assert.throws(
    () => canTransitionAutomationVerificationStatus("not_started", "completed"),
    OperationsError
  );
});

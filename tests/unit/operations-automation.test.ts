import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAutomationHealthUpdate,
  buildDigestFingerprint,
  buildDigestSummary,
  buildMaxMatchCapReason,
  buildOperationMatchExplanation,
  getAutomationControlState,
  getAutomationEligibility,
  getCooldownWindow,
  isAutomationUnhealthy,
  limitMatchesForRun
} from "@/features/operations/lib/automation";
import type { AdminDeliveryRecord } from "@/types/operations";

const delivery: AdminDeliveryRecord = {
  id: "delivery-1",
  notificationId: "notification-1",
  userId: "user-1",
  channel: "email",
  templateKey: "session_confirmed",
  status: "failed",
  retryCount: 2,
  maxRetries: 3,
  errorMessage: "Timeout",
  sentAt: null,
  lastAttemptedAt: null,
  createdAt: "2026-03-12T12:00:00.000Z",
  nextAttemptAt: null,
  relatedEntityType: "tutor_session",
  relatedEntityId: "session-1",
  assignedAdminUserId: null,
  assignedAdminUserLabel: null,
  assignedAt: null,
  handoffNote: null,
  workflowState: "investigating",
  workflowStateUpdatedAt: "2026-03-12T12:00:00.000Z",
  isEscalated: true,
  escalatedAt: "2026-03-12T12:00:00.000Z",
  escalatedByAdminUserId: "admin-1",
  escalatedByAdminUserLabel: "admin@example.com",
  escalationReason: "Needs team review",
  watcherCount: 2,
  watchedByTeam: true,
  teamAttention: true,
  needsAttention: true,
  triageIssues: []
};

test("getCooldownWindow blocks runs until cooldown expires", () => {
  const result = getCooldownWindow("2026-03-12T12:00:00.000Z", 30, new Date("2026-03-12T12:10:00.000Z"));

  assert.equal(result.eligible, false);
  assert.equal(result.nextEligibleAt, "2026-03-12T12:30:00.000Z");
});

test("limitMatchesForRun caps large match sets", () => {
  assert.deepEqual(limitMatchesForRun([1, 2, 3, 4], 2), [1, 2]);
  assert.deepEqual(limitMatchesForRun([1, 2], 10), [1, 2]);
});

test("buildOperationMatchExplanation highlights key filters", () => {
  const explanation = buildOperationMatchExplanation("notification_delivery", {
    status: "failed",
    userId: "",
    channel: "email",
    templateKey: "session_reminder",
    relatedEntityType: "",
    needsAttention: true,
    ownership: "unassigned",
    workflowState: "investigating",
    recentlyHandedOff: false,
    watchedOnly: false,
    escalatedOnly: false,
    sort: "newest"
  });

  assert.match(explanation, /status=failed/);
  assert.match(explanation, /template_key=session_reminder/);
  assert.match(explanation, /workflow_state=investigating/);
  assert.match(explanation, /unassigned/);
});

test("buildDigestFingerprint is stable for identical queue slices", () => {
  const first = buildDigestFingerprint("notification_delivery", [delivery]);
  const second = buildDigestFingerprint("notification_delivery", [delivery]);

  assert.equal(first, second);
});

test("buildDigestSummary includes counts and explanation", () => {
  const summary = buildDigestSummary(
    "notification_delivery",
    "Failed reminders",
    "Matched because status=failed, unassigned.",
    [delivery]
  );

  assert.match(summary, /Failed reminders/);
  assert.match(summary, /1 deliveries matched/);
  assert.match(summary, /Matched because status=failed, unassigned/);
});

test("getAutomationControlState reports muted and snoozed states", () => {
  assert.equal(getAutomationControlState(true, null), "muted");
  assert.equal(
    getAutomationControlState(false, "2026-03-13T12:00:00.000Z", new Date("2026-03-13T11:00:00.000Z")),
    "snoozed"
  );
  assert.equal(getAutomationControlState(false, null), "active");
});

test("getAutomationEligibility blocks muted, snoozed, and cooldown states", () => {
  assert.equal(
    getAutomationEligibility({
      isMuted: true,
      snoozedUntil: null,
      lastRunAt: null,
      cooldownMinutes: 30
    }).skipReason,
    "Muted by operator."
  );

  const snoozed = getAutomationEligibility({
    isMuted: false,
    snoozedUntil: "2026-03-13T12:00:00.000Z",
    lastRunAt: null,
    cooldownMinutes: 30,
    now: new Date("2026-03-13T11:00:00.000Z")
  });
  assert.equal(snoozed.eligible, false);
  assert.match(snoozed.skipReason ?? "", /Snoozed until/);

  const coolingDown = getAutomationEligibility({
    isMuted: false,
    snoozedUntil: null,
    lastRunAt: "2026-03-13T10:50:00.000Z",
    cooldownMinutes: 30,
    now: new Date("2026-03-13T11:00:00.000Z")
  });
  assert.equal(coolingDown.eligible, false);
  assert.equal(coolingDown.skipReason, "Cooldown window is still active.");
});

test("buildAutomationHealthUpdate preserves last success and last failure context", () => {
  const skipped = buildAutomationHealthUpdate(
    {
      consecutiveSkipCount: 1,
      consecutiveFailureCount: 0,
      lastSuccessAt: "2026-03-13T09:00:00.000Z",
      lastFailureAt: "2026-03-12T09:00:00.000Z"
    },
    {
      runStatus: "skipped",
      occurredAt: "2026-03-13T10:00:00.000Z",
      skipReason: "Muted by operator."
    }
  );

  assert.equal(skipped.consecutive_skip_count, 2);
  assert.equal(skipped.last_success_at, "2026-03-13T09:00:00.000Z");
  assert.equal(skipped.last_failure_at, "2026-03-12T09:00:00.000Z");
  assert.equal(skipped.last_skip_reason, "Muted by operator.");

  const failed = buildAutomationHealthUpdate(
    {
      consecutiveSkipCount: 4,
      consecutiveFailureCount: 1,
      lastSuccessAt: "2026-03-13T09:00:00.000Z",
      lastFailureAt: "2026-03-12T09:00:00.000Z"
    },
    {
      runStatus: "failed",
      occurredAt: "2026-03-13T10:00:00.000Z"
    }
  );

  assert.equal(failed.consecutive_skip_count, 0);
  assert.equal(failed.consecutive_failure_count, 2);
  assert.equal(failed.last_success_at, "2026-03-13T09:00:00.000Z");
  assert.equal(failed.last_failure_at, "2026-03-13T10:00:00.000Z");
});

test("buildMaxMatchCapReason and isAutomationUnhealthy flag operational risk", () => {
  assert.equal(
    buildMaxMatchCapReason(10, 4),
    "Max-match cap applied; 6 incident(s) were skipped this run."
  );
  assert.equal(buildMaxMatchCapReason(3, 3), null);
  assert.equal(isAutomationUnhealthy(3, 0), true);
  assert.equal(isAutomationUnhealthy(0, 1), true);
  assert.equal(isAutomationUnhealthy(1, 0), false);
});

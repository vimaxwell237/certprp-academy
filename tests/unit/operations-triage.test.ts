import assert from "node:assert/strict";
import test from "node:test";

import {
  STALE_QUEUE_MINUTES,
  buildDeliveryTriageIssues,
  buildJobTriageIssues,
  hasNeedsAttention,
  isStaleQueueItem
} from "@/features/operations/lib/triage";

test("delivery triage flags retry exhaustion and missing target info", () => {
  const issues = buildDeliveryTriageIssues({
    status: "failed",
    retryCount: 3,
    maxRetries: 3,
    errorMessage: "Permanent failure",
    createdAt: "2026-03-10T12:00:00.000Z",
    nextAttemptAt: null,
    missingTargetInfo: true,
    invalidRelatedEntity: false
  });

  assert.equal(issues.some((issue) => issue.code === "retry_exhausted"), true);
  assert.equal(issues.some((issue) => issue.code === "missing_target"), true);
  assert.equal(hasNeedsAttention(issues), true);
});

test("delivery triage flags stale pending queue items", () => {
  const staleCreatedAt = new Date(
    Date.now() - (STALE_QUEUE_MINUTES + 5) * 60 * 1000
  ).toISOString();
  const issues = buildDeliveryTriageIssues({
    status: "pending",
    retryCount: 0,
    maxRetries: 3,
    errorMessage: null,
    createdAt: staleCreatedAt,
    nextAttemptAt: null,
    missingTargetInfo: false,
    invalidRelatedEntity: false
  });

  assert.equal(issues.some((issue) => issue.code === "stale_pending"), true);
});

test("job triage flags invalid related entities and repeated failures", () => {
  const issues = buildJobTriageIssues({
    status: "failed",
    retryCount: 2,
    maxRetries: 3,
    errorMessage: "Session invalid",
    scheduledFor: "2026-03-10T12:00:00.000Z",
    missingTargetInfo: false,
    invalidRelatedEntity: true
  });

  assert.equal(issues.some((issue) => issue.code === "repeated_failures"), true);
  assert.equal(issues.some((issue) => issue.code === "invalid_related_entity"), true);
});

test("isStaleQueueItem returns false for recent timestamps", () => {
  const recentTimestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  assert.equal(isStaleQueueItem(recentTimestamp), false);
});

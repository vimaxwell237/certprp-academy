import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAutomationTrendWindows,
  buildAutomationTrendSummary,
  buildManualRerunGuidance,
  buildSnoozePresetTimestamp,
  classifyAutomationHealthStatus,
  summarizeAutomationReasons
} from "@/features/operations/lib/health";

test("classifyAutomationHealthStatus distinguishes healthy, warning, unhealthy, muted, and snoozed", () => {
  assert.equal(
    classifyAutomationHealthStatus({
      automationState: "active",
      consecutiveSkipCount: 0,
      consecutiveFailureCount: 0,
      lastSuccessAt: "2026-03-12T12:00:00.000Z",
      lastFailureAt: null,
      lastSkipReason: null
    }),
    "healthy"
  );

  assert.equal(
    classifyAutomationHealthStatus({
      automationState: "active",
      consecutiveSkipCount: 1,
      consecutiveFailureCount: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastSkipReason: "Zero matches."
    }),
    "warning"
  );

  assert.equal(
    classifyAutomationHealthStatus({
      automationState: "active",
      consecutiveSkipCount: 4,
      consecutiveFailureCount: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastSkipReason: "Cooldown window is still active."
    }),
    "unhealthy"
  );

  assert.equal(
    classifyAutomationHealthStatus({
      automationState: "muted",
      consecutiveSkipCount: 0,
      consecutiveFailureCount: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastSkipReason: null
    }),
    "muted"
  );

  assert.equal(
    classifyAutomationHealthStatus({
      automationState: "snoozed",
      consecutiveSkipCount: 0,
      consecutiveFailureCount: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastSkipReason: null
    }),
    "snoozed"
  );
});

test("summarizeAutomationReasons aggregates the most common skip and failure reasons", () => {
  const runs = [
    {
      runStatus: "skipped" as const,
      skipReason: "Cooldown window is still active.",
      failureReason: null,
      createdAt: "2026-03-12T10:00:00.000Z"
    },
    {
      runStatus: "skipped" as const,
      skipReason: "Cooldown window is still active.",
      failureReason: null,
      createdAt: "2026-03-12T11:00:00.000Z"
    },
    {
      runStatus: "failed" as const,
      skipReason: null,
      failureReason: "Repeated provider timeout.",
      createdAt: "2026-03-12T12:00:00.000Z"
    }
  ];

  const skipReasons = summarizeAutomationReasons(runs, "skip", 2);
  const failureReasons = summarizeAutomationReasons(runs, "failure", 2);

  assert.deepEqual(skipReasons, [
    {
      reason: "Cooldown window is still active",
      count: 2,
      kind: "skip"
    }
  ]);
  assert.deepEqual(failureReasons, [
    {
      reason: "Repeated provider timeout",
      count: 1,
      kind: "failure"
    }
  ]);
});

test("buildAutomationTrendSummary reports recent skip and failure patterns", () => {
  assert.equal(
    buildAutomationTrendSummary({
      automationState: "active",
      consecutiveSkipCount: 2,
      consecutiveFailureCount: 1,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastSkipReason: null
    }),
    "1 consecutive failure · 2 consecutive skips"
  );
});

test("buildManualRerunGuidance warns when automation is muted and repeatedly failing", () => {
  const guidance = buildManualRerunGuidance(
    {
      automationState: "muted",
      consecutiveSkipCount: 0,
      consecutiveFailureCount: 3,
      lastSuccessAt: null,
      lastFailureAt: "2026-03-12T12:00:00.000Z",
      lastSkipReason: null
    },
    [
      {
        runStatus: "failed",
        skipReason: null,
        failureReason: "Repeated provider timeout.",
        createdAt: "2026-03-12T12:00:00.000Z"
      }
    ],
    { manualOverride: true }
  );

  assert.ok(guidance.some((item) => item.message.includes("muted")));
  assert.ok(guidance.some((item) => item.message.includes("Consecutive failures are high")));
  assert.ok(guidance.some((item) => item.message.includes("Manual override is enabled")));
});

test("buildAutomationTrendWindows summarizes 24h, 7d, and 30-run windows", () => {
  const trendWindows = buildAutomationTrendWindows(
    [
      {
        runStatus: "success",
        skipReason: null,
        failureReason: null,
        createdAt: "2026-03-12T12:00:00.000Z",
        matchCount: 12
      },
      {
        runStatus: "skipped",
        skipReason: "Cooldown window is still active.",
        failureReason: null,
        createdAt: "2026-03-12T10:00:00.000Z",
        matchCount: 0
      },
      {
        runStatus: "failed",
        skipReason: null,
        failureReason: "Repeated provider timeout.",
        createdAt: "2026-03-10T12:00:00.000Z",
        matchCount: 8
      }
    ],
    new Date("2026-03-12T12:30:00.000Z")
  );

  assert.equal(trendWindows[0]?.key, "24h");
  assert.equal(trendWindows[0]?.totalRuns, 2);
  assert.equal(trendWindows[0]?.successes, 1);
  assert.equal(trendWindows[0]?.skipped, 1);
  assert.equal(trendWindows[0]?.failures, 0);
  assert.equal(trendWindows[1]?.key, "7d");
  assert.equal(trendWindows[1]?.totalRuns, 3);
  assert.equal(trendWindows[2]?.key, "30runs");
  assert.equal(trendWindows[2]?.latestMatchCount, 12);
});

test("buildManualRerunGuidance adds category-specific guidance for cooldown and max-match patterns", () => {
  const guidance = buildManualRerunGuidance(
    {
      automationState: "active",
      consecutiveSkipCount: 2,
      consecutiveFailureCount: 0,
      lastSuccessAt: null,
      lastFailureAt: null,
      lastSkipReason: "Cooldown window is still active."
    },
    [
      {
        runStatus: "skipped",
        skipReason: "Cooldown window is still active.",
        failureReason: null,
        createdAt: "2026-03-12T12:00:00.000Z"
      },
      {
        runStatus: "skipped",
        skipReason: "Max-match cap applied; 5 incident(s) were skipped this run.",
        failureReason: null,
        createdAt: "2026-03-12T11:00:00.000Z"
      }
    ]
  );

  assert.ok(guidance.some((item) => item.message.includes("cooldown")));
  assert.ok(guidance.some((item) => item.message.includes("max-match cap")));
});

test("buildSnoozePresetTimestamp applies supported preset durations", () => {
  assert.equal(
    buildSnoozePresetTimestamp("1h", new Date("2026-03-12T12:00:00.000Z")),
    "2026-03-12T13:00:00.000Z"
  );
  assert.equal(
    buildSnoozePresetTimestamp("3d", new Date("2026-03-12T12:00:00.000Z")),
    "2026-03-15T12:00:00.000Z"
  );
});

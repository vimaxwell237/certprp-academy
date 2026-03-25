import assert from "node:assert/strict";
import test from "node:test";

import {
  assignOperatorHandles,
  extractMentionHandles,
  normalizeDeliverySavedViewFilters,
  normalizeJobSavedViewFilters
} from "@/features/operations/lib/collaboration";

test("assignOperatorHandles generates unique handles from admin labels", () => {
  const operators = assignOperatorHandles([
    { userId: "1", label: "alice@example.com" },
    { userId: "2", label: "alice@other.com" }
  ]);

  assert.equal(operators[0]?.handle, "alice");
  assert.equal(operators[1]?.handle, "alice2");
});

test("extractMentionHandles parses unique mention handles safely", () => {
  const handles = extractMentionHandles(
    "Please review this @alice and @bob. Follow up with @alice tomorrow."
  );

  assert.deepEqual(handles, ["alice", "bob"]);
});

test("normalizeDeliverySavedViewFilters rejects invalid template and workflow values", () => {
  const filters = normalizeDeliverySavedViewFilters({
    templateKey: "not_real",
    workflowState: "unknown",
    ownership: "assigned_to_me",
    needsAttention: true
  });

  assert.equal(filters.templateKey, "all");
  assert.equal(filters.workflowState, "all");
  assert.equal(filters.ownership, "assigned_to_me");
  assert.equal(filters.needsAttention, true);
});

test("normalizeJobSavedViewFilters retains valid saved view filters", () => {
  const filters = normalizeJobSavedViewFilters({
    status: "failed",
    workflowState: "investigating",
    ownership: "unassigned",
    recentlyHandedOff: true,
    watchedOnly: true
  });

  assert.equal(filters.status, "failed");
  assert.equal(filters.workflowState, "investigating");
  assert.equal(filters.ownership, "unassigned");
  assert.equal(filters.recentlyHandedOff, true);
  assert.equal(filters.watchedOnly, true);
});

import test from "node:test";
import assert from "node:assert/strict";

import { buildSupportRequestHref } from "@/features/support/lib/support-link";

test("buildSupportRequestHref returns base support path when no context is provided", () => {
  assert.equal(buildSupportRequestHref({}), "/support/new");
});

test("buildSupportRequestHref includes contextual query params", () => {
  const href = buildSupportRequestHref({
    category: "quiz_help",
    subject: "Need help with subnetting quiz review",
    quizAttemptId: "quiz-attempt-123"
  });

  assert.equal(
    href,
    "/support/new?category=quiz_help&subject=Need+help+with+subnetting+quiz+review&quizAttemptId=quiz-attempt-123"
  );
});

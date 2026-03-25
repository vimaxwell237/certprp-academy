import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeCommand,
  validateCliCommand
} from "@/features/cli/lib/validation";

test("normalizeCommand collapses whitespace and lowercases input", () => {
  assert.equal(normalizeCommand("  SHOW   IP   ROUTE  "), "show ip route");
});

test("validateCliCommand accepts normalized matches", () => {
  const result = validateCliCommand({
    enteredCommand: "  SHOW   IP   INTERFACE   BRIEF ",
    expectedPatterns: ["show ip interface brief"],
    validationType: "normalized",
    explanation: "Interface summary confirmed."
  });

  assert.equal(result.isCorrect, true);
  assert.equal(result.feedback, "Interface summary confirmed.");
});

test("validateCliCommand rejects exact matches with altered spacing", () => {
  const result = validateCliCommand({
    enteredCommand: "username admin  secret Pa55w0rd!",
    expectedPatterns: ["username admin secret Pa55w0rd!"],
    validationType: "exact"
  });

  assert.equal(result.isCorrect, false);
  assert.match(result.feedback, /expects the exact syntax/i);
});

test("validateCliCommand accepts regex pattern matches", () => {
  const result = validateCliCommand({
    enteredCommand: "show run | include hostname",
    expectedPatterns: ["^show run \\| include hostname$"],
    validationType: "pattern"
  });

  assert.equal(result.isCorrect, true);
  assert.match(result.feedback, /correct command/i);
});

import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateBroadcastAddress,
  calculateHostRange,
  calculateNetworkAddress,
  calculateTotalHosts,
  generateRandomSubnet,
  validateSubnetAnswer
} from "@/features/subnetting/lib/subnetting-engine";
import type { GeneratedSubnetProblem } from "@/types/subnetting";

test("standard subnet calculations resolve the expected /26 values", () => {
  assert.equal(calculateNetworkAddress("192.168.10.14", 26), "192.168.10.0");
  assert.equal(calculateBroadcastAddress("192.168.10.14", 26), "192.168.10.63");
  assert.deepEqual(calculateHostRange("192.168.10.14", 26), {
    firstHost: "192.168.10.1",
    lastHost: "192.168.10.62"
  });
  assert.equal(calculateTotalHosts(26), 62);
});

test("validateSubnetAnswer returns a perfect score for correct answers", () => {
  const problem: GeneratedSubnetProblem = {
    type: "standard",
    difficulty: "beginner",
    networkAddress: "192.168.10.0",
    prefixLength: 26,
    prompt: "Solve 192.168.10.0/26",
    questionLabel: "192.168.10.0/26"
  };

  const result = validateSubnetAnswer(problem, {
    subnetMask: "255.255.255.192",
    networkAddress: "192.168.10.0",
    firstUsableHost: "192.168.10.1",
    lastUsableHost: "192.168.10.62",
    broadcastAddress: "192.168.10.63",
    totalUsableHosts: "62"
  });

  assert.equal(result.isCorrect, true);
  assert.equal(result.score, 100);
  assert.equal(
    result.explanation.steps.some((step) => step.includes("64 total addresses")),
    true
  );
});

test("advanced generator creates a VLSM prompt with a host requirement", () => {
  const problem = generateRandomSubnet("advanced");

  assert.equal(problem.type, "vlsm");
  assert.equal(problem.difficulty, "advanced");
  assert.equal(typeof problem.requiredHosts, "number");
  assert.equal(typeof problem.baseNetwork, "string");
  assert.equal(typeof problem.basePrefix, "number");
  assert.equal(problem.prompt.includes("first available subnet"), true);
});

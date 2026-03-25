import test from "node:test";
import assert from "node:assert/strict";

import {
  buildVisualCalculation,
  calculateBlockSize,
  findContainingSubnet,
  parseIPv4CIDR,
  prefixToSubnetMask
} from "@/features/subnetting/lib/subnetting-visual-engine";

test("parseIPv4CIDR normalizes valid IPv4/CIDR input", () => {
  const parsed = parseIPv4CIDR("192.168.010.070 / 26");

  assert.deepEqual(parsed, {
    inputAddress: "192.168.10.70",
    prefixLength: 26,
    normalizedInput: "192.168.10.70/26"
  });
});

test("block size and containing subnet are derived correctly for /26", () => {
  assert.equal(prefixToSubnetMask(26), "255.255.255.192");
  assert.equal(calculateBlockSize(26), 64);
  assert.deepEqual(findContainingSubnet("192.168.10.70", 26), {
    blockSize: 64,
    subnetStartValue: 64,
    subnetEndValue: 127,
    containingSubnetStart: "192.168.10.64",
    containingSubnetEnd: "192.168.10.127"
  });
});

test("buildVisualCalculation returns network, broadcast, and guided steps", () => {
  const result = buildVisualCalculation("192.168.10.70/26");

  assert.equal(result.networkAddress, "192.168.10.64");
  assert.equal(result.broadcastAddress, "192.168.10.127");
  assert.equal(result.firstUsableHost, "192.168.10.65");
  assert.equal(result.lastUsableHost, "192.168.10.126");
  assert.equal(result.usableHosts, 62);
  assert.equal(result.steps.length, 6);
  assert.equal(result.rangeExplanation.includes("64-127"), true);
});

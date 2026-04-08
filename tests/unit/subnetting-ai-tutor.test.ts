import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSubnettingCalculatorTutorRequest,
  buildSubnettingTrainerTutorRequest
} from "@/features/subnetting/lib/subnetting-ai-tutor";
import type {
  GeneratedSubnetProblem,
  SubnetAnswerInput,
  SubnetValidationResult,
  SubnetVisualCalculationResult
} from "@/types/subnetting";

const baseProblem: GeneratedSubnetProblem = {
  difficulty: "intermediate",
  networkAddress: "192.168.10.70",
  prefixLength: 26,
  prompt: "Find the subnet mask, network address, broadcast address, and usable host range.",
  questionLabel: "Subnet 192.168.10.70/26",
  type: "standard"
};

const draftAnswers: SubnetAnswerInput = {
  subnetMask: "255.255.255.192",
  networkAddress: "192.168.10.64",
  firstUsableHost: "",
  lastUsableHost: "",
  broadcastAddress: "",
  totalUsableHosts: ""
};

test("buildSubnettingTrainerTutorRequest includes incorrect-field review context", () => {
  const result: SubnetValidationResult = {
    explanation: {
      headline: "Check the block size",
      hint: "Look at the interesting octet first.",
      overview: "The /26 mask creates blocks of 64.",
      steps: ["Convert /26 into a mask.", "Find the 64-address block."]
    },
    fieldResults: [
      {
        correctValue: "255.255.255.192",
        isCorrect: true,
        key: "subnetMask",
        label: "Subnet Mask",
        submittedValue: "255.255.255.192"
      },
      {
        correctValue: "192.168.10.64",
        isCorrect: false,
        key: "networkAddress",
        label: "Network Address",
        submittedValue: "192.168.10.0"
      }
    ],
    isCorrect: false,
    score: 50,
    solution: {
      broadcastAddress: "192.168.10.127",
      firstUsableHost: "192.168.10.65",
      lastUsableHost: "192.168.10.126",
      networkAddress: "192.168.10.64",
      subnetMask: "255.255.255.192",
      totalAddresses: 64,
      totalUsableHosts: 62
    }
  };

  const request = buildSubnettingTrainerTutorRequest({
    answers: draftAnswers,
    problem: baseProblem,
    result
  });

  assert.equal(request.lessonContext, "Subnetting trainer: Intermediate Direct subnet");
  assert.match(request.question, /Problem type: Direct subnet/);
  assert.match(request.question, /Target subnet: 192\.168\.10\.70\/26/);
  assert.match(request.question, /I missed these fields:/);
  assert.match(
    request.question,
    /Network Address: I entered 192\.168\.10\.0, but the correct value is 192\.168\.10\.64\./
  );
  assert.match(request.question, /Correct solution:/);
});

test("buildSubnettingCalculatorTutorRequest includes solved calculator context", () => {
  const result: SubnetVisualCalculationResult = {
    blockSize: 64,
    broadcastAddress: "192.168.10.127",
    commonMistakes: ["Forgetting that /26 means blocks of 64 in the interesting octet."],
    containingSubnetEnd: "127",
    containingSubnetStart: "64",
    firstUsableHost: "192.168.10.65",
    inputAddress: "192.168.10.70",
    interestingOctetIndex: 4,
    interestingOctetLabel: "4th octet",
    interestingOctetValue: 192,
    ipBinaryOctets: [],
    lastUsableHost: "192.168.10.126",
    maskBinaryOctets: [],
    networkAddress: "192.168.10.64",
    normalizedInput: "192.168.10.70/26",
    prefixLength: 26,
    rangeExplanation: "70 falls between 64 and 127, so it belongs to that subnet block.",
    steps: [],
    subnetBoundaries: [0, 64, 128, 192],
    subnetMask: "255.255.255.192",
    subnetMaskBinary: "11111111.11111111.11111111.11000000",
    summary: "192.168.10.70/26 belongs to the 192.168.10.64 subnet.",
    totalAddresses: 64,
    usableHosts: 62
  };

  const request = buildSubnettingCalculatorTutorRequest({
    inputValue: "192.168.10.70/26",
    mode: "guided",
    result
  });

  assert.equal(
    request.lessonContext,
    "Subnetting visual calculator: 192.168.10.70/26 in guided learning mode"
  );
  assert.match(request.question, /Mode: Guided learning/);
  assert.match(request.question, /Interesting octet: 4th octet \(192\)/);
  assert.match(request.question, /Block size: 64/);
  assert.match(request.question, /Network address: 192\.168\.10\.64/);
  assert.match(
    request.question,
    /Please explain how the interesting octet and block size lead to this result step by step\./
  );
});

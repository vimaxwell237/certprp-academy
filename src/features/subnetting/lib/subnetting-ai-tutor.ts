import type {
  GeneratedSubnetProblem,
  SubnetAnswerInput,
  SubnetAnswerFieldKey,
  SubnetValidationResult,
  SubnetVisualCalculationResult,
  SubnettingCalculatorMode
} from "@/types/subnetting";

const SUBNET_ANSWER_LABELS: Record<SubnetAnswerFieldKey, string> = {
  subnetMask: "Subnet mask",
  networkAddress: "Network address",
  firstUsableHost: "First usable host",
  lastUsableHost: "Last usable host",
  broadcastAddress: "Broadcast address",
  totalUsableHosts: "Total usable hosts"
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatAnswerValue(value: string) {
  return value.trim() || "(blank)";
}

function formatProblemType(problem: GeneratedSubnetProblem) {
  return problem.type === "vlsm" ? "VLSM scenario" : "Direct subnet";
}

function formatDraftAnswers(answers: SubnetAnswerInput) {
  return (Object.entries(SUBNET_ANSWER_LABELS) as Array<[SubnetAnswerFieldKey, string]>)
    .filter(([key]) => answers[key].trim().length > 0)
    .map(([key, label]) => `- ${label}: ${answers[key].trim()}`);
}

function formatSolutionLines(result: SubnetValidationResult) {
  return [
    `- Subnet mask: ${result.solution.subnetMask}`,
    `- Network address: ${result.solution.networkAddress}`,
    `- First usable host: ${result.solution.firstUsableHost}`,
    `- Last usable host: ${result.solution.lastUsableHost}`,
    `- Broadcast address: ${result.solution.broadcastAddress}`,
    `- Total usable hosts: ${result.solution.totalUsableHosts}`
  ];
}

export function buildSubnettingTrainerTutorRequest(input: {
  answers: SubnetAnswerInput;
  problem: GeneratedSubnetProblem;
  result: SubnetValidationResult | null;
}) {
  const { answers, problem, result } = input;
  const questionLines = [
    "Please help me with this subnetting trainer problem.",
    "",
    `Problem type: ${formatProblemType(problem)}`,
    `Difficulty: ${capitalize(problem.difficulty)}`,
    `Prompt: ${problem.prompt}`,
    `Target subnet: ${problem.networkAddress}/${problem.prefixLength}`
  ];

  if (problem.type === "vlsm" && problem.baseNetwork && problem.basePrefix) {
    questionLines.push(
      `Base block: ${problem.baseNetwork}/${problem.basePrefix}`,
      `Required hosts: ${problem.requiredHosts ?? 0}`
    );
  }

  if (result) {
    const incorrectFields = result.fieldResults.filter((field) => !field.isCorrect);

    if (incorrectFields.length > 0) {
      questionLines.push("", "I missed these fields:");

      for (const field of incorrectFields) {
        questionLines.push(
          `- ${field.label}: I entered ${formatAnswerValue(field.submittedValue)}, but the correct value is ${field.correctValue}.`
        );
      }

      questionLines.push(
        "",
        "Correct solution:",
        ...formatSolutionLines(result),
        "",
        "Please explain the solving process step by step and show how to avoid these mistakes."
      );
    } else {
      questionLines.push(
        "",
        "I answered this problem correctly.",
        "Correct solution:",
        ...formatSolutionLines(result),
        "",
        "Please explain why this solution works so I can repeat the process on my own."
      );
    }
  } else {
    const draftAnswers = formatDraftAnswers(answers);

    if (draftAnswers.length > 0) {
      questionLines.push(
        "",
        "My current draft answers:",
        ...draftAnswers,
        "",
        "Please tell me what to check next without skipping the subnetting logic."
      );
    } else {
      questionLines.push("", "Please walk me through how to solve it step by step.");
    }
  }

  return {
    lessonContext: `Subnetting trainer: ${capitalize(problem.difficulty)} ${formatProblemType(problem)}`,
    question: questionLines.join("\n")
  };
}

export function buildSubnettingCalculatorTutorRequest(input: {
  inputValue: string;
  mode: SubnettingCalculatorMode;
  result: SubnetVisualCalculationResult | null;
}) {
  const trimmedInput = input.inputValue.trim();
  const modeLabel = input.mode === "guided" ? "Guided learning" : "Quick calculate";
  const resolvedInput = input.result?.normalizedInput ?? trimmedInput;
  const questionLines = [
    "Please explain this subnetting calculator scenario in simple CCNA terms.",
    "",
    `Mode: ${modeLabel}`,
    `Input: ${resolvedInput || "No IPv4/CIDR input entered yet"}`
  ];

  if (input.result) {
    questionLines.push(
      "",
      `Interesting octet: ${input.result.interestingOctetLabel} (${input.result.interestingOctetValue})`,
      `Block size: ${input.result.blockSize}`,
      `Subnet mask: ${input.result.subnetMask}`,
      `Network address: ${input.result.networkAddress}`,
      `Broadcast address: ${input.result.broadcastAddress}`,
      `First usable host: ${input.result.firstUsableHost}`,
      `Last usable host: ${input.result.lastUsableHost}`,
      `Usable hosts: ${input.result.usableHosts}`,
      "",
      "Please explain how the interesting octet and block size lead to this result step by step."
    );
  } else {
    questionLines.push(
      "",
      "Please show me how to find the interesting octet, block size, subnet range, network address, broadcast address, and usable host range."
    );
  }

  return {
    lessonContext: input.result
      ? `Subnetting visual calculator: ${input.result.normalizedInput} in ${modeLabel.toLowerCase()} mode`
      : `Subnetting visual calculator: ${modeLabel.toLowerCase()}`,
    question: questionLines.join("\n")
  };
}

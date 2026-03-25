import type {
  GeneratedSubnetProblem,
  SubnetAnswerFieldKey,
  SubnetAnswerFieldResult,
  SubnetAnswerInput,
  SubnetExplanation,
  SubnetSolution,
  SubnetValidationResult,
  SubnettingDifficulty
} from "@/types/subnetting";

const FIELD_LABELS: Record<SubnetAnswerFieldKey, string> = {
  subnetMask: "Subnet mask",
  networkAddress: "Network address",
  firstUsableHost: "First usable host",
  lastUsableHost: "Last usable host",
  broadcastAddress: "Broadcast address",
  totalUsableHosts: "Total usable hosts"
};

const PRIVATE_NETWORK_BUILDERS = [
  () => [10, randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)],
  () => [172, randomInt(16, 31), randomInt(0, 255), randomInt(0, 255)],
  () => [192, 168, randomInt(0, 255), randomInt(0, 255)]
] as const;

const ADVANCED_HOST_REQUIREMENTS = [14, 18, 22, 30, 45, 60, 90, 110] as const;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clampPrefix(prefix: number) {
  return Math.max(0, Math.min(32, Math.trunc(prefix)));
}

function prefixToMaskInt(prefixLength: number) {
  const prefix = clampPrefix(prefixLength);

  if (prefix === 0) {
    return 0;
  }

  return (0xffffffff << (32 - prefix)) >>> 0;
}

function ipToInt(address: string) {
  const octets = address.split(".").map((part) => Number(part));

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    throw new Error(`Invalid IPv4 address: ${address}`);
  }

  return (
    (((octets[0] << 24) >>> 0) |
      ((octets[1] << 16) >>> 0) |
      ((octets[2] << 8) >>> 0) |
      (octets[3] >>> 0)) >>>
    0
  );
}

function intToIp(value: number) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  ].join(".");
}

function pickRandomPrivateHostInt() {
  const builder =
    PRIVATE_NETWORK_BUILDERS[randomInt(0, PRIVATE_NETWORK_BUILDERS.length - 1)]!;

  return ipToInt(builder().join("."));
}

function pickPrefixRange(difficulty: SubnettingDifficulty) {
  switch (difficulty) {
    case "beginner":
      return [24, 25, 26, 27, 28, 29, 30];
    case "intermediate":
      return [20, 21, 22, 23, 24, 25, 26, 27, 28];
    case "advanced":
      return [24, 25, 26, 27];
  }
}

function normalizeIpInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return intToIp(ipToInt(trimmed));
}

function normalizeHostCount(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const parsed = Number(trimmed);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("Host count must be a non-negative whole number.");
  }

  return String(parsed);
}

function calculateSubnetMask(prefixLength: number) {
  return intToIp(prefixToMaskInt(prefixLength));
}

function calculateTotalAddresses(prefixLength: number) {
  return 2 ** (32 - clampPrefix(prefixLength));
}

function getUsableHostCountFromTotal(totalAddresses: number, prefixLength: number) {
  if (prefixLength === 31) {
    return 2;
  }

  if (prefixLength === 32) {
    return 1;
  }

  return Math.max(totalAddresses - 2, 0);
}

function getInterestingOctet(prefixLength: number) {
  const prefix = clampPrefix(prefixLength);
  const octetIndex = Math.min(3, Math.floor(prefix / 8));
  const maskOctets = calculateSubnetMask(prefix).split(".").map(Number);
  const interestingMask = maskOctets[octetIndex] ?? 255;
  const blockSize = interestingMask === 255 ? 1 : 256 - interestingMask;

  return {
    octetIndex,
    interestingMask,
    blockSize
  };
}

function buildStandardProblem(
  difficulty: SubnettingDifficulty
): GeneratedSubnetProblem {
  const prefixes = pickPrefixRange(difficulty);
  const prefixLength = prefixes[randomInt(0, prefixes.length - 1)]!;
  const networkInt = pickRandomPrivateHostInt() & prefixToMaskInt(prefixLength);
  const networkAddress = intToIp(networkInt);

  return {
    type: "standard",
    difficulty,
    networkAddress,
    prefixLength,
    questionLabel: `${networkAddress}/${prefixLength}`,
    prompt: `Work out the subnet details for ${networkAddress}/${prefixLength}. Fill in the network address, host range, broadcast address, usable host count, and subnet mask.`,
    startedAtIso: new Date().toISOString()
  };
}

function getSmallestPrefixForHosts(requiredHosts: number) {
  for (let hostBits = 2; hostBits <= 12; hostBits += 1) {
    if (2 ** hostBits - 2 >= requiredHosts) {
      return 32 - hostBits;
    }
  }

  return 20;
}

function buildAdvancedVlsmProblem(): GeneratedSubnetProblem {
  const basePrefix = [24, 23, 22][randomInt(0, 2)]!;
  const baseNetworkInt = pickRandomPrivateHostInt() & prefixToMaskInt(basePrefix);
  const requiredHosts =
    ADVANCED_HOST_REQUIREMENTS[randomInt(0, ADVANCED_HOST_REQUIREMENTS.length - 1)]!;
  const prefixLength = getSmallestPrefixForHosts(requiredHosts);
  const networkAddress = intToIp(baseNetworkInt);

  return {
    type: "vlsm",
    difficulty: "advanced",
    networkAddress,
    prefixLength,
    baseNetwork: intToIp(baseNetworkInt),
    basePrefix,
    requiredHosts,
    questionLabel: `${networkAddress}/${prefixLength}`,
    prompt: `VLSM scenario: inside ${intToIp(baseNetworkInt)}/${basePrefix}, you need the first available subnet that can support ${requiredHosts} hosts. Determine the assigned subnet's network address, first usable host, last usable host, broadcast address, usable host count, and subnet mask.`,
    startedAtIso: new Date().toISOString()
  };
}

export function generateRandomSubnet(
  difficulty: SubnettingDifficulty = "beginner"
): GeneratedSubnetProblem {
  if (difficulty === "advanced") {
    return buildAdvancedVlsmProblem();
  }

  return buildStandardProblem(difficulty);
}

export function calculateNetworkAddress(address: string, prefixLength: number) {
  return intToIp(ipToInt(address) & prefixToMaskInt(prefixLength));
}

export function calculateBroadcastAddress(address: string, prefixLength: number) {
  const network = ipToInt(calculateNetworkAddress(address, prefixLength));
  const inverseMask = (~prefixToMaskInt(prefixLength)) >>> 0;

  return intToIp((network | inverseMask) >>> 0);
}

export function calculateHostRange(address: string, prefixLength: number) {
  const networkInt = ipToInt(calculateNetworkAddress(address, prefixLength));
  const broadcastInt = ipToInt(calculateBroadcastAddress(address, prefixLength));

  if (prefixLength === 31) {
    return {
      firstHost: intToIp(networkInt),
      lastHost: intToIp(broadcastInt)
    };
  }

  if (prefixLength === 32) {
    const host = intToIp(networkInt);

    return {
      firstHost: host,
      lastHost: host
    };
  }

  return {
    firstHost: intToIp((networkInt + 1) >>> 0),
    lastHost: intToIp((broadcastInt - 1) >>> 0)
  };
}

export function calculateTotalHosts(prefixLength: number) {
  const totalAddresses = calculateTotalAddresses(prefixLength);

  return getUsableHostCountFromTotal(totalAddresses, prefixLength);
}

export function solveSubnetProblem(problem: GeneratedSubnetProblem): SubnetSolution {
  const subnetMask = calculateSubnetMask(problem.prefixLength);
  const networkAddress = calculateNetworkAddress(problem.networkAddress, problem.prefixLength);
  const broadcastAddress = calculateBroadcastAddress(
    problem.networkAddress,
    problem.prefixLength
  );
  const hostRange = calculateHostRange(problem.networkAddress, problem.prefixLength);
  const totalAddresses = calculateTotalAddresses(problem.prefixLength);
  const totalUsableHosts = calculateTotalHosts(problem.prefixLength);

  return {
    subnetMask,
    networkAddress,
    firstUsableHost: hostRange.firstHost,
    lastUsableHost: hostRange.lastHost,
    broadcastAddress,
    totalUsableHosts,
    totalAddresses
  };
}

function buildExplanation(
  problem: GeneratedSubnetProblem,
  solution: SubnetSolution
): SubnetExplanation {
  const hostBits = 32 - problem.prefixLength;
  const { octetIndex, blockSize } = getInterestingOctet(problem.prefixLength);
  const octetName = ["first", "second", "third", "fourth"][octetIndex] ?? "fourth";
  const baseSteps = [
    `A /${problem.prefixLength} prefix leaves ${hostBits} host bits, so each subnet has ${solution.totalAddresses} total addresses.`,
    `Usable hosts = ${solution.totalAddresses} - 2 = ${solution.totalUsableHosts}.`,
    `The subnet mask for /${problem.prefixLength} is ${solution.subnetMask}.`,
    `The interesting octet is the ${octetName} octet, so the block size is ${blockSize}.`,
    `This subnet runs from ${solution.networkAddress} to ${solution.broadcastAddress}.`,
    `That means the usable host range is ${solution.firstUsableHost} through ${solution.lastUsableHost}.`
  ];

  if (problem.type === "vlsm" && problem.requiredHosts && problem.baseNetwork && problem.basePrefix) {
    const previousPrefix = Math.min(problem.prefixLength + 1, 30);
    const smallerHostCapacity = calculateTotalHosts(previousPrefix);

    return {
      headline: `Use the host requirement to choose the smallest subnet that fits.`,
      overview: `You needed a subnet for ${problem.requiredHosts} hosts inside ${problem.baseNetwork}/${problem.basePrefix}.`,
      steps: [
        `Start with the host requirement. A /${previousPrefix} subnet only supports ${smallerHostCapacity} usable hosts, so it is too small.`,
        `A /${problem.prefixLength} subnet supports ${solution.totalUsableHosts} usable hosts, so it is the first size that fits.`,
        `Using the first available subnet inside ${problem.baseNetwork}/${problem.basePrefix}, the assigned network is ${solution.networkAddress}/${problem.prefixLength}.`,
        ...baseSteps
      ],
      hint: `Find the smallest subnet where 2^h - 2 is at least ${problem.requiredHosts}, then place that subnet at the start of the base block.`
    };
  }

  return {
    headline: `Break the problem into mask, block size, and address range.`,
    overview: `For ${problem.networkAddress}/${problem.prefixLength}, once you know the block size, the rest of the answers line up quickly.`,
    steps: baseSteps,
    hint: `Remember that /${problem.prefixLength} means ${hostBits} host bits, so each subnet has 2^${hostBits} = ${solution.totalAddresses} total addresses.`
  };
}

function compareField(
  key: SubnetAnswerFieldKey,
  submitted: string,
  correctValue: string
): SubnetAnswerFieldResult {
  return {
    key,
    label: FIELD_LABELS[key],
    isCorrect: submitted === correctValue,
    submittedValue: submitted,
    correctValue
  };
}

export function validateSubnetAnswer(
  problem: GeneratedSubnetProblem,
  answer: SubnetAnswerInput
): SubnetValidationResult {
  const solution = solveSubnetProblem(problem);
  const normalizedNetwork = safeNormalizeIp(answer.networkAddress);
  const normalizedFirst = safeNormalizeIp(answer.firstUsableHost);
  const normalizedLast = safeNormalizeIp(answer.lastUsableHost);
  const normalizedBroadcast = safeNormalizeIp(answer.broadcastAddress);
  const normalizedMask = safeNormalizeIp(answer.subnetMask);
  const normalizedHosts = safeNormalizeCount(answer.totalUsableHosts);

  const fieldResults = [
    compareField("subnetMask", normalizedMask, solution.subnetMask),
    compareField("networkAddress", normalizedNetwork, solution.networkAddress),
    compareField("firstUsableHost", normalizedFirst, solution.firstUsableHost),
    compareField("lastUsableHost", normalizedLast, solution.lastUsableHost),
    compareField("broadcastAddress", normalizedBroadcast, solution.broadcastAddress),
    compareField("totalUsableHosts", normalizedHosts, String(solution.totalUsableHosts))
  ];
  const correctCount = fieldResults.filter((field) => field.isCorrect).length;
  const score = Math.round((correctCount / fieldResults.length) * 100);

  return {
    isCorrect: correctCount === fieldResults.length,
    score,
    fieldResults,
    explanation: buildExplanation(problem, solution),
    solution
  };
}

function safeNormalizeIp(value: string) {
  try {
    return normalizeIpInput(value);
  } catch {
    return value.trim();
  }
}

function safeNormalizeCount(value: string) {
  try {
    return normalizeHostCount(value);
  } catch {
    return value.trim();
  }
}

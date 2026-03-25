export type SubnettingDifficulty = "beginner" | "intermediate" | "advanced";

export type SubnettingProblemType = "standard" | "vlsm";

export type SubnettingCalculatorMode = "quick" | "guided";

export type SubnetAnswerFieldKey =
  | "subnetMask"
  | "networkAddress"
  | "firstUsableHost"
  | "lastUsableHost"
  | "broadcastAddress"
  | "totalUsableHosts";

export interface SubnetAnswerInput {
  subnetMask: string;
  networkAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  broadcastAddress: string;
  totalUsableHosts: string;
}

export interface SubnetSolution {
  subnetMask: string;
  networkAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  broadcastAddress: string;
  totalUsableHosts: number;
  totalAddresses: number;
}

export interface SubnetExplanation {
  headline: string;
  overview: string;
  steps: string[];
  hint: string;
}

export interface GeneratedSubnetProblem {
  type: SubnettingProblemType;
  difficulty: SubnettingDifficulty;
  networkAddress: string;
  prefixLength: number;
  prompt: string;
  questionLabel: string;
  startedAtIso?: string;
  baseNetwork?: string;
  basePrefix?: number;
  requiredHosts?: number;
}

export interface SubnetAnswerFieldResult {
  key: SubnetAnswerFieldKey;
  label: string;
  isCorrect: boolean;
  submittedValue: string;
  correctValue: string;
}

export interface SubnetValidationResult {
  isCorrect: boolean;
  score: number;
  fieldResults: SubnetAnswerFieldResult[];
  explanation: SubnetExplanation;
  solution: SubnetSolution;
}

export interface SubnettingAttemptHistoryItem {
  id: string;
  network: string;
  prefix: number;
  correct: boolean;
  score: number;
  timeTaken: number;
  createdAt: string;
}

export interface SubnettingPracticeStats {
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  accuracyPercentage: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  totalTimeSeconds: number;
  latestAttemptAt: string | null;
}

export interface SubnettingPracticeSnapshot {
  stats: SubnettingPracticeStats;
  history: SubnettingAttemptHistoryItem[];
}

export interface SaveSubnettingAttemptResult {
  snapshot: SubnettingPracticeSnapshot | null;
  persistenceError: string | null;
}

export interface ParsedIpv4Cidr {
  inputAddress: string;
  prefixLength: number;
  normalizedInput: string;
}

export interface BinaryOctetBreakdown {
  decimal: number;
  binary: string;
  networkBits: string;
  hostBits: string;
  index: number;
}

export interface SubnetCalculationStep {
  id:
    | "prefix-to-mask"
    | "interesting-octet"
    | "block-size"
    | "subnet-range"
    | "network-broadcast"
    | "host-range";
  title: string;
  description: string;
}

export interface SubnetVisualCalculationResult {
  inputAddress: string;
  prefixLength: number;
  normalizedInput: string;
  subnetMask: string;
  subnetMaskBinary: string;
  ipBinaryOctets: BinaryOctetBreakdown[];
  maskBinaryOctets: BinaryOctetBreakdown[];
  interestingOctetIndex: number;
  interestingOctetLabel: string;
  interestingOctetValue: number;
  blockSize: number;
  subnetBoundaries: number[];
  containingSubnetStart: string;
  containingSubnetEnd: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  totalAddresses: number;
  usableHosts: number;
  summary: string;
  rangeExplanation: string;
  commonMistakes: string[];
  steps: SubnetCalculationStep[];
}

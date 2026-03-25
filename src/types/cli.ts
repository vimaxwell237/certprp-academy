export type CliDifficulty = "beginner" | "intermediate" | "advanced";

export type CliValidationType = "exact" | "normalized" | "pattern";

export type CliAttemptStatus = "not_started" | "in_progress" | "completed";

export interface CliChallengeListItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: CliDifficulty;
  estimatedMinutes: number;
  moduleTitle: string;
  moduleSlug: string;
  lessonTitle: string | null;
  lessonSlug: string | null;
  stepCount: number;
  status: CliAttemptStatus;
  currentStep: number | null;
}

export interface CliChallengeStep {
  id: string;
  stepNumber: number;
  prompt: string;
  validationType: CliValidationType;
  hint: string | null;
  explanation: string | null;
}

export interface CliChallengeDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  scenario: string;
  objectives: string;
  difficulty: CliDifficulty;
  estimatedMinutes: number;
  moduleTitle: string;
  moduleSlug: string;
  courseTitle: string;
  courseSlug: string;
  lessonTitle: string | null;
  lessonSlug: string | null;
  stepCount: number;
  status: CliAttemptStatus;
  currentStep: number | null;
  steps: CliChallengeStep[];
}

export interface CliAttemptResultEntry {
  id: string;
  cliStepId: string;
  stepNumber: number;
  enteredCommand: string;
  isCorrect: boolean;
  feedback: string;
  answeredAt: string;
}

export interface CliAttemptState {
  attemptId: string;
  challengeId: string;
  challengeSlug: string;
  challengeTitle: string;
  status: CliAttemptStatus;
  currentStep: number;
  totalSteps: number;
  completedAt: string | null;
  latestFeedback: string | null;
  latestCommand: string | null;
  results: CliAttemptResultEntry[];
  steps: CliChallengeStep[];
}

export interface CliCommandSubmissionResult {
  attempt: CliAttemptState;
  commandAccepted: boolean;
  feedback: string;
}

export interface RelatedCliChallengeSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: CliDifficulty;
  estimatedMinutes: number;
  stepCount: number;
  status: CliAttemptStatus;
}

export interface CliActivityItem {
  id: string;
  title: string;
  slug: string;
  status: CliAttemptStatus;
  updatedAt: string;
}

export interface DashboardCliSnapshot {
  totalChallengesAvailable: number;
  challengesStarted: number;
  challengesCompleted: number;
  latestActivity: CliActivityItem | null;
}

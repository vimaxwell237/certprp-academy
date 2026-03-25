export type ExamMode = "full_mock" | "quick_practice" | "random_mixed";

export type ExamAttemptStatus = "in_progress" | "submitted" | "timed_out";

export interface ExamHistoryItem {
  id: string;
  examTitle: string;
  examSlug: string;
  status: ExamAttemptStatus;
  score: number | null;
  correctAnswers: number;
  totalQuestions: number;
  flaggedCount: number;
  completedAt: string | null;
}

export interface ExamConfigListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  examMode: ExamMode;
  timeLimitMinutes: number;
  questionCount: number;
  passingScore: number;
  attemptsTaken: number;
  latestScore: number | null;
  bestScore: number | null;
  lastAttemptAt: string | null;
}

export interface ExamConfigDetail extends ExamConfigListItem {
  recentAttempts: ExamHistoryItem[];
}

export interface ExamAttemptQuestionOption {
  id: string;
  optionText: string;
  orderIndex: number;
}

export interface ExamAttemptQuestion {
  id: string;
  questionId: string;
  orderIndex: number;
  moduleTitle: string | null;
  moduleSlug: string | null;
  questionText: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  questionType: "single_choice";
  selectedOptionId: string | null;
  flagged: boolean;
  options: ExamAttemptQuestionOption[];
}

export interface ExamAttemptState {
  attemptId: string;
  examId: string;
  examTitle: string;
  examSlug: string;
  status: ExamAttemptStatus;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  durationSeconds: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredCount: number;
  flaggedCount: number;
  remainingSeconds: number;
  questions: ExamAttemptQuestion[];
}

export interface ExamResultReviewOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  isSelected: boolean;
}

export interface ExamResultReviewQuestion {
  id: string;
  questionId: string;
  questionText: string;
  explanation: string;
  moduleTitle: string | null;
  moduleSlug: string | null;
  difficulty: "easy" | "medium" | "hard";
  flagged: boolean;
  isCorrect: boolean;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  options: ExamResultReviewOption[];
}

export interface ExamDomainPerformance {
  moduleTitle: string;
  moduleSlug: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
}

export interface ExamAttemptResult {
  attemptId: string;
  examTitle: string;
  examSlug: string;
  description: string;
  status: ExamAttemptStatus;
  score: number | null;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredCount: number;
  flaggedCount: number;
  timeUsedSeconds: number;
  startedAt: string;
  completedAt: string | null;
  domainBreakdown: ExamDomainPerformance[];
  review: ExamResultReviewQuestion[];
}

export interface DashboardExamSnapshot {
  attemptsTaken: number;
  averageScore: number | null;
  latestScore: number | null;
  bestScore: number | null;
  lastAttemptAt: string | null;
  recentAttempts: ExamHistoryItem[];
}

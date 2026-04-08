export interface QuizListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  questionCount: number;
  courseTitle: string;
  courseSlug: string;
  moduleTitle: string | null;
  moduleSlug: string | null;
  lessonTitle: string | null;
  lessonSlug: string | null;
  attemptsTaken: number;
  latestScore: number | null;
  averageScore: number | null;
}

export interface QuizDetailQuestionOption {
  id: string;
  optionText: string;
  orderIndex: number;
}

export interface QuizDetailQuestion {
  id: string;
  questionText: string;
  orderIndex: number;
  questionType: "single_choice";
  difficulty: "easy" | "medium" | "hard";
  questionImageUrl: string | null;
  questionImageAlt: string;
  questionImageSecondaryUrl: string | null;
  questionImageSecondaryAlt: string;
  options: QuizDetailQuestionOption[];
}

export interface QuizDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  questionCount: number;
  courseTitle: string;
  courseSlug: string;
  moduleTitle: string | null;
  moduleSlug: string | null;
  lessonTitle: string | null;
  lessonSlug: string | null;
  attemptsTaken: number;
  latestScore: number | null;
  questions: QuizDetailQuestion[];
}

export interface QuizAttemptHistoryItem {
  id: string;
  quizTitle: string;
  quizSlug: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string | null;
}

export interface QuizResultReviewOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  isSelected: boolean;
}

export interface QuizResultReviewQuestion {
  id: string;
  questionText: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  questionImageUrl: string | null;
  questionImageAlt: string;
  questionImageSecondaryUrl: string | null;
  questionImageSecondaryAlt: string;
  isCorrect: boolean;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  options: QuizResultReviewOption[];
}

export interface QuizAttemptResult {
  attemptId: string;
  quizTitle: string;
  quizSlug: string;
  description: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completedAt: string | null;
  courseTitle: string;
  courseSlug: string;
  moduleTitle: string | null;
  moduleSlug: string | null;
  review: QuizResultReviewQuestion[];
}

export interface RelatedQuizSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  questionCount: number;
  attemptsTaken: number;
  latestScore: number | null;
}

export interface DashboardQuizSnapshot {
  attemptsTaken: number;
  averageScore: number | null;
  latestResult: QuizAttemptHistoryItem | null;
  weakPerformance: {
    quizTitle: string;
    score: number;
    label: string;
  } | null;
}

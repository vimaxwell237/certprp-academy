import type { PlanInterval } from "@/types/billing";
import type { DragDropInteractionConfig, QuestionType } from "@/types/questions";

export interface AdminSelectOption {
  value: string;
  label: string;
  hint?: string | null;
  state?: "published" | "draft" | "active" | "inactive";
}

export interface AdminActionState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Record<string, string>;
  savedRecordId: string | null;
}

export interface AdminDashboardMetric {
  total: number;
  published?: number;
  draft?: number;
  active?: number;
  inactive?: number;
}

export interface AdminDashboardStats {
  certifications: AdminDashboardMetric;
  courses: AdminDashboardMetric;
  lessons: AdminDashboardMetric;
  quizzes: AdminDashboardMetric;
  labs: AdminDashboardMetric;
  cliChallenges: AdminDashboardMetric;
  tutors: AdminDashboardMetric;
  plans: AdminDashboardMetric;
}

export interface AdminDashboardSnapshot {
  stats: AdminDashboardStats;
  warning: string | null;
}

export interface AdminCertificationRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  isPublished: boolean;
  courseCount: number;
  createdAt: string;
}

export interface AdminCourseRecord {
  id: string;
  certificationId: string;
  certificationName: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  isPublished: boolean;
  moduleCount: number;
  lessonCount: number;
  createdAt: string;
}

export interface AdminModuleRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
  lessonCount: number;
  createdAt: string;
}

export interface AdminLessonRecord {
  id: string;
  moduleId: string;
  moduleTitle: string;
  courseTitle: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  estimatedMinutes: number;
  videoUrl: string | null;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
}

export interface AdminQuizRecord {
  id: string;
  moduleId: string | null;
  lessonId: string | null;
  title: string;
  slug: string;
  description: string;
  isPublished: boolean;
  questionCount: number;
  quizVisibleQuestionCount: number;
  contextLabel: string;
  createdAt: string;
}

export type AdminQuizQuestionDifficulty = "easy" | "medium" | "hard";
export type AdminQuizQuestionType = QuestionType;

export interface AdminQuizQuestionOptionRecord {
  id: string;
  optionText: string;
  isCorrect: boolean;
  matchKey: string | null;
  orderIndex: number;
}

export interface AdminQuizQuestionRecord {
  id: string;
  quizId: string;
  questionText: string;
  explanation: string;
  difficulty: AdminQuizQuestionDifficulty;
  orderIndex: number;
  questionType: AdminQuizQuestionType;
  showInQuiz: boolean;
  interactionConfig: DragDropInteractionConfig | null;
  questionImagePath: string | null;
  questionImageAlt: string;
  questionImageUrl: string | null;
  questionImageSecondaryPath: string | null;
  questionImageSecondaryAlt: string;
  questionImageSecondaryUrl: string | null;
  options: AdminQuizQuestionOptionRecord[];
  createdAt: string;
}

export interface AdminQuizQuestionBankRecord {
  quiz: AdminQuizRecord;
  questions: AdminQuizQuestionRecord[];
}

export type AdminDifficulty = "beginner" | "intermediate" | "advanced";

export interface AdminLabRecord {
  id: string;
  moduleId: string;
  lessonId: string | null;
  title: string;
  slug: string;
  summary: string;
  instructions: string;
  difficulty: AdminDifficulty;
  estimatedMinutes: number;
  isPublished: boolean;
  contextLabel: string;
  createdAt: string;
}

export interface AdminCliChallengeRecord {
  id: string;
  moduleId: string;
  lessonId: string | null;
  title: string;
  slug: string;
  summary: string;
  scenario: string;
  objectives: string;
  difficulty: AdminDifficulty;
  estimatedMinutes: number;
  isPublished: boolean;
  contextLabel: string;
  stepCount: number;
  createdAt: string;
}

export interface AdminTutorRecord {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  expertise: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AdminPlanRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceAmount: number;
  priceCurrency: string;
  billingInterval: PlanInterval;
  isActive: boolean;
  createdAt: string;
}

export interface CertificationMutationInput {
  id?: string;
  name: string;
  slug: string;
  description: string;
  isPublished: boolean;
}

export interface CourseMutationInput {
  id?: string;
  certificationId: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  isPublished: boolean;
}

export interface ModuleMutationInput {
  id?: string;
  courseId: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
}

export interface LessonMutationInput {
  id?: string;
  moduleId: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  estimatedMinutes: number;
  videoUrl: string | null;
  orderIndex: number;
  isPublished: boolean;
}

export interface QuizMutationInput {
  id?: string;
  moduleId: string | null;
  lessonId: string | null;
  title: string;
  slug: string;
  description: string;
  isPublished: boolean;
}

export interface QuizQuestionMutationInput {
  id?: string;
  quizId: string;
  questionText: string;
  explanation: string;
  difficulty: AdminQuizQuestionDifficulty;
  orderIndex: number;
  questionType: AdminQuizQuestionType;
  showInQuiz: boolean;
  interactionConfig: DragDropInteractionConfig | null;
  questionImageAlt: string;
  questionImageFile?: File | null;
  removeQuestionImage?: boolean;
  questionImageSecondaryAlt: string;
  questionImageSecondaryFile?: File | null;
  removeQuestionImageSecondary?: boolean;
  options: Array<{
    optionText: string;
    isCorrect: boolean;
    matchKey: string | null;
    orderIndex: number;
  }>;
}

export interface LabMutationInput {
  id?: string;
  moduleId: string;
  lessonId: string | null;
  title: string;
  slug: string;
  summary: string;
  instructions: string;
  difficulty: AdminDifficulty;
  estimatedMinutes: number;
  isPublished: boolean;
}

export interface CliChallengeMutationInput {
  id?: string;
  moduleId: string;
  lessonId: string | null;
  title: string;
  slug: string;
  summary: string;
  scenario: string;
  objectives: string;
  difficulty: AdminDifficulty;
  estimatedMinutes: number;
  isPublished: boolean;
}

export interface TutorMutationInput {
  id?: string;
  userId: string;
  displayName: string;
  bio: string;
  expertise: string[];
  isActive: boolean;
}

export interface PlanMutationInput {
  id?: string;
  name: string;
  slug: string;
  description: string;
  priceAmount: number;
  billingInterval: PlanInterval;
  isActive: boolean;
}

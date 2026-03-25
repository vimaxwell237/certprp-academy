export type StudyPlanStatus = "active" | "completed" | "archived";

export type StudyPlanItemType =
  | "lesson_review"
  | "quiz_retry"
  | "exam_follow_up"
  | "lab_completion"
  | "cli_completion"
  | "support_follow_up"
  | "next_action";

export type RecommendationType =
  | "low_quiz_average"
  | "weak_exam_domain"
  | "unfinished_lab"
  | "unfinished_cli"
  | "support_revision"
  | "low_activity"
  | "next_action";

export type RecommendationSeverity = "low" | "medium" | "high";

export interface GuidanceLink {
  label: string;
  href: string;
}

export interface RecommendationItem {
  id: string;
  recommendationType: RecommendationType;
  severity: RecommendationSeverity;
  title: string;
  description: string;
  rationale: string;
  createdAt: string;
  isDismissed: boolean;
  link: GuidanceLink | null;
}

export interface RecommendationsPageData {
  recommendations: RecommendationItem[];
  generatedAt: string | null;
  hasActivity: boolean;
}

export interface StudyPlanItem {
  id: string;
  itemType: StudyPlanItemType;
  title: string;
  description: string;
  actionLabel: string;
  orderIndex: number;
  isCompleted: boolean;
  completedAt: string | null;
  link: GuidanceLink | null;
}

export interface ActiveStudyPlan {
  id: string;
  title: string;
  description: string;
  status: StudyPlanStatus;
  createdAt: string;
  updatedAt: string;
  items: StudyPlanItem[];
  completedItems: number;
  totalItems: number;
  progressPercentage: number;
  nextPendingItem: StudyPlanItem | null;
}

export interface GuidanceWeakArea {
  title: string;
  summary: string;
}

export interface DashboardGuidanceSnapshot {
  weakAreaSummary: GuidanceWeakArea | null;
  topRecommendation: RecommendationItem | null;
  activeStudyPlan: {
    title: string;
    progressPercentage: number;
    completedItems: number;
    totalItems: number;
  } | null;
  nextRecommendedAction: GuidanceLink | null;
}

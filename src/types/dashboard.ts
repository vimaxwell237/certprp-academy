export interface DashboardCardData {
  title: string;
  description: string;
  detail: string;
}

export interface DashboardLearningMetrics {
  courseTitle: string;
  courseSlug: string;
  certificationName: string;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

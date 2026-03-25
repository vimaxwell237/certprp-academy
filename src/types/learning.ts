export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  certificationName: string;
  certificationSlug: string;
  moduleCount: number;
  lessonCount: number;
  completedLessons: number;
  progressPercentage: number;
}

export interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  summary: string;
  orderIndex: number;
  estimatedMinutes: number;
  videoUrl: string | null;
  completed: boolean;
}

export interface ModuleSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
  lessons: LessonSummary[];
  lessonCount: number;
  completedLessons: number;
  progressPercentage: number;
  estimatedMinutesTotal: number;
  nextLesson: LessonNavLink | null;
}

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  certificationName: string;
  certificationSlug: string;
  modules: ModuleSummary[];
  moduleCount: number;
  lessonCount: number;
  completedLessons: number;
  progressPercentage: number;
  estimatedMinutesTotal: number;
  continueLesson: LessonNavLink | null;
}

export interface LessonNavLink {
  title: string;
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  summary?: string;
  estimatedMinutes?: number;
}

export interface LessonDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  estimatedMinutes: number;
  videoUrl: string | null;
  completed: boolean;
  course: {
    title: string;
    slug: string;
  };
  module: {
    title: string;
    slug: string;
  };
  currentLessonNumber: number;
  moduleLessonCount: number;
  previousLesson: LessonNavLink | null;
  nextLesson: LessonNavLink | null;
}

export interface DashboardLearningSnapshot {
  courseTitle: string;
  courseSlug: string;
  certificationName: string;
  totalModules: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  estimatedMinutesTotal: number;
  continueLesson: LessonNavLink | null;
}

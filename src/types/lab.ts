export type LabStatus = "not_started" | "in_progress" | "completed";

export interface LabFileSummary {
  id: string;
  fileName: string;
  filePath: string;
  fileType: "packet_tracer" | "guide" | "topology" | "solution" | "reference";
  sortOrder: number;
  downloadUrl: string | null;
  isAvailable: boolean;
}

export interface LabListItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  moduleTitle: string;
  moduleSlug: string;
  lessonTitle: string | null;
  lessonSlug: string | null;
  status: LabStatus;
  fileCount: number;
}

export interface LabDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  objectives: string;
  instructions: string;
  topologyNotes: string | null;
  expectedOutcomes: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  moduleTitle: string;
  moduleSlug: string;
  courseTitle: string;
  courseSlug: string;
  lessonTitle: string | null;
  lessonSlug: string | null;
  status: LabStatus;
  completedAt: string | null;
  files: LabFileSummary[];
}

export interface RelatedLabSummary {
  id: string;
  title: string;
  slug: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  status: LabStatus;
  fileCount: number;
}

export interface LabActivityItem {
  id: string;
  title: string;
  slug: string;
  status: LabStatus;
  updatedAt: string;
}

export interface DashboardLabSnapshot {
  totalLabsAvailable: number;
  labsStarted: number;
  labsCompleted: number;
  latestActivity: LabActivityItem | null;
}

export interface LabFilterOptions {
  modules: Array<{
    slug: string;
    title: string;
  }>;
  difficulties: Array<LabListItem["difficulty"]>;
}

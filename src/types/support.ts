export type SupportCategory =
  | "general"
  | "lesson_clarification"
  | "quiz_help"
  | "exam_help"
  | "lab_help"
  | "cli_help";

export type SupportStatus = "open" | "in_progress" | "resolved" | "closed";

export type SupportPriority = "low" | "medium" | "high";

export type SupportViewerRole = "learner" | "tutor";

export interface TutorProfileSummary {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  expertise: string[];
  isActive: boolean;
}

export interface SupportContextSummary {
  type: "lesson" | "quiz_attempt" | "exam_attempt" | "lab" | "cli_challenge";
  label: string;
  href: string | null;
}

export interface SupportRequestListItem {
  id: string;
  subject: string;
  category: SupportCategory;
  status: SupportStatus;
  priority: SupportPriority;
  createdAt: string;
  updatedAt: string;
  tutorDisplayName: string | null;
  messageCount: number;
  lastMessagePreview: string | null;
  contexts: SupportContextSummary[];
}

export interface SupportMessageItem {
  id: string;
  senderUserId: string;
  senderLabel: string;
  senderRole: SupportViewerRole | "self";
  messageBody: string;
  createdAt: string;
}

export interface SupportRequestDetail {
  id: string;
  subject: string;
  category: SupportCategory;
  status: SupportStatus;
  priority: SupportPriority;
  createdAt: string;
  updatedAt: string;
  learnerUserId: string;
  tutorProfileId: string | null;
  tutorDisplayName: string | null;
  tutorUserId: string | null;
  viewerRole: SupportViewerRole;
  canReply: boolean;
  canUpdateStatus: boolean;
  contexts: SupportContextSummary[];
  messages: SupportMessageItem[];
}

export interface SupportCreateFormData {
  tutors: TutorProfileSummary[];
  contextPreview: SupportContextSummary[];
  invalidContextReasons: string[];
  initialValues: {
    subject: string;
    category: SupportCategory;
    priority: SupportPriority;
    tutorProfileId: string;
    lessonId: string;
    quizAttemptId: string;
    examAttemptId: string;
    labId: string;
    cliChallengeId: string;
    messageBody: string;
  };
}

export interface SupportOverviewData {
  learnerRequests: SupportRequestListItem[];
  tutorRequests: SupportRequestListItem[];
  tutorProfile: TutorProfileSummary | null;
}

export interface DashboardSupportSnapshot {
  openRequests: number;
  resolvedRequests: number;
  latestActivity: {
    id: string;
    subject: string;
    status: SupportStatus;
    updatedAt: string;
  } | null;
  tutorProfile: Pick<TutorProfileSummary, "id" | "displayName"> | null;
  tutorMetrics: {
    assignedOpenRequests: number;
    resolvedRequests: number;
    unassignedOpenRequests: number;
  } | null;
}

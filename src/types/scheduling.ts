import type { SupportCategory, TutorProfileSummary } from "@/types/support";
import type { SessionReminderState } from "@/types/delivery";

export type TutorSessionStatus =
  | "requested"
  | "confirmed"
  | "completed"
  | "canceled";

export interface TutorSessionFollowup {
  id: string;
  tutorSessionId: string;
  tutorProfileId: string;
  learnerUserId: string;
  summary: string;
  recommendations: string | null;
  homework: string | null;
  nextSteps: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TutorAvailabilitySlotItem {
  id: string;
  tutorProfileId: string;
  tutorDisplayName: string;
  tutorExpertise: string[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isBooked: boolean;
  bookedSessionId: string | null;
  bookedSessionStatus: TutorSessionStatus | null;
}

export interface TutorScheduleOverview {
  tutorProfile: TutorProfileSummary;
  slots: TutorAvailabilitySlotItem[];
  upcomingBookedCount: number;
}

export interface TutorSessionListItem {
  id: string;
  tutorProfileId: string;
  tutorDisplayName: string;
  learnerUserId: string;
  availabilitySlotId: string | null;
  supportRequestId: string | null;
  subject: string;
  category: SupportCategory;
  status: TutorSessionStatus;
  meetingLink: string | null;
  notes: string | null;
  scheduledStartsAt: string;
  scheduledEndsAt: string;
  createdAt: string;
  updatedAt: string;
  followup: TutorSessionFollowup | null;
  reminderState: SessionReminderState | null;
}

export interface LearnerSessionsOverview {
  upcomingSessions: TutorSessionListItem[];
  pastSessions: TutorSessionListItem[];
}

export interface TutorSessionsOverview {
  pendingSessions: TutorSessionListItem[];
  upcomingSessions: TutorSessionListItem[];
  completedSessions: TutorSessionListItem[];
  canceledSessions: TutorSessionListItem[];
}

export interface BookingSupportContext {
  requestId: string;
  subject: string;
  category: SupportCategory;
  tutorProfileId: string | null;
}

export interface TutorBookingFormData {
  tutors: TutorProfileSummary[];
  selectedTutorProfileId: string;
  availableSlots: TutorAvailabilitySlotItem[];
  supportContext: BookingSupportContext | null;
  initialValues: {
    subject: string;
    category: SupportCategory;
    notes: string;
    availabilitySlotId: string;
    supportRequestId: string;
  };
}

export interface DashboardSchedulingSnapshot {
  upcomingSessions: number;
  pastSessions: number;
  nextSession: {
    id: string;
    subject: string;
    status: TutorSessionStatus;
    scheduledStartsAt: string;
    tutorDisplayName: string;
    meetingLink: string | null;
  } | null;
  latestFollowup: {
    sessionId: string;
    subject: string;
    summary: string;
    createdAt: string;
  } | null;
  tutorMetrics: {
    upcomingBookedSessions: number;
    pendingRequests: number;
    completedSessions: number;
    todaySessions: number;
    sessionsNeedingFollowup: number;
    overdueFollowups: number;
    recentBookingActivity: number;
  } | null;
}

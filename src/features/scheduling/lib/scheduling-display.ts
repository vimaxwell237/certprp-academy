import type { SupportCategory } from "@/types/support";
import type { TutorSessionStatus } from "@/types/scheduling";

export const TUTOR_SESSION_STATUS_OPTIONS: Array<{
  value: TutorSessionStatus;
  label: string;
}> = [
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" }
];

export const BOOKING_CATEGORY_OPTIONS: Array<{
  value: SupportCategory;
  label: string;
}> = [
  { value: "general", label: "General Support" },
  { value: "lesson_clarification", label: "Lesson Clarification" },
  { value: "quiz_help", label: "Quiz Help" },
  { value: "exam_help", label: "Exam Help" },
  { value: "lab_help", label: "Lab Help" },
  { value: "cli_help", label: "CLI Help" }
];

export function getTutorSessionStatusLabel(status: TutorSessionStatus) {
  return (
    TUTOR_SESSION_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    "Requested"
  );
}

export function getBookingCategoryLabel(category: SupportCategory) {
  return (
    BOOKING_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ??
    "General Support"
  );
}

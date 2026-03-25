import type { SupportCategory, SupportPriority, SupportStatus } from "@/types/support";

export const SUPPORT_CATEGORY_OPTIONS: Array<{
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

export const SUPPORT_PRIORITY_OPTIONS: Array<{
  value: SupportPriority;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

export const SUPPORT_STATUS_OPTIONS: Array<{
  value: SupportStatus;
  label: string;
}> = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" }
];

export function getSupportCategoryLabel(category: SupportCategory) {
  return (
    SUPPORT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? "Support"
  );
}

export function getSupportPriorityLabel(priority: SupportPriority) {
  return (
    SUPPORT_PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? "Medium"
  );
}

export function getSupportStatusLabel(status: SupportStatus) {
  return SUPPORT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "Open";
}

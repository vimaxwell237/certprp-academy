import type { SupportCategory } from "@/types/support";
import type { TutorSessionStatus } from "@/types/scheduling";

const SUPPORT_CATEGORIES: SupportCategory[] = [
  "general",
  "lesson_clarification",
  "quiz_help",
  "exam_help",
  "lab_help",
  "cli_help"
];

const SESSION_STATUSES: TutorSessionStatus[] = [
  "requested",
  "confirmed",
  "completed",
  "canceled"
];

export class SchedulingValidationError extends Error {}

export function readRequiredText(
  formData: FormData,
  field: string,
  label: string
) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    throw new SchedulingValidationError(`${label} is required.`);
  }

  return value;
}

export function readOptionalText(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim();

  return value.length > 0 ? value : null;
}

export function readBookingCategory(formData: FormData, field = "category"): SupportCategory {
  const value = String(formData.get(field) ?? "general") as SupportCategory;

  if (!SUPPORT_CATEGORIES.includes(value)) {
    throw new SchedulingValidationError("Select a valid booking category.");
  }

  return value;
}

export function readSessionStatus(formData: FormData, field = "status"): TutorSessionStatus {
  const value = String(formData.get(field) ?? "requested") as TutorSessionStatus;

  if (!SESSION_STATUSES.includes(value)) {
    throw new SchedulingValidationError("Select a valid session status.");
  }

  return value;
}

export function readUtcIsoDate(formData: FormData, field: string, label: string) {
  const value = String(formData.get(field) ?? "").trim();

  if (!value) {
    throw new SchedulingValidationError(`${label} is required.`);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new SchedulingValidationError(`${label} must be a valid date and time.`);
  }

  return parsed.toISOString();
}

export function normalizeMeetingLink(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new SchedulingValidationError("Meeting links must use http or https.");
    }

    return url.toString();
  } catch {
    throw new SchedulingValidationError("Meeting link must be a valid URL.");
  }
}

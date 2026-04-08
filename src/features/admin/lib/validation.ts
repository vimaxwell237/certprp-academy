import type { AdminActionState } from "@/types/admin";
import type { PlanInterval } from "@/types/billing";
import type { QuestionType } from "@/types/questions";

export class AdminFormError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "AdminFormError";
    this.fieldErrors = fieldErrors;
  }
}

export const INITIAL_ADMIN_ACTION_STATE: AdminActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  savedRecordId: null
};

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function readRequiredText(formData: FormData, name: string, label: string) {
  const value = normalizeText(formData.get(name));

  if (!value) {
    throw new AdminFormError(`${label} is required.`, { [name]: `${label} is required.` });
  }

  return value;
}

export function readOptionalText(formData: FormData, name: string) {
  const value = normalizeText(formData.get(name));

  return value || "";
}

export function readOptionalFile(formData: FormData, name: string) {
  const value = formData.get(name);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

export function readOptionalUrl(formData: FormData, name: string) {
  const value = normalizeText(formData.get(name));

  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);

    return parsed.toString();
  } catch {
    throw new AdminFormError("Video URL must be a valid absolute URL.", {
      [name]: "Enter a valid URL."
    });
  }
}

export function readRequiredId(formData: FormData, name: string, label: string) {
  const value = normalizeText(formData.get(name));

  if (!value) {
    throw new AdminFormError(`${label} is required.`, { [name]: `Select a ${label.toLowerCase()}.` });
  }

  return value;
}

export function readOptionalId(formData: FormData, name: string) {
  return normalizeText(formData.get(name)) || null;
}

export function readBoolean(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return !["0", "false", "off", "no"].includes(normalized);
}

export function readPositiveInteger(formData: FormData, name: string, label: string) {
  const rawValue = normalizeText(formData.get(name));
  const value = Number(rawValue);

  if (!rawValue || !Number.isInteger(value) || value <= 0) {
    throw new AdminFormError(`${label} must be a positive whole number.`, {
      [name]: `${label} must be a positive whole number.`
    });
  }

  return value;
}

export function readNonNegativeInteger(formData: FormData, name: string, label: string) {
  const rawValue = normalizeText(formData.get(name));
  const value = Number(rawValue);

  if (rawValue === "" || !Number.isInteger(value) || value < 0) {
    throw new AdminFormError(`${label} must be zero or greater.`, {
      [name]: `${label} must be zero or greater.`
    });
  }

  return value;
}

export function readRecordId(formData: FormData) {
  const recordId = normalizeText(formData.get("recordId"));

  return recordId || undefined;
}

export function readSlug(formData: FormData, name = "slug") {
  const slug = readRequiredText(formData, name, "Slug").toLowerCase();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new AdminFormError("Slug format is invalid.", {
      [name]: "Use lowercase letters, numbers, and hyphens only."
    });
  }

  return slug;
}

export function readExpertiseList(formData: FormData, name: string) {
  const value = readOptionalText(formData, name);

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function readPlanInterval(formData: FormData, name = "billingInterval"): PlanInterval {
  const value = readRequiredText(formData, name, "Billing interval") as PlanInterval;

  if (!["none", "month", "year"].includes(value)) {
    throw new AdminFormError("Billing interval is invalid.", {
      [name]: "Select a valid billing interval."
    });
  }

  return value;
}

export function readDifficulty(formData: FormData, name = "difficulty") {
  const value = readRequiredText(formData, name, "Difficulty");

  if (!["beginner", "intermediate", "advanced"].includes(value)) {
    throw new AdminFormError("Difficulty is invalid.", {
      [name]: "Select a valid difficulty."
    });
  }

  return value as "beginner" | "intermediate" | "advanced";
}

export function readQuestionType(formData: FormData, name = "questionType"): QuestionType {
  const value = readRequiredText(formData, name, "Question type");

  if (!["single_choice", "multiple_choice", "drag_drop_categorize"].includes(value)) {
    throw new AdminFormError("Question type is invalid.", {
      [name]: "Choose a supported question type."
    });
  }

  return value as QuestionType;
}

export function toActionErrorState(error: unknown): AdminActionState {
  if (error instanceof AdminFormError) {
    return {
      status: "error",
      message: error.message,
      fieldErrors: error.fieldErrors,
      savedRecordId: null
    };
  }

  return {
    status: "error",
    message: error instanceof Error ? error.message : "An unexpected admin error occurred.",
    fieldErrors: {},
    savedRecordId: null
  };
}

export function toActionSuccessState(message: string, savedRecordId: string): AdminActionState {
  return {
    status: "success",
    message,
    fieldErrors: {},
    savedRecordId
  };
}

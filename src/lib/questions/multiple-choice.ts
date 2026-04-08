import type { MultipleChoiceAnswerPayload } from "@/types/questions";

export function normalizeSelectedOptionIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    )
  );
}

export function buildMultipleChoiceAnswerPayload(
  selectedOptionIds: string[]
): MultipleChoiceAnswerPayload {
  return {
    selectedOptionIds: normalizeSelectedOptionIds(selectedOptionIds)
  };
}

export function normalizeMultipleChoiceAnswerPayload(
  value: unknown
): MultipleChoiceAnswerPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const selectedOptionIds =
    "selectedOptionIds" in value
      ? normalizeSelectedOptionIds(
          (value as { selectedOptionIds?: unknown }).selectedOptionIds
        )
      : [];

  return {
    selectedOptionIds
  };
}

export function isMultipleChoiceAnswered(selectedOptionIds: string[]) {
  return normalizeSelectedOptionIds(selectedOptionIds).length > 0;
}

export function isMultipleChoiceCorrect(
  correctOptionIds: string[],
  selectedOptionIds: string[]
) {
  const normalizedCorrectOptionIds = normalizeSelectedOptionIds(correctOptionIds);
  const normalizedSelectedOptionIds = normalizeSelectedOptionIds(selectedOptionIds);

  if (normalizedCorrectOptionIds.length === 0) {
    return false;
  }

  if (normalizedCorrectOptionIds.length !== normalizedSelectedOptionIds.length) {
    return false;
  }

  return normalizedCorrectOptionIds.every((optionId) =>
    normalizedSelectedOptionIds.includes(optionId)
  );
}

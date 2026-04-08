import type {
  DragDropAnswerPayload,
  DragDropBucket,
  DragDropInteractionConfig,
  QuestionType
} from "@/types/questions";

type DragDropAuthoringItem = {
  optionText: string;
  matchKey: string;
};

function slugifyBucketLabel(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "bucket";
}

export function splitMultilineEntries(value: string) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function getQuestionTypeLabel(questionType: QuestionType) {
  if (questionType === "drag_drop_categorize") {
    return "Drag and Drop";
  }

  if (questionType === "multiple_choice") {
    return "Multiple Choice";
  }

  return "Single Choice";
}

export function buildDragDropBucketsFromLabels(labels: string[]): DragDropBucket[] {
  const slugCounts = new Map<string, number>();

  return labels.map((label) => {
    const baseId = slugifyBucketLabel(label);
    const nextCount = (slugCounts.get(baseId) ?? 0) + 1;

    slugCounts.set(baseId, nextCount);

    return {
      id: nextCount === 1 ? baseId : `${baseId}-${nextCount}`,
      label
    };
  });
}

export function getDragDropBucketLabel(
  interactionConfig: DragDropInteractionConfig | null,
  bucketId: string | null
) {
  if (!interactionConfig || !bucketId) {
    return null;
  }

  return (
    interactionConfig.buckets.find((bucket) => bucket.id === bucketId)?.label ?? null
  );
}

export function formatDragDropItemLines(
  options: Array<{ optionText: string; matchKey: string | null }>,
  interactionConfig: DragDropInteractionConfig | null
) {
  return options
    .map((option) => {
      const bucketLabel = getDragDropBucketLabel(interactionConfig, option.matchKey);

      if (!bucketLabel) {
        return option.optionText;
      }

      return `${option.optionText} | ${bucketLabel}`;
    })
    .join("\n");
}

export function normalizeDragDropInteractionConfig(
  value: unknown
): DragDropInteractionConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const bucketsValue = (value as { buckets?: unknown }).buckets;

  if (!Array.isArray(bucketsValue)) {
    return null;
  }

  const buckets = bucketsValue.flatMap((bucket) => {
    if (!bucket || typeof bucket !== "object") {
      return [];
    }

    const id = typeof (bucket as { id?: unknown }).id === "string" ? (bucket as { id: string }).id.trim() : "";
    const label =
      typeof (bucket as { label?: unknown }).label === "string"
        ? (bucket as { label: string }).label.trim()
        : "";

    if (!id || !label) {
      return [];
    }

    return [{ id, label }];
  });

  return buckets.length > 0 ? { buckets } : null;
}

export function normalizeDragDropAnswerPayload(value: unknown): DragDropAnswerPayload | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "object") {
    return null;
  }

  const placementsValue =
    "placements" in value && value.placements && typeof value.placements === "object"
      ? value.placements
      : {};

  const placements = Object.entries(placementsValue as Record<string, unknown>).reduce<
    Record<string, string>
  >((acc, [itemId, bucketId]) => {
    if (typeof itemId !== "string" || typeof bucketId !== "string") {
      return acc;
    }

    const trimmedItemId = itemId.trim();
    const trimmedBucketId = bucketId.trim();

    if (!trimmedItemId || !trimmedBucketId) {
      return acc;
    }

    acc[trimmedItemId] = trimmedBucketId;

    return acc;
  }, {});

  return { placements };
}

export function parseDragDropItemLines(
  value: string,
  buckets: DragDropBucket[]
): DragDropAuthoringItem[] {
  const bucketByLabel = new Map(
    buckets.map((bucket) => [bucket.label.trim().toLowerCase(), bucket])
  );

  return splitMultilineEntries(value).map((line, index) => {
    const separatorIndex = line.lastIndexOf("|");

    if (separatorIndex < 1 || separatorIndex >= line.length - 1) {
      throw new Error(
        `Item line ${index + 1} must use the format "statement | bucket label".`
      );
    }

    const optionText = line.slice(0, separatorIndex).trim();
    const bucketLabel = line.slice(separatorIndex + 1).trim();

    if (!optionText) {
      throw new Error(`Item line ${index + 1} is missing the draggable statement.`);
    }

    if (!bucketLabel) {
      throw new Error(`Item line ${index + 1} is missing the bucket label.`);
    }

    const bucket = bucketByLabel.get(bucketLabel.toLowerCase());

    if (!bucket) {
      throw new Error(
        `Item line ${index + 1} references "${bucketLabel}", but that bucket is not listed above.`
      );
    }

    return {
      optionText,
      matchKey: bucket.id
    };
  });
}

export function setDragDropPlacement(
  payload: DragDropAnswerPayload | null,
  itemId: string,
  bucketId: string | null
): DragDropAnswerPayload {
  const placements = { ...(payload?.placements ?? {}) };

  if (!bucketId) {
    delete placements[itemId];

    return { placements };
  }

  placements[itemId] = bucketId;

  return { placements };
}

export function isDragDropAnswerComplete(
  itemIds: string[],
  bucketIds: string[],
  payload: DragDropAnswerPayload | null
) {
  if (itemIds.length === 0 || bucketIds.length === 0 || !payload) {
    return false;
  }

  return itemIds.every((itemId) => {
    const placement = payload.placements[itemId];

    return typeof placement === "string" && bucketIds.includes(placement);
  });
}

export function isDragDropAnswerCorrect(
  items: Array<{ id: string; matchKey: string | null }>,
  bucketIds: string[],
  payload: DragDropAnswerPayload | null
) {
  if (!isDragDropAnswerComplete(items.map((item) => item.id), bucketIds, payload)) {
    return false;
  }

  return items.every((item) => {
    if (!item.matchKey) {
      return false;
    }

    return payload?.placements[item.id] === item.matchKey;
  });
}

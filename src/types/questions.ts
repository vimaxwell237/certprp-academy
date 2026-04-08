export type QuestionType = "single_choice" | "multiple_choice" | "drag_drop_categorize";

export interface DragDropBucket {
  id: string;
  label: string;
}

export interface DragDropInteractionConfig {
  buckets: DragDropBucket[];
}

export interface DragDropAnswerPayload {
  placements: Record<string, string>;
}

export interface MultipleChoiceAnswerPayload {
  selectedOptionIds: string[];
}

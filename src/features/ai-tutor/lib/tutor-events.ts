export const ASK_AI_TUTOR_EVENT = "certprep:ask-ai-tutor";

export interface AskAiTutorEventDetail {
  lessonContext?: string | null;
  question: string;
  source?: string | null;
}

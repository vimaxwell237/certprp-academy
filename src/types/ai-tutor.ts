export type TutorRole = "user" | "assistant";

export interface AiTutorMessage {
  id: string;
  role: TutorRole;
  content: string;
  createdAt: string;
}

export interface AiTutorSessionEntry {
  id: string;
  question: string;
  response: string;
  lessonContext: string | null;
  createdAt: string;
}

export interface AiTutorPageContext {
  lessonContext: string | null;
  initialQuestion: string | null;
  source: string | null;
}

export interface AskAiTutorInput {
  question: string;
  lessonContext?: string | null;
}

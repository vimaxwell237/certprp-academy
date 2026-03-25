import { APP_ROUTES } from "@/lib/auth/redirects";

export function buildAiTutorHref(input?: {
  question?: string | null;
  lessonContext?: string | null;
  source?: string | null;
}) {
  const params = new URLSearchParams();

  if (input?.question) {
    params.set("question", input.question);
  }

  if (input?.lessonContext) {
    params.set("lessonContext", input.lessonContext);
  }

  if (input?.source) {
    params.set("source", input.source);
  }

  const query = params.toString();

  return query ? `${APP_ROUTES.aiTutor}?${query}` : APP_ROUTES.aiTutor;
}

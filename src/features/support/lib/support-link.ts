import { APP_ROUTES } from "@/lib/auth/redirects";
import type { SupportCategory } from "@/types/support";

export function buildSupportRequestHref(input: {
  category?: SupportCategory;
  subject?: string;
  lessonId?: string | null;
  quizAttemptId?: string | null;
  examAttemptId?: string | null;
  labId?: string | null;
  cliChallengeId?: string | null;
}) {
  const searchParams = new URLSearchParams();

  if (input.category) {
    searchParams.set("category", input.category);
  }

  if (input.subject) {
    searchParams.set("subject", input.subject);
  }

  if (input.lessonId) {
    searchParams.set("lessonId", input.lessonId);
  }

  if (input.quizAttemptId) {
    searchParams.set("quizAttemptId", input.quizAttemptId);
  }

  if (input.examAttemptId) {
    searchParams.set("examAttemptId", input.examAttemptId);
  }

  if (input.labId) {
    searchParams.set("labId", input.labId);
  }

  if (input.cliChallengeId) {
    searchParams.set("cliChallengeId", input.cliChallengeId);
  }

  const query = searchParams.toString();

  return query
    ? `${APP_ROUTES.supportNew}?${query}`
    : APP_ROUTES.supportNew;
}

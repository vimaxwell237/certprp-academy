import { APP_ROUTES } from "@/lib/auth/redirects";
import type { CommunityTopic } from "@/types/community";

export function buildCommunityPostHref(input: {
  subject?: string;
  topic?: CommunityTopic;
  lessonId?: string | null;
  messageBody?: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.subject) {
    searchParams.set("subject", input.subject);
  }

  if (input.topic) {
    searchParams.set("topic", input.topic);
  }

  if (input.lessonId) {
    searchParams.set("lessonId", input.lessonId);
  }

  if (input.messageBody) {
    searchParams.set("messageBody", input.messageBody);
  }

  const query = searchParams.toString();

  return query ? `${APP_ROUTES.community}?${query}` : APP_ROUTES.community;
}

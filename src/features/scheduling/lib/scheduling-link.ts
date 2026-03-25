import { APP_ROUTES } from "@/lib/auth/redirects";
import type { SupportCategory } from "@/types/support";

export function buildBookSessionHref(input: {
  tutorProfileId?: string | null;
  subject?: string | null;
  category?: SupportCategory | null;
  supportRequestId?: string | null;
}) {
  const searchParams = new URLSearchParams();

  if (input.tutorProfileId) {
    searchParams.set("tutorProfileId", input.tutorProfileId);
  }

  if (input.subject) {
    searchParams.set("subject", input.subject);
  }

  if (input.category) {
    searchParams.set("category", input.category);
  }

  if (input.supportRequestId) {
    searchParams.set("supportRequestId", input.supportRequestId);
  }

  const query = searchParams.toString();

  return query ? `${APP_ROUTES.bookSession}?${query}` : APP_ROUTES.bookSession;
}

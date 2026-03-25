import { redirect } from "next/navigation";

import { TutorChatInterface } from "@/features/ai-tutor/components/tutor-chat-interface";
import { fetchAiTutorSessions } from "@/features/ai-tutor/data/ai-tutor-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";
import type { AiTutorSessionEntry } from "@/types/ai-tutor";

export default async function AiTutorPage({
  searchParams
}: {
  searchParams: Promise<{
    question?: string;
    lessonContext?: string;
    source?: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { lessonContext, question, source } = await searchParams;
  let historyLoadError: string | null = null;
  let history: AiTutorSessionEntry[] = [];

  try {
    history = await fetchAiTutorSessions(user.id);
  } catch (error) {
    historyLoadError =
      error instanceof Error ? error.message : "AI tutor history could not be loaded.";
  }

  return (
    <section className="w-full space-y-8 pb-12">
      <TutorChatInterface
        context={{
          initialQuestion: question ?? null,
          lessonContext: lessonContext ?? null,
          source: source ?? null
        }}
        history={history}
        historyLoadError={historyLoadError}
      />
    </section>
  );
}

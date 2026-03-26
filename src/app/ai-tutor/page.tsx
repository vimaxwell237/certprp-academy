import { redirect } from "next/navigation";

import { TutorChatInterface } from "@/features/ai-tutor/components/tutor-chat-interface";
import { fetchAiTutorSessions } from "@/features/ai-tutor/data/ai-tutor-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicPageErrorMessage } from "@/lib/errors/page-error";
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
  try {
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
  } catch (error) {
    const message = getPublicPageErrorMessage(
      error,
      "AI tutor data could not be loaded right now."
    );

    return (
      <section className="w-full space-y-6 pb-12">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            AI Networking Tutor
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Built-In CCNA Help
          </h1>
        </div>

        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load the AI tutor right now.</p>
          <p className="mt-2 text-sm">
            Refresh the page and try again. If the problem continues, sign in again to
            restore your session.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

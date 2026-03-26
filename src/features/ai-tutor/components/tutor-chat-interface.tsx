"use client";

import type { AiTutorPageContext, AiTutorSessionEntry } from "@/types/ai-tutor";
import { useAiTutorChat } from "@/features/ai-tutor/hooks/use-ai-tutor-chat";

import { TutorInputBox } from "./tutor-input-box";
import { TutorMessageList } from "./tutor-message-list";
import { TutorSuggestedQuestions } from "./tutor-suggested-questions";
import { TutorTypingIndicator } from "./tutor-typing-indicator";

export function TutorChatInterface({
  context,
  history,
  historyLoadError
}: {
  context: AiTutorPageContext;
  history: AiTutorSessionEntry[];
  historyLoadError: string | null;
}) {
  const { askTutor, error, inputValue, isPending, messages, setInputValue, suggestions, tutorNote } =
    useAiTutorChat({
      context,
      history,
      historyLoadError
    });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <div className="rounded-[1.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.9))] px-4 py-6 text-white shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
                AI Networking Tutor
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Built-In CCNA Help
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-100">
                Ask networking questions in plain language and get organized,
                beginner-friendly explanations with examples and CCNA exam notes.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-sm text-slate-50">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                Tutor Style
              </p>
              <p className="mt-2">Structured explanations</p>
              <p className="mt-1">CCNA-focused answers</p>
              <p className="mt-1">Beginner-friendly examples</p>
            </div>
          </div>

          {context.lessonContext ? (
            <p className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              Context: {context.lessonContext}
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Conversation
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
                Ask, learn, and keep going
              </h2>
            </div>
            <span className="rounded-full bg-pearl px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              Live Chat
            </span>
          </div>

          <TutorMessageList messages={messages} />
          {isPending ? (
            <div className="mt-4">
              <TutorTypingIndicator />
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
            <p className="font-semibold">AI tutor request failed.</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : null}

        {tutorNote ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <p className="font-semibold">Tutor note</p>
            <p className="mt-2 text-sm">{tutorNote}</p>
          </div>
        ) : null}

        <TutorInputBox
          disabled={isPending}
          onChange={setInputValue}
          onSubmit={() => askTutor(inputValue)}
          value={inputValue}
        />
      </div>

      <div className="space-y-6">
        <TutorSuggestedQuestions
          onSelect={(question) => {
            setInputValue(question);
            askTutor(question);
          }}
          questions={suggestions}
        />

        <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            How It Helps
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate">
            <p className="rounded-2xl bg-pearl px-4 py-4">
              Understand subnetting, routing, switching, wireless, IPv4, IPv6, and protocol behavior.
            </p>
            <p className="rounded-2xl bg-pearl px-4 py-4">
              Get cleaner answers organized into explanation, example, and CCNA exam notes.
            </p>
            <p className="rounded-2xl bg-pearl px-4 py-4">
              Use the floating live tutor from any page whenever you get stuck.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

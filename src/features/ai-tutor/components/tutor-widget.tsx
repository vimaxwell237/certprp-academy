"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useAiTutorChat } from "@/features/ai-tutor/hooks/use-ai-tutor-chat";
import {
  ASK_AI_TUTOR_EVENT,
  type AskAiTutorEventDetail
} from "@/features/ai-tutor/lib/tutor-events";
import { APP_ROUTES } from "@/lib/auth/redirects";

import { TutorInputBox } from "./tutor-input-box";
import { TutorMessageList } from "./tutor-message-list";
import { TutorSuggestedQuestions } from "./tutor-suggested-questions";
import { TutorTypingIndicator } from "./tutor-typing-indicator";

function RobotBadge() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.92))] shadow-soft">
      <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-white/95">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
        </div>
      </div>
      <span className="absolute -top-1 h-3 w-3 rounded-full bg-cyan" />
    </div>
  );
}

export function TutorWidget() {
  const pathname = usePathname();
  const messageViewportRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { askTutor, error, inputValue, isPending, messages, setInputValue, suggestions, tutorNote } =
    useAiTutorChat({
      context: {
        initialQuestion: null,
        lessonContext: null,
        source: "widget"
      },
      history: [],
      historyLoadError: null,
      welcomeMessage:
        "Simple Explanation\nI'm your live CCNA tutor.\n\nExample\nAsk me about subnetting, VLANs, ARP, routing, TCP vs UDP, or anything from your current lesson.\n\nImportant CCNA Exam Note\nYou can open me from any page whenever you get stuck."
    });
  const userMessageCount = messages.filter((message) => message.role === "user").length;
  const showSuggestions = userMessageCount === 0;

  useEffect(() => {
    const viewport = messageViewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth"
    });
  }, [isOpen, isPending, messages]);

  useEffect(() => {
    function handleAskTutorEvent(event: Event) {
      const customEvent = event as CustomEvent<AskAiTutorEventDetail>;

      if (!customEvent.detail?.question) {
        return;
      }

      setIsOpen(true);
      setInputValue(customEvent.detail.question);
      askTutor(customEvent.detail.question, customEvent.detail.lessonContext ?? null);
    }

    window.addEventListener(ASK_AI_TUTOR_EVENT, handleAskTutorEvent as EventListener);

    return () => {
      window.removeEventListener(ASK_AI_TUTOR_EVENT, handleAskTutorEvent as EventListener);
    };
  }, [askTutor, setInputValue]);

  if (pathname === APP_ROUTES.aiTutor) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-50 flex flex-col items-stretch gap-3 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:items-end"
      data-no-ai-selection="true"
    >
      {isOpen ? (
        <div className="flex h-[min(42rem,calc(100dvh-5.5rem))] w-full flex-col overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/95 shadow-2xl shadow-slate-900/15 backdrop-blur sm:h-[min(44rem,calc(100dvh-6rem))] sm:w-[min(32rem,calc(100vw-2.5rem))] sm:rounded-[1.75rem] lg:w-[34rem]">
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.92))] px-4 py-3 text-white sm:px-5">
            <div className="flex items-start gap-3">
              <RobotBadge />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  Live AI Tutor
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold leading-tight">
                  Ask while you study
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-100">
                  Quick CCNA help on this page.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Link
                    className="rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-white/20"
                    href={APP_ROUTES.aiTutor}
                  >
                    Open Full Tutor
                  </Link>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-slate-100">
                    Live chat
                  </span>
                </div>
              </div>
              <button
                className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-white/20"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Minimize
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,rgba(244,248,251,0.86),rgba(255,255,255,0.98))]">
            <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3 sm:px-4" ref={messageViewportRef}>
              <TutorMessageList compact messages={messages.slice(-8)} />
              {isPending ? (
                <div className="mt-3">
                  <TutorTypingIndicator />
                </div>
              ) : null}
            </div>

            <div className="border-t border-ink/5 bg-white/96 px-2.5 py-2.5 sm:px-4">
              {error ? (
                <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-900">
                  {error}
                </div>
              ) : null}

              {tutorNote ? (
                <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
                  {tutorNote}
                </div>
              ) : null}

              {showSuggestions ? (
                <div className="mb-2">
                  <TutorSuggestedQuestions
                    compact
                    onSelect={(question) => {
                      setInputValue(question);
                      askTutor(question);
                    }}
                    questions={suggestions.slice(0, 4)}
                  />
                </div>
              ) : null}

              <TutorInputBox
                compact
                disabled={isPending}
                onChange={setInputValue}
                onSubmit={() => askTutor(inputValue)}
                surface="plain"
                value={inputValue}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden max-w-[16rem] rounded-full bg-white/92 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate shadow-soft sm:block">
          Need networking help?
        </div>
      )}

      <button
        aria-label="Toggle AI tutor"
        className="self-end transition hover:-translate-y-0.5"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <RobotBadge />
      </button>
    </div>
  );
}

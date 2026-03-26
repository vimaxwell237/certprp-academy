"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import type {
  AiTutorMessage,
  AiTutorPageContext,
  AiTutorSessionEntry
} from "@/types/ai-tutor";

type TutorApiPayload = {
  answer?: string;
  error?: string;
  persistenceWarning?: string | null;
  providerDebug?: string;
};

function toMessages(history: AiTutorSessionEntry[]): AiTutorMessage[] {
  return [...history]
    .reverse()
    .flatMap((entry) => [
      {
        id: `${entry.id}-q`,
        role: "user" as const,
        content: entry.question,
        createdAt: entry.createdAt
      },
      {
        id: `${entry.id}-a`,
        role: "assistant" as const,
        content: entry.response,
        createdAt: entry.createdAt
      }
    ]);
}

export function buildSuggestedQuestions(context: AiTutorPageContext) {
  const defaults = [
    "What is the OSI model?",
    "Explain subnetting in simple terms",
    "What is a VLAN?",
    "How does ARP work?",
    "Difference between TCP and UDP?"
  ];

  if (context.lessonContext) {
    return [
      `Explain ${context.lessonContext} in simple terms`,
      `What is the most important CCNA exam point about ${context.lessonContext}?`,
      ...defaults
    ];
  }

  return defaults;
}

export function useAiTutorChat(input: {
  context: AiTutorPageContext;
  history: AiTutorSessionEntry[];
  historyLoadError: string | null;
  welcomeMessage?: string;
}) {
  const initializedAutoAsk = useRef(false);
  const [messages, setMessages] = useState<AiTutorMessage[]>(() => {
    const priorMessages = toMessages(input.history);

    if (priorMessages.length > 0) {
      return priorMessages;
    }

    return [
      {
        id: "welcome-message",
        role: "assistant",
        content:
          input.welcomeMessage ??
          "Simple Explanation\nAsk me any CCNA-level networking question.\n\nExample\nI can help with subnetting, VLANs, ARP, routing, switching, TCP vs UDP, and troubleshooting.\n\nImportant CCNA Exam Note\nI keep explanations beginner-friendly and focused on the exam.",
        createdAt: new Date().toISOString()
      }
    ];
  });
  const [inputValue, setInputValue] = useState(input.context.initialQuestion ?? "");
  const [error, setError] = useState<string | null>(input.historyLoadError);
  const [tutorNote, setTutorNote] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const buildTutorNote = useCallback((payload: TutorApiPayload) => {
    const notes = [payload.persistenceWarning];

    if (payload.providerDebug) {
      notes.push(`Debug: ${payload.providerDebug}`);
    }

    const message = notes.filter(Boolean).join(" ");

    return message || null;
  }, []);

  const readTutorApiPayload = useCallback(async (response: Response) => {
    const responseText = await response.text();
    const trimmed = responseText.trim();

    if (!trimmed) {
      return {} satisfies TutorApiPayload;
    }

    try {
      return JSON.parse(trimmed) as TutorApiPayload;
    } catch {
      return {
        error: response.ok
          ? "The AI tutor returned an unreadable response. Please try again."
          : "The AI tutor is temporarily unavailable. Please try again shortly."
      } satisfies TutorApiPayload;
    }
  }, []);

  const askTutor = useCallback(
    (question: string, lessonContextOverride?: string | null) => {
      const trimmedQuestion = question.trim();

      if (!trimmedQuestion) {
        return;
      }

      const userMessage: AiTutorMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmedQuestion,
        createdAt: new Date().toISOString()
      };

      setMessages((current) => [...current, userMessage]);
      setInputValue("");
      setError(null);
      setTutorNote(null);

      startTransition(async () => {
        try {
          const response = await fetch("/api/ai/networking-tutor", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              user_question: trimmedQuestion,
              lesson_context: lessonContextOverride ?? input.context.lessonContext
            })
          });
          const payload = await readTutorApiPayload(response);

          if (!response.ok || !payload.answer) {
            const debugSuffix = payload.providerDebug ? ` Debug: ${payload.providerDebug}` : "";

            throw new Error(
              `${payload.error ?? "The AI tutor could not answer right now."}${debugSuffix}`
            );
          }

          const answer = payload.answer;

          setMessages((current) => [
            ...current,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: answer,
              createdAt: new Date().toISOString()
            }
          ]);
          setTutorNote(buildTutorNote(payload));
        } catch (requestError) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "The AI tutor request failed."
          );
        }
      });
    },
    [buildTutorNote, input.context.lessonContext, readTutorApiPayload]
  );

  useEffect(() => {
    if (!input.context.initialQuestion || initializedAutoAsk.current) {
      return;
    }

    initializedAutoAsk.current = true;
    askTutor(input.context.initialQuestion);
  }, [askTutor, input.context.initialQuestion]);

  return {
    askTutor,
    error,
    inputValue,
    isPending,
    messages,
    setError,
    setInputValue,
    suggestions: buildSuggestedQuestions(input.context),
    tutorNote
  };
}

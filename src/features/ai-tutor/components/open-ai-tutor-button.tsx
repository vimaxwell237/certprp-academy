"use client";

import { Button } from "@/components/ui/button";
import {
  ASK_AI_TUTOR_EVENT,
  type AskAiTutorEventDetail
} from "@/features/ai-tutor/lib/tutor-events";

type OpenAiTutorButtonVariant = "primary" | "secondary" | "ghost";

export function OpenAiTutorButton({
  className,
  label = "Ask AI Tutor",
  lessonContext,
  question,
  source,
  variant = "secondary"
}: {
  className?: string;
  label?: string;
  lessonContext?: string | null;
  question: string;
  source?: string | null;
  variant?: OpenAiTutorButtonVariant;
}) {
  return (
    <Button
      className={className}
      onClick={() => {
        const detail: AskAiTutorEventDetail = {
          lessonContext,
          question,
          source
        };

        window.dispatchEvent(new CustomEvent(ASK_AI_TUTOR_EVENT, { detail }));
      }}
      variant={variant}
    >
      {label}
    </Button>
  );
}

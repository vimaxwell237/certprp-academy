import Link from "next/link";

import { OpenAiTutorButton } from "@/features/ai-tutor/components/open-ai-tutor-button";
import { buildAiTutorHref } from "@/features/ai-tutor/lib/ai-tutor-link";

export function AskAiTutorCta(input: {
  title: string;
  description: string;
  question: string;
  lessonContext?: string | null;
  source?: string | null;
  preferLiveChat?: boolean;
}) {
  const href = buildAiTutorHref({
    question: input.question,
    lessonContext: input.lessonContext,
    source: input.source
  });

  return (
    <div className="rounded-3xl border border-cyan/15 bg-cyan/5 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
        AI Tutor
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{input.title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate">{input.description}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {input.preferLiveChat ? (
          <OpenAiTutorButton
            label="Ask the Live AI Tutor"
            lessonContext={input.lessonContext}
            question={input.question}
            source={input.source}
          />
        ) : null}

        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
          href={href}
        >
          {input.preferLiveChat ? "Open Full Tutor" : "Ask the AI Tutor"}
        </Link>
      </div>
    </div>
  );
}

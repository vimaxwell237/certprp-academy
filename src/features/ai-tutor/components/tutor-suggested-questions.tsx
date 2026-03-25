"use client";

export function TutorSuggestedQuestions({
  compact = false,
  onSelect,
  questions
}: {
  compact?: boolean;
  onSelect: (question: string) => void;
  questions: string[];
}) {
  if (compact) {
    return (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan">
          Try One
        </p>
        <div className="-mx-1 mt-2 flex snap-x gap-2 overflow-x-auto pb-1">
          {questions.map((question) => (
            <button
              className="shrink-0 snap-start rounded-full border border-ink/10 bg-pearl px-3 py-2 text-left text-xs font-medium text-ink transition hover:border-cyan/40 hover:bg-white hover:text-cyan"
              key={question}
              onClick={() => onSelect(question)}
              type="button"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
        Suggested Questions
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {questions.map((question) => (
          <button
            className="rounded-full border border-ink/10 bg-pearl px-4 py-2 text-sm font-medium text-ink transition hover:border-cyan/40 hover:bg-white hover:text-cyan"
            key={question}
            onClick={() => onSelect(question)}
            type="button"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

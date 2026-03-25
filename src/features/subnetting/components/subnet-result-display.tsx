import { Card } from "@/components/ui/card";
import type { SubnetValidationResult } from "@/types/subnetting";

export function SubnetResultDisplay({
  persistenceMessage,
  result
}: {
  persistenceMessage: string | null;
  result: SubnetValidationResult | null;
}) {
  if (!result) {
    return (
      <Card className="border-ink/5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Result
        </p>
        <p className="mt-3 text-base text-slate">
          Submit the current problem to see your score, field-by-field feedback, and the
          full explanation.
        </p>
      </Card>
    );
  }

  return (
    <Card
      className={
        result.isCorrect
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
        Result
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="font-display text-3xl font-semibold text-ink">
          {result.isCorrect ? "Correct" : "Keep Going"}
        </p>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
          Score {result.score}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate">
        {result.isCorrect
          ? "Nice work. Every field matches the calculated subnet values."
          : "Some fields are off. Compare your answers with the correct values below and use the explanation panel to see the logic."}
      </p>

      <div className="mt-5 grid gap-3">
        {result.fieldResults.map((field) => (
          <div
            className="rounded-2xl bg-white/80 px-4 py-4 text-sm"
            key={field.key}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-ink">{field.label}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                  field.isCorrect
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-rose-100 text-rose-900"
                }`}
              >
                {field.isCorrect ? "Correct" : "Review"}
              </span>
            </div>
            <p className="mt-2 text-slate">
              Your answer:{" "}
              <span className="font-semibold text-ink">
                {field.submittedValue || "No answer entered"}
              </span>
            </p>
            {!field.isCorrect ? (
              <p className="mt-1 text-slate">
                Correct answer:{" "}
                <span className="font-semibold text-ink">{field.correctValue}</span>
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {persistenceMessage ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-white/80 px-4 py-4 text-sm text-amber-950">
          {persistenceMessage}
        </div>
      ) : null}
    </Card>
  );
}

import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { ExamHistoryItem } from "@/types/exam";

function statusLabel(status: ExamHistoryItem["status"]) {
  if (status === "timed_out") {
    return "Timed out";
  }

  if (status === "submitted") {
    return "Submitted";
  }

  return "In progress";
}

export function ExamHistoryList({
  attempts,
  title = "Recent Exam Attempts"
}: {
  attempts: ExamHistoryItem[];
  title?: string;
}) {
  return (
    <Card className="space-y-4 border-ink/5">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          History
        </p>
        <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      </div>

      {attempts.length === 0 ? (
        <p className="rounded-2xl bg-pearl px-4 py-3 text-sm text-slate">
          No exam attempts yet. Start a simulator session to build full-exam history.
        </p>
      ) : (
        <ul className="space-y-3">
          {attempts.map((attempt) => (
            <li
              className="flex flex-col gap-3 rounded-2xl border border-ink/5 bg-pearl p-4 md:flex-row md:items-center md:justify-between"
              key={attempt.id}
            >
              <div className="space-y-1">
                <p className="font-semibold text-ink">{attempt.examTitle}</p>
                <p className="text-sm text-slate">
                  {attempt.correctAnswers} / {attempt.totalQuestions} correct
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate">
                  {statusLabel(attempt.status)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink">
                  {attempt.score !== null ? `${attempt.score}%` : "Pending"}
                </p>
                <Link
                  className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                  href={`/exam-simulator/${attempt.examSlug}/results/${attempt.id}`}
                >
                  View Result
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

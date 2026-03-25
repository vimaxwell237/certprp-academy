import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { ExamConfigListItem } from "@/types/exam";

const examModeLabels: Record<ExamConfigListItem["examMode"], string> = {
  full_mock: "Full Mock Exam",
  quick_practice: "Quick Practice",
  random_mixed: "Random Mixed"
};

export function ExamModeCard({
  exam,
  locked = false
}: {
  exam: ExamConfigListItem;
  locked?: boolean;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
            {examModeLabels[exam.examMode]}
          </span>
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            {exam.timeLimitMinutes} min
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink">{exam.title}</h2>
        <p className="text-base text-slate">{exam.description}</p>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Questions</p>
          <p className="font-semibold text-ink">{exam.questionCount}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Passing</p>
          <p className="font-semibold text-ink">{exam.passingScore}%</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Taken</p>
          <p className="font-semibold text-ink">{exam.attemptsTaken}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Best</p>
          <p className="font-semibold text-ink">
            {exam.bestScore !== null ? `${exam.bestScore}%` : "N/A"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate">
          Latest result: {exam.latestScore !== null ? `${exam.latestScore}%` : "Not taken"}
        </p>
        <Link
          className={`inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${
            locked
              ? "bg-amber-500 text-white hover:bg-amber-400"
              : "bg-ink text-white hover:bg-slate-900"
          }`}
          href={locked ? "/pricing" : `/exam-simulator/${exam.slug}`}
        >
          {locked ? "Upgrade to Unlock" : "Open Simulator"}
        </Link>
      </div>
    </Card>
  );
}

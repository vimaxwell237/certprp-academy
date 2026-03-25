import { Card } from "@/components/ui/card";
import type { SubnettingPracticeSnapshot } from "@/types/subnetting";

function formatTime(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
}

export function SubnetScoreTracker({
  isSyncing,
  snapshot
}: {
  isSyncing: boolean;
  snapshot: SubnettingPracticeSnapshot;
}) {
  return (
    <div className="space-y-6">
      <Card className="space-y-5 border-ink/5">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            Score Tracker
          </p>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Practice Statistics
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
            <p className="text-slate">Attempts</p>
            <p className="font-semibold text-ink">{snapshot.stats.totalAttempts}</p>
          </div>
          <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
            <p className="text-slate">Accuracy</p>
            <p className="font-semibold text-ink">
              {snapshot.stats.accuracyPercentage}%
            </p>
          </div>
          <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
            <p className="text-slate">Average Score</p>
            <p className="font-semibold text-ink">{snapshot.stats.averageScore}</p>
          </div>
          <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
            <p className="text-slate">Best Score</p>
            <p className="font-semibold text-ink">{snapshot.stats.bestScore}</p>
          </div>
          <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
            <p className="text-slate">Current Streak</p>
            <p className="font-semibold text-ink">{snapshot.stats.currentStreak}</p>
          </div>
          <div className="rounded-2xl bg-pearl px-4 py-4 text-sm">
            <p className="text-slate">Time Practiced</p>
            <p className="font-semibold text-ink">
              {formatTime(snapshot.stats.totalTimeSeconds)}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate">
          {isSyncing ? "Saving latest attempt..." : "Stats refresh after each submitted problem."}
        </p>
      </Card>

      <Card className="space-y-4 border-ink/5">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            Practice History
          </p>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Recent Attempts
          </h3>
        </div>

        {snapshot.history.length === 0 ? (
          <p className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
            No saved attempts yet. Submit your first problem to start tracking progress.
          </p>
        ) : (
          <div className="space-y-3">
            {snapshot.history.map((attempt) => (
              <div className="rounded-2xl bg-pearl px-4 py-4 text-sm" key={attempt.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-ink">
                    {attempt.network}/{attempt.prefix}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      attempt.correct
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-rose-100 text-rose-900"
                    }`}
                  >
                    {attempt.correct ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-slate">
                  <span>Score {attempt.score}</span>
                  <span>Time {formatTime(attempt.timeTaken)}</span>
                  <span>{new Date(attempt.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

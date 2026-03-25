export function QuizProgressBar({
  current,
  total
}: {
  current: number;
  total: number;
}) {
  const percentage = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate">
        <span>
          Question {current} of {total}
        </span>
        <span className="font-semibold text-ink">{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-mist">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#0891B2,#0F766E)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}


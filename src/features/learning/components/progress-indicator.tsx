export function ProgressIndicator({
  completed,
  total,
  percentage
}: {
  completed: number;
  total: number;
  percentage: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 text-sm text-slate sm:flex-row sm:items-center sm:justify-between">
        <span>
          {completed} of {total} lessons completed
        </span>
        <span className="font-semibold text-ink">{percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-mist">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#0891B2,#0F766E)] transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

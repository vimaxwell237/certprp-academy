export function OperationsTeamFollowBadge({
  watcherCount,
  teamAttention
}: {
  watcherCount: number;
  teamAttention: boolean;
}) {
  if (watcherCount <= 0) {
    return null;
  }

  return (
    <span
      className={
        teamAttention
          ? "inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900"
          : "inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-900"
      }
    >
      {watcherCount > 1 ? `Team Follow x${watcherCount}` : "Watched"}
    </span>
  );
}

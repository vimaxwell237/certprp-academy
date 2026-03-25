export function OperationsEscalationBadge({
  isEscalated
}: {
  isEscalated: boolean;
}) {
  return (
    <span
      className={
        isEscalated
          ? "inline-flex rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-900"
          : "inline-flex rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700"
      }
    >
      {isEscalated ? "Escalated" : "Normal"}
    </span>
  );
}

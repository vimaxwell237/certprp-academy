import { deactivateTutorAvailabilitySlotAction } from "@/features/scheduling/actions/scheduling-actions";
import { Card } from "@/components/ui/card";
import type { TutorAvailabilitySlotItem } from "@/types/scheduling";

export function AvailabilitySlotCard({
  slot,
  showTutorName = false
}: {
  slot: TutorAvailabilitySlotItem;
  showTutorName?: boolean;
}) {
  return (
    <Card className="space-y-4 border-ink/5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
            slot.isBooked
              ? "bg-amber-100 text-amber-900"
              : slot.isActive
                ? "bg-emerald-100 text-emerald-900"
                : "bg-slate-200 text-slate-700"
          }`}
        >
          {slot.isBooked ? "Booked" : slot.isActive ? "Available" : "Inactive"}
        </span>
        {showTutorName ? (
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            {slot.tutorDisplayName}
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-2xl font-semibold text-ink">
          {new Date(slot.startsAt).toLocaleString()}
        </h3>
        <p className="text-sm text-slate">
          Ends {new Date(slot.endsAt).toLocaleString()}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {slot.tutorExpertise.length > 0 ? (
          slot.tutorExpertise.map((topic) => (
            <span
              className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate"
              key={`${slot.id}-${topic}`}
            >
              {topic}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            CCNA
          </span>
        )}
      </div>

      {!showTutorName ? (
        <form action={deactivateTutorAvailabilitySlotAction}>
          <input name="slotId" type="hidden" value={slot.id} />
          <button
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-50"
            disabled={slot.isBooked || !slot.isActive}
            type="submit"
          >
            {slot.isBooked ? "Booked Slot" : slot.isActive ? "Deactivate Slot" : "Inactive"}
          </button>
        </form>
      ) : null}
    </Card>
  );
}

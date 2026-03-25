import { bookTutorSessionAction } from "@/features/scheduling/actions/scheduling-actions";
import { BOOKING_CATEGORY_OPTIONS } from "@/features/scheduling/lib/scheduling-display";
import type { TutorBookingFormData } from "@/types/scheduling";

export function BookingForm({ formData }: { formData: TutorBookingFormData }) {
  return (
    <form
      action={bookTutorSessionAction}
      className="space-y-6 rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Live Tutor Help
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink">Book a Session</h1>
        <p className="text-base text-slate">
          Pick an open slot, add the study context, and send the booking request to a tutor.
        </p>
      </div>

      {formData.supportContext ? (
        <div className="rounded-2xl bg-pearl px-4 py-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
            Linked Support Request
          </p>
          <p className="mt-2 font-semibold text-ink">{formData.supportContext.subject}</p>
          <p className="mt-1 text-sm text-slate">
            This booking will stay connected to your support thread context.
          </p>
        </div>
      ) : null}

      <input
        name="selectedTutorProfileId"
        type="hidden"
        value={formData.selectedTutorProfileId}
      />
      <input
        name="supportRequestId"
        type="hidden"
        value={formData.initialValues.supportRequestId}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Subject</span>
          <input
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            defaultValue={formData.initialValues.subject}
            name="subject"
            placeholder="Example: Walk through my subnetting weak areas"
            required
            type="text"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Category</span>
          <select
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            defaultValue={formData.initialValues.category}
            name="category"
          >
            {BOOKING_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-ink">
        <span>Notes</span>
        <textarea
          className="min-h-36 w-full rounded-3xl border border-ink/10 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-cyan/60"
          defaultValue={formData.initialValues.notes}
          name="notes"
          placeholder="Optional notes for the tutor, including the exact topic or blocker."
        />
      </label>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
            Choose a Slot
          </p>
          <p className="text-sm text-slate">
            Only currently open slots are shown here.
          </p>
        </div>

        {formData.availableSlots.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            No open slots match the current tutor filter yet. Try another tutor or check
            back later.
          </div>
        ) : (
          <div className="space-y-3">
            {formData.availableSlots.map((slot) => (
              <label
                className="flex cursor-pointer gap-4 rounded-2xl border border-ink/10 bg-white px-4 py-4 transition hover:border-cyan/60"
                key={slot.id}
              >
                <input
                  className="mt-1"
                  defaultChecked={formData.initialValues.availabilitySlotId === slot.id}
                  name="availabilitySlotId"
                  required
                  type="radio"
                  value={slot.id}
                />
                <div className="space-y-2">
                  <p className="font-semibold text-ink">{slot.tutorDisplayName}</p>
                  <p className="text-sm text-slate">
                    {new Date(slot.startsAt).toLocaleString()} to{" "}
                    {new Date(slot.endsAt).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slot.tutorExpertise.length > 0 ? (
                      slot.tutorExpertise.map((topic) => (
                        <span
                          className="rounded-full bg-pearl px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate"
                          key={`${slot.id}-${topic}`}
                        >
                          {topic}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-pearl px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                        CCNA
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={formData.availableSlots.length === 0}
        type="submit"
      >
        Request Session
      </button>
    </form>
  );
}

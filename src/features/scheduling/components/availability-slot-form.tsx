"use client";

import { useState } from "react";

import { createTutorAvailabilitySlotAction } from "@/features/scheduling/actions/scheduling-actions";

function toLocalInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function localDateTimeToUtcIso(value: string) {
  if (!value) {
    return "";
  }

  const [datePart, timePart] = value.split("T");

  if (!datePart || !timePart) {
    return "";
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes);

  return Number.isNaN(localDate.getTime()) ? "" : localDate.toISOString();
}

export function AvailabilitySlotForm() {
  const initialStart = (() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30, 0, 0);

    return toLocalInputValue(date);
  })();

  const initialEnd = (() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 90, 0, 0);

    return toLocalInputValue(date);
  })();

  const [startsAtLocal, setStartsAtLocal] = useState(initialStart);
  const [endsAtLocal, setEndsAtLocal] = useState(initialEnd);

  return (
    <form
      action={createTutorAvailabilitySlotAction}
      className="space-y-5 rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Publish Availability
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Add New Time Slots
        </h1>
        <p className="text-base text-slate">
          Publish blocks learners can book directly. Overlapping active slots are rejected.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Starts At</span>
          <input
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            min={toLocalInputValue(new Date())}
            name="startsAtLocal"
            onChange={(event) => setStartsAtLocal(event.target.value)}
            required
            type="datetime-local"
            value={startsAtLocal}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Ends At</span>
          <input
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
            min={startsAtLocal || toLocalInputValue(new Date())}
            name="endsAtLocal"
            onChange={(event) => setEndsAtLocal(event.target.value)}
            required
            type="datetime-local"
            value={endsAtLocal}
          />
        </label>
      </div>

      <input name="startsAtUtc" type="hidden" value={localDateTimeToUtcIso(startsAtLocal)} />
      <input name="endsAtUtc" type="hidden" value={localDateTimeToUtcIso(endsAtLocal)} />

      <button
        className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
        type="submit"
      >
        Save Slot
      </button>
    </form>
  );
}

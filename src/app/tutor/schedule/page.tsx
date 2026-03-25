import { AvailabilitySlotCard } from "@/features/scheduling/components/availability-slot-card";
import { AvailabilitySlotForm } from "@/features/scheduling/components/availability-slot-form";
import { FlashBanner } from "@/features/scheduling/components/flash-banner";
import { fetchTutorScheduleOverview } from "@/features/scheduling/data/scheduling-service";
import { requireTutorUser } from "@/lib/auth/roles";

export default async function TutorSchedulePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireTutorUser();
  const resolvedSearchParams = await searchParams;
  const success =
    (Array.isArray(resolvedSearchParams.success)
      ? resolvedSearchParams.success[0]
      : resolvedSearchParams.success) ?? "";
  const error =
    (Array.isArray(resolvedSearchParams.error)
      ? resolvedSearchParams.error[0]
      : resolvedSearchParams.error) ?? "";

  try {
    const overview = await fetchTutorScheduleOverview(user.id);

    return (
      <section className="space-y-8 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <AvailabilitySlotForm />

          <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Tutor Snapshot
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
              {overview.tutorProfile.displayName}
            </h2>
            <p className="mt-2 text-base text-slate">{overview.tutorProfile.bio}</p>

            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Upcoming Slots</p>
                <p className="font-semibold text-ink">{overview.slots.length}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Booked Sessions</p>
                <p className="font-semibold text-ink">{overview.upcomingBookedCount}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {overview.tutorProfile.expertise.length > 0 ? (
                overview.tutorProfile.expertise.map((item) => (
                  <span
                    className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate"
                    key={item}
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  CCNA
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Upcoming Slots
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Availability Queue
            </h2>
          </div>

          {overview.slots.length === 0 ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
              No future availability slots yet. Publish a time block to start taking live
              session requests.
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {overview.slots.map((slot) => (
                <AvailabilitySlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  } catch (serviceError) {
    const message =
      serviceError instanceof Error ? serviceError.message : "Unknown scheduling error.";

    return (
      <section className="space-y-6 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load tutor scheduling.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 11 scheduling migration has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { NotificationCard } from "@/features/notifications/components/notification-card";
import { fetchNotifications } from "@/features/notifications/data/notification-service";
import { FlashBanner } from "@/features/scheduling/components/flash-banner";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function NotificationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

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
    const notifications = await fetchNotifications(user.id);

    return (
      <section className="w-full max-w-5xl space-y-8 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              In-App Notifications
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
              Notification Center
            </h1>
            <p className="max-w-2xl text-base text-slate">
              Review live-session updates, reminders, cancellations, and tutor follow-up
              activity from one place.
            </p>
          </div>

          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={APP_ROUTES.dashboard}
          >
            Back to Dashboard
          </Link>
          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={APP_ROUTES.settingsNotifications}
          >
            Manage Email Settings
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            No notifications yet. Session activity and tutor follow-ups will appear here.
          </div>
        ) : (
          <div className="grid gap-5">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </section>
    );
  } catch (serviceError) {
    const message = getPublicErrorMessage(
      serviceError,
      "Notifications could not be loaded right now."
    );

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load notifications.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 14 automation and preferences migration has been executed in
            Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

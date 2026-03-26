import Link from "next/link";
import { redirect } from "next/navigation";

import { updateNotificationPreferencesAction } from "@/features/delivery/actions/preferences-actions";
import { fetchNotificationPreferences } from "@/features/delivery/data/preferences-service";
import { FlashBanner } from "@/features/scheduling/components/flash-banner";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export default async function NotificationSettingsPage({
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
    const preferences = await fetchNotificationPreferences(user.id);

    return (
      <section className="w-full max-w-5xl space-y-8 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              Settings
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Notification Preferences
            </h1>
            <p className="max-w-2xl text-base text-slate">
              Control which tutor-session events should also send email. In-app alerts
              remain available inside the platform.
            </p>
          </div>

          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={APP_ROUTES.notifications}
          >
            Back to Notifications
          </Link>
        </div>

        <form
          action={updateNotificationPreferencesAction}
          className="space-y-5 rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft"
        >
          <div className="grid gap-4">
            {preferences.map((preference) => (
              <label
                className="grid gap-3 rounded-3xl border border-ink/5 bg-pearl px-5 py-4 md:grid-cols-[1.5fr_auto_auto]"
                key={preference.notificationType}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{preference.label}</p>
                  <p className="text-sm text-slate">{preference.description}</p>
                </div>

                <div className="inline-flex items-center justify-start rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900">
                  In-app on
                </div>

                <div className="inline-flex items-center gap-3">
                  <input
                    className="h-5 w-5 rounded border border-ink/20 text-cyan focus:ring-cyan"
                    defaultChecked={preference.emailEnabled}
                    id={`email-${preference.notificationType}`}
                    name={`email-${preference.notificationType}`}
                    type="checkbox"
                  />
                  <span className="text-sm font-medium text-ink">Email enabled</span>
                </div>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
              type="submit"
            >
              Save Preferences
            </button>
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.dashboard}
            >
              Back to Dashboard
            </Link>
          </div>
        </form>
      </section>
    );
  } catch (serviceError) {
    const message =
      serviceError instanceof Error ? serviceError.message : "Unknown preferences error.";

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        {success ? <FlashBanner message={success} tone="success" /> : null}
        {error ? <FlashBanner message={error} tone="error" /> : null}
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load notification preferences.</p>
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

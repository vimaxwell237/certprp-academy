import Link from "next/link";

import { APP_ROUTES } from "@/lib/auth/redirects";
import { requireTutorUser } from "@/lib/auth/roles";

export default async function TutorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireTutorUser();

  return (
    <div className="w-full space-y-8">
      <div className="rounded-3xl border border-white/70 bg-[linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(8,145,178,0.9))] px-6 py-8 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-50">
          Tutor Workspace
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
          Scheduling Control Center
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-200">
          Publish availability, manage session requests, and keep live learner support
          organized inside the app.
        </p>
      </div>

      <nav className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
          href={APP_ROUTES.tutorSchedule}
        >
          Schedule
        </Link>
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
          href={APP_ROUTES.tutorSessions}
        >
          Sessions
        </Link>
      </nav>

      {children}
    </div>
  );
}

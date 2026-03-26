import type { Metadata } from "next";
import Link from "next/link";

import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Page Not Found",
  description: "The page you requested is not available on CertPrep Academy.",
  path: "/404"
});

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-5 rounded-[1.5rem] border border-white/70 bg-white/90 px-4 py-6 shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan">
        Page Not Found
      </p>
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        This page is not available.
      </h1>
      <p className="max-w-2xl text-base text-slate">
        The resource you requested may have been removed, renamed, or is not available
        in the current learning setup.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
          href={APP_ROUTES.dashboard}
        >
          Go to Dashboard
        </Link>
        <Link
          className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
          href={APP_ROUTES.home}
        >
          Return Home
        </Link>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { APP_ROUTES } from "@/lib/auth/redirects";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Checkout Canceled",
  description: "Your CertPrep Academy checkout was canceled and no billing changes were made.",
  path: "/checkout/cancel"
});

export default function CheckoutCancelPage() {
  return (
    <section className="w-full max-w-4xl space-y-6 pb-12">
      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-soft sm:rounded-[2rem] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em]">Checkout Canceled</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          No billing changes were made
        </h1>
        <p className="mt-3 text-base">
          Your current CertPrep plan remains active. You can compare plans again or return
          to your dashboard.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
            href={APP_ROUTES.pricing}
          >
            Back to Pricing
          </Link>
          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={APP_ROUTES.dashboard}
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

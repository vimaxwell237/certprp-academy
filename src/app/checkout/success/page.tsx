import type { Metadata } from "next";
import Link from "next/link";

import {
  completeDevCheckoutSession,
  fetchBillingAccessState,
  syncStripeCheckoutSession
} from "@/features/billing/data/billing-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Checkout Success",
  description: "Your CertPrep Academy checkout is being finalized and your plan access is updating.",
  path: "/checkout/success"
});

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{
    sessionToken?: string;
    plan?: string;
    provider?: string;
    session_id?: string;
  }>;
}) {
  const user = await getCurrentUser();
  const { sessionToken, plan, provider, session_id: stripeSessionId } = await searchParams;

  if (!user) {
    return (
      <section className="w-full max-w-4xl space-y-6 pb-12">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-semibold">Sign in to finalize checkout.</p>
          <p className="mt-2 text-sm">
            Your checkout return was reached without an authenticated session.
          </p>
          <Link
            className="mt-4 inline-flex rounded-full border border-amber-700 px-5 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            href={APP_ROUTES.login}
          >
            Log In
          </Link>
        </div>
      </section>
    );
  }

  if (provider === "stripe" || stripeSessionId) {
    if (!stripeSessionId) {
      return (
        <section className="w-full max-w-4xl space-y-6 pb-12">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
            <p className="font-semibold">Stripe checkout is missing the session reference.</p>
            <p className="mt-2 text-sm">
              The success URL did not include the Stripe session identifier needed to confirm the
              purchase.
            </p>
          </div>
        </section>
      );
    }

    await syncStripeCheckoutSession(stripeSessionId, user.id);
  } else if (sessionToken && plan) {
    await completeDevCheckoutSession(user.id, {
      planSlug: plan,
      sessionToken
    });
  } else {
    return (
      <section className="w-full max-w-4xl space-y-6 pb-12">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Checkout session is incomplete.</p>
          <p className="mt-2 text-sm">
            The return URL is missing required checkout parameters.
          </p>
        </div>
      </section>
    );
  }

  const accessState = await fetchBillingAccessState(user.id);

  return (
    <section className="w-full max-w-4xl space-y-6 pb-12">
      <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-soft sm:rounded-[2rem] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em]">Checkout Success</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {accessState.plan.name} is now active
        </h1>
        <p className="mt-3 text-base">
          Your account access has been updated. You can now return to your dashboard or open
          billing to review the active subscription state.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
            href={APP_ROUTES.dashboard}
          >
            Open Dashboard
          </Link>
          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={APP_ROUTES.billing}
          >
            Review Billing
          </Link>
        </div>
      </div>
    </section>
  );
}

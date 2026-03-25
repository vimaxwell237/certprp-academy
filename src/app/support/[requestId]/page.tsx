import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  canAccessTutorSupport
} from "@/features/billing/data/billing-service";
import { SupportThread } from "@/features/support/components/support-thread";
import { fetchSupportRequestDetail } from "@/features/support/data/support-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

function isNavigationNotFoundError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const digest =
    "digest" in error && typeof error.digest === "string" ? error.digest : error.message;

  return digest.includes("NEXT_HTTP_ERROR_FALLBACK");
}

export default async function SupportRequestDetailPage({
  params
}: {
  params: Promise<{ requestId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { requestId } = await params;

  if (!(await canAccessTutorSupport(user.id))) {
    const lockedContent = buildLockedFeatureModel("tutor_support_access");

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.support}
        >
          Back to Support
        </Link>
        <LockedFeatureCard
          description={lockedContent.description}
          title={lockedContent.title}
        />
      </section>
    );
  }

  try {
    const request = await fetchSupportRequestDetail(user.id, requestId);

    if (!request) {
      notFound();
    }

    return (
      <section className="w-full max-w-6xl space-y-8 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.support}
        >
          Back to Support
        </Link>
        <SupportThread request={request} />
      </section>
    );
  } catch (error) {
    if (isNavigationNotFoundError(error)) {
      throw error;
    }

    const message = getPublicErrorMessage(
      error,
      "Support thread data could not be loaded right now."
    );

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.support}
        >
          Back to Support
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load this support thread.</p>
          <p className="mt-2 text-sm">
            Verify that the request exists and belongs to the signed-in learner or tutor.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

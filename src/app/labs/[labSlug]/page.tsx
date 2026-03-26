import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  canAccessLabBySlug
} from "@/features/billing/data/billing-service";
import { LabFilesSection } from "@/features/labs/components/lab-files-section";
import { LabProgressForm } from "@/features/labs/components/lab-progress-form";
import { LabDifficultyBadge } from "@/features/labs/components/lab-difficulty-badge";
import { LabStatusBadge } from "@/features/labs/components/lab-status-badge";
import { fetchLabDetail } from "@/features/labs/data/lab-service";
import { ContextualSupportCta } from "@/features/support/components/contextual-support-cta";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicPageErrorMessage } from "@/lib/errors/page-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LabDetailPage({
  params
}: {
  params: Promise<{ labSlug: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { labSlug } = await params;

  if (!(await canAccessLabBySlug(user.id, labSlug))) {
    const lockedContent = buildLockedFeatureModel("lab_access");

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.labs}
        >
          Back to Labs
        </Link>
        <LockedFeatureCard
          description={lockedContent.description}
          title={lockedContent.title}
        />
      </section>
    );
  }

  try {
    const lab = await fetchLabDetail(user.id, labSlug);

    if (!lab) {
      notFound();
    }

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12 sm:space-y-8">
        <div className="space-y-4 rounded-[1.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.9))] px-4 py-6 text-white shadow-soft sm:rounded-[2rem] sm:px-6 sm:py-8 lg:px-10">
          <Link
            className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:text-white"
            href={APP_ROUTES.labs}
          >
            Back to Labs
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {lab.moduleTitle}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {lab.estimatedMinutes} min
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{lab.title}</h1>
          <p className="max-w-3xl text-slate-100">{lab.summary}</p>

          <div className="flex flex-wrap items-center gap-3">
            <LabDifficultyBadge difficulty={lab.difficulty} />
            <LabStatusBadge status={lab.status} />
            {lab.lessonTitle ? (
              <Link
                className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-white/20"
                href={`/courses/${lab.courseSlug}/${lab.moduleSlug}/${lab.lessonSlug}`}
              >
                Related Lesson
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Objectives
              </p>
              <p className="mt-3 whitespace-pre-line leading-7 text-ink">{lab.objectives}</p>
            </div>

            <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Instructions
              </p>
              <p className="mt-3 whitespace-pre-line leading-7 text-ink">
                {lab.instructions}
              </p>
            </div>

            {lab.topologyNotes ? (
              <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                  Topology Notes
                </p>
                <p className="mt-3 whitespace-pre-line leading-7 text-ink">
                  {lab.topologyNotes}
                </p>
              </div>
            ) : null}

            <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Expected Outcomes
              </p>
              <p className="mt-3 whitespace-pre-line leading-7 text-ink">
                {lab.expectedOutcomes}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Lab Actions
              </p>
              <div className="mt-4 space-y-4">
                <LabProgressForm
                  courseSlug={lab.courseSlug}
                  labId={lab.id}
                  labSlug={lab.slug}
                  lessonSlug={lab.lessonSlug ?? undefined}
                  moduleSlug={lab.moduleSlug}
                  returnPath={`/labs/${lab.slug}`}
                  status={lab.status}
                />

                <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                  <p className="font-semibold text-ink">Latest Completion</p>
                  <p className="mt-1">
                    {lab.completedAt
                      ? new Date(lab.completedAt).toLocaleString()
                      : "Not completed yet"}
                  </p>
                </div>

                <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                  <p className="font-semibold text-ink">Course Context</p>
                  <p className="mt-1">{lab.courseTitle}</p>
                  <p className="mt-1">{lab.moduleTitle}</p>
                  <Link
                    className="mt-3 inline-flex text-sm font-semibold text-ink underline decoration-cyan/60 underline-offset-4 transition hover:text-cyan"
                    href={`/courses/${lab.courseSlug}`}
                  >
                    Return to course module map
                  </Link>
                </div>
              </div>
            </div>

            <LabFilesSection files={lab.files} />
          </div>
        </div>

        <ContextualSupportCta
          category="lab_help"
          description="Use tutor support when the Packet Tracer workflow, expected outcome, or troubleshooting steps in this lab need a second set of eyes."
          labId={lab.id}
          subject={`Need help with lab: ${lab.title}`}
          title="Need tutor help with this lab?"
        />
      </section>
    );
  } catch (error) {
    const message = getPublicPageErrorMessage(
      error,
      "Lab details could not be loaded right now."
    );

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.labs}
        >
          Back to Labs
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load this lab.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 5 migration and seed SQL has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  canAccessCliChallenge
} from "@/features/billing/data/billing-service";
import { startCliChallenge } from "@/features/cli/actions/cli-practice-actions";
import { CliTerminalPractice } from "@/features/cli/components/cli-terminal-practice";
import {
  fetchActiveCliAttemptState,
  fetchCliChallengeDetail
} from "@/features/cli/data/cli-service";
import { LabDifficultyBadge } from "@/features/labs/components/lab-difficulty-badge";
import { LabStatusBadge } from "@/features/labs/components/lab-status-badge";
import { ContextualSupportCta } from "@/features/support/components/contextual-support-cta";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

function isNavigationNotFoundError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const digest =
    "digest" in error && typeof error.digest === "string" ? error.digest : error.message;

  return digest.includes("NEXT_HTTP_ERROR_FALLBACK");
}

export default async function CliChallengeDetailPage({
  params
}: {
  params: Promise<{ challengeSlug: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { challengeSlug } = await params;

  if (!(await canAccessCliChallenge(user.id, challengeSlug))) {
    const lockedContent = buildLockedFeatureModel("cli_access");

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.cliPractice}
        >
          Back to CLI Practice
        </Link>
        <LockedFeatureCard
          description={lockedContent.description}
          title={lockedContent.title}
        />
      </section>
    );
  }

  try {
    const [challenge, activeAttempt] = await Promise.all([
      fetchCliChallengeDetail(user.id, challengeSlug),
      fetchActiveCliAttemptState(user.id, challengeSlug)
    ]);

    if (!challenge) {
      notFound();
    }

    return (
      <section className="w-full max-w-5xl space-y-8 pb-12">
        <div className="space-y-4 rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,145,178,0.9))] px-6 py-8 text-white shadow-soft lg:px-10">
          <Link
            className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:text-white"
            href={APP_ROUTES.cliPractice}
          >
            Back to CLI Practice
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {challenge.moduleTitle}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {challenge.estimatedMinutes} min
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {challenge.stepCount} steps
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight">{challenge.title}</h1>
          <p className="max-w-3xl text-slate-100">{challenge.summary}</p>

          <div className="flex flex-wrap items-center gap-3">
            <LabDifficultyBadge difficulty={challenge.difficulty} />
            <LabStatusBadge status={challenge.status} />
            {challenge.lessonTitle ? (
              <Link
                className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-white/20"
                href={`/courses/${challenge.courseSlug}/${challenge.moduleSlug}/${challenge.lessonSlug}`}
              >
                Related Lesson
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Scenario
              </p>
              <p className="mt-3 whitespace-pre-line leading-7 text-ink">
                {challenge.scenario}
              </p>
            </div>

            <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Objectives
              </p>
              <p className="mt-3 whitespace-pre-line leading-7 text-ink">
                {challenge.objectives}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Session Control
              </p>
              <div className="mt-4 space-y-4">
                <form action={startCliChallenge}>
                  <input name="challengeSlug" type="hidden" value={challenge.slug} />
                  <button
                    className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                    type="submit"
                  >
                    {activeAttempt ? "Resume Terminal Session" : "Launch Terminal Challenge"}
                  </button>
                </form>

                <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                  <p className="font-semibold text-ink">Current Status</p>
                  <p className="mt-1">
                    {activeAttempt
                      ? `Active attempt at step ${activeAttempt.currentStep} of ${activeAttempt.totalSteps}`
                      : challenge.status === "completed"
                        ? "Last recorded attempt completed."
                        : "No active attempt yet."}
                  </p>
                </div>

                <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                  <p className="font-semibold text-ink">Practice Notes</p>
                  <p className="mt-1">
                    Guided simulation only. Commands are validated against expected training
                    steps and do not emulate a full device operating system.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Step Preview
              </p>
              <ul className="mt-4 space-y-3">
                {challenge.steps.map((step) => (
                  <li className="rounded-2xl bg-pearl px-4 py-4 text-sm text-ink" key={step.id}>
                    <p className="font-semibold">Step {step.stepNumber}</p>
                    <p className="mt-2 text-slate">{step.prompt}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ContextualSupportCta
          category="cli_help"
          cliChallengeId={challenge.id}
          description="If the command flow, validation rules, or expected syntax in this guided terminal challenge is still blocking you, open a tutor request from here."
          subject={`Need help with CLI challenge: ${challenge.title}`}
          title="Need help with this CLI challenge?"
        />

        {activeAttempt ? <CliTerminalPractice initialAttempt={activeAttempt} /> : null}
      </section>
    );
  } catch (error) {
    if (isNavigationNotFoundError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.cliPractice}
        >
          Back to CLI Practice
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load this CLI challenge.</p>
          <p className="mt-2 text-sm">
            Confirm the Phase 6 migration and seed SQL has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

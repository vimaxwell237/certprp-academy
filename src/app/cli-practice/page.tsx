import { redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  fetchBillingAccessState
} from "@/features/billing/data/billing-service";
import { canAccessCliModule } from "@/features/billing/lib/access-control";
import { CliChallengeCard } from "@/features/cli/components/cli-challenge-card";
import { fetchCliChallenges } from "@/features/cli/data/cli-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CliPracticePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    const [challenges, accessState] = await Promise.all([
      fetchCliChallenges(user.id),
      fetchBillingAccessState(user.id)
    ]);
    const hasLockedChallenges = challenges.some(
      (challenge) => !canAccessCliModule(accessState, challenge.moduleSlug)
    );
    const lockedContent = buildLockedFeatureModel("cli_access");

    return (
      <section className="w-full space-y-8 pb-12">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            CLI Practice Terminal
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            CLI Practice
          </h1>
          <p className="max-w-2xl text-base text-slate">
            Guided terminal-style command practice for CCNA workflows. Each challenge
            validates commands step by step and lets you resume progress later.
          </p>
        </div>

        {hasLockedChallenges ? (
          <LockedFeatureCard
            description={lockedContent.description}
            title={lockedContent.title}
          />
        ) : null}

        {challenges.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            No CLI practice challenges are available yet. Run the Phase 6 seed script in
            Supabase to load starter challenges.
          </div>
        ) : (
          <div className="grid gap-6">
            {challenges.map((challenge) => (
              <CliChallengeCard
                challenge={challenge}
                key={challenge.id}
                locked={!canAccessCliModule(accessState, challenge.moduleSlug)}
              />
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return (
      <section className="w-full space-y-6 pb-12">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          CLI Practice
        </h1>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load CLI challenge data.</p>
          <p className="mt-2 text-sm">
            Run the Phase 6 migration and seed SQL in Supabase, then refresh this page.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

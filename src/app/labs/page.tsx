import { redirect } from "next/navigation";

import { LockedFeatureCard } from "@/features/billing/components/locked-feature-card";
import {
  buildLockedFeatureModel,
  fetchBillingAccessState
} from "@/features/billing/data/billing-service";
import { canAccessLabModule } from "@/features/billing/lib/access-control";
import { LabCard } from "@/features/labs/components/lab-card";
import { fetchLabCatalog } from "@/features/labs/data/lab-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

function buildReturnPath(moduleSlug?: string, difficulty?: string) {
  const params = new URLSearchParams();

  if (moduleSlug) {
    params.set("module", moduleSlug);
  }

  if (difficulty) {
    params.set("difficulty", difficulty);
  }

  const query = params.toString();

  return query ? `${APP_ROUTES.labs}?${query}` : APP_ROUTES.labs;
}

export default async function LabsPage({
  searchParams
}: {
  searchParams: Promise<{
    module?: string;
    difficulty?: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { module: moduleFilter, difficulty } = await searchParams;

  try {
    const [{ labs, filterOptions }, accessState] = await Promise.all([
      fetchLabCatalog(user.id, {
        moduleSlug: moduleFilter ?? null,
        difficulty: difficulty ?? null
      }),
      fetchBillingAccessState(user.id)
    ]);
    const returnPath = buildReturnPath(moduleFilter, difficulty);
    const hasLockedLabs = labs.some((lab) => !canAccessLabModule(accessState, lab.moduleSlug));
    const lockedContent = buildLockedFeatureModel("lab_access");

    return (
      <section className="w-full space-y-8 pb-12">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
            Packet Tracer Labs
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Labs
          </h1>
          <p className="max-w-2xl text-base text-slate">
            Open hands-on CCNA practice labs, download guided resources, and track lab
            progress across the course.
          </p>
        </div>

        {hasLockedLabs ? (
          <LockedFeatureCard
            description={lockedContent.description}
            title={lockedContent.title}
          />
        ) : null}

        <form
          action={APP_ROUTES.labs}
          className="grid gap-4 rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft md:grid-cols-[1fr_1fr_auto]"
          method="get"
        >
          <label className="space-y-2 text-sm font-medium text-ink">
            <span>Filter by Module</span>
            <select
              className="w-full rounded-2xl border border-ink/10 bg-pearl px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/60"
              defaultValue={moduleFilter ?? ""}
              name="module"
            >
              <option value="">All modules</option>
              {filterOptions.modules.map((moduleOption) => (
                <option key={moduleOption.slug} value={moduleOption.slug}>
                  {moduleOption.title}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-ink">
            <span>Filter by Difficulty</span>
            <select
              className="w-full rounded-2xl border border-ink/10 bg-pearl px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/60"
              defaultValue={difficulty ?? ""}
              name="difficulty"
            >
              <option value="">All difficulties</option>
              {filterOptions.difficulties.map((difficultyOption) => (
                <option key={difficultyOption} value={difficultyOption}>
                  {difficultyOption}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-3">
            <button
              className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
              type="submit"
            >
              Apply Filters
            </button>
            <a
              className="inline-flex rounded-full border border-ink/10 px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.labs}
            >
              Reset
            </a>
          </div>
        </form>

        {labs.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            No labs match the current filters yet. Run the Phase 5 seed script or adjust
            the filters.
          </div>
        ) : (
          <div className="grid gap-6">
            {labs.map((lab) => (
              <LabCard
                key={lab.id}
                lab={lab}
                locked={!canAccessLabModule(accessState, lab.moduleSlug)}
                returnPath={returnPath}
              />
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    const message = getPublicErrorMessage(
      error,
      "Lab data could not be loaded right now."
    );

    return (
      <section className="w-full space-y-6 pb-12">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Labs</h1>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load lab data.</p>
          <p className="mt-2 text-sm">
            Run the Phase 5 migration and seed SQL in Supabase, then refresh this page.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

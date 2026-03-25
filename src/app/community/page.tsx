import Link from "next/link";
import { redirect } from "next/navigation";

import { CommunityPostCard } from "@/features/community/components/community-post-card";
import { CommunityPostForm } from "@/features/community/components/community-post-form";
import { fetchCommunityOverview } from "@/features/community/data/community-service";
import { COMMUNITY_TOPIC_OPTIONS } from "@/features/community/lib/community-display";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CommunityPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const resolvedSearchParams = await searchParams;

  try {
    const overview = await fetchCommunityOverview(resolvedSearchParams);

    return (
      <section className="w-full space-y-8 pb-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              Community
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
              Learner Discussions
            </h1>
            <p className="max-w-3xl text-base text-slate">
              Talk through tricky CCNA topics with other learners, compare approaches,
              and ask for help without leaving the platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.aiTutor}
            >
              Ask AI Tutor
            </Link>
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.dashboard}
            >
              Return to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            {overview.recentPosts.length === 0 ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                No community posts yet. Start the first discussion and give learners a
                place to talk through CCNA topics together.
              </div>
            ) : (
              <div className="grid gap-5">
                {overview.recentPosts.map((post, index) => (
                  <CommunityPostCard
                    compact={index > 0}
                    key={post.id}
                    post={post}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <CommunityPostForm formData={overview.createForm} />

            <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Topic Guide
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                Post in the Right Place
              </h2>
              <div className="mt-4 grid gap-3">
                {COMMUNITY_TOPIC_OPTIONS.map((option) => (
                  <div className="rounded-2xl bg-pearl px-4 py-4" key={option.value}>
                    <p className="font-semibold text-ink">{option.label}</p>
                    <p className="mt-1 text-sm text-slate">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    const message = getPublicErrorMessage(
      error,
      "Community data could not be loaded right now."
    );

    return (
      <section className="w-full space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.dashboard}
        >
          Back to Dashboard
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load the community space.</p>
          <p className="mt-2 text-sm">
            Confirm the community migration has been executed in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

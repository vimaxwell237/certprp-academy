import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CommunityThread } from "@/features/community/components/community-thread";
import { fetchCommunityPostDetail } from "@/features/community/data/community-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicPageErrorMessage } from "@/lib/errors/page-error";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CommunityPostDetailPage({
  params
}: {
  params: Promise<{ postId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const { postId } = await params;

  try {
    const post = await fetchCommunityPostDetail(user.id, postId);

    if (!post) {
      notFound();
    }

    return (
      <section className="w-full max-w-6xl space-y-8 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.community}
        >
          Back to Community
        </Link>
        <CommunityThread post={post} />
      </section>
    );
  } catch (error) {
    const message = getPublicPageErrorMessage(
      error,
      "Discussion data could not be loaded right now."
    );

    return (
      <section className="w-full max-w-5xl space-y-6 pb-12">
        <Link
          className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-cyan transition hover:text-teal"
          href={APP_ROUTES.community}
        >
          Back to Community
        </Link>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Unable to load this discussion.</p>
          <p className="mt-2 text-sm">
            Verify that the post exists and the community migration has been run.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{message}</p>
        </div>
      </section>
    );
  }
}

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { CommunityTopicBadge } from "@/features/community/components/community-topic-badge";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type { CommunityPostListItem } from "@/types/community";

export function CommunityPostCard({
  post,
  compact = false
}: {
  post: CommunityPostListItem;
  compact?: boolean;
}) {
  return (
    <Card className={`border-ink/5 ${compact ? "space-y-4 p-5" : "space-y-5"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <CommunityTopicBadge topic={post.topic} />
        <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
          {post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
          {post.authorRole === "tutor" ? "Tutor" : "Learner"}
        </span>
      </div>

      <div className="space-y-2">
        <h2 className={`${compact ? "text-2xl" : "text-3xl"} font-display font-semibold text-ink`}>
          {post.subject}
        </h2>
        <p className="text-sm text-slate">
          Started by {post.authorDisplayName} · Updated{" "}
          {new Date(post.updatedAt).toLocaleString()}
        </p>
      </div>

      {post.contexts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {post.contexts.map((context) =>
            context.href ? (
              <Link
                className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate transition hover:border-cyan/60 hover:text-cyan"
                href={context.href}
                key={`${post.id}-${context.type}`}
              >
                {context.label}
              </Link>
            ) : (
              <span
                className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate"
                key={`${post.id}-${context.type}`}
              >
                {context.label}
              </span>
            )
          )}
        </div>
      ) : null}

      <p className="text-sm leading-7 text-slate">{post.excerpt}</p>

      <Link
        className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
        href={`${APP_ROUTES.community}/${post.id}`}
      >
        Open Discussion
      </Link>
    </Card>
  );
}

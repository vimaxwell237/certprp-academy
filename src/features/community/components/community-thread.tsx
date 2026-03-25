import Link from "next/link";

import { Card } from "@/components/ui/card";
import { postCommunityReplyAction } from "@/features/community/actions/community-actions";
import { CommunityTopicBadge } from "@/features/community/components/community-topic-badge";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type { CommunityPostDetail } from "@/types/community";

export function CommunityThread({ post }: { post: CommunityPostDetail }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        <Card className="space-y-5 border-ink/5">
          <div className="flex flex-wrap items-center gap-2">
            <CommunityTopicBadge topic={post.topic} />
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              {post.authorRole === "tutor" ? "Tutor" : "Learner"}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold text-ink">{post.subject}</h1>
            <p className="text-sm text-slate">
              Started by {post.authorDisplayName} · Opened{" "}
              {new Date(post.createdAt).toLocaleString()} · Updated{" "}
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
        </Card>

        <Card className="space-y-5 border-ink/5">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Discussion
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Thread Messages
            </h2>
          </div>

          <div className="space-y-4">
            <div className="max-w-[92%] rounded-3xl bg-pearl px-5 py-4 text-ink">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold">{post.authorDisplayName}</p>
                <p className="text-xs text-slate">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-7">
                {post.messageBody}
              </p>
            </div>

            {post.replies.map((reply) => (
              <div
                className={`rounded-3xl px-5 py-4 ${
                  reply.authorRole === "self"
                    ? "ml-auto max-w-[92%] bg-ink text-white"
                    : reply.authorRole === "tutor"
                      ? "max-w-[92%] bg-cyan/10 text-ink"
                      : "max-w-[92%] bg-pearl text-ink"
                }`}
                key={reply.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{reply.authorDisplayName}</p>
                  <p
                    className={`text-xs ${
                      reply.authorRole === "self" ? "text-slate-200" : "text-slate"
                    }`}
                  >
                    {new Date(reply.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-7">
                  {reply.messageBody}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {post.canReply ? (
          <Card className="space-y-4 border-ink/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Reply
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Join the Discussion
              </h2>
            </div>

            <form action={postCommunityReplyAction} className="space-y-4">
              <input name="postId" type="hidden" value={post.id} />
              <textarea
                className="min-h-32 w-full rounded-3xl border border-ink/10 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-cyan/60"
                name="messageBody"
                placeholder="Share what helped you, ask a follow-up, or explain how you would solve it."
                required
              />
              <button
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                type="submit"
              >
                Post Reply
              </button>
            </form>
          </Card>
        ) : null}
      </div>

      <div className="space-y-5">
        <Card className="space-y-4 border-ink/5">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Community Tips
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Keep It Useful
            </h2>
          </div>
          <div className="space-y-3 text-sm text-slate">
            <p className="rounded-2xl bg-pearl px-4 py-4">
              Share what device, protocol, or lesson area is confusing you before asking the question.
            </p>
            <p className="rounded-2xl bg-pearl px-4 py-4">
              Include the command, symptom, or subnet math step that is blocking you when possible.
            </p>
            <p className="rounded-2xl bg-pearl px-4 py-4">
              Use the AI Tutor when you want an immediate explanation, then return here for peer discussion.
            </p>
          </div>
        </Card>

        <Card className="space-y-4 border-ink/5">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Navigation
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Keep Studying
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.community}
            >
              Back to Community
            </Link>
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.aiTutor}
            >
              Ask AI Tutor
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

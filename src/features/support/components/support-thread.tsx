import Link from "next/link";

import { Card } from "@/components/ui/card";
import { postSupportReplyAction, updateSupportStatusAction } from "@/features/support/actions/support-actions";
import { buildBookSessionHref } from "@/features/scheduling/lib/scheduling-link";
import {
  getSupportCategoryLabel,
  SUPPORT_STATUS_OPTIONS
} from "@/features/support/lib/support-display";
import { SupportPriorityBadge } from "@/features/support/components/support-priority-badge";
import { SupportStatusBadge } from "@/features/support/components/support-status-badge";
import type { SupportRequestDetail } from "@/types/support";

export function SupportThread({ request }: { request: SupportRequestDetail }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-5">
        <Card className="space-y-5 border-ink/5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <SupportStatusBadge status={request.status} />
              <SupportPriorityBadge priority={request.priority} />
              <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                {getSupportCategoryLabel(request.category)}
              </span>
            </div>
            <h1 className="font-display text-3xl font-semibold text-ink">{request.subject}</h1>
            <p className="text-sm text-slate">
              Opened {new Date(request.createdAt).toLocaleString()} · Updated{" "}
              {new Date(request.updatedAt).toLocaleString()}
            </p>
          </div>

          {request.contexts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {request.contexts.map((context) =>
                context.href ? (
                  <Link
                    className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate transition hover:border-cyan/60 hover:text-cyan"
                    href={context.href}
                    key={context.type}
                  >
                    {context.label}
                  </Link>
                ) : (
                  <span
                    className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate"
                    key={context.type}
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
              Conversation
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">Message Thread</h2>
          </div>

          <div className="space-y-4">
            {request.messages.map((message) => (
              <div
                className={`rounded-3xl px-5 py-4 ${
                  message.senderRole === "self"
                    ? "ml-auto max-w-[88%] bg-ink text-white"
                    : message.senderRole === "tutor"
                      ? "max-w-[88%] bg-cyan/10 text-ink"
                      : "max-w-[88%] bg-pearl text-ink"
                }`}
                key={message.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{message.senderLabel}</p>
                  <p
                    className={`text-xs ${
                      message.senderRole === "self" ? "text-slate-200" : "text-slate"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-7">
                  {message.messageBody}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {request.canReply ? (
          <Card className="space-y-4 border-ink/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Reply
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Continue the Thread
              </h2>
            </div>

            <form action={postSupportReplyAction} className="space-y-4">
              <input name="requestId" type="hidden" value={request.id} />
              <textarea
                className="min-h-32 w-full rounded-3xl border border-ink/10 bg-white px-4 py-4 text-sm leading-7 outline-none transition focus:border-cyan/60"
                name="messageBody"
                placeholder="Add more detail, respond to the tutor, or explain the next blocker."
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
              Thread Details
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Support Metadata
            </h2>
          </div>
          <div className="space-y-3 rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
            <p>
              <span className="font-semibold text-ink">Assigned Tutor:</span>{" "}
              {request.tutorDisplayName ?? "Not assigned yet"}
            </p>
            <p>
              <span className="font-semibold text-ink">Viewer Mode:</span>{" "}
              {request.viewerRole === "tutor" ? "Tutor" : "Learner"}
            </p>
          </div>
          {request.viewerRole === "learner" ? (
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={buildBookSessionHref({
                tutorProfileId: request.tutorProfileId,
                subject: request.subject,
                category: request.category,
                supportRequestId: request.id
              })}
            >
              Book Live Session
            </Link>
          ) : null}
        </Card>

        {request.canUpdateStatus ? (
          <Card className="space-y-4 border-ink/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Tutor Controls
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Update Request Status
              </h2>
            </div>
            <form action={updateSupportStatusAction} className="space-y-4">
              <input name="requestId" type="hidden" value={request.id} />
              <select
                className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan/60"
                defaultValue={request.status}
                name="status"
              >
                {SUPPORT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                type="submit"
              >
                Save Status
              </button>
            </form>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

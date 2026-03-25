import Link from "next/link";

import { Card } from "@/components/ui/card";
import { buildBookSessionHref } from "@/features/scheduling/lib/scheduling-link";
import { getSupportCategoryLabel } from "@/features/support/lib/support-display";
import { SupportPriorityBadge } from "@/features/support/components/support-priority-badge";
import { SupportStatusBadge } from "@/features/support/components/support-status-badge";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type { SupportRequestListItem } from "@/types/support";

export function SupportRequestCard({
  request,
  subtitle,
  showBookingCta = true
}: {
  request: SupportRequestListItem;
  subtitle?: string;
  showBookingCta?: boolean;
}) {
  return (
    <Card className="space-y-5 border-ink/5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SupportStatusBadge status={request.status} />
          <SupportPriorityBadge priority={request.priority} />
          <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
            {getSupportCategoryLabel(request.category)}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-2xl font-semibold text-ink">{request.subject}</h3>
          <p className="text-sm text-slate">
            {subtitle ??
              `Updated ${new Date(request.updatedAt).toLocaleString()}${request.tutorDisplayName ? ` · Tutor: ${request.tutorDisplayName}` : ""}`}
          </p>
        </div>
      </div>

      {request.contexts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {request.contexts.map((context) => (
            <span
              className="rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate"
              key={`${request.id}-${context.type}`}
            >
              {context.label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Messages</p>
          <p className="font-semibold text-ink">{request.messageCount}</p>
        </div>
        <div className="rounded-2xl bg-pearl px-4 py-3">
          <p className="text-slate">Latest Note</p>
          <p className="font-semibold text-ink">
            {request.lastMessagePreview ?? "No messages yet"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
          href={`${APP_ROUTES.support}/${request.id}`}
        >
          Open Thread
        </Link>
        {showBookingCta ? (
          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={buildBookSessionHref({
              subject: request.subject,
              category: request.category,
              supportRequestId: request.id
            })}
          >
            Book Live Session
          </Link>
        ) : null}
      </div>
    </Card>
  );
}

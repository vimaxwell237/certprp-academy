import Link from "next/link";

import { markNotificationReadAction } from "@/features/notifications/actions/notification-actions";
import type { NotificationItem } from "@/types/notifications";

export function NotificationCard({
  notification
}: {
  notification: NotificationItem;
}) {
  return (
    <div
      className={`space-y-4 rounded-3xl border p-6 shadow-soft ${
        notification.isRead
          ? "border-ink/5 bg-white/80"
          : "border-cyan/20 bg-cyan/5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
            notification.isRead
              ? "bg-pearl text-slate"
              : "bg-cyan/15 text-cyan-900"
          }`}
        >
          {notification.type.replaceAll("_", " ")}
        </span>
        {!notification.isRead ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
            Unread
          </span>
        ) : null}
        {notification.latestDelivery ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
              notification.latestDelivery.status === "sent"
                ? "bg-emerald-100 text-emerald-900"
                : notification.latestDelivery.status === "failed"
                  ? "bg-rose-100 text-rose-900"
                  : notification.latestDelivery.status === "ignored"
                    ? "bg-slate-200 text-slate-700"
                  : "bg-pearl text-slate"
            }`}
          >
            Email {notification.latestDelivery.status}
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold text-ink">
          {notification.title}
        </h2>
        <p className="text-sm leading-7 text-slate">{notification.message}</p>
        <p className="text-xs text-slate">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
        {notification.latestDelivery?.errorMessage ? (
          <p className="rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-900">
            Delivery issue: {notification.latestDelivery.errorMessage}
          </p>
        ) : null}
        {notification.latestDelivery ? (
          <p className="text-xs text-slate">
            Retry {notification.latestDelivery.retryCount} of{" "}
            {notification.latestDelivery.maxRetries}
            {notification.latestDelivery.lastAttemptedAt
              ? ` | Last attempt ${new Date(notification.latestDelivery.lastAttemptedAt).toLocaleString()}`
              : ""}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {notification.linkUrl ? (
          <Link
            className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
            href={notification.linkUrl}
          >
            Open Related Page
          </Link>
        ) : null}

        {!notification.isRead ? (
          <form action={markNotificationReadAction}>
            <input name="notificationId" type="hidden" value={notification.id} />
            <button
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              type="submit"
            >
              Mark as Read
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

import type { EmailMessage } from "@/features/delivery/lib/provider";
import type { NotificationTemplateKey } from "@/types/delivery";

type SessionEmailContext = {
  subject: string | null;
  category: string | null;
  scheduledStartsAt: string | null;
  scheduledEndsAt: string | null;
  tutorDisplayName: string | null;
  meetingLink: string | null;
};

function getAppBaseUrl() {
  const configuredUrl =
    process.env.APP_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

function buildAppUrl(linkUrl: string | null) {
  if (!linkUrl) {
    return getAppBaseUrl();
  }

  if (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) {
    return linkUrl;
  }

  return `${getAppBaseUrl()}${linkUrl.startsWith("/") ? linkUrl : `/${linkUrl}`}`;
}

function formatSessionDate(dateIso: string | null) {
  if (!dateIso) {
    return "TBD";
  }

  return `${new Date(dateIso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC"
  })} UTC`;
}

function formatCategory(category: string | null) {
  if (!category) {
    return "General";
  }

  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildTemplateBody(
  templateKey: NotificationTemplateKey,
  notificationTitle: string,
  notificationMessage: string
) {
  switch (templateKey) {
    case "session_booked":
      return {
        eyebrow: "New booking",
        headline: notificationTitle,
        supportingText:
          "A learner booked live help and the request is now waiting in your tutor queue."
      };
    case "session_confirmed":
      return {
        eyebrow: "Session confirmed",
        headline: notificationTitle,
        supportingText:
          "Your tutor session details were updated. Review the timing and meeting access now."
      };
    case "session_canceled":
      return {
        eyebrow: "Session canceled",
        headline: notificationTitle,
        supportingText:
          "This session changed state and should be reviewed before the scheduled time arrives."
      };
    case "session_reminder":
      return {
        eyebrow: "Upcoming session",
        headline: notificationTitle,
        supportingText:
          "Your live session is approaching. Check the schedule, notes, and meeting access."
      };
    case "session_completed":
      return {
        eyebrow: "Session completed",
        headline: notificationTitle,
        supportingText:
          "The live session lifecycle is complete. Review any follow-up notes inside the platform."
      };
    case "followup_added":
      return {
        eyebrow: "Tutor follow-up",
        headline: notificationTitle,
        supportingText:
          "Your tutor posted new follow-up guidance tied to the completed session."
      };
    default:
      return {
        eyebrow: "CertPrep Academy",
        headline: notificationTitle,
        supportingText: notificationMessage
      };
  }
}

export function buildNotificationEmailTemplate(input: {
  to: string;
  templateKey: NotificationTemplateKey;
  notificationTitle: string;
  notificationMessage: string;
  linkUrl: string | null;
  session: SessionEmailContext | null;
}): EmailMessage {
  const body = buildTemplateBody(
    input.templateKey,
    input.notificationTitle,
    input.notificationMessage
  );
  const sessionDate = formatSessionDate(input.session?.scheduledStartsAt ?? null);
  const meetingLink = input.session?.meetingLink;
  const actionUrl = buildAppUrl(input.linkUrl);
  const sessionSubject = input.session?.subject ?? "Tutor session";
  const sessionCategory = formatCategory(input.session?.category ?? null);
  const tutorLabel = input.session?.tutorDisplayName ?? "CertPrep tutor";

  const text = [
    "CertPrep Academy",
    body.headline,
    body.supportingText,
    "",
    `Session: ${sessionSubject}`,
    `Category: ${sessionCategory}`,
    `Date: ${sessionDate}`,
    `Tutor: ${tutorLabel}`,
    meetingLink ? `Meeting link: ${meetingLink}` : "Meeting link: Pending",
    `Action: ${actionUrl}`,
    "",
    input.notificationMessage
  ].join("\n");

  const html = `
    <div style="background:#f5f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="margin:0 auto;max-width:640px;overflow:hidden;border-radius:24px;background:#ffffff;box-shadow:0 18px 50px rgba(15,23,42,0.12);">
        <div style="background:linear-gradient(135deg,#0f172a,#0891b2);padding:28px 32px;color:#ffffff;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;">${body.eyebrow}</p>
          <h1 style="margin:0;font-size:30px;line-height:1.2;">${body.headline}</h1>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#dbeafe;">${body.supportingText}</p>
        </div>
        <div style="padding:28px 32px;">
          <div style="border-radius:18px;background:#f8fafc;padding:18px 20px;">
            <p style="margin:0 0 10px;font-size:15px;line-height:1.7;"><strong>Session:</strong> ${sessionSubject}</p>
            <p style="margin:0 0 10px;font-size:15px;line-height:1.7;"><strong>Category:</strong> ${sessionCategory}</p>
            <p style="margin:0 0 10px;font-size:15px;line-height:1.7;"><strong>Date:</strong> ${sessionDate}</p>
            <p style="margin:0 0 10px;font-size:15px;line-height:1.7;"><strong>Tutor:</strong> ${tutorLabel}</p>
            <p style="margin:0;font-size:15px;line-height:1.7;"><strong>Meeting link:</strong> ${meetingLink ? `<a href="${meetingLink}" style="color:#0891b2;">Open meeting</a>` : "Pending tutor update"}</p>
          </div>
          <p style="margin:22px 0 0;font-size:15px;line-height:1.8;color:#334155;">${input.notificationMessage}</p>
          <a href="${actionUrl}" style="display:inline-block;margin-top:24px;border-radius:999px;background:#0f172a;padding:14px 22px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Open CertPrep Academy</a>
        </div>
      </div>
    </div>
  `.trim();

  return {
    to: input.to,
    subject: `CertPrep Academy | ${input.notificationTitle}`,
    html,
    text
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canAccessTutorSupport } from "@/features/billing/data/billing-service";
import {
  bookTutorSession,
  cancelLearnerTutorSession,
  createTutorAvailabilitySlot,
  deactivateTutorAvailabilitySlot,
  upsertTutorSessionFollowup,
  updateTutorSession
} from "@/features/scheduling/data/scheduling-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { requireTutorUser } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import {
  normalizeMeetingLink,
  readBookingCategory,
  readOptionalText,
  readRequiredText,
  readSessionStatus,
  readUtcIsoDate
} from "@/features/scheduling/lib/validation";

function buildBookingRedirect(
  params: Record<string, string | null | undefined>,
  message: string
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  searchParams.set("error", message);

  return `${APP_ROUTES.bookSession}?${searchParams.toString()}`;
}

export async function createTutorAvailabilitySlotAction(formData: FormData) {
  await requireTutorUser();
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    await createTutorAvailabilitySlot(user.id, {
      startsAt: readUtcIsoDate(formData, "startsAtUtc", "Start time"),
      endsAt: readUtcIsoDate(formData, "endsAtUtc", "End time")
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the slot.";
    redirect(
      `${APP_ROUTES.tutorSchedule}?error=${encodeURIComponent(message)}`
    );
  }

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.tutorSchedule);
  revalidatePath(APP_ROUTES.bookSession);
  redirect(`${APP_ROUTES.tutorSchedule}?success=${encodeURIComponent("Availability slot created.")}`);
}

export async function deactivateTutorAvailabilitySlotAction(formData: FormData) {
  await requireTutorUser();
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    await deactivateTutorAvailabilitySlot(
      user.id,
      readRequiredText(formData, "slotId", "Availability slot")
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to deactivate the slot.";
    redirect(`${APP_ROUTES.tutorSchedule}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(APP_ROUTES.tutorSchedule);
  revalidatePath(APP_ROUTES.bookSession);
  redirect(`${APP_ROUTES.tutorSchedule}?success=${encodeURIComponent("Availability slot deactivated.")}`);
}

export async function bookTutorSessionAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  if (!(await canAccessTutorSupport(user.id))) {
    redirect(APP_ROUTES.pricing);
  }

  try {
    await bookTutorSession(user.id, {
      availabilitySlotId: readRequiredText(formData, "availabilitySlotId", "Availability slot"),
      subject: readRequiredText(formData, "subject", "Subject"),
      category: readBookingCategory(formData),
      notes: readOptionalText(formData, "notes"),
      supportRequestId: readOptionalText(formData, "supportRequestId")
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to book the tutor session.";
    redirect(
      buildBookingRedirect(
        {
          tutorProfileId: readOptionalText(formData, "selectedTutorProfileId"),
          supportRequestId: readOptionalText(formData, "supportRequestId"),
          subject: String(formData.get("subject") ?? ""),
          category: String(formData.get("category") ?? "general"),
          notes: String(formData.get("notes") ?? "")
        },
        message
      )
    );
  }

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.bookSession);
  revalidatePath(APP_ROUTES.notifications);
  revalidatePath(APP_ROUTES.sessions);
  revalidatePath(APP_ROUTES.tutorSessions);
  redirect(`${APP_ROUTES.sessions}?success=${encodeURIComponent("Tutor session requested.")}`);
}

export async function updateTutorSessionAction(formData: FormData) {
  await requireTutorUser();
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    await updateTutorSession(user.id, {
      sessionId: readRequiredText(formData, "sessionId", "Session"),
      status: readSessionStatus(formData),
      meetingLink: normalizeMeetingLink(readOptionalText(formData, "meetingLink")),
      notes: readOptionalText(formData, "notes")
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update the tutor session.";
    redirect(`${APP_ROUTES.tutorSessions}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.notifications);
  revalidatePath(APP_ROUTES.sessions);
  revalidatePath(APP_ROUTES.tutorSessions);
  redirect(`${APP_ROUTES.tutorSessions}?success=${encodeURIComponent("Tutor session updated.")}`);
}

export async function upsertTutorSessionFollowupAction(formData: FormData) {
  await requireTutorUser();
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    await upsertTutorSessionFollowup(user.id, {
      sessionId: readRequiredText(formData, "sessionId", "Session"),
      summary: readRequiredText(formData, "summary", "Summary"),
      recommendations: readOptionalText(formData, "recommendations"),
      homework: readOptionalText(formData, "homework"),
      nextSteps: readOptionalText(formData, "nextSteps")
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save the tutor follow-up.";
    redirect(`${APP_ROUTES.tutorSessions}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.notifications);
  revalidatePath(APP_ROUTES.sessions);
  revalidatePath(APP_ROUTES.tutorSessions);
  redirect(`${APP_ROUTES.tutorSessions}?success=${encodeURIComponent("Tutor follow-up saved.")}`);
}

export async function cancelLearnerTutorSessionAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  try {
    await cancelLearnerTutorSession(
      user.id,
      readRequiredText(formData, "sessionId", "Session")
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to cancel the tutor session.";
    redirect(`${APP_ROUTES.sessions}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.notifications);
  revalidatePath(APP_ROUTES.sessions);
  revalidatePath(APP_ROUTES.tutorSessions);
  redirect(`${APP_ROUTES.sessions}?success=${encodeURIComponent("Tutor session canceled.")}`);
}

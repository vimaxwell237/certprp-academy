"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canAccessTutorSupport } from "@/features/billing/data/billing-service";
import {
  createSupportRequestAndInitialMessage,
  postSupportReply,
  updateSupportRequestStatus
} from "@/features/support/data/support-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";
import type { SupportCategory, SupportPriority, SupportStatus } from "@/types/support";

export async function createSupportRequest(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  if (!(await canAccessTutorSupport(user.id))) {
    redirect(APP_ROUTES.pricing);
  }

  const result = await createSupportRequestAndInitialMessage(user.id, {
    tutorProfileId: String(formData.get("tutorProfileId") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    category: String(formData.get("category") ?? "general") as SupportCategory,
    priority: String(formData.get("priority") ?? "medium") as SupportPriority,
    lessonId: String(formData.get("lessonId") ?? ""),
    quizAttemptId: String(formData.get("quizAttemptId") ?? ""),
    examAttemptId: String(formData.get("examAttemptId") ?? ""),
    labId: String(formData.get("labId") ?? ""),
    cliChallengeId: String(formData.get("cliChallengeId") ?? ""),
    messageBody: String(formData.get("messageBody") ?? "")
  });

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.support);
  redirect(`${APP_ROUTES.support}/${result.requestId}`);
}

export async function postSupportReplyAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const requestId = String(formData.get("requestId") ?? "");

  if (!requestId) {
    throw new Error("Support request id is required.");
  }

  if (!(await canAccessTutorSupport(user.id))) {
    redirect(APP_ROUTES.pricing);
  }

  await postSupportReply(user.id, {
    requestId,
    messageBody: String(formData.get("messageBody") ?? "")
  });

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.support);
  revalidatePath(`${APP_ROUTES.support}/${requestId}`);
  redirect(`${APP_ROUTES.support}/${requestId}`);
}

export async function updateSupportStatusAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "") as SupportStatus;

  if (!requestId) {
    throw new Error("Support request id is required.");
  }

  if (!(await canAccessTutorSupport(user.id))) {
    redirect(APP_ROUTES.pricing);
  }

  await updateSupportRequestStatus(user.id, {
    requestId,
    status
  });

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.support);
  revalidatePath(`${APP_ROUTES.support}/${requestId}`);
  redirect(`${APP_ROUTES.support}/${requestId}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canAccessLabById } from "@/features/billing/data/billing-service";
import { upsertLabProgress } from "@/features/labs/data/lab-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { sanitizeInternalPath } from "@/lib/navigation/safe-path";
import { getCurrentUser } from "@/lib/auth/session";
import type { LabStatus } from "@/types/lab";

export async function updateLabProgress(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const labId = String(formData.get("labId") ?? "");
  const status = String(formData.get("status") ?? "") as LabStatus;
  const returnPath = sanitizeInternalPath(
    String(formData.get("returnPath") ?? APP_ROUTES.labs),
    APP_ROUTES.labs,
    {
      allowedPrefixes: [APP_ROUTES.labs, APP_ROUTES.courses]
    }
  );
  const labSlug = String(formData.get("labSlug") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const moduleSlug = String(formData.get("moduleSlug") ?? "");
  const lessonSlug = String(formData.get("lessonSlug") ?? "");

  if (!labId) {
    throw new Error("Lab id is required.");
  }

  if (!["not_started", "in_progress", "completed"].includes(status)) {
    throw new Error("Lab status is invalid.");
  }

  if (!(await canAccessLabById(user.id, labId))) {
    redirect(APP_ROUTES.pricing);
  }

  await upsertLabProgress(user.id, {
    labId,
    status
  });

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.courses);
  revalidatePath(APP_ROUTES.labs);

  if (labSlug) {
    revalidatePath(`/labs/${labSlug}`);
  }

  if (courseSlug) {
    revalidatePath(`/courses/${courseSlug}`);
  }

  if (courseSlug && moduleSlug && lessonSlug) {
    revalidatePath(`/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`);
  }

  redirect(returnPath);
}

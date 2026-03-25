"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";
import { updateLessonCompletion } from "@/features/learning/data/learning-service";

export async function markLessonComplete(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const moduleSlug = String(formData.get("moduleSlug") ?? "");
  const lessonSlug = String(formData.get("lessonSlug") ?? "");

  if (!lessonId || !courseSlug || !moduleSlug || !lessonSlug) {
    return;
  }

  await updateLessonCompletion(user.id, lessonId, true);

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.courses);
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath(`/courses/${courseSlug}/${moduleSlug}/${lessonSlug}`);
}


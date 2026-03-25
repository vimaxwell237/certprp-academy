"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { fetchBillingAccessState } from "@/features/billing/data/billing-service";
import {
  dismissRecommendationForUser,
  generateRecommendationsForUser,
  generateStudyPlanForUser,
  updateStudyPlanItemCompletion
} from "@/features/guidance/data/guidance-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export async function generateRecommendationsAction() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  await generateRecommendationsForUser(user.id);

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.recommendations);
  revalidatePath(APP_ROUTES.studyPlan);
  redirect(APP_ROUTES.recommendations);
}

export async function dismissRecommendationAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const recommendationId = String(formData.get("recommendationId") ?? "");

  if (!recommendationId) {
    throw new Error("Recommendation id is required.");
  }

  await dismissRecommendationForUser(user.id, recommendationId);

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.recommendations);
  revalidatePath(APP_ROUTES.studyPlan);
  redirect(APP_ROUTES.recommendations);
}

export async function generateStudyPlanAction() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const accessState = await fetchBillingAccessState(user.id);

  if (!accessState.isPaid) {
    redirect(APP_ROUTES.pricing);
  }

  await generateStudyPlanForUser(user.id);

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.recommendations);
  revalidatePath(APP_ROUTES.studyPlan);
  redirect(APP_ROUTES.studyPlan);
}

export async function updateStudyPlanItemCompletionAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const itemId = String(formData.get("itemId") ?? "");
  const isCompleted = String(formData.get("isCompleted") ?? "false") === "true";

  if (!itemId) {
    throw new Error("Study plan item id is required.");
  }

  await updateStudyPlanItemCompletion(user.id, itemId, isCompleted);

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.studyPlan);
  redirect(APP_ROUTES.studyPlan);
}

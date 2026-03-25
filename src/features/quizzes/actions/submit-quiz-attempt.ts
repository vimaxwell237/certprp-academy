"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canAccessQuizSlug } from "@/features/billing/data/billing-service";
import { submitQuizAttemptAndStore } from "@/features/quizzes/data/quiz-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export async function submitQuizAttempt(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const quizSlug = String(formData.get("quizSlug") ?? "");

  if (!quizSlug) {
    throw new Error("Quiz slug is required.");
  }

  if (!(await canAccessQuizSlug(user.id, quizSlug))) {
    redirect(APP_ROUTES.pricing);
  }

  const submittedAnswers = Array.from(formData.entries()).reduce<
    Record<string, string | null>
  >((acc, [key, value]) => {
    if (!key.startsWith("question:")) {
      return acc;
    }

    const questionId = key.replace("question:", "");
    acc[questionId] = typeof value === "string" ? value : null;

    return acc;
  }, {});

  const result = await submitQuizAttemptAndStore(user.id, quizSlug, submittedAnswers);

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.quizzes);
  revalidatePath(`/quizzes/${quizSlug}`);
  redirect(`/quizzes/${quizSlug}/results/${result.attemptId}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canAccessExamSimulator } from "@/features/billing/data/billing-service";
import {
  createExamAttemptForUser,
  saveExamAttemptAnswer,
  saveExamAttemptNavigation,
  setExamAttemptFlag,
  submitExamAttemptForUser
} from "@/features/exams/data/exam-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export async function startExamAttempt(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const examSlug = String(formData.get("examSlug") ?? "");

  if (!examSlug) {
    throw new Error("Exam slug is required.");
  }

  if (!(await canAccessExamSimulator(user.id))) {
    redirect(APP_ROUTES.pricing);
  }

  const attempt = await createExamAttemptForUser(user.id, examSlug);

  redirect(`/exam-simulator/${attempt.examSlug}/attempt/${attempt.attemptId}`);
}

export async function saveExamAnswerAction(input: {
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  currentQuestionIndex?: number;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "unauthorized" as const,
      redirectPath: APP_ROUTES.login
    };
  }

  return saveExamAttemptAnswer(
    user.id,
    input.attemptId,
    input.questionId,
    input.selectedOptionId,
    input.currentQuestionIndex
  );
}

export async function saveExamFlagAction(input: {
  attemptId: string;
  questionId: string;
  flagged: boolean;
  currentQuestionIndex?: number;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "unauthorized" as const,
      redirectPath: APP_ROUTES.login
    };
  }

  return setExamAttemptFlag(
    user.id,
    input.attemptId,
    input.questionId,
    input.flagged,
    input.currentQuestionIndex
  );
}

export async function saveExamNavigationAction(input: {
  attemptId: string;
  currentQuestionIndex: number;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "unauthorized" as const,
      redirectPath: APP_ROUTES.login
    };
  }

  return saveExamAttemptNavigation(user.id, input.attemptId, input.currentQuestionIndex);
}

export async function submitExamAttemptAction(input: {
  attemptId: string;
  examSlug: string;
  reason: "manual" | "timeout";
}) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      status: "unauthorized" as const,
      redirectPath: APP_ROUTES.login
    };
  }

  const result = await submitExamAttemptForUser(
    user.id,
    input.examSlug,
    input.attemptId,
    input.reason
  );

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.examSimulator);
  revalidatePath(`/exam-simulator/${input.examSlug}`);
  revalidatePath(`/exam-simulator/${input.examSlug}/results/${input.attemptId}`);

  return result;
}

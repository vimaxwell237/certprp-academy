"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canAccessCliChallenge } from "@/features/billing/data/billing-service";
import {
  startOrResumeCliAttempt,
  submitCliCommand
} from "@/features/cli/data/cli-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export async function startCliChallenge(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const challengeSlug = String(formData.get("challengeSlug") ?? "");

  if (!challengeSlug) {
    throw new Error("Challenge slug is required.");
  }

  if (!(await canAccessCliChallenge(user.id, challengeSlug))) {
    redirect(APP_ROUTES.pricing);
  }

  await startOrResumeCliAttempt(user.id, challengeSlug);

  redirect(`/cli-practice/${challengeSlug}`);
}

export async function submitCliCommandAction(input: {
  challengeSlug: string;
  attemptId: string;
  command: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      unauthorized: true as const,
      redirectPath: APP_ROUTES.login
    };
  }

  const result = await submitCliCommand(
    user.id,
    input.challengeSlug,
    input.attemptId,
    input.command
  );

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.cliPractice);
  revalidatePath(`/cli-practice/${input.challengeSlug}`);

  return result;
}

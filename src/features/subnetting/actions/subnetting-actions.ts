"use server";

import { revalidatePath } from "next/cache";

import { saveSubnettingAttempt } from "@/features/subnetting/data/subnetting-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";
import type { GeneratedSubnetProblem, SubnetAnswerInput } from "@/types/subnetting";

export async function submitSubnettingAttemptAction(input: {
  problem: GeneratedSubnetProblem;
  answers: SubnetAnswerInput;
  timeTaken: number;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      unauthorized: true as const,
      redirectPath: APP_ROUTES.login
    };
  }

  const result = await saveSubnettingAttempt(user.id, input);

  revalidatePath(APP_ROUTES.subnettingPractice);

  return result;
}

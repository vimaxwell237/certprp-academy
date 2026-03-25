"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

import {
  completeDevCheckoutSession,
  createCheckoutSession
} from "@/features/billing/data/billing-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getPublicErrorMessage } from "@/lib/errors/public-error";
import { getCurrentUser } from "@/lib/auth/session";

export async function createCheckoutSessionAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const planSlug = String(formData.get("planSlug") ?? "");
  const returnToRaw = String(formData.get("returnTo") ?? APP_ROUTES.pricing);
  const returnTo =
    returnToRaw === APP_ROUTES.billing || returnToRaw === APP_ROUTES.pricing
      ? returnToRaw
      : APP_ROUTES.pricing;

  if (!planSlug) {
    throw new Error("Plan slug is required.");
  }

  try {
    const session = await createCheckoutSession(user.id, planSlug, user.email ?? null);

    redirect(session.checkoutUrl);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = getPublicErrorMessage(
      error,
      "Unable to start checkout right now."
    );
    const destination = new URL(returnTo, "http://localhost:3000");

    destination.searchParams.set("billingError", message);
    redirect(`${destination.pathname}${destination.search}`);
  }
}

export async function finalizeDevCheckoutSuccess(input: {
  sessionToken: string;
  planSlug: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      completed: false as const,
      requiresLogin: true as const
    };
  }

  await completeDevCheckoutSession(user.id, input);

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.billing);
  revalidatePath(APP_ROUTES.pricing);
  revalidatePath(APP_ROUTES.quizzes);
  revalidatePath(APP_ROUTES.examSimulator);
  revalidatePath(APP_ROUTES.labs);
  revalidatePath(APP_ROUTES.cliPractice);
  revalidatePath(APP_ROUTES.support);
  revalidatePath(APP_ROUTES.tutors);

  return {
    completed: true as const,
    requiresLogin: false as const
  };
}

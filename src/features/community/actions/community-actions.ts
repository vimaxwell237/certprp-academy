"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCommunityPost,
  postCommunityReply
} from "@/features/community/data/community-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";
import type { CommunityTopic } from "@/types/community";

export async function createCommunityPostAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const result = await createCommunityPost(user.id, user.email, {
    subject: String(formData.get("subject") ?? ""),
    topic: String(formData.get("topic") ?? "general") as CommunityTopic,
    lessonId: String(formData.get("lessonId") ?? ""),
    messageBody: String(formData.get("messageBody") ?? "")
  });

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.community);
  revalidatePath(APP_ROUTES.courses);
  redirect(`${APP_ROUTES.community}/${result.postId}`);
}

export async function postCommunityReplyAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const postId = String(formData.get("postId") ?? "");

  if (!postId) {
    throw new Error("Community post id is required.");
  }

  await postCommunityReply(user.id, user.email, {
    postId,
    messageBody: String(formData.get("messageBody") ?? "")
  });

  revalidatePath(APP_ROUTES.dashboard);
  revalidatePath(APP_ROUTES.community);
  revalidatePath(`${APP_ROUTES.community}/${postId}`);
  redirect(`${APP_ROUTES.community}/${postId}`);
}

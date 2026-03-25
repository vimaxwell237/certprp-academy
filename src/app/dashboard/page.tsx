import { redirect } from "next/navigation";

import { fetchDashboardBillingSnapshot } from "@/features/billing/data/billing-service";
import { fetchDashboardCliSnapshot } from "@/features/cli/data/cli-service";
import { fetchDashboardCommunitySnapshot } from "@/features/community/data/community-service";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { fetchDashboardDeliverySnapshot } from "@/features/delivery/data/delivery-service";
import { fetchDashboardExamSnapshot } from "@/features/exams/data/exam-service";
import { fetchDashboardGuidanceSnapshot } from "@/features/guidance/data/guidance-service";
import { fetchDashboardLabSnapshot } from "@/features/labs/data/lab-service";
import { fetchDashboardLearningSnapshot } from "@/features/learning/data/learning-service";
import { fetchDashboardNotificationSnapshot } from "@/features/notifications/data/notification-service";
import { fetchDashboardQuizSnapshot } from "@/features/quizzes/data/quiz-service";
import { fetchDashboardSchedulingSnapshot } from "@/features/scheduling/data/scheduling-service";
import { fetchDashboardSupportSnapshot } from "@/features/support/data/support-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

function captureDashboardLoadError(section: string, error: unknown) {
  console.error(`[dashboard] Failed to load ${section} snapshot`, error);

  return error instanceof Error ? error.message : `Unknown ${section} data error`;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  let learningSnapshot = null;
  let learningLoadError = false;
  let learningLoadErrorMessage: string | null = null;
  let quizSnapshot = null;
  let quizLoadError = false;
  let quizLoadErrorMessage: string | null = null;
  let examSnapshot = null;
  let examLoadError = false;
  let examLoadErrorMessage: string | null = null;
  let labSnapshot = null;
  let labLoadError = false;
  let labLoadErrorMessage: string | null = null;
  let cliSnapshot = null;
  let cliLoadError = false;
  let cliLoadErrorMessage: string | null = null;
  let supportSnapshot = null;
  let supportLoadError = false;
  let supportLoadErrorMessage: string | null = null;
  let communitySnapshot = null;
  let communityLoadError = false;
  let communityLoadErrorMessage: string | null = null;
  let schedulingSnapshot = null;
  let schedulingLoadError = false;
  let schedulingLoadErrorMessage: string | null = null;
  let notificationSnapshot = null;
  let notificationLoadError = false;
  let notificationLoadErrorMessage: string | null = null;
  let deliverySnapshot = null;
  let deliveryLoadError = false;
  let deliveryLoadErrorMessage: string | null = null;
  let billingSnapshot = null;
  let billingLoadError = false;
  let billingLoadErrorMessage: string | null = null;
  let guidanceSnapshot = null;
  let guidanceLoadError = false;
  let guidanceLoadErrorMessage: string | null = null;

  try {
    learningSnapshot = await fetchDashboardLearningSnapshot(user.id);
  } catch (error) {
    learningLoadError = true;
    learningLoadErrorMessage = captureDashboardLoadError("learning", error);
  }

  try {
    quizSnapshot = await fetchDashboardQuizSnapshot(user.id);
  } catch (error) {
    quizLoadError = true;
    quizLoadErrorMessage = captureDashboardLoadError("quiz", error);
  }

  try {
    examSnapshot = await fetchDashboardExamSnapshot(user.id);
  } catch (error) {
    examLoadError = true;
    examLoadErrorMessage = captureDashboardLoadError("exam", error);
  }

  try {
    labSnapshot = await fetchDashboardLabSnapshot(user.id);
  } catch (error) {
    labLoadError = true;
    labLoadErrorMessage = captureDashboardLoadError("lab", error);
  }

  try {
    cliSnapshot = await fetchDashboardCliSnapshot(user.id);
  } catch (error) {
    cliLoadError = true;
    cliLoadErrorMessage = captureDashboardLoadError("cli", error);
  }

  try {
    supportSnapshot = await fetchDashboardSupportSnapshot(user.id);
  } catch (error) {
    supportLoadError = true;
    supportLoadErrorMessage = captureDashboardLoadError("support", error);
  }

  try {
    communitySnapshot = await fetchDashboardCommunitySnapshot(user.id);
  } catch (error) {
    communityLoadError = true;
    communityLoadErrorMessage = captureDashboardLoadError("community", error);
  }

  try {
    schedulingSnapshot = await fetchDashboardSchedulingSnapshot(user.id);
  } catch (error) {
    schedulingLoadError = true;
    schedulingLoadErrorMessage = captureDashboardLoadError("scheduling", error);
  }

  try {
    notificationSnapshot = await fetchDashboardNotificationSnapshot(user.id);
  } catch (error) {
    notificationLoadError = true;
    notificationLoadErrorMessage = captureDashboardLoadError("notification", error);
  }

  try {
    deliverySnapshot = await fetchDashboardDeliverySnapshot(user.id);
  } catch (error) {
    deliveryLoadError = true;
    deliveryLoadErrorMessage = captureDashboardLoadError("delivery", error);
  }

  try {
    billingSnapshot = await fetchDashboardBillingSnapshot(user.id);
  } catch (error) {
    billingLoadError = true;
    billingLoadErrorMessage = captureDashboardLoadError("billing", error);
  }

  try {
    guidanceSnapshot = await fetchDashboardGuidanceSnapshot(user.id);
  } catch (error) {
    guidanceLoadError = true;
    guidanceLoadErrorMessage = captureDashboardLoadError("guidance", error);
  }

  return (
    <DashboardShell
      billingLoadError={billingLoadError}
      billingLoadErrorMessage={billingLoadErrorMessage}
      billingSnapshot={billingSnapshot}
      cliLoadError={cliLoadError}
      cliLoadErrorMessage={cliLoadErrorMessage}
      cliSnapshot={cliSnapshot}
      communityLoadError={communityLoadError}
      communityLoadErrorMessage={communityLoadErrorMessage}
      communitySnapshot={communitySnapshot}
      deliveryLoadError={deliveryLoadError}
      deliveryLoadErrorMessage={deliveryLoadErrorMessage}
      deliverySnapshot={deliverySnapshot}
      examLoadError={examLoadError}
      examLoadErrorMessage={examLoadErrorMessage}
      examSnapshot={examSnapshot}
      guidanceLoadError={guidanceLoadError}
      guidanceLoadErrorMessage={guidanceLoadErrorMessage}
      guidanceSnapshot={guidanceSnapshot}
      labLoadError={labLoadError}
      labLoadErrorMessage={labLoadErrorMessage}
      labSnapshot={labSnapshot}
      learningLoadError={learningLoadError}
      learningLoadErrorMessage={learningLoadErrorMessage}
      learningSnapshot={learningSnapshot}
      quizLoadError={quizLoadError}
      quizLoadErrorMessage={quizLoadErrorMessage}
      quizSnapshot={quizSnapshot}
      notificationLoadError={notificationLoadError}
      notificationLoadErrorMessage={notificationLoadErrorMessage}
      notificationSnapshot={notificationSnapshot}
      schedulingLoadError={schedulingLoadError}
      schedulingLoadErrorMessage={schedulingLoadErrorMessage}
      schedulingSnapshot={schedulingSnapshot}
      supportLoadError={supportLoadError}
      supportLoadErrorMessage={supportLoadErrorMessage}
      supportSnapshot={supportSnapshot}
      user={user}
    />
  );
}

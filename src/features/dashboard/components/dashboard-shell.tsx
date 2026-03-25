import type { User } from "@supabase/supabase-js";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { buildLockedFeatureModel } from "@/features/billing/data/billing-service";
import type { DashboardCommunitySnapshot } from "@/types/community";
import type { DashboardDeliverySnapshot } from "@/types/delivery";
import { LabDifficultyBadge } from "@/features/labs/components/lab-difficulty-badge";
import { ExamHistoryList } from "@/features/exams/components/exam-history-list";
import { LabStatusBadge } from "@/features/labs/components/lab-status-badge";
import { ProgressIndicator } from "@/features/learning/components/progress-indicator";
import type { DashboardNotificationSnapshot } from "@/types/notifications";
import { QuizHistoryList } from "@/features/quizzes/components/quiz-history-list";
import { SessionStatusBadge } from "@/features/scheduling/components/session-status-badge";
import { SupportStatusBadge } from "@/features/support/components/support-status-badge";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type { DashboardBillingSnapshot } from "@/types/billing";
import type { DashboardCliSnapshot } from "@/types/cli";
import type { DashboardExamSnapshot } from "@/types/exam";
import type { DashboardGuidanceSnapshot } from "@/types/guidance";
import type { DashboardLabSnapshot } from "@/types/lab";
import type { DashboardLearningSnapshot } from "@/types/learning";
import type { DashboardQuizSnapshot } from "@/types/quiz";
import type { DashboardSchedulingSnapshot } from "@/types/scheduling";
import type { DashboardSupportSnapshot } from "@/types/support";

export function DashboardShell({
  user,
  billingSnapshot,
  billingLoadError,
  billingLoadErrorMessage,
  guidanceSnapshot,
  guidanceLoadError,
  guidanceLoadErrorMessage,
  learningSnapshot,
  learningLoadError,
  learningLoadErrorMessage,
  quizSnapshot,
  quizLoadError,
  quizLoadErrorMessage,
  examSnapshot,
  examLoadError,
  examLoadErrorMessage,
  labSnapshot,
  labLoadError,
  labLoadErrorMessage,
  cliSnapshot,
  cliLoadError,
  cliLoadErrorMessage,
  communitySnapshot,
  communityLoadError,
  communityLoadErrorMessage,
  notificationSnapshot,
  notificationLoadError,
  notificationLoadErrorMessage,
  deliverySnapshot,
  deliveryLoadError,
  deliveryLoadErrorMessage,
  schedulingSnapshot,
  schedulingLoadError,
  schedulingLoadErrorMessage,
  supportSnapshot,
  supportLoadError,
  supportLoadErrorMessage
}: {
  user: User;
  billingSnapshot: DashboardBillingSnapshot | null;
  billingLoadError: boolean;
  billingLoadErrorMessage: string | null;
  guidanceSnapshot: DashboardGuidanceSnapshot | null;
  guidanceLoadError: boolean;
  guidanceLoadErrorMessage: string | null;
  learningSnapshot: DashboardLearningSnapshot | null;
  learningLoadError: boolean;
  learningLoadErrorMessage: string | null;
  quizSnapshot: DashboardQuizSnapshot | null;
  quizLoadError: boolean;
  quizLoadErrorMessage: string | null;
  examSnapshot: DashboardExamSnapshot | null;
  examLoadError: boolean;
  examLoadErrorMessage: string | null;
  labSnapshot: DashboardLabSnapshot | null;
  labLoadError: boolean;
  labLoadErrorMessage: string | null;
  cliSnapshot: DashboardCliSnapshot | null;
  cliLoadError: boolean;
  cliLoadErrorMessage: string | null;
  communitySnapshot: DashboardCommunitySnapshot | null;
  communityLoadError: boolean;
  communityLoadErrorMessage: string | null;
  notificationSnapshot: DashboardNotificationSnapshot | null;
  notificationLoadError: boolean;
  notificationLoadErrorMessage: string | null;
  deliverySnapshot: DashboardDeliverySnapshot | null;
  deliveryLoadError: boolean;
  deliveryLoadErrorMessage: string | null;
  schedulingSnapshot: DashboardSchedulingSnapshot | null;
  schedulingLoadError: boolean;
  schedulingLoadErrorMessage: string | null;
  supportSnapshot: DashboardSupportSnapshot | null;
  supportLoadError: boolean;
  supportLoadErrorMessage: string | null;
}) {
  const partialDataIssueCount = [
    billingLoadError,
    guidanceLoadError,
    learningLoadError,
    quizLoadError,
    examLoadError,
    labLoadError,
    cliLoadError,
    supportLoadError,
    schedulingLoadError,
    notificationLoadError,
    deliveryLoadError,
    communityLoadError
  ].filter(Boolean).length;
  const hasPartialDataIssue = partialDataIssueCount > 0;
  const showTechnicalErrorCards = false;

  return (
    <section className="space-y-10">
      <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(8,145,178,0.9))] px-6 py-10 text-white shadow-soft lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-50">
          Dashboard
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-200">
          Signed in as <span className="font-semibold text-white">{user.email}</span>.
          Your CCNA learning progress and course activity are now tracked here.
        </p>
      </div>

      {hasPartialDataIssue ? (
        <Card className="border-amber-200 bg-amber-50">
          <h2 className="font-display text-2xl font-semibold text-amber-950">
            Some dashboard sections are temporarily unavailable
          </h2>
          <p className="mt-2 text-base text-amber-950">
            {partialDataIssueCount === 1
              ? "One section could not be loaded right now."
              : `${partialDataIssueCount} sections could not be loaded right now.`}{" "}
            Your account is still available, and the rest of the dashboard can continue to work
            normally.
          </p>
        </Card>
      ) : null}

      {showTechnicalErrorCards && billingLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Billing Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the Phase 8 billing migration and seed SQL in Supabase, then refresh the
            page.
          </p>
          {billingLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {billingLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {!billingLoadError && billingSnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Billing
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                {billingSnapshot.currentPlanName}
              </h2>
              <p className="text-base text-slate">
                Subscription status: {billingSnapshot.subscriptionStatus}
              </p>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Plan</p>
                <p className="font-semibold text-ink">{billingSnapshot.currentPlanName}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Status</p>
                <p className="font-semibold text-ink">{billingSnapshot.subscriptionStatus}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Renewal / End</p>
                <p className="font-semibold text-ink">
                  {billingSnapshot.currentPeriodEnd
                    ? new Date(billingSnapshot.currentPeriodEnd).toLocaleDateString()
                    : "No renewal date"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                href={APP_ROUTES.billing}
              >
                Manage Billing
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                href={APP_ROUTES.pricing}
              >
                Compare Plans
              </Link>
            </div>
          </Card>

          <Card className="space-y-4 border-ink/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Access Control
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Locked Features
              </h2>
            </div>

            {billingSnapshot.lockedFeatures.length > 0 ? (
              <>
                <p className="text-base text-slate">
                  Some premium areas are still locked on your current plan.
                </p>
                <div className="grid gap-3">
                  {billingSnapshot.lockedFeatures.map((feature) => {
                    const lockedFeature = buildLockedFeatureModel(feature.feature);

                    return (
                      <div
                        className="rounded-2xl bg-pearl px-4 py-4 text-sm text-ink"
                        key={feature.feature}
                      >
                        <p className="font-semibold">{lockedFeature.title}</p>
                        <p className="mt-1 text-slate">{lockedFeature.description}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                All currently available features on your plan are unlocked.
              </div>
            )}
          </Card>
        </div>
      ) : null}

      {showTechnicalErrorCards && guidanceLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Guidance Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the Phase 9 guidance migration in Supabase, then refresh the page.
          </p>
          {guidanceLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {guidanceLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {!guidanceLoadError && guidanceSnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                Remediation
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Guidance Snapshot
              </h2>
            </div>

            {guidanceSnapshot.weakAreaSummary ? (
              <div className="rounded-2xl bg-amber-50 px-4 py-4 text-amber-900">
                <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Weak Area Summary
                </p>
                <p className="mt-2 font-semibold">{guidanceSnapshot.weakAreaSummary.title}</p>
                <p className="mt-1 text-sm">{guidanceSnapshot.weakAreaSummary.summary}</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-emerald-900">
                No weak-area alerts yet. Generate recommendations after more activity.
              </div>
            )}

            {guidanceSnapshot.topRecommendation ? (
              <div className="rounded-2xl bg-pearl px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                  Top Recommendation
                </p>
                <p className="mt-2 font-semibold text-ink">
                  {guidanceSnapshot.topRecommendation.title}
                </p>
                <p className="mt-1 text-sm text-slate">
                  {guidanceSnapshot.topRecommendation.description}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                href={APP_ROUTES.recommendations}
              >
                Open Recommendations
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                href={APP_ROUTES.studyPlan}
              >
                Open Study Plan
              </Link>
            </div>
          </Card>

          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                Next Action
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Planned Progress
              </h2>
            </div>

            {guidanceSnapshot.activeStudyPlan ? (
              <div className="space-y-3 rounded-2xl bg-pearl px-4 py-4">
                <p className="font-semibold text-ink">{guidanceSnapshot.activeStudyPlan.title}</p>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(8,145,178,0.95),rgba(14,116,144,0.85))]"
                    style={{
                      width: `${guidanceSnapshot.activeStudyPlan.progressPercentage}%`
                    }}
                  />
                </div>
                <p className="text-sm text-slate">
                  {guidanceSnapshot.activeStudyPlan.completedItems} of{" "}
                  {guidanceSnapshot.activeStudyPlan.totalItems} completed
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                No active study plan yet.
              </div>
            )}

            {guidanceSnapshot.nextRecommendedAction ? (
              <Link
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                href={guidanceSnapshot.nextRecommendedAction.href}
              >
                {guidanceSnapshot.nextRecommendedAction.label}
              </Link>
            ) : (
              <p className="text-sm text-slate">
                Generate recommendations to get a concrete next action.
              </p>
            )}
          </Card>
        </div>
      ) : null}

      {showTechnicalErrorCards && learningLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Learning Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check Phase 2 migration and seed SQL in Supabase, then refresh the page.
          </p>
          {learningLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {learningLoadErrorMessage}
            </p>
          ) : null}
          <Link
            className="mt-4 inline-flex rounded-full border border-rose-700 px-5 py-2.5 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
            href={APP_ROUTES.courses}
          >
            Open Courses
          </Link>
        </Card>
      ) : null}

      {showTechnicalErrorCards && quizLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Quiz Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the Phase 3 quiz migration and seed SQL in Supabase, then refresh the page.
          </p>
          {quizLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {quizLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {showTechnicalErrorCards && examLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Exam Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the Phase 4 exam migration and seed SQL in Supabase, then refresh the
            page.
          </p>
          {examLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {examLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {showTechnicalErrorCards && labLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Lab Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the Phase 5 lab migration and seed SQL in Supabase, then refresh the page.
          </p>
          {labLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {labLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {showTechnicalErrorCards && cliLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            CLI Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the Phase 6 CLI migration and seed SQL in Supabase, then refresh the page.
          </p>
          {cliLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {cliLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {showTechnicalErrorCards && supportLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Support Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the Phase 7 tutor support migration and seed SQL in Supabase, then
            refresh the page.
          </p>
          {supportLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {supportLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {showTechnicalErrorCards && schedulingLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Scheduling Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the Phase 11 tutor scheduling migration in Supabase, then refresh the
            page.
          </p>
          {schedulingLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {schedulingLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {showTechnicalErrorCards && notificationLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Notification Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the Phase 12 notification migration in Supabase, then refresh the page.
          </p>
          {notificationLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {notificationLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {showTechnicalErrorCards && deliveryLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Delivery Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the Phase 14 automation and preferences migration in Supabase, then refresh the
            page.
          </p>
          {deliveryLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {deliveryLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {showTechnicalErrorCards && communityLoadError ? (
        <Card className="border-rose-200 bg-rose-50">
          <h2 className="font-display text-2xl font-semibold text-rose-900">
            Community Data Could Not Be Loaded
          </h2>
          <p className="mt-2 text-base text-rose-900">
            Check the community migration in Supabase, then refresh the page.
          </p>
          {communityLoadErrorMessage ? (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-rose-900">
              {communityLoadErrorMessage}
            </p>
          ) : null}
        </Card>
      ) : null}

      {!learningLoadError && learningSnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Card className="space-y-6 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                Active Course
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                {learningSnapshot.courseTitle}
              </h2>
              <p className="text-base text-slate">
                Certification: {learningSnapshot.certificationName}
              </p>
            </div>

            <ProgressIndicator
              completed={learningSnapshot.completedLessons}
              percentage={learningSnapshot.progressPercentage}
              total={learningSnapshot.totalLessons}
            />

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Modules</p>
                <p className="font-semibold text-ink">{learningSnapshot.totalModules}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Lessons</p>
                <p className="font-semibold text-ink">{learningSnapshot.totalLessons}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Completed</p>
                <p className="font-semibold text-ink">
                  {learningSnapshot.completedLessons}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-cyan/5 px-4 py-4 text-sm text-ink">
              <p className="font-semibold text-cyan">
                {learningSnapshot.continueLesson
                  ? "Recommended next lesson"
                  : "Course review path"}
              </p>
              <p className="mt-2">
                {learningSnapshot.continueLesson?.title ??
                  "All lessons are complete. Revisit the course map anytime."}
              </p>
              {learningSnapshot.continueLesson?.summary ? (
                <p className="mt-1 text-slate">{learningSnapshot.continueLesson.summary}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                href={
                  learningSnapshot.continueLesson
                    ? `/courses/${learningSnapshot.continueLesson.courseSlug}/${learningSnapshot.continueLesson.moduleSlug}/${learningSnapshot.continueLesson.lessonSlug}`
                    : `/courses/${learningSnapshot.courseSlug}`
                }
              >
                {learningSnapshot.continueLesson ? "Resume Lesson" : "Open Course"}
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                href={`/courses/${learningSnapshot.courseSlug}`}
              >
                View Course Map
              </Link>
            </div>
          </Card>

          <Card className="space-y-4 border-ink/5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              Learning Actions
            </p>
            <h3 className="font-display text-2xl font-semibold text-ink">
              Course Navigation
            </h3>
            <p className="text-base text-slate">
              Open the course catalog, review module structure, and continue lesson-by-lesson
              completion tracking.
            </p>
            <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-ink">
              <p className="text-slate">Estimated study time</p>
              <p className="mt-1 font-semibold">
                {learningSnapshot.estimatedMinutesTotal} minutes across the current course
              </p>
            </div>
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.courses}
            >
              View All Courses
            </Link>
          </Card>
        </div>
      ) : !learningLoadError ? (
        <Card className="border-amber-200 bg-amber-50">
          <h2 className="font-display text-2xl font-semibold text-amber-900">
            No Published Course Found
          </h2>
          <p className="mt-2 text-base text-amber-900">
            Course data is not available yet. Run the Phase 2 migration and seed scripts in
            Supabase to load the CCNA starter content.
          </p>
          <Link
            className="mt-4 inline-flex rounded-full border border-amber-700 px-5 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            href={APP_ROUTES.courses}
          >
            Open Courses
          </Link>
        </Card>
      ) : null}

      {!quizLoadError && quizSnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                Quiz Performance
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Practice Metrics
              </h2>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Taken</p>
                <p className="font-semibold text-ink">{quizSnapshot.attemptsTaken}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Average</p>
                <p className="font-semibold text-ink">
                  {quizSnapshot.averageScore !== null
                    ? `${quizSnapshot.averageScore}%`
                    : "N/A"}
                </p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Latest</p>
                <p className="font-semibold text-ink">
                  {quizSnapshot.latestResult
                    ? `${quizSnapshot.latestResult.score}%`
                    : "Not taken"}
                </p>
              </div>
            </div>

            {quizSnapshot.weakPerformance ? (
              <div className="rounded-2xl bg-amber-50 px-4 py-4 text-amber-900">
                <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Weak Performance Indicator
                </p>
                <p className="mt-2 text-base">
                  {quizSnapshot.weakPerformance.quizTitle}:{" "}
                  {quizSnapshot.weakPerformance.score}% (
                  {quizSnapshot.weakPerformance.label})
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-emerald-900">
                <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                  Performance Status
                </p>
                <p className="mt-2 text-base">
                  No weak quiz attempts detected in current history.
                </p>
              </div>
            )}

            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.quizzes}
            >
              Open Quizzes
            </Link>
          </Card>

          <QuizHistoryList
            attempts={quizSnapshot.latestResult ? [quizSnapshot.latestResult] : []}
            title="Latest Quiz Result"
          />
        </div>
      ) : null}

      {!examLoadError && examSnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                Exam Simulator
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Timed Exam Metrics
              </h2>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Taken</p>
                <p className="font-semibold text-ink">{examSnapshot.attemptsTaken}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Average</p>
                <p className="font-semibold text-ink">
                  {examSnapshot.averageScore !== null
                    ? `${examSnapshot.averageScore}%`
                    : "N/A"}
                </p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Latest</p>
                <p className="font-semibold text-ink">
                  {examSnapshot.latestScore !== null
                    ? `${examSnapshot.latestScore}%`
                    : "Not taken"}
                </p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Best</p>
                <p className="font-semibold text-ink">
                  {examSnapshot.bestScore !== null ? `${examSnapshot.bestScore}%` : "N/A"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
              <p className="font-semibold text-ink">Last Attempt</p>
              <p className="mt-1">
                {examSnapshot.lastAttemptAt
                  ? new Date(examSnapshot.lastAttemptAt).toLocaleString()
                  : "No exam attempts yet"}
              </p>
            </div>

            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.examSimulator}
            >
              Open Exam Simulator
            </Link>
          </Card>

          <ExamHistoryList attempts={examSnapshot.recentAttempts} title="Latest Exam Results" />
        </div>
      ) : null}

      {!labLoadError && labSnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                Packet Tracer Labs
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Hands-On Metrics
              </h2>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Available</p>
                <p className="font-semibold text-ink">{labSnapshot.totalLabsAvailable}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Started</p>
                <p className="font-semibold text-ink">{labSnapshot.labsStarted}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Completed</p>
                <p className="font-semibold text-ink">{labSnapshot.labsCompleted}</p>
              </div>
            </div>

            {labSnapshot.latestActivity ? (
              <div className="rounded-2xl bg-pearl px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                  Latest Lab Activity
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-ink">{labSnapshot.latestActivity.title}</p>
                  <LabStatusBadge status={labSnapshot.latestActivity.status} />
                </div>
                <p className="mt-2 text-sm text-slate">
                  {new Date(labSnapshot.latestActivity.updatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                No lab activity yet. Open a lab to start tracking hands-on progress.
              </div>
            )}

            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.labs}
            >
              Open Labs
            </Link>
          </Card>

          <Card className="space-y-4 border-ink/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Storage Preparation
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Download Readiness
              </h2>
            </div>
            <p className="text-base text-slate">
              Lab metadata now points to the private Supabase Storage bucket for Packet
              Tracer and guide assets. Placeholder file records remain safe until real
              uploads are added.
            </p>
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.labs}
            >
              Review Lab Files
            </Link>
          </Card>
        </div>
      ) : null}

      {!cliLoadError && cliSnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                CLI Practice
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Terminal Metrics
              </h2>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Available</p>
                <p className="font-semibold text-ink">{cliSnapshot.totalChallengesAvailable}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Started</p>
                <p className="font-semibold text-ink">{cliSnapshot.challengesStarted}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Completed</p>
                <p className="font-semibold text-ink">{cliSnapshot.challengesCompleted}</p>
              </div>
            </div>

            {cliSnapshot.latestActivity ? (
              <div className="rounded-2xl bg-pearl px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                  Latest CLI Activity
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-ink">{cliSnapshot.latestActivity.title}</p>
                  <LabStatusBadge status={cliSnapshot.latestActivity.status} />
                </div>
                <p className="mt-2 text-sm text-slate">
                  {new Date(cliSnapshot.latestActivity.updatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                No CLI activity yet. Launch a terminal challenge to begin guided command
                practice.
              </div>
            )}

            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.cliPractice}
            >
              Open CLI Practice
            </Link>
          </Card>

          <Card className="space-y-4 border-ink/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Practice Design
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Guided Simulation
              </h2>
            </div>
            <p className="text-base text-slate">
              CLI practice is intentionally guided. Commands are validated step by step with
              hints and immediate feedback, without pretending to be a full device
              emulator.
            </p>
            <div className="flex flex-wrap gap-2">
              <LabDifficultyBadge difficulty="beginner" />
              <LabDifficultyBadge difficulty="intermediate" />
              <LabDifficultyBadge difficulty="advanced" />
            </div>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-5 border-ink/5">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
              Subnetting Practice
            </p>
            <h2 className="font-display text-3xl font-semibold text-ink">
              Build Confidence Faster
            </h2>
            <p className="text-base text-slate">
              Move between scored subnetting drills and a visual explanation tool without
              leaving the practice section.
            </p>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-pearl px-4 py-4">
              <p className="text-slate">Interactive Trainer</p>
              <p className="mt-1 text-ink">
                Practice network, broadcast, host range, and usable host calculations.
              </p>
            </div>
            <div className="rounded-2xl bg-pearl px-4 py-4">
              <p className="text-slate">Visual Calculator</p>
              <p className="mt-1 text-ink">
                See binary bits, subnet masks, block sizes, and containing subnet ranges.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
              href={APP_ROUTES.subnettingPractice}
            >
              Open Trainer
            </Link>
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.subnettingCalculator}
            >
              Open Calculator
            </Link>
            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.aiTutor}
            >
              Ask AI Tutor
            </Link>
          </div>
        </Card>

        <Card className="space-y-4 border-ink/5">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              When to Use Which
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Practice Flow
            </h2>
          </div>
          <div className="space-y-3 text-sm text-slate">
            <p className="rounded-2xl bg-pearl px-4 py-4">
              Start in the visual calculator if subnet masks and block sizes still feel abstract.
            </p>
            <p className="rounded-2xl bg-pearl px-4 py-4">
              Move to the trainer once you can explain why an address belongs to a subnet block.
            </p>
            <p className="rounded-2xl bg-pearl px-4 py-4">
              Return to the calculator whenever a wrong trainer answer shows a pattern you want to understand visually.
            </p>
          </div>
        </Card>
      </div>

      {!communityLoadError && communitySnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                Community
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Learn With Other Students
              </h2>
              <p className="text-base text-slate">
                Ask questions, compare approaches, and keep tough CCNA topics moving with peer discussion.
              </p>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Total Posts</p>
                <p className="font-semibold text-ink">{communitySnapshot.totalPosts}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Your Posts</p>
                <p className="font-semibold text-ink">{communitySnapshot.yourPostsCount}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Your Replies</p>
                <p className="font-semibold text-ink">{communitySnapshot.yourRepliesCount}</p>
              </div>
            </div>

            {communitySnapshot.latestPost ? (
              <div className="rounded-2xl bg-pearl px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                  Latest Community Activity
                </p>
                <p className="mt-2 font-semibold text-ink">
                  {communitySnapshot.latestPost.subject}
                </p>
                <p className="mt-1 text-sm text-slate">
                  {communitySnapshot.latestPost.replyCount}{" "}
                  {communitySnapshot.latestPost.replyCount === 1 ? "reply" : "replies"} · Updated{" "}
                  {new Date(communitySnapshot.latestPost.updatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                No community activity yet. Start the first discussion from the dashboard or from any lesson page.
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                href={APP_ROUTES.community}
              >
                Open Community
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                href={APP_ROUTES.aiTutor}
              >
                Ask AI Tutor
              </Link>
            </div>
          </Card>

          <Card className="space-y-4 border-ink/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Best Use Cases
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                When Community Helps Most
              </h2>
            </div>
            <div className="space-y-3 text-sm text-slate">
              <p className="rounded-2xl bg-pearl px-4 py-4">
                Use the community when you want multiple explanations for the same concept instead of a single answer.
              </p>
              <p className="rounded-2xl bg-pearl px-4 py-4">
                Post after a quiz, lab, or lesson if you understand the definition but still need practical examples.
              </p>
              <p className="rounded-2xl bg-pearl px-4 py-4">
                Keep using the AI Tutor for immediate clarification, then bring the topic here if you want peer study discussion.
              </p>
            </div>
          </Card>
        </div>
      ) : null}

      {!supportLoadError && supportSnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                Tutor Support
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Support Metrics
              </h2>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Open Requests</p>
                <p className="font-semibold text-ink">{supportSnapshot.openRequests}</p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Resolved</p>
                <p className="font-semibold text-ink">{supportSnapshot.resolvedRequests}</p>
              </div>
            </div>

            {supportSnapshot.latestActivity ? (
              <div className="rounded-2xl bg-pearl px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                  Latest Support Activity
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-ink">
                    {supportSnapshot.latestActivity.subject}
                  </p>
                  <SupportStatusBadge status={supportSnapshot.latestActivity.status} />
                </div>
                <p className="mt-2 text-sm text-slate">
                  {new Date(supportSnapshot.latestActivity.updatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                No support activity yet. Use tutor help from any lesson, quiz result, lab,
                exam result, or CLI challenge.
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                href={APP_ROUTES.support}
              >
                Open Support
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                href={APP_ROUTES.tutors}
              >
                View Tutors
              </Link>
            </div>
          </Card>

          <Card className="space-y-4 border-ink/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Tutor Snapshot
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Queue Readiness
              </h2>
            </div>
            {supportSnapshot.tutorProfile && supportSnapshot.tutorMetrics ? (
              <>
                <p className="text-base text-slate">
                  Tutor mode is active for {supportSnapshot.tutorProfile.displayName}.
                </p>
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-2xl bg-pearl px-4 py-3">
                    <p className="text-slate">Assigned Open</p>
                    <p className="font-semibold text-ink">
                      {supportSnapshot.tutorMetrics.assignedOpenRequests}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-pearl px-4 py-3">
                    <p className="text-slate">Resolved</p>
                    <p className="font-semibold text-ink">
                      {supportSnapshot.tutorMetrics.resolvedRequests}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-pearl px-4 py-3">
                    <p className="text-slate">Unassigned Open</p>
                    <p className="font-semibold text-ink">
                      {supportSnapshot.tutorMetrics.unassignedOpenRequests}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-base text-slate">
                Tutor metrics appear automatically when the signed-in user has an active tutor
                profile in Supabase.
              </p>
            )}
          </Card>
        </div>
      ) : null}

      {!notificationLoadError && notificationSnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                Notifications
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Alert Center
              </h2>
            </div>

            <div className="rounded-2xl bg-pearl px-4 py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Unread Count
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {notificationSnapshot.unreadCount}
              </p>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Queued Reminders</p>
                <p className="font-semibold text-ink">
                  {notificationSnapshot.pendingReminderCount}
                </p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Pending Email Sends</p>
                <p className="font-semibold text-ink">
                  {deliverySnapshot?.pendingDeliveryCount ?? 0}
                </p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3 sm:col-span-2">
                <p className="text-slate">Failed Email Sends</p>
                <p className="font-semibold text-ink">
                  {deliverySnapshot?.failedDeliveryCount ?? 0}
                </p>
              </div>
            </div>

            {notificationSnapshot.latestSessionUpdate ? (
              <div className="rounded-2xl bg-pearl px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                  Latest Session Update
                </p>
                <p className="mt-2 font-semibold text-ink">
                  {notificationSnapshot.latestSessionUpdate.title}
                </p>
                <p className="mt-1 text-sm text-slate">
                  {notificationSnapshot.latestSessionUpdate.message}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                No session notifications yet.
              </div>
            )}

            <Link
              className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
              href={APP_ROUTES.notifications}
            >
              Open Notifications
            </Link>
          </Card>

          <Card className="space-y-4 border-ink/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Learner Follow-Up
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Latest Tutor Guidance
              </h2>
            </div>
            {schedulingSnapshot?.latestFollowup ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-emerald-950">
                <p className="font-semibold">{schedulingSnapshot.latestFollowup.subject}</p>
                <p className="mt-2 text-sm">{schedulingSnapshot.latestFollowup.summary}</p>
                <p className="mt-2 text-xs text-emerald-800">
                  Added {new Date(schedulingSnapshot.latestFollowup.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-base text-slate">
                Completed tutor sessions with saved follow-ups will surface here.
              </p>
            )}

            {deliverySnapshot?.latestDelivery ? (
              <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                  Latest Email Delivery
                </p>
                <p className="mt-2 font-semibold text-ink">
                  {deliverySnapshot.latestDelivery.status.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-xs">
                  Retry {deliverySnapshot.latestDelivery.retryCount} of{" "}
                  {deliverySnapshot.latestDelivery.maxRetries}
                </p>
                <p className="mt-1 text-xs">
                  {new Date(deliverySnapshot.latestDelivery.createdAt).toLocaleString()}
                </p>
              </div>
            ) : null}
          </Card>
        </div>
      ) : null}

      {!schedulingLoadError && schedulingSnapshot ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-5 border-ink/5">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
                Live Help
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Session Snapshot
              </h2>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Upcoming Sessions</p>
                <p className="font-semibold text-ink">
                  {schedulingSnapshot.upcomingSessions}
                </p>
              </div>
              <div className="rounded-2xl bg-pearl px-4 py-3">
                <p className="text-slate">Past Sessions</p>
                <p className="font-semibold text-ink">{schedulingSnapshot.pastSessions}</p>
              </div>
            </div>

            {schedulingSnapshot.nextSession ? (
              <div className="rounded-2xl bg-pearl px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                  Next Live Session
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-ink">
                    {schedulingSnapshot.nextSession.subject}
                  </p>
                  <SessionStatusBadge status={schedulingSnapshot.nextSession.status} />
                </div>
                <p className="mt-2 text-sm text-slate">
                  {new Date(
                    schedulingSnapshot.nextSession.scheduledStartsAt
                  ).toLocaleString()}{" "}
                  with {schedulingSnapshot.nextSession.tutorDisplayName}
                </p>
                {schedulingSnapshot.nextSession.meetingLink ? (
                  <Link
                    className="mt-4 inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                    href={schedulingSnapshot.nextSession.meetingLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Join Meeting
                  </Link>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl bg-pearl px-4 py-4 text-sm text-slate">
                No live tutor sessions scheduled yet.
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
                href={APP_ROUTES.sessions}
              >
                Open Sessions
              </Link>
              <Link
                className="inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
                href={APP_ROUTES.bookSession}
              >
                Book Live Help
              </Link>
            </div>
          </Card>

          <Card className="space-y-4 border-ink/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Tutor Metrics
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Scheduling Throughput
              </h2>
            </div>
            {schedulingSnapshot.tutorMetrics ? (
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-pearl px-4 py-3">
                  <p className="text-slate">Upcoming Booked</p>
                  <p className="font-semibold text-ink">
                    {schedulingSnapshot.tutorMetrics.upcomingBookedSessions}
                  </p>
                </div>
                <div className="rounded-2xl bg-pearl px-4 py-3">
                  <p className="text-slate">Pending Requests</p>
                  <p className="font-semibold text-ink">
                    {schedulingSnapshot.tutorMetrics.pendingRequests}
                  </p>
                </div>
                <div className="rounded-2xl bg-pearl px-4 py-3">
                  <p className="text-slate">Completed</p>
                  <p className="font-semibold text-ink">
                    {schedulingSnapshot.tutorMetrics.completedSessions}
                  </p>
                </div>
                <div className="rounded-2xl bg-pearl px-4 py-3">
                  <p className="text-slate">Today</p>
                  <p className="font-semibold text-ink">
                    {schedulingSnapshot.tutorMetrics.todaySessions}
                  </p>
                </div>
                <div className="rounded-2xl bg-pearl px-4 py-3">
                  <p className="text-slate">Need Follow-Up</p>
                  <p className="font-semibold text-ink">
                    {schedulingSnapshot.tutorMetrics.sessionsNeedingFollowup}
                  </p>
                </div>
                <div className="rounded-2xl bg-pearl px-4 py-3">
                  <p className="text-slate">Overdue Follow-Ups</p>
                  <p className="font-semibold text-ink">
                    {schedulingSnapshot.tutorMetrics.overdueFollowups}
                  </p>
                </div>
                <div className="rounded-2xl bg-pearl px-4 py-3">
                  <p className="text-slate">Recent Booking Activity</p>
                  <p className="font-semibold text-ink">
                    {schedulingSnapshot.tutorMetrics.recentBookingActivity}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-base text-slate">
                Tutor scheduling metrics appear automatically when the signed-in user has an
                active tutor role and profile.
              </p>
            )}
          </Card>
        </div>
      ) : null}
    </section>
  );
}

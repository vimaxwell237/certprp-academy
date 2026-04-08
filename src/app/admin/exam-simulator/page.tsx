import Link from "next/link";

import { Card } from "@/components/ui/card";
import { saveQuizQuestionAction } from "@/features/admin/actions/admin-actions";
import { AdminDataTable } from "@/features/admin/components/admin-data-table";
import { AdminQuizQuestionForm } from "@/features/admin/components/admin-quiz-question-form";
import { AdminSectionHeader } from "@/features/admin/components/admin-section-header";
import { AdminStatusBadge } from "@/features/admin/components/admin-status-badge";
import {
  fetchAdminQuizQuestionBank,
  fetchAdminQuizzes
} from "@/features/admin/data/admin-service";
import {
  formatDragDropItemLines,
  getQuestionTypeLabel
} from "@/lib/questions/drag-drop";
import { APP_ROUTES } from "@/lib/auth/redirects";

function truncateText(value: string, maxLength = 140) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

export default async function AdminExamSimulatorPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const requestedQuizId =
    typeof resolvedSearchParams.quiz === "string" ? resolvedSearchParams.quiz : undefined;
  const requestedQuestionId =
    typeof resolvedSearchParams.question === "string"
      ? resolvedSearchParams.question
      : undefined;
  const requestedCreatedQuestionId =
    typeof resolvedSearchParams.created === "string"
      ? resolvedSearchParams.created
      : undefined;

  const quizzes = await fetchAdminQuizzes();
  const activeQuizId =
    requestedQuizId && quizzes.some((quiz) => quiz.id === requestedQuizId)
      ? requestedQuizId
      : quizzes[0]?.id;
  const questionBank = activeQuizId
    ? await fetchAdminQuizQuestionBank(activeQuizId)
    : null;
  const editingQuestion =
    requestedQuestionId && questionBank
      ? questionBank.questions.find((question) => question.id === requestedQuestionId) ?? null
      : null;
  const nextOrderIndex =
    (questionBank?.questions.reduce(
      (highest, question) => Math.max(highest, question.orderIndex),
      0
    ) ?? 0) + 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <AdminSectionHeader
          description="Manage the timed exam question bank. Question banks are still organized under quiz shells, but questions created here can stay exam-only so they do not appear on the regular learner quiz pages."
          eyebrow="Assessment"
          title="Exam Simulator Admin"
        />
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
            href={APP_ROUTES.adminQuizzes}
          >
            Manage Quiz Shells
          </Link>
          <Link
            className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
            href={APP_ROUTES.examSimulator}
          >
            Preview Learner Simulator
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <AdminDataTable
          columns={[
            {
              header: "Quiz",
              cell: (record) => (
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{record.title}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate">{record.slug}</p>
                  <p className="max-w-md text-sm text-slate">{record.contextLabel}</p>
                </div>
              )
            },
                {
                  header: "Questions",
                  cell: (record) => (
                    <span className="font-semibold text-ink">{record.questionCount}</span>
                  ),
              className: "w-24"
            },
            {
              header: "State",
              cell: (record) => (
                <AdminStatusBadge status={record.isPublished ? "published" : "draft"} />
              ),
              className: "w-32"
            },
            {
              header: "Manage",
              cell: (record) => (
                <Link
                  className="font-semibold text-cyan hover:text-teal"
                  href={`${APP_ROUTES.adminExamSimulator}?quiz=${record.id}`}
                >
                  {record.id === activeQuizId ? "Open" : "Manage"}
                </Link>
              ),
              className: "w-24"
            }
          ]}
          emptyMessage="Create a quiz first, then come back here to add exam simulator questions."
          getKey={(record) => record.id}
          items={quizzes}
          title="Quiz Question Banks"
        />

        {questionBank ? (
          <div className="space-y-6">
            <Card className="border-ink/5">
              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
                      Active Quiz
                    </p>
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      {questionBank.quiz.title}
                    </h2>
                    <p className="text-sm text-slate">{questionBank.quiz.contextLabel}</p>
                  </div>
                  <AdminStatusBadge
                    status={questionBank.quiz.isPublished ? "published" : "draft"}
                  />
                </div>

                <div className="rounded-2xl border border-dashed border-ink/10 bg-pearl px-4 py-3 text-sm text-slate">
                  Questions added here feed the timed learner exam simulator. New questions default
                  to exam-only, and you can turn quiz visibility back on if you want to share the
                  same item with the regular learner quiz flow.
                </div>

                {!questionBank.quiz.isPublished ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    This quiz shell is still in draft. Its questions will not appear in the learner
                    exam simulator until the quiz is published from Manage Quiz Shells.
                  </div>
                ) : null}

                {requestedCreatedQuestionId ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    Question saved to the bank. The form has been reset so the next save creates a
                    new question instead of overwriting the last one.
                  </div>
                ) : null}
              </div>
            </Card>

            <AdminDataTable
              columns={[
                {
                  header: "Order",
                  cell: (record) => (
                    <span className="font-semibold text-ink">{record.orderIndex}</span>
                  ),
                  className: "w-20"
                },
                {
                  header: "Question",
                  cell: (record) => (
                    <div className="space-y-1">
                      <p className="font-semibold text-ink">{truncateText(record.questionText)}</p>
                      <p className="text-sm text-slate">
                        {record.questionType === "drag_drop_categorize"
                          ? `${record.options.length} draggable item${
                              record.options.length === 1 ? "" : "s"
                            } across ${
                              record.interactionConfig?.buckets.length ?? 0
                            } bucket${
                              (record.interactionConfig?.buckets.length ?? 0) === 1 ? "" : "s"
                            }`
                          : `${record.options.length} choices`}
                        {record.explanation ? " with explanation" : ""}
                        {(() => {
                          const imageCount = [
                            record.questionImageUrl,
                            record.questionImageSecondaryUrl
                          ].filter(Boolean).length;

                          if (imageCount === 0) {
                            return "";
                          }

                          return ` and ${imageCount} image${imageCount === 1 ? "" : "s"}`;
                        })()}
                      </p>
                    </div>
                  )
                },
                {
                  header: "Type",
                  cell: (record) => (
                    <span className="text-sm font-semibold text-ink">
                      {getQuestionTypeLabel(record.questionType)}
                    </span>
                  ),
                  className: "w-32"
                },
                {
                  header: "Difficulty",
                  cell: (record) => (
                    <span className="capitalize text-ink">{record.difficulty}</span>
                  ),
                  className: "w-28"
                },
                {
                  header: "Use",
                  cell: (record) => (
                    <span className="text-sm font-semibold text-ink">
                      {record.showInQuiz ? "Quiz + Exam" : "Exam Only"}
                    </span>
                  ),
                  className: "w-32"
                },
                {
                  header: "Edit",
                  cell: (record) => (
                    <Link
                      className="font-semibold text-cyan hover:text-teal"
                      href={`${APP_ROUTES.adminExamSimulator}?quiz=${questionBank.quiz.id}&question=${record.id}`}
                    >
                      Edit
                    </Link>
                  ),
                  className: "w-20"
                }
              ]}
              emptyMessage="This quiz does not have any questions yet."
              getKey={(record) => record.id}
              items={questionBank.questions}
              title="Question List"
            />

            <AdminQuizQuestionForm
              action={saveQuizQuestionAction}
              initialValues={
                editingQuestion
                  ? {
                      questionText: editingQuestion.questionText,
                      explanation: editingQuestion.explanation,
                      difficulty: editingQuestion.difficulty,
                      orderIndex: editingQuestion.orderIndex,
                      questionType: editingQuestion.questionType,
                      showInQuiz: editingQuestion.showInQuiz,
                      dragDropBucketLines:
                        editingQuestion.interactionConfig?.buckets
                          .map((bucket) => bucket.label)
                          .join("\n") ?? "",
                      dragDropItemLines: formatDragDropItemLines(
                        editingQuestion.options,
                        editingQuestion.interactionConfig
                      ),
                      questionImageUrl: editingQuestion.questionImageUrl,
                      questionImageAlt: editingQuestion.questionImageAlt,
                      questionImageSecondaryUrl: editingQuestion.questionImageSecondaryUrl,
                      questionImageSecondaryAlt: editingQuestion.questionImageSecondaryAlt,
                      choiceOptions: editingQuestion.options.map((option) => ({
                        optionText: option.optionText,
                        isCorrect: option.isCorrect
                      }))
                    }
                  : {
                      questionText: "",
                      explanation: "",
                      difficulty: "medium" as const,
                      orderIndex: nextOrderIndex,
                      questionType: "single_choice" as const,
                      showInQuiz: false,
                      dragDropBucketLines: "FTP\nTFTP",
                      dragDropItemLines:
                        "Uses ports 20 and 21 | FTP\nUses UDP protocol | TFTP",
                      questionImageUrl: null,
                      questionImageAlt: "",
                      questionImageSecondaryUrl: null,
                      questionImageSecondaryAlt: "",
                      choiceOptions: [
                        { optionText: "", isCorrect: true },
                        { optionText: "", isCorrect: false },
                        { optionText: "", isCorrect: false },
                        { optionText: "", isCorrect: false }
                      ]
                    }
              }
              key={
                editingQuestion?.id ??
                `new-${questionBank.quiz.id}-${requestedCreatedQuestionId ?? "draft"}`
              }
              questionCount={questionBank.questions.length}
              quizId={questionBank.quiz.id}
              recordId={editingQuestion?.id}
            />
          </div>
        ) : (
          <Card className="border-ink/5">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-ink">No Quiz Selected</h2>
              <p className="text-sm text-slate">
                Choose a quiz from the left to start adding the questions that the exam simulator
                can use.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DragDropCategorizeBoard } from "@/components/ui/drag-drop-categorize-board";
import { QuestionImageGallery } from "@/components/ui/question-image-gallery";
import {
  saveExamAnswerAction,
  saveExamFlagAction,
  saveExamNavigationAction,
  submitExamAttemptAction
} from "@/features/exams/actions/exam-attempt-actions";
import { formatSecondsLabel } from "@/features/exams/lib/exam-engine";
import {
  getQuestionTypeLabel,
  isDragDropAnswerComplete,
  setDragDropPlacement
} from "@/lib/questions/drag-drop";
import { normalizeSelectedOptionIds } from "@/lib/questions/multiple-choice";
import type { ExamAttemptState } from "@/types/exam";
import type { DragDropAnswerPayload } from "@/types/questions";

function cloneDragDropAnswerPayload(
  payload: DragDropAnswerPayload | null
): DragDropAnswerPayload {
  return {
    placements: { ...(payload?.placements ?? {}) }
  };
}

export function ExamAttemptClient({ attempt }: { attempt: ExamAttemptState }) {
  const router = useRouter();
  const [questions, setQuestions] = useState(attempt.questions);
  const [dragDropUndoHistory, setDragDropUndoHistory] = useState<
    Record<string, DragDropAnswerPayload[]>
  >({});
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(attempt.currentQuestionIndex - 1, 0), attempt.questions.length - 1)
  );
  const [remainingSeconds, setRemainingSeconds] = useState(attempt.remainingSeconds);
  const [feedback, setFeedback] = useState("Session restored. Changes save as you work.");
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  function isQuestionAnswered(question: ExamAttemptState["questions"][number]) {
    if (question.questionType === "drag_drop_categorize") {
      return isDragDropAnswerComplete(
        question.options.map((option) => option.id),
        question.interactionConfig?.buckets.map((bucket) => bucket.id) ?? [],
        question.answerPayload as DragDropAnswerPayload | null
      );
    }

    if (question.questionType === "multiple_choice") {
      return question.selectedOptionIds.length > 0;
    }

    return question.selectedOptionId !== null;
  }

  const answeredCount = questions.filter((question) => isQuestionAnswered(question)).length;
  const flaggedCount = questions.filter((question) => question.flagged).length;
  const currentQuestion = questions[currentIndex];
  const canUndoDragDropMove =
    currentQuestion?.questionType === "drag_drop_categorize" &&
    (dragDropUndoHistory[currentQuestion.id]?.length ?? 0) > 0;

  useEffect(() => {
    if (remainingSeconds <= 0 || isSubmitting) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [remainingSeconds, isSubmitting]);

  useEffect(() => {
    if (remainingSeconds > 0 || hasAutoSubmitted || isSubmitting) {
      return;
    }

    setHasAutoSubmitted(true);
    setFeedback("Time expired. Submitting your exam now.");
    setIsSubmitting(true);

    startTransition(async () => {
      try {
        const result = await submitExamAttemptAction({
          attemptId: attempt.attemptId,
          examSlug: attempt.examSlug,
          reason: "timeout"
        });

        if (result.redirectPath) {
          router.push(result.redirectPath);
          return;
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Timed submission failed.");
        setIsSubmitting(false);
      }
    });
  }, [
    attempt.attemptId,
    attempt.examSlug,
    hasAutoSubmitted,
    isSubmitting,
    remainingSeconds,
    router,
    startTransition
  ]);

  function handleServerResponse(result?: { status: string; redirectPath?: string | null }) {
    if (!result) {
      return;
    }

    if (result.redirectPath) {
      router.push(result.redirectPath);
      return;
    }

    if (result.status === "saved") {
      setFeedback("Changes saved.");
    }
  }

  function goToQuestion(nextIndex: number) {
    const boundedIndex = Math.min(Math.max(nextIndex, 0), questions.length - 1);

    setCurrentIndex(boundedIndex);
    setFeedback(`Moved to question ${boundedIndex + 1}.`);

    startTransition(async () => {
      try {
        const result = await saveExamNavigationAction({
          attemptId: attempt.attemptId,
          currentQuestionIndex: boundedIndex + 1
        });

        handleServerResponse(result);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Navigation could not be saved.");
      }
    });
  }

  function handleAnswerChange(optionId: string) {
    if (!currentQuestion || currentQuestion.questionType !== "single_choice" || isSubmitting) {
      return;
    }

    setQuestions((existing) =>
      existing.map((question, index) =>
        index === currentIndex
          ? { ...question, selectedOptionId: optionId, selectedOptionIds: [optionId] }
          : question
      )
    );
    setFeedback(`Answer saved for question ${currentIndex + 1}.`);

    startTransition(async () => {
      try {
        const result = await saveExamAnswerAction({
          attemptId: attempt.attemptId,
          questionId: currentQuestion.questionId,
          selectedOptionId: optionId,
          currentQuestionIndex: currentIndex + 1
        });

        handleServerResponse(result);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Answer could not be saved.");
      }
    });
  }

  function handleMultipleChoiceToggle(optionId: string, checked: boolean) {
    if (!currentQuestion || currentQuestion.questionType !== "multiple_choice" || isSubmitting) {
      return;
    }

    const nextSelectedOptionIds = normalizeSelectedOptionIds(
      checked
        ? [...currentQuestion.selectedOptionIds, optionId]
        : currentQuestion.selectedOptionIds.filter((existingOptionId) => existingOptionId !== optionId)
    );

    setQuestions((existing) =>
      existing.map((question, index) =>
        index === currentIndex
          ? { ...question, selectedOptionId: null, selectedOptionIds: nextSelectedOptionIds }
          : question
      )
    );
    setFeedback(`Answer saved for question ${currentIndex + 1}.`);

    startTransition(async () => {
      try {
        const result = await saveExamAnswerAction({
          attemptId: attempt.attemptId,
          questionId: currentQuestion.questionId,
          selectedOptionIds: nextSelectedOptionIds,
          currentQuestionIndex: currentIndex + 1
        });

        handleServerResponse(result);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Answer could not be saved.");
      }
    });
  }

  function persistDragDropAnswer(
    questionId: string,
    nextAnswerPayload: DragDropAnswerPayload,
    optimisticMessage: string,
    failureMessage: string
  ) {
    setFeedback(optimisticMessage);

    startTransition(async () => {
      try {
        const result = await saveExamAnswerAction({
          attemptId: attempt.attemptId,
          questionId,
          answerPayload: nextAnswerPayload,
          currentQuestionIndex: currentIndex + 1
        });

        handleServerResponse(result);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : failureMessage);
      }
    });
  }

  function handleDragDropMove(itemId: string, bucketId: string | null) {
    if (
      !currentQuestion ||
      currentQuestion.questionType !== "drag_drop_categorize" ||
      isSubmitting
    ) {
      return;
    }

    const currentAnswerPayload = currentQuestion.answerPayload as DragDropAnswerPayload | null;
    const previousBucketId = currentAnswerPayload?.placements[itemId] ?? null;

    if (previousBucketId === bucketId) {
      return;
    }

    const previousAnswerPayload = cloneDragDropAnswerPayload(currentAnswerPayload);
    const nextAnswerPayload = setDragDropPlacement(previousAnswerPayload, itemId, bucketId);

    setDragDropUndoHistory((existing) => ({
      ...existing,
      [currentQuestion.id]: [...(existing[currentQuestion.id] ?? []), previousAnswerPayload]
    }));

    setQuestions((existing) =>
      existing.map((question, index) =>
        index === currentIndex ? { ...question, answerPayload: nextAnswerPayload } : question
      )
    );
    persistDragDropAnswer(
      currentQuestion.questionId,
      nextAnswerPayload,
      `Drag-and-drop placement saved for question ${currentIndex + 1}.`,
      "Drag-and-drop answer could not be saved."
    );
  }

  function handleUndoDragDropMove() {
    if (
      !currentQuestion ||
      currentQuestion.questionType !== "drag_drop_categorize" ||
      isSubmitting
    ) {
      return;
    }

    const questionHistory = dragDropUndoHistory[currentQuestion.id] ?? [];
    const previousAnswerPayload = questionHistory.at(-1);

    if (!previousAnswerPayload) {
      return;
    }

    const restoredAnswerPayload = cloneDragDropAnswerPayload(previousAnswerPayload);

    setDragDropUndoHistory((existing) => {
      const nextHistory = questionHistory.slice(0, -1);

      if (nextHistory.length === 0) {
        const { [currentQuestion.id]: _removedHistory, ...remainingHistory } = existing;
        return remainingHistory;
      }

      return {
        ...existing,
        [currentQuestion.id]: nextHistory
      };
    });

    setQuestions((existing) =>
      existing.map((question, index) =>
        index === currentIndex ? { ...question, answerPayload: restoredAnswerPayload } : question
      )
    );
    persistDragDropAnswer(
      currentQuestion.questionId,
      restoredAnswerPayload,
      `Last drag-and-drop move undone for question ${currentIndex + 1}.`,
      "Undo could not be saved."
    );
  }

  function handleFlagToggle() {
    if (!currentQuestion || isSubmitting) {
      return;
    }

    const nextFlagged = !currentQuestion.flagged;

    setQuestions((existing) =>
      existing.map((question, index) =>
        index === currentIndex ? { ...question, flagged: nextFlagged } : question
      )
    );
    setFeedback(
      nextFlagged
        ? `Question ${currentIndex + 1} flagged for review.`
        : `Question ${currentIndex + 1} unflagged.`
    );

    startTransition(async () => {
      try {
        const result = await saveExamFlagAction({
          attemptId: attempt.attemptId,
          questionId: currentQuestion.questionId,
          flagged: nextFlagged,
          currentQuestionIndex: currentIndex + 1
        });

        handleServerResponse(result);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Flag state could not be saved.");
      }
    });
  }

  function handleSubmit(reason: "manual" | "timeout") {
    if (isSubmitting) {
      return;
    }

    if (
      reason === "manual" &&
      !window.confirm(
        "Submit exam now? You will not be able to change answers after submission."
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(
      reason === "timeout"
        ? "Time expired. Submitting your exam now."
        : "Submitting your exam."
    );

    startTransition(async () => {
      try {
        const result = await submitExamAttemptAction({
          attemptId: attempt.attemptId,
          examSlug: attempt.examSlug,
          reason
        });

        if (result.redirectPath) {
          router.push(result.redirectPath);
          return;
        }

        setIsSubmitting(false);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Exam submission failed.");
        setIsSubmitting(false);
      }
    });
  }

  const timerTone =
    remainingSeconds <= 300 ? "text-rose-700" : remainingSeconds <= 900 ? "text-amber-700" : "text-cyan";
  const isDragDropQuestion = currentQuestion.questionType === "drag_drop_categorize";
  const isMultipleChoiceQuestion = currentQuestion.questionType === "multiple_choice";
  const dragDropAnswerPayload =
    currentQuestion.questionType === "drag_drop_categorize"
      ? (currentQuestion.answerPayload as DragDropAnswerPayload | null)
      : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <Card className={`${isDragDropQuestion ? "space-y-4" : "space-y-5"} border-ink/5`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
                Exam Session
              </p>
              <h1 className="font-display text-3xl font-semibold text-ink">
                {attempt.examTitle}
              </h1>
              <p className="text-base text-slate">
                {answeredCount} of {attempt.totalQuestions} answered, {flaggedCount} flagged.
              </p>
            </div>

            <div className="rounded-3xl border border-ink/5 bg-pearl px-5 py-4 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                Time Remaining
              </p>
              <p className={`font-display text-3xl font-semibold ${timerTone}`}>
                {formatSecondsLabel(remainingSeconds)}
              </p>
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-pearl">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(15,23,42,0.95),rgba(8,145,178,0.9))]"
              style={{
                width: `${Math.max(6, Math.round((answeredCount / attempt.totalQuestions) * 100))}%`
              }}
            />
          </div>

          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
            {isPending || isSubmitting ? "Syncing exam state..." : feedback}
          </div>
        </Card>

        {currentQuestion ? (
          <Card className={`${isDragDropQuestion ? "space-y-4" : "space-y-6"} border-ink/5`}>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
                  Question {currentQuestion.orderIndex}
                </span>
                <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  {currentQuestion.difficulty}
                </span>
                <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  {getQuestionTypeLabel(currentQuestion.questionType)}
                </span>
                {currentQuestion.moduleTitle ? (
                  <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                    {currentQuestion.moduleTitle}
                  </span>
                ) : null}
                {currentQuestion.flagged ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                    Flagged
                  </span>
                ) : null}
              </div>

              <h2
                className={`font-display font-semibold text-ink ${
                  isDragDropQuestion ? "text-2xl leading-tight" : "text-3xl"
                }`}
              >
                {currentQuestion.questionText}
              </h2>
            </div>

            <QuestionImageGallery
              images={[
                {
                  src: currentQuestion.questionImageUrl,
                  alt: currentQuestion.questionImageAlt || "Question reference image 1",
                  key: `${currentQuestion.id}-primary`
                },
                {
                  src: currentQuestion.questionImageSecondaryUrl,
                  alt:
                    currentQuestion.questionImageSecondaryAlt || "Question reference image 2",
                  key: `${currentQuestion.id}-secondary`
                }
              ]}
            />

            {currentQuestion.questionType === "drag_drop_categorize" ? (
              <DragDropCategorizeBoard
                buckets={currentQuestion.interactionConfig?.buckets ?? []}
                items={currentQuestion.options.map((option) => ({
                  id: option.id,
                  label: option.optionText,
                  selectedBucketId: dragDropAnswerPayload?.placements[option.id] ?? null
                }))}
                canUndo={canUndoDragDropMove}
                onMoveItem={handleDragDropMove}
                onUndoLastMove={handleUndoDragDropMove}
                variant="compact"
              />
            ) : isMultipleChoiceQuestion ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.selectedOptionIds.includes(option.id);

                  return (
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${
                        isSelected
                          ? "border-cyan/60 bg-cyan/5"
                          : "border-ink/10 bg-pearl hover:border-cyan/40 hover:bg-white"
                      }`}
                      key={option.id}
                    >
                      <input
                        checked={isSelected}
                        className="mt-1 h-4 w-4 rounded accent-cyan"
                        disabled={isSubmitting}
                        name={`question-${currentQuestion.questionId}-${option.id}`}
                        onChange={(event) =>
                          handleMultipleChoiceToggle(option.id, event.target.checked)
                        }
                        type="checkbox"
                      />
                      <span className="text-base text-ink">{option.optionText}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentQuestion.selectedOptionId === option.id;

                  return (
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${
                        isSelected
                          ? "border-cyan/60 bg-cyan/5"
                          : "border-ink/10 bg-pearl hover:border-cyan/40 hover:bg-white"
                      }`}
                      key={option.id}
                    >
                      <input
                        checked={isSelected}
                        className="mt-1 h-4 w-4 accent-cyan"
                        disabled={isSubmitting}
                        name={`question-${currentQuestion.questionId}`}
                        onChange={() => handleAnswerChange(option.id)}
                        type="radio"
                      />
                      <span className="text-base text-ink">{option.optionText}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                disabled={isSubmitting}
                onClick={handleFlagToggle}
                variant="secondary"
              >
                {currentQuestion.flagged ? "Unflag Question" : "Flag for Review"}
              </Button>

              <div className="flex flex-wrap gap-3">
                <Button
                  disabled={currentIndex === 0 || isSubmitting}
                  onClick={() => goToQuestion(currentIndex - 1)}
                  variant="ghost"
                >
                  Previous
                </Button>
                <Button
                  disabled={currentIndex >= questions.length - 1 || isSubmitting}
                  onClick={() => goToQuestion(currentIndex + 1)}
                  variant="secondary"
                >
                  Next
                </Button>
                <Button disabled={isSubmitting} onClick={() => handleSubmit("manual")}>
                  Submit Exam
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </div>

      <div className="space-y-6">
        <Card className="space-y-5 border-ink/5 xl:sticky xl:top-24">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
              Question Palette
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Navigate the Session
            </h2>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const isCurrent = index === currentIndex;
              const isAnswered = isQuestionAnswered(question);
              const paletteClass = isCurrent
                ? "border-ink bg-ink text-white"
                : question.flagged
                  ? "border-amber-300 bg-amber-100 text-amber-950"
                  : isAnswered
                    ? "border-emerald-300 bg-emerald-100 text-emerald-950"
                    : "border-ink/10 bg-pearl text-ink";

              return (
                <button
                  className={`rounded-2xl border px-0 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${paletteClass}`}
                  disabled={isSubmitting}
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  type="button"
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="space-y-3 rounded-2xl bg-pearl px-4 py-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate">Answered</span>
              <span className="font-semibold text-ink">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate">Unanswered</span>
              <span className="font-semibold text-ink">
                {attempt.totalQuestions - answeredCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate">Flagged</span>
              <span className="font-semibold text-ink">{flaggedCount}</span>
            </div>
          </div>

          <Button disabled={isSubmitting} fullWidth onClick={() => handleSubmit("manual")}>
            Submit Exam
          </Button>
        </Card>
      </div>
    </div>
  );
}

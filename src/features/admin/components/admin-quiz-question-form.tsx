"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DragDropCategorizeBoard } from "@/components/ui/drag-drop-categorize-board";
import { QuestionImage } from "@/components/ui/question-image";
import { QuestionImageGallery } from "@/components/ui/question-image-gallery";
import {
  buildDragDropBucketsFromLabels,
  getQuestionTypeLabel,
  splitMultilineEntries
} from "@/lib/questions/drag-drop";
import { APP_ROUTES } from "@/lib/auth/redirects";
import type { AdminActionState } from "@/types/admin";
import type { QuestionType } from "@/types/questions";

type AdminFormAction = (
  state: AdminActionState,
  formData: FormData
) => Promise<AdminActionState>;

export interface AdminQuizQuestionFormValues {
  questionText: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  orderIndex: number;
  questionType: QuestionType;
  showInQuiz: boolean;
  dragDropBucketLines: string;
  dragDropItemLines: string;
  questionImageUrl: string | null;
  questionImageAlt: string;
  questionImageSecondaryUrl: string | null;
  questionImageSecondaryAlt: string;
  choiceOptions: Array<{
    optionText: string;
    isCorrect: boolean;
  }>;
}

export function AdminQuizQuestionForm({
  action,
  initialValues,
  quizId,
  questionCount,
  recordId
}: {
  action: AdminFormAction;
  initialValues: AdminQuizQuestionFormValues;
  quizId: string;
  questionCount: number;
  recordId?: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, {
    status: "idle",
    message: null,
    fieldErrors: {},
    savedRecordId: null
  });
  const [previewQuestionText, setPreviewQuestionText] = useState(initialValues.questionText);
  const [previewExplanation, setPreviewExplanation] = useState(initialValues.explanation);
  const [previewDifficulty, setPreviewDifficulty] = useState(initialValues.difficulty);
  const [previewOrderIndex, setPreviewOrderIndex] = useState(initialValues.orderIndex);
  const [previewQuestionType, setPreviewQuestionType] = useState(initialValues.questionType);
  const [previewShowInQuiz, setPreviewShowInQuiz] = useState(initialValues.showInQuiz);
  const [previewDragDropBucketLines, setPreviewDragDropBucketLines] = useState(
    initialValues.dragDropBucketLines
  );
  const [previewDragDropItemLines, setPreviewDragDropItemLines] = useState(
    initialValues.dragDropItemLines
  );
  const [previewQuestionImageAlt, setPreviewQuestionImageAlt] = useState(
    initialValues.questionImageAlt
  );
  const [previewQuestionImageSecondaryAlt, setPreviewQuestionImageSecondaryAlt] = useState(
    initialValues.questionImageSecondaryAlt
  );
  const [previewChoiceOptions, setPreviewChoiceOptions] = useState(initialValues.choiceOptions);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [removeCurrentImageSecondary, setRemoveCurrentImageSecondary] = useState(false);
  const [uploadedImagePreviewUrl, setUploadedImagePreviewUrl] = useState<string | null>(null);
  const [uploadedSecondaryImagePreviewUrl, setUploadedSecondaryImagePreviewUrl] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (state.status !== "success" || !state.savedRecordId) {
      return;
    }

    const searchParams = new URLSearchParams({
      quiz: quizId
    });

    if (recordId) {
      searchParams.set("question", state.savedRecordId);
    } else {
      searchParams.set("created", state.savedRecordId);
    }

    router.replace(`${APP_ROUTES.adminExamSimulator}?${searchParams.toString()}`);
    router.refresh();
  }, [quizId, recordId, router, state.savedRecordId, state.status]);

  useEffect(() => {
    return () => {
      if (uploadedImagePreviewUrl) {
        URL.revokeObjectURL(uploadedImagePreviewUrl);
      }

      if (uploadedSecondaryImagePreviewUrl) {
        URL.revokeObjectURL(uploadedSecondaryImagePreviewUrl);
      }
    };
  }, [uploadedImagePreviewUrl, uploadedSecondaryImagePreviewUrl]);

  function handleQuestionImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setUploadedImagePreviewUrl((existing) => {
      if (existing) {
        URL.revokeObjectURL(existing);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  }

  function handleQuestionImageSecondaryChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setUploadedSecondaryImagePreviewUrl((existing) => {
      if (existing) {
        URL.revokeObjectURL(existing);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  }

  function handleChoiceOptionTextChange(index: number, value: string) {
    setPreviewChoiceOptions((existing) =>
      existing.map((option, optionIndex) =>
        optionIndex === index ? { ...option, optionText: value } : option
      )
    );
  }

  function setSingleChoiceCorrect(index: number) {
    setPreviewChoiceOptions((existing) =>
      existing.map((option, optionIndex) => ({
        ...option,
        isCorrect: optionIndex === index
      }))
    );
  }

  function toggleMultipleChoiceCorrect(index: number, checked: boolean) {
    setPreviewChoiceOptions((existing) =>
      existing.map((option, optionIndex) =>
        optionIndex === index ? { ...option, isCorrect: checked } : option
      )
    );
  }

  function handleAddChoiceOption() {
    setPreviewChoiceOptions((existing) => {
      if (existing.length >= 6) {
        return existing;
      }

      return [...existing, { optionText: "", isCorrect: false }];
    });
  }

  function handleRemoveChoiceOption(index: number) {
    setPreviewChoiceOptions((existing) => {
      if (existing.length <= 2) {
        return existing;
      }

      const next = existing.filter((_, optionIndex) => optionIndex !== index);

      if (previewQuestionType === "single_choice") {
        const nextCorrectIndex = next.findIndex((option) => option.isCorrect);

        if (nextCorrectIndex >= 0) {
          return next.map((option, optionIndex) => ({
            ...option,
            isCorrect: optionIndex === nextCorrectIndex
          }));
        }

        return next.map((option, optionIndex) => ({
          ...option,
          isCorrect: optionIndex === 0
        }));
      }

      return next;
    });
  }

  const learnerPreviewImageUrl =
    uploadedImagePreviewUrl ?? (removeCurrentImage ? null : initialValues.questionImageUrl);
  const learnerPreviewSecondaryImageUrl =
    uploadedSecondaryImagePreviewUrl ??
    (removeCurrentImageSecondary ? null : initialValues.questionImageSecondaryUrl);
  const learnerPreviewQuestionText =
    previewQuestionText.trim() || "Your question text will appear here.";
  const learnerPreviewExplanation =
    previewExplanation.trim() || "Your explanation will appear here after the learner submits.";
  const previewBuckets = buildDragDropBucketsFromLabels(
    splitMultilineEntries(previewDragDropBucketLines)
  );
  const previewBucketByLabel = new Map(
    previewBuckets.map((bucket) => [bucket.label.trim().toLowerCase(), bucket.id])
  );
  const previewDragDropItems = splitMultilineEntries(previewDragDropItemLines).map((line, index) => {
    const separatorIndex = line.lastIndexOf("|");
    const label =
      separatorIndex >= 0 ? line.slice(0, separatorIndex).trim() : line.trim();
    const bucketLabel =
      separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim().toLowerCase() : "";

    return {
      id: `preview-item-${index + 1}`,
      label: label || `Draggable item ${index + 1}`,
      selectedBucketId: previewBucketByLabel.get(bucketLabel) ?? null
    };
  });

  return (
    <Card className="border-ink/5">
      <form action={formAction} className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-ink">
              {recordId ? "Edit Question" : "Add Question"}
            </h2>
            <p className="text-sm text-slate">
              {recordId
                ? "You are updating an existing bank item. Use single choice for one correct answer, multiple choice for two or more correct answers, or drag and drop for bucket-style matching questions."
                : "Each save in create mode adds a brand-new question to the bank. Use Edit from the list only when you want to change an existing question."}
            </p>
          </div>
          {recordId ? (
            <Link
              className="inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-cyan/30 hover:text-cyan"
              href={`${APP_ROUTES.adminExamSimulator}?quiz=${quizId}`}
            >
              New Question
            </Link>
          ) : null}
        </div>

        <div className="rounded-2xl border border-dashed border-ink/10 bg-pearl px-4 py-3 text-sm text-slate">
          {questionCount === 0
            ? "This quiz does not have any questions yet."
            : `This quiz currently has ${questionCount} question${questionCount === 1 ? "" : "s"}.`}
        </div>

        <input name="recordId" type="hidden" value={recordId ?? ""} />
        <input name="quizId" type="hidden" value={quizId} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2" htmlFor="questionType">
            <span className="block text-sm font-semibold text-ink">Question Type</span>
            <select
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
              id="questionType"
              name="questionType"
              value={previewQuestionType}
              onChange={(event) => {
                const nextQuestionType = event.target.value as QuestionType;

                setPreviewQuestionType(nextQuestionType);

                if (nextQuestionType !== "single_choice") {
                  setPreviewShowInQuiz(false);
                }

                if (nextQuestionType === "single_choice") {
                  setPreviewChoiceOptions((existing) => {
                    const firstCorrectIndex = existing.findIndex((option) => option.isCorrect);
                    const resolvedCorrectIndex = firstCorrectIndex >= 0 ? firstCorrectIndex : 0;

                    return existing.map((option, index) => ({
                      ...option,
                      isCorrect: index === resolvedCorrectIndex
                    }));
                  });
                }
              }}
            >
              <option value="single_choice">Single Choice</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="drag_drop_categorize">Drag and Drop</option>
            </select>
            {state.fieldErrors.questionType ? (
              <p className="text-xs font-medium text-rose-700">{state.fieldErrors.questionType}</p>
            ) : null}
          </label>

          <div className="rounded-2xl border border-dashed border-ink/10 bg-pearl px-4 py-4 text-sm text-slate">
            {previewQuestionType === "drag_drop_categorize"
              ? "Drag and drop questions are saved as exam-only items right now, so the learner quiz checkbox below is turned off automatically."
              : previewQuestionType === "multiple_choice"
                ? "Multiple-choice questions can use up to six options with more than one correct answer, and they stay inside the timed exam simulator bank."
                : "Single-choice questions can use between two and six options and can also be shared with learner quizzes."}
          </div>
        </div>

        <label className="block space-y-2" htmlFor="questionText">
          <span className="block text-sm font-semibold text-ink">Question</span>
          <textarea
            className="min-h-[140px] w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
            defaultValue={initialValues.questionText}
            id="questionText"
            name="questionText"
            onChange={(event) => setPreviewQuestionText(event.target.value)}
            rows={6}
          />
          {state.fieldErrors.questionText ? (
            <p className="text-xs font-medium text-rose-700">{state.fieldErrors.questionText}</p>
          ) : null}
        </label>

        <label className="block space-y-2" htmlFor="explanation">
          <span className="block text-sm font-semibold text-ink">Explanation</span>
          <textarea
            className="min-h-[120px] w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
            defaultValue={initialValues.explanation}
            id="explanation"
            name="explanation"
            onChange={(event) => setPreviewExplanation(event.target.value)}
            rows={5}
          />
          {state.fieldErrors.explanation ? (
            <p className="text-xs font-medium text-rose-700">{state.fieldErrors.explanation}</p>
          ) : null}
        </label>

        <div className="space-y-4 rounded-3xl border border-ink/10 bg-pearl/60 p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-ink">Question Images</h3>
            <p className="text-xs text-slate">
              Add up to two exhibits when the question needs a topology, CLI output, screenshot,
              or another visual reference. Supported types: JPG, PNG, WebP, or GIF up to 5 MB
              each.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-ink/10 bg-white p-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  Image 1
                </p>
                <p className="text-xs text-slate">
                  Use this for the main exhibit, such as the topology diagram.
                </p>
              </div>

              {initialValues.questionImageUrl ? (
                <div className="space-y-3">
                  <QuestionImage
                    alt={initialValues.questionImageAlt || "Current question image"}
                    className="bg-white"
                    imageClassName="max-h-80"
                    src={initialValues.questionImageUrl}
                  />

                  <label
                    className="flex items-center gap-3 text-sm text-ink"
                    htmlFor="removeQuestionImage"
                  >
                    <input
                      className="h-4 w-4 rounded border-ink/20 accent-cyan"
                      id="removeQuestionImage"
                      name="removeQuestionImage"
                      onChange={(event) => setRemoveCurrentImage(event.target.checked)}
                      type="checkbox"
                    />
                    <span>Remove image 1</span>
                  </label>
                </div>
              ) : null}

              <label className="block space-y-2" htmlFor="questionImage">
                <span className="block text-sm font-semibold text-ink">
                  {initialValues.questionImageUrl ? "Replace Image 1" : "Upload Image 1"}
                </span>
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="block w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-cyan/10 file:px-4 file:py-2 file:font-semibold file:text-cyan"
                  id="questionImage"
                  name="questionImage"
                  onChange={handleQuestionImageChange}
                  type="file"
                />
                {state.fieldErrors.questionImage ? (
                  <p className="text-xs font-medium text-rose-700">
                    {state.fieldErrors.questionImage}
                  </p>
                ) : null}
              </label>

              <label className="block space-y-2" htmlFor="questionImageAlt">
                <span className="block text-sm font-semibold text-ink">Image 1 Alt Text</span>
                <input
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
                  defaultValue={initialValues.questionImageAlt}
                  id="questionImageAlt"
                  name="questionImageAlt"
                  onChange={(event) => setPreviewQuestionImageAlt(event.target.value)}
                  placeholder="Describe what image 1 shows if that context helps the learner."
                  type="text"
                />
                {state.fieldErrors.questionImageAlt ? (
                  <p className="text-xs font-medium text-rose-700">
                    {state.fieldErrors.questionImageAlt}
                  </p>
                ) : null}
              </label>
            </div>

            <div className="space-y-4 rounded-2xl border border-ink/10 bg-white p-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  Image 2
                </p>
                <p className="text-xs text-slate">
                  Use this for a second exhibit, such as CLI output or a second diagram.
                </p>
              </div>

              {initialValues.questionImageSecondaryUrl ? (
                <div className="space-y-3">
                  <QuestionImage
                    alt={
                      initialValues.questionImageSecondaryAlt || "Current secondary question image"
                    }
                    className="bg-white"
                    imageClassName="max-h-80"
                    src={initialValues.questionImageSecondaryUrl}
                  />

                  <label
                    className="flex items-center gap-3 text-sm text-ink"
                    htmlFor="removeQuestionImageSecondary"
                  >
                    <input
                      className="h-4 w-4 rounded border-ink/20 accent-cyan"
                      id="removeQuestionImageSecondary"
                      name="removeQuestionImageSecondary"
                      onChange={(event) => setRemoveCurrentImageSecondary(event.target.checked)}
                      type="checkbox"
                    />
                    <span>Remove image 2</span>
                  </label>
                </div>
              ) : null}

              <label className="block space-y-2" htmlFor="questionImageSecondary">
                <span className="block text-sm font-semibold text-ink">
                  {initialValues.questionImageSecondaryUrl
                    ? "Replace Image 2"
                    : "Upload Image 2"}
                </span>
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="block w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-cyan/10 file:px-4 file:py-2 file:font-semibold file:text-cyan"
                  id="questionImageSecondary"
                  name="questionImageSecondary"
                  onChange={handleQuestionImageSecondaryChange}
                  type="file"
                />
                {state.fieldErrors.questionImageSecondary ? (
                  <p className="text-xs font-medium text-rose-700">
                    {state.fieldErrors.questionImageSecondary}
                  </p>
                ) : null}
              </label>

              <label className="block space-y-2" htmlFor="questionImageSecondaryAlt">
                <span className="block text-sm font-semibold text-ink">Image 2 Alt Text</span>
                <input
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
                  defaultValue={initialValues.questionImageSecondaryAlt}
                  id="questionImageSecondaryAlt"
                  name="questionImageSecondaryAlt"
                  onChange={(event) => setPreviewQuestionImageSecondaryAlt(event.target.value)}
                  placeholder="Describe what image 2 shows if that context helps the learner."
                  type="text"
                />
                {state.fieldErrors.questionImageSecondaryAlt ? (
                  <p className="text-xs font-medium text-rose-700">
                    {state.fieldErrors.questionImageSecondaryAlt}
                  </p>
                ) : null}
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2" htmlFor="difficulty">
            <span className="block text-sm font-semibold text-ink">Difficulty</span>
            <select
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
              defaultValue={initialValues.difficulty}
              id="difficulty"
              name="difficulty"
              onChange={(event) =>
                setPreviewDifficulty(event.target.value as "easy" | "medium" | "hard")
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {state.fieldErrors.difficulty ? (
              <p className="text-xs font-medium text-rose-700">{state.fieldErrors.difficulty}</p>
            ) : null}
          </label>

          <label className="block space-y-2" htmlFor="orderIndex">
            <span className="block text-sm font-semibold text-ink">Order Index</span>
            <input
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
              defaultValue={String(initialValues.orderIndex)}
              id="orderIndex"
              min={1}
              name="orderIndex"
              onChange={(event) => {
                const nextValue = Number(event.target.value);

                setPreviewOrderIndex(Number.isInteger(nextValue) && nextValue > 0 ? nextValue : 1);
              }}
              type="number"
            />
            {state.fieldErrors.orderIndex ? (
              <p className="text-xs font-medium text-rose-700">{state.fieldErrors.orderIndex}</p>
            ) : null}
          </label>
        </div>

        <label
          className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4 text-sm text-ink"
          htmlFor="showInQuiz"
        >
          <input
            className="mt-1 h-4 w-4 rounded border-ink/20 accent-cyan"
            checked={previewQuestionType === "single_choice" && previewShowInQuiz}
            disabled={previewQuestionType !== "single_choice"}
            id="showInQuiz"
            name="showInQuiz"
            onChange={(event) => setPreviewShowInQuiz(event.target.checked)}
            type="checkbox"
          />
          <span className="space-y-1">
            <span className="block font-semibold">Show This Question In Learner Quizzes</span>
            <span className="block text-xs text-slate">
              {previewQuestionType !== "single_choice"
                ? "Multiple-choice and drag-and-drop questions currently stay inside the timed exam simulator question bank only."
                : "Leave this unchecked to keep the question inside the timed exam simulator question bank only."}
            </span>
          </span>
        </label>
        {state.fieldErrors.showInQuiz ? (
          <p className="text-xs font-medium text-rose-700">{state.fieldErrors.showInQuiz}</p>
        ) : null}

        {previewQuestionType !== "drag_drop_categorize" ? (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-ink">Answer Choices</h3>
                <p className="text-xs text-slate">
                  {previewQuestionType === "multiple_choice"
                    ? "Enter between 2 and 6 choices and mark every answer that should count as correct."
                    : "Enter between 2 and 6 choices and mark which one should be scored as correct."}
                </p>
              </div>

              <input name="optionCount" type="hidden" value={String(previewChoiceOptions.length)} />

              {state.fieldErrors.optionCount ? (
                <p className="text-xs font-medium text-rose-700">{state.fieldErrors.optionCount}</p>
              ) : null}
              {state.fieldErrors.correctOption ? (
                <p className="text-xs font-medium text-rose-700">
                  {state.fieldErrors.correctOption}
                </p>
              ) : null}

              {previewChoiceOptions.map((option, index) => {
                const optionNumber = index + 1;

                return (
                  <div
                    className="space-y-3 rounded-2xl border border-ink/10 bg-white px-4 py-4"
                    key={`choice-option-${optionNumber}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-ink">Option {optionNumber}</span>
                      {previewChoiceOptions.length > 2 ? (
                        <button
                          className="text-xs font-semibold uppercase tracking-[0.16em] text-slate transition hover:text-rose-700"
                          onClick={() => handleRemoveChoiceOption(index)}
                          type="button"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <label
                      className="flex items-center gap-3 rounded-2xl border border-dashed border-ink/10 bg-pearl px-4 py-3 text-sm text-ink"
                      htmlFor={`option${optionNumber}Correct`}
                    >
                      <input
                        checked={option.isCorrect}
                        className="h-4 w-4 accent-cyan"
                        id={`option${optionNumber}Correct`}
                        name={
                          previewQuestionType === "single_choice"
                            ? "correctOption"
                            : `option${optionNumber}Correct`
                        }
                        onChange={(event) => {
                          if (previewQuestionType === "single_choice") {
                            if (event.target.checked) {
                              setSingleChoiceCorrect(index);
                            }

                            return;
                          }

                          toggleMultipleChoiceCorrect(index, event.target.checked);
                        }}
                        type={previewQuestionType === "single_choice" ? "radio" : "checkbox"}
                        value={String(optionNumber)}
                      />
                      <span>
                        {previewQuestionType === "single_choice"
                          ? "Mark as the correct answer"
                          : "Mark as one of the correct answers"}
                      </span>
                    </label>

                    <label className="block space-y-2" htmlFor={`option${optionNumber}Text`}>
                      <input
                        className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
                        id={`option${optionNumber}Text`}
                        name={`option${optionNumber}Text`}
                        onChange={(event) =>
                          handleChoiceOptionTextChange(index, event.target.value)
                        }
                        type="text"
                        value={option.optionText}
                      />
                      {state.fieldErrors[`option${optionNumber}Text`] ? (
                        <p className="text-xs font-medium text-rose-700">
                          {state.fieldErrors[`option${optionNumber}Text`]}
                        </p>
                      ) : null}
                    </label>
                  </div>
                );
              })}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-ink/10 bg-pearl px-4 py-3">
                <p className="text-xs text-slate">
                  {previewChoiceOptions.length} of 6 options in use.
                </p>
                <Button
                  disabled={previewChoiceOptions.length >= 6}
                  onClick={handleAddChoiceOption}
                  type="button"
                  variant="secondary"
                >
                  Add Option
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-5 rounded-3xl border border-cyan/15 bg-cyan/[0.04] p-5">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ink">Drag-and-Drop Setup</h3>
              <p className="text-xs text-slate">
                Add one bucket label per line, then add one draggable item per line using the
                format <span className="font-semibold text-ink">statement | bucket label</span>.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <label className="block space-y-2" htmlFor="dragDropBucketLines">
                <span className="block text-sm font-semibold text-ink">Buckets</span>
                <textarea
                  className="min-h-[150px] w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
                  defaultValue={initialValues.dragDropBucketLines}
                  id="dragDropBucketLines"
                  name="dragDropBucketLines"
                  onChange={(event) => setPreviewDragDropBucketLines(event.target.value)}
                  rows={6}
                />
                {state.fieldErrors.dragDropBucketLines ? (
                  <p className="text-xs font-medium text-rose-700">
                    {state.fieldErrors.dragDropBucketLines}
                  </p>
                ) : null}
              </label>

              <label className="block space-y-2" htmlFor="dragDropItemLines">
                <span className="block text-sm font-semibold text-ink">Draggable Items</span>
                <textarea
                  className="min-h-[150px] w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan"
                  defaultValue={initialValues.dragDropItemLines}
                  id="dragDropItemLines"
                  name="dragDropItemLines"
                  onChange={(event) => setPreviewDragDropItemLines(event.target.value)}
                  rows={6}
                />
                {state.fieldErrors.dragDropItemLines ? (
                  <p className="text-xs font-medium text-rose-700">
                    {state.fieldErrors.dragDropItemLines}
                  </p>
                ) : null}
              </label>
            </div>
          </div>
        )}

        <div className="space-y-5 rounded-3xl border border-cyan/15 bg-cyan/[0.04] p-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
              Preview
            </p>
            <h3 className="text-lg font-semibold text-ink">Learner Dashboard Preview</h3>
            <p className="text-sm text-slate">
              This updates while you type so you can review the question before saving or
              publishing it.
            </p>
          </div>

          <Card className="space-y-6 border-ink/5 bg-white">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
                  Question {previewOrderIndex}
                </span>
                <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  {previewDifficulty}
                </span>
                <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  {getQuestionTypeLabel(previewQuestionType)}
                </span>
                <span className="rounded-full bg-pearl px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                  {previewQuestionType === "drag_drop_categorize"
                    ? "Timed Exam Only"
                    : previewQuestionType === "single_choice" && previewShowInQuiz
                      ? "Quiz + Timed Exam"
                      : "Timed Exam Only"}
                </span>
              </div>

              <h4 className="font-display text-3xl font-semibold text-ink">
                {learnerPreviewQuestionText}
              </h4>
            </div>

            <QuestionImageGallery
              imageClassName="max-h-80"
              images={[
                {
                  src: learnerPreviewImageUrl,
                  alt: previewQuestionImageAlt || "Question reference image 1",
                  key: "preview-primary"
                },
                {
                  src: learnerPreviewSecondaryImageUrl,
                  alt: previewQuestionImageSecondaryAlt || "Question reference image 2",
                  key: "preview-secondary"
                }
              ]}
            />

            {previewQuestionType === "drag_drop_categorize" ? (
              previewBuckets.length > 0 && previewDragDropItems.length > 0 ? (
                <DragDropCategorizeBoard
                  buckets={previewBuckets}
                  items={previewDragDropItems}
                  readOnly
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-ink/10 bg-pearl px-4 py-5 text-sm text-slate">
                  Add bucket labels and draggable items to preview the drag-and-drop board.
                </div>
              )
            ) : (
              <div className="space-y-3">
                {previewChoiceOptions.map((option, index) => (
                  <div
                    className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-pearl px-4 py-4"
                    key={`preview-option-${index + 1}`}
                  >
                    <span
                      className={`mt-0.5 h-4 w-4 border border-ink/20 bg-white ${
                        previewQuestionType === "multiple_choice"
                          ? "rounded-md"
                          : "rounded-full"
                      }`}
                    />
                    <div className="space-y-1">
                      <p className="text-base text-ink">
                        {option.optionText.trim() || `Answer choice ${index + 1}`}
                      </p>
                      {option.isCorrect ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
                          {previewQuestionType === "multiple_choice"
                            ? "Admin note: correct answer"
                            : "Admin note: correct option"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-2 rounded-3xl border border-ink/10 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">
              Review Screen Preview
            </p>
            <p className="text-sm text-slate">
              After submission, the learner also sees the explanation below the question.
            </p>
            <div className="rounded-2xl bg-pearl px-4 py-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan">
                Explanation
              </p>
              <p className="mt-2 text-base text-ink">{learnerPreviewExplanation}</p>
            </div>
          </div>
        </div>

        {state.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.status === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-rose-50 text-rose-800"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <Button disabled={isPending} type="submit">
            {isPending ? "Saving..." : recordId ? "Update Question" : "Create Question"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

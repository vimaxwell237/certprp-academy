import {
  isDragDropAnswerComplete,
  isDragDropAnswerCorrect
} from "@/lib/questions/drag-drop";
import {
  isMultipleChoiceAnswered,
  isMultipleChoiceCorrect
} from "@/lib/questions/multiple-choice";
import type { DragDropAnswerPayload, DragDropInteractionConfig, QuestionType } from "@/types/questions";

export interface ExamBankOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  matchKey: string | null;
  orderIndex: number;
}

export interface ExamBankQuestion {
  id: string;
  moduleSlug: string | null;
  moduleTitle: string | null;
  showInQuiz?: boolean;
  questionText: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  questionType: QuestionType;
  interactionConfig: DragDropInteractionConfig | null;
  questionImagePath: string | null;
  questionImageAlt: string;
  questionImageSecondaryPath: string | null;
  questionImageSecondaryAlt: string;
  options: ExamBankOption[];
}

export interface ExamSelectionConfig {
  questionCount: number;
  selectionStrategy: "random" | "balanced";
}

export type ExamAnswerKey =
  | {
      questionType: "single_choice" | "multiple_choice";
      correctOptionIds: string[];
      selectedOptionIds: string[];
    }
  | {
      questionType: "drag_drop_categorize";
      answerPayload: DragDropAnswerPayload | null;
      items: Array<{ id: string; matchKey: string | null }>;
      bucketIds: string[];
    };

export interface ExamScoreSummary {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredCount: number;
  flaggedCount: number;
  score: number;
}

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];

    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }

  return copy;
}

function getQuestionSelectionPriority(question: Pick<ExamBankQuestion, "questionType" | "showInQuiz">) {
  let priority = 0;

  if (question.showInQuiz === false) {
    priority += 2;
  }

  if (question.questionType === "drag_drop_categorize") {
    priority += 1;
  }

  return priority;
}

function prioritizeQuestions<T extends ExamBankQuestion>(questions: T[]) {
  return shuffleArray(questions).sort(
    (left, right) =>
      getQuestionSelectionPriority(right) - getQuestionSelectionPriority(left)
  );
}

function selectBalancedQuestions(
  questions: ExamBankQuestion[],
  questionCount: number
) {
  const byModule = new Map<string, ExamBankQuestion[]>();

  for (const question of questions) {
    const moduleKey = question.moduleSlug ?? "unknown";
    const existing = byModule.get(moduleKey) ?? [];

    existing.push(question);
    byModule.set(moduleKey, existing);
  }

  for (const [moduleKey, moduleQuestions] of byModule.entries()) {
    byModule.set(moduleKey, prioritizeQuestions(moduleQuestions));
  }

  const moduleKeys = shuffleArray(Array.from(byModule.keys()));
  const selected: ExamBankQuestion[] = [];

  while (selected.length < questionCount) {
    let pickedInPass = false;

    for (const moduleKey of moduleKeys) {
      const pool = byModule.get(moduleKey) ?? [];

      if (pool.length === 0) {
        continue;
      }

      const nextQuestion = pool.shift();

      if (nextQuestion) {
        selected.push(nextQuestion);
        pickedInPass = true;
      }

      if (selected.length >= questionCount) {
        break;
      }
    }

    if (!pickedInPass) {
      break;
    }
  }

  return selected;
}

export function selectExamQuestions(
  questionBank: ExamBankQuestion[],
  config: ExamSelectionConfig
) {
  const uniqueQuestions = questionBank.filter(
    (question, index, items) => items.findIndex((entry) => entry.id === question.id) === index
  );
  const maxCount = Math.min(config.questionCount, uniqueQuestions.length);

  if (config.selectionStrategy === "balanced") {
    return selectBalancedQuestions(uniqueQuestions, maxCount);
  }

  return prioritizeQuestions(uniqueQuestions).slice(0, maxCount);
}

export function calculateExamScore(
  answers: Array<{ answer: ExamAnswerKey; flagged: boolean }>
): ExamScoreSummary {
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(({ answer }) => isExamAnswerCorrect(answer)).length;
  const unansweredCount = answers.filter(({ answer }) => !isExamAnswerAnswered(answer)).length;
  const incorrectAnswers = totalQuestions - correctAnswers - unansweredCount;
  const flaggedCount = answers.filter(({ flagged }) => flagged).length;
  const score =
    totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unansweredCount,
    flaggedCount,
    score
  };
}

export function isExamAnswerAnswered(answer: ExamAnswerKey) {
  if (answer.questionType === "drag_drop_categorize") {
    return isDragDropAnswerComplete(
      answer.items.map((item) => item.id),
      answer.bucketIds,
      answer.answerPayload
    );
  }

  return isMultipleChoiceAnswered(answer.selectedOptionIds);
}

export function isExamAnswerCorrect(answer: ExamAnswerKey) {
  if (answer.questionType === "drag_drop_categorize") {
    return isDragDropAnswerCorrect(answer.items, answer.bucketIds, answer.answerPayload);
  }

  return isMultipleChoiceCorrect(answer.correctOptionIds, answer.selectedOptionIds);
}

export function clampTimeUsed(startedAt: string, endedAt: string, durationSeconds: number) {
  const elapsedSeconds = Math.max(
    0,
    Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)
  );

  return Math.min(elapsedSeconds, durationSeconds);
}

export function formatSecondsLabel(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

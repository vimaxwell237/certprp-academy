export interface ExamBankOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface ExamBankQuestion {
  id: string;
  moduleSlug: string | null;
  moduleTitle: string | null;
  questionText: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  questionType: "single_choice";
  options: ExamBankOption[];
}

export interface ExamSelectionConfig {
  questionCount: number;
  selectionStrategy: "random" | "balanced";
}

export interface ExamAnswerKey {
  correctOptionId: string | null;
  selectedOptionId: string | null;
}

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

function selectBalancedQuestions(
  questions: ExamBankQuestion[],
  questionCount: number
) {
  const byModule = new Map<string, ExamBankQuestion[]>();

  for (const question of shuffleArray(questions)) {
    const moduleKey = question.moduleSlug ?? "unknown";
    const existing = byModule.get(moduleKey) ?? [];

    existing.push(question);
    byModule.set(moduleKey, existing);
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

  return shuffleArray(uniqueQuestions).slice(0, maxCount);
}

export function calculateExamScore(
  answers: Array<{ answer: ExamAnswerKey; flagged: boolean }>
): ExamScoreSummary {
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(
    ({ answer }) =>
      answer.correctOptionId !== null &&
      answer.selectedOptionId === answer.correctOptionId
  ).length;
  const unansweredCount = answers.filter(
    ({ answer }) => answer.selectedOptionId === null
  ).length;
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

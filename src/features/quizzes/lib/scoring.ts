export interface QuizAnswerKey {
  questionId: string;
  correctOptionId: string | null;
  selectedOptionId: string | null;
}

export interface QuizScoreSummary {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
}

export function calculateQuizScore(
  answerKeys: QuizAnswerKey[]
): QuizScoreSummary {
  const totalQuestions = answerKeys.length;
  const correctAnswers = answerKeys.filter(
    (answer) =>
      answer.correctOptionId !== null &&
      answer.selectedOptionId === answer.correctOptionId
  ).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const score =
    totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    score
  };
}

export function getWeakPerformanceLabel(score: number) {
  if (score < 60) {
    return "Needs targeted review";
  }

  if (score < 75) {
    return "Review recommended";
  }

  return "On track";
}


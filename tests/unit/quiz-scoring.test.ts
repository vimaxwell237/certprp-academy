import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateQuizScore,
  getWeakPerformanceLabel
} from "@/features/quizzes/lib/scoring";

test("calculateQuizScore returns rounded percentage and counts", () => {
  const result = calculateQuizScore([
    {
      questionId: "q1",
      correctOptionId: "a",
      selectedOptionId: "a"
    },
    {
      questionId: "q2",
      correctOptionId: "b",
      selectedOptionId: "c"
    },
    {
      questionId: "q3",
      correctOptionId: "d",
      selectedOptionId: "d"
    }
  ]);

  assert.deepEqual(result, {
    totalQuestions: 3,
    correctAnswers: 2,
    incorrectAnswers: 1,
    score: 67
  });
});

test("calculateQuizScore handles unanswered questions", () => {
  const result = calculateQuizScore([
    {
      questionId: "q1",
      correctOptionId: "a",
      selectedOptionId: null
    }
  ]);

  assert.equal(result.correctAnswers, 0);
  assert.equal(result.incorrectAnswers, 1);
  assert.equal(result.score, 0);
});

test("getWeakPerformanceLabel classifies score bands", () => {
  assert.equal(getWeakPerformanceLabel(55), "Needs targeted review");
  assert.equal(getWeakPerformanceLabel(70), "Review recommended");
  assert.equal(getWeakPerformanceLabel(88), "On track");
});


import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateExamScore,
  clampTimeUsed,
  selectExamQuestions
} from "@/features/exams/lib/exam-engine";

test("balanced selection spreads questions across modules when possible", () => {
  const selected = selectExamQuestions(
    [
      {
        id: "q1",
        moduleSlug: "network-fundamentals",
        moduleTitle: "Network Fundamentals",
        questionText: "Q1",
        explanation: "",
        difficulty: "easy",
        questionType: "single_choice",
        options: []
      },
      {
        id: "q2",
        moduleSlug: "network-access",
        moduleTitle: "Network Access",
        questionText: "Q2",
        explanation: "",
        difficulty: "easy",
        questionType: "single_choice",
        options: []
      },
      {
        id: "q3",
        moduleSlug: "ip-connectivity",
        moduleTitle: "IP Connectivity",
        questionText: "Q3",
        explanation: "",
        difficulty: "easy",
        questionType: "single_choice",
        options: []
      },
      {
        id: "q4",
        moduleSlug: "network-fundamentals",
        moduleTitle: "Network Fundamentals",
        questionText: "Q4",
        explanation: "",
        difficulty: "easy",
        questionType: "single_choice",
        options: []
      }
    ],
    {
      questionCount: 3,
      selectionStrategy: "balanced"
    }
  );

  assert.equal(selected.length, 3);
  assert.equal(new Set(selected.map((question) => question.id)).size, 3);
  assert.deepEqual(
    new Set(selected.map((question) => question.moduleSlug)),
    new Set(["network-fundamentals", "network-access", "ip-connectivity"])
  );
});

test("exam scoring tracks correct, incorrect, unanswered, and flagged counts", () => {
  const summary = calculateExamScore([
    {
      answer: {
        correctOptionId: "a",
        selectedOptionId: "a"
      },
      flagged: false
    },
    {
      answer: {
        correctOptionId: "b",
        selectedOptionId: "c"
      },
      flagged: true
    },
    {
      answer: {
        correctOptionId: "d",
        selectedOptionId: null
      },
      flagged: true
    }
  ]);

  assert.deepEqual(summary, {
    totalQuestions: 3,
    correctAnswers: 1,
    incorrectAnswers: 1,
    unansweredCount: 1,
    flaggedCount: 2,
    score: 33
  });
});

test("time used is capped by exam duration", () => {
  const timeUsed = clampTimeUsed(
    "2026-03-08T10:00:00.000Z",
    "2026-03-08T10:45:30.000Z",
    1800
  );

  assert.equal(timeUsed, 1800);
});

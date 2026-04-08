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
        interactionConfig: null,
        questionImagePath: null,
        questionImageAlt: "",
        questionImageSecondaryPath: null,
        questionImageSecondaryAlt: "",
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
        interactionConfig: null,
        questionImagePath: null,
        questionImageAlt: "",
        questionImageSecondaryPath: null,
        questionImageSecondaryAlt: "",
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
        interactionConfig: null,
        questionImagePath: null,
        questionImageAlt: "",
        questionImageSecondaryPath: null,
        questionImageSecondaryAlt: "",
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
        interactionConfig: null,
        questionImagePath: null,
        questionImageAlt: "",
        questionImageSecondaryPath: null,
        questionImageSecondaryAlt: "",
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

test("random selection prioritizes exam-only drag-and-drop questions", () => {
  const selected = selectExamQuestions(
    [
      {
        id: "q1",
        moduleSlug: "network-fundamentals",
        moduleTitle: "Network Fundamentals",
        showInQuiz: true,
        questionText: "Q1",
        explanation: "",
        difficulty: "easy",
        questionType: "single_choice",
        interactionConfig: null,
        questionImagePath: null,
        questionImageAlt: "",
        questionImageSecondaryPath: null,
        questionImageSecondaryAlt: "",
        options: []
      },
      {
        id: "q2",
        moduleSlug: "network-access",
        moduleTitle: "Network Access",
        showInQuiz: false,
        questionText: "Q2",
        explanation: "",
        difficulty: "medium",
        questionType: "drag_drop_categorize",
        interactionConfig: {
          buckets: [
            { id: "bucket-a", label: "Bucket A" },
            { id: "bucket-b", label: "Bucket B" }
          ]
        },
        questionImagePath: null,
        questionImageAlt: "",
        questionImageSecondaryPath: null,
        questionImageSecondaryAlt: "",
        options: []
      }
    ],
    {
      questionCount: 1,
      selectionStrategy: "random"
    }
  );

  assert.equal(selected.length, 1);
  assert.equal(selected[0]?.id, "q2");
});

test("exam scoring tracks correct, incorrect, unanswered, and flagged counts", () => {
  const summary = calculateExamScore([
    {
      answer: {
        questionType: "single_choice",
        correctOptionIds: ["a"],
        selectedOptionIds: ["a"]
      },
      flagged: false
    },
    {
      answer: {
        questionType: "single_choice",
        correctOptionIds: ["b"],
        selectedOptionIds: ["c"]
      },
      flagged: true
    },
    {
      answer: {
        questionType: "single_choice",
        correctOptionIds: ["d"],
        selectedOptionIds: []
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

test("drag-and-drop questions score only when every item is placed correctly", () => {
  const summary = calculateExamScore([
    {
      answer: {
        questionType: "drag_drop_categorize",
        answerPayload: {
          placements: {
            "item-1": "ftp",
            "item-2": "ftp",
            "item-3": "tftp"
          }
        },
        items: [
          { id: "item-1", matchKey: "ftp" },
          { id: "item-2", matchKey: "ftp" },
          { id: "item-3", matchKey: "tftp" }
        ],
        bucketIds: ["ftp", "tftp"]
      },
      flagged: false
    },
    {
      answer: {
        questionType: "drag_drop_categorize",
        answerPayload: {
          placements: {
            "item-4": "ftp"
          }
        },
        items: [
          { id: "item-4", matchKey: "ftp" },
          { id: "item-5", matchKey: "tftp" }
        ],
        bucketIds: ["ftp", "tftp"]
      },
      flagged: false
    }
  ]);

  assert.deepEqual(summary, {
    totalQuestions: 2,
    correctAnswers: 1,
    incorrectAnswers: 0,
    unansweredCount: 1,
    flaggedCount: 0,
    score: 50
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

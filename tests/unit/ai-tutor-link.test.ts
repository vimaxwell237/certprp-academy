import test from "node:test";
import assert from "node:assert/strict";

import { buildAiTutorHref } from "@/features/ai-tutor/lib/ai-tutor-link";

test("buildAiTutorHref returns the base AI tutor route when no context is provided", () => {
  assert.equal(buildAiTutorHref(), "/ai-tutor");
});

test("buildAiTutorHref encodes question and lesson context query params", () => {
  assert.equal(
    buildAiTutorHref({
      question: "Help me understand subnetting",
      lessonContext: "Network Fundamentals: Subnetting Fundamentals",
      source: "lesson"
    }),
    "/ai-tutor?question=Help+me+understand+subnetting&lessonContext=Network+Fundamentals%3A+Subnetting+Fundamentals&source=lesson"
  );
});

"use client";

import { useState, useTransition } from "react";

import { Card } from "@/components/ui/card";
import { OpenAiTutorButton } from "@/features/ai-tutor/components/open-ai-tutor-button";
import { submitSubnettingAttemptAction } from "@/features/subnetting/actions/subnetting-actions";
import { buildSubnettingTrainerTutorRequest } from "@/features/subnetting/lib/subnetting-ai-tutor";
import {
  generateRandomSubnet,
  validateSubnetAnswer
} from "@/features/subnetting/lib/subnetting-engine";
import type {
  GeneratedSubnetProblem,
  SaveSubnettingAttemptResult,
  SubnetAnswerInput,
  SubnetValidationResult,
  SubnettingDifficulty,
  SubnettingPracticeSnapshot
} from "@/types/subnetting";

import { SubnetAnswerForm } from "./subnet-answer-form";
import { SubnetExplanationPanel } from "./subnet-explanation-panel";
import { SubnetProblemCard } from "./subnet-problem-card";
import { SubnetResultDisplay } from "./subnet-result-display";
import { SubnetScoreTracker } from "./subnet-score-tracker";

const EMPTY_ANSWERS: SubnetAnswerInput = {
  subnetMask: "",
  networkAddress: "",
  firstUsableHost: "",
  lastUsableHost: "",
  broadcastAddress: "",
  totalUsableHosts: ""
};

export function SubnettingTrainer({
  initialProblem,
  initialSnapshot
}: {
  initialProblem: GeneratedSubnetProblem;
  initialSnapshot: SubnettingPracticeSnapshot;
}) {
  const [difficulty, setDifficulty] = useState<SubnettingDifficulty>(initialProblem.difficulty);
  const [problem, setProblem] = useState(initialProblem);
  const [answers, setAnswers] = useState<SubnetAnswerInput>(EMPTY_ANSWERS);
  const [result, setResult] = useState<SubnetValidationResult | null>(null);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [incorrectCountForCurrentProblem, setIncorrectCountForCurrentProblem] = useState(0);
  const [isPending, startTransition] = useTransition();
  const tutorRequest = buildSubnettingTrainerTutorRequest({
    answers,
    problem,
    result
  });

  function resetForProblem(nextProblem: GeneratedSubnetProblem) {
    setProblem(nextProblem);
    setAnswers(EMPTY_ANSWERS);
    setResult(null);
    setPersistenceMessage(null);
    setIncorrectCountForCurrentProblem(0);
  }

  function handleGenerateProblem(nextDifficulty = difficulty) {
    const nextProblem = generateRandomSubnet(nextDifficulty);

    resetForProblem(nextProblem);
  }

  function handleDifficultyChange(nextDifficulty: SubnettingDifficulty) {
    setDifficulty(nextDifficulty);
    handleGenerateProblem(nextDifficulty);
  }

  function handleSubmit() {
    const validation = validateSubnetAnswer(problem, answers);
    const startedAt = problem.startedAtIso ? new Date(problem.startedAtIso).getTime() : Date.now();
    const timeTaken = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

    setResult(validation);
    setPersistenceMessage(null);
    setIncorrectCountForCurrentProblem((current) =>
      validation.isCorrect ? 0 : current + 1
    );

    startTransition(async () => {
      try {
        const response = await submitSubnettingAttemptAction({
          problem,
          answers,
          timeTaken
        });

        if ("unauthorized" in response) {
          window.location.href = response.redirectPath;
          return;
        }

        hydratePersistenceResponse(response);
      } catch (error) {
        setPersistenceMessage(
          error instanceof Error ? error.message : "Attempt history could not be saved."
        );
      }
    });
  }

  function hydratePersistenceResponse(response: SaveSubnettingAttemptResult) {
    if (response.snapshot) {
      setSnapshot(response.snapshot);
    }

    setPersistenceMessage(response.persistenceError);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <SubnetProblemCard problem={problem} />
        <SubnetAnswerForm
          answers={answers}
          difficulty={difficulty}
          isPending={isPending}
          onAnswerChange={(key, value) =>
            setAnswers((current) => ({ ...current, [key]: value }))
          }
          onDifficultyChange={handleDifficultyChange}
          onGenerateProblem={() => handleGenerateProblem()}
          onSubmit={handleSubmit}
          problem={problem}
        />
        <SubnetResultDisplay persistenceMessage={persistenceMessage} result={result} />
      </div>

      <div className="space-y-6">
        <Card className="border-cyan/15 bg-cyan/5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            Live AI Tutor
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            {result
              ? result.isCorrect
                ? "Understand why this one worked"
                : "Review this exact subnetting miss"
              : "Talk through this problem in real time"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate">
            {result
              ? "Open the current AI tutor with this problem, your latest result, and the correct subnet values so it can explain the reasoning step by step."
              : "Send the active trainer prompt to the current AI tutor and get a guided explanation without leaving the page."}
          </p>
          <OpenAiTutorButton
            className="mt-4"
            label={
              result
                ? result.isCorrect
                  ? "Ask Why This Works"
                  : "Review This Attempt with AI"
                : "Walk Me Through This Problem"
            }
            lessonContext={tutorRequest.lessonContext}
            question={tutorRequest.question}
            source="subnetting-trainer-live"
          />
        </Card>

        <SubnetExplanationPanel
          hintVisible={Boolean(result && !result.isCorrect && incorrectCountForCurrentProblem >= 2)}
          result={result}
        />
        <SubnetScoreTracker isSyncing={isPending} snapshot={snapshot} />
      </div>
    </div>
  );
}

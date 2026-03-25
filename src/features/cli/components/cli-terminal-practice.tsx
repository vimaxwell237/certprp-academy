"use client";

import { useState, useTransition } from "react";

import { submitCliCommandAction } from "@/features/cli/actions/cli-practice-actions";
import type { CliAttemptState } from "@/types/cli";

export function CliTerminalPractice({
  initialAttempt
}: {
  initialAttempt: CliAttemptState;
}) {
  const [attempt, setAttempt] = useState(initialAttempt);
  const [command, setCommand] = useState("");
  const [feedback, setFeedback] = useState(initialAttempt.latestFeedback);
  const [showHint, setShowHint] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentStep =
    attempt.steps.find((step) => step.stepNumber === attempt.currentStep) ??
    attempt.steps[attempt.steps.length - 1];
  const latestResult = attempt.results[attempt.results.length - 1] ?? null;
  const completedSteps = new Set(
    attempt.results.filter((result) => result.isCorrect).map((result) => result.cliStepId)
  ).size;
  const feedbackTone =
    attempt.status === "completed" || latestResult?.isCorrect
      ? "bg-emerald-500/15 text-emerald-100"
      : "bg-rose-500/15 text-rose-100";

  function handleSubmit() {
    if (!command.trim() || !currentStep || attempt.status === "completed") {
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitCliCommandAction({
          challengeSlug: attempt.challengeSlug,
          attemptId: attempt.attemptId,
          command
        });

        if ("unauthorized" in result) {
          window.location.href = result.redirectPath;
          return;
        }

        setAttempt(result.attempt);
        setFeedback(result.feedback);
        setShowHint(false);

        if (result.commandAccepted) {
          setCommand("");
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Command validation failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-ink/5 bg-slate-950 p-6 text-slate-100 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Guided Terminal
            </p>
            <h2 className="font-display text-3xl font-semibold text-white">
              {attempt.challengeTitle}
            </h2>
            <p className="text-sm text-slate-300">
              Guided simulation only. This is training practice, not a full Cisco IOS emulator.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              Progress
            </p>
            <p className="font-display text-2xl font-semibold text-white">
              {completedSteps} / {attempt.totalSteps}
            </p>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,197,94,0.9),rgba(8,145,178,0.9))]"
            style={{
              width: `${Math.max(
                6,
                Math.round((completedSteps / Math.max(attempt.totalSteps, 1)) * 100)
              )}%`
            }}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/50 p-5 font-mono text-sm">
          {attempt.status === "completed" ? (
            <div className="space-y-4">
              <p className="text-emerald-300">Challenge completed.</p>
              <p className="text-slate-300">
                You cleared all {attempt.totalSteps} steps. Review the command history below
                or restart from the challenge page.
              </p>
            </div>
          ) : currentStep ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  Step {currentStep.stepNumber} of {attempt.totalSteps}
                </span>
              </div>

              <p className="leading-7 text-slate-100">{currentStep.prompt}</p>

              <div className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-4">
                <label className="flex items-center gap-3">
                  <span className="text-emerald-300">Switch#</span>
                  <input
                    autoComplete="off"
                    className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                    disabled={isPending}
                    onChange={(event) => setCommand(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Type the command for this step"
                    spellCheck={false}
                    value={command}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:opacity-60"
                  disabled={isPending || !command.trim()}
                  onClick={handleSubmit}
                  type="button"
                >
                  Submit Command
                </button>
                {currentStep.hint ? (
                  <button
                    className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
                    onClick={() => setShowHint((current) => !current)}
                    type="button"
                  >
                    {showHint ? "Hide Hint" : "Reveal Hint"}
                  </button>
                ) : null}
              </div>

              {showHint && currentStep.hint ? (
                <div className="rounded-2xl border border-amber-300/20 bg-amber-200/10 px-4 py-4 text-amber-100">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">Hint</p>
                  <p className="mt-2 text-sm">{currentStep.hint}</p>
                </div>
              ) : null}

              {feedback ? (
                <div className={`rounded-2xl px-4 py-4 ${feedbackTone}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">Feedback</p>
                  <p className="mt-2 text-sm">{feedback}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-amber-100">No CLI steps are configured for this challenge yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            Attempt History
          </p>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Recorded Commands
          </h3>
        </div>

        {attempt.results.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-pearl px-4 py-3 text-sm text-slate">
            No commands submitted yet. Start with the current prompt above.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {attempt.results.map((result) => (
              <div
                className="rounded-2xl border border-ink/5 bg-pearl px-4 py-4 font-mono text-sm"
                key={result.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-ink">Step {result.stepNumber}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      result.isCorrect
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-rose-100 text-rose-900"
                    }`}
                  >
                    {result.isCorrect ? "Accepted" : "Retry"}
                  </span>
                </div>
                <p className="mt-3 text-ink">Switch# {result.enteredCommand}</p>
                <p className="mt-3 font-sans text-sm text-slate">{result.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

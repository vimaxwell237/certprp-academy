import type { CliValidationType } from "@/types/cli";

export interface CliValidationResult {
  isCorrect: boolean;
  feedback: string;
}

export function normalizeCommand(command: string) {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

export function validateCliCommand(input: {
  enteredCommand: string;
  expectedPatterns: string[];
  validationType: CliValidationType;
  explanation?: string | null;
}): CliValidationResult {
  const rawCommand = input.enteredCommand.trim();

  if (!rawCommand) {
    return {
      isCorrect: false,
      feedback: "Enter a command before submitting this step."
    };
  }

  if (input.validationType === "exact") {
    const exactMatch = input.expectedPatterns.some((pattern) => rawCommand === pattern);

    if (exactMatch) {
      return {
        isCorrect: true,
        feedback: input.explanation ?? "Correct command."
      };
    }

    const normalizedMatch = input.expectedPatterns.some(
      (pattern) => normalizeCommand(pattern) === normalizeCommand(rawCommand)
    );

    return {
      isCorrect: false,
      feedback: normalizedMatch
        ? "The command is close, but this step expects the exact syntax shown in the scenario."
        : "That command does not match the expected syntax for this step."
    };
  }

  if (input.validationType === "normalized") {
    const normalizedInput = normalizeCommand(rawCommand);
    const isCorrect = input.expectedPatterns.some(
      (pattern) => normalizeCommand(pattern) === normalizedInput
    );

    return {
      isCorrect,
      feedback: isCorrect
        ? input.explanation ?? "Correct command."
        : "That command is not correct yet. Check the required syntax and try again."
    };
  }

  const isCorrect = input.expectedPatterns.some((pattern) =>
    new RegExp(pattern, "i").test(rawCommand)
  );

  return {
    isCorrect,
    feedback: isCorrect
      ? input.explanation ?? "Correct command."
      : "That command pattern is not correct for this step. Review the prompt and try again."
  };
}

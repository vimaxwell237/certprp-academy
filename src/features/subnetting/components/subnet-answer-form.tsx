"use client";

import { Button } from "@/components/ui/button";
import type {
  GeneratedSubnetProblem,
  SubnetAnswerInput,
  SubnettingDifficulty
} from "@/types/subnetting";

const FIELD_CONFIG: Array<{
  key: keyof SubnetAnswerInput;
  label: string;
  placeholder: string;
}> = [
  {
    key: "subnetMask",
    label: "Subnet mask",
    placeholder: "255.255.255.192"
  },
  {
    key: "networkAddress",
    label: "Network address",
    placeholder: "192.168.10.0"
  },
  {
    key: "firstUsableHost",
    label: "First usable host",
    placeholder: "192.168.10.1"
  },
  {
    key: "lastUsableHost",
    label: "Last usable host",
    placeholder: "192.168.10.62"
  },
  {
    key: "broadcastAddress",
    label: "Broadcast address",
    placeholder: "192.168.10.63"
  },
  {
    key: "totalUsableHosts",
    label: "Total usable hosts",
    placeholder: "62"
  }
];

export function SubnetAnswerForm({
  answers,
  difficulty,
  isPending,
  onAnswerChange,
  onDifficultyChange,
  onGenerateProblem,
  onSubmit,
  problem
}: {
  answers: SubnetAnswerInput;
  difficulty: SubnettingDifficulty;
  isPending: boolean;
  onAnswerChange: (key: keyof SubnetAnswerInput, value: string) => void;
  onDifficultyChange: (difficulty: SubnettingDifficulty) => void;
  onGenerateProblem: () => void;
  onSubmit: () => void;
  problem: GeneratedSubnetProblem;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="space-y-2 text-sm font-medium text-ink">
            <span>Difficulty</span>
            <select
              className="w-full rounded-2xl border border-ink/10 bg-pearl px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/60"
              disabled={isPending}
              onChange={(event) =>
                onDifficultyChange(event.target.value as SubnettingDifficulty)
              }
              value={difficulty}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced VLSM</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-3">
            <Button disabled={isPending} onClick={onGenerateProblem} variant="secondary">
              New Problem
            </Button>
            <Button disabled={isPending} onClick={onSubmit}>
              Check Answers
            </Button>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate">
          Current prompt: <span className="font-semibold text-ink">{problem.questionLabel}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {FIELD_CONFIG.map((field) => (
          <label
            className="space-y-2 rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft"
            key={field.key}
          >
            <span className="text-sm font-semibold text-ink">{field.label}</span>
            <input
              autoComplete="off"
              className="w-full rounded-2xl border border-ink/10 bg-pearl px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/60"
              disabled={isPending}
              onChange={(event) => onAnswerChange(field.key, event.target.value)}
              placeholder={field.placeholder}
              spellCheck={false}
              type="text"
              value={answers[field.key]}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

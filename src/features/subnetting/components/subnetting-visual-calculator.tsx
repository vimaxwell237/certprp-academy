"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { OpenAiTutorButton } from "@/features/ai-tutor/components/open-ai-tutor-button";
import { buildSubnettingCalculatorTutorRequest } from "@/features/subnetting/lib/subnetting-ai-tutor";
import {
  buildVisualCalculation,
  parseIPv4CIDR
} from "@/features/subnetting/lib/subnetting-visual-engine";
import type {
  SubnetVisualCalculationResult,
  SubnettingCalculatorMode
} from "@/types/subnetting";

import { SubnetBinaryBreakdown } from "./subnet-binary-breakdown";
import { SubnetBlockSizePanel } from "./subnet-block-size-panel";
import { SubnetMaskVisualization } from "./subnet-mask-visualization";
import { SubnetRangeExplanation } from "./subnet-range-explanation";
import { SubnetResultCard } from "./subnet-result-card";
import { SubnetStepByStepPanel } from "./subnet-step-by-step-panel";
import { SubnettingCalculatorForm } from "./subnetting-calculator-form";

export function SubnettingVisualCalculator({
  initialInput = "192.168.10.70/26"
}: {
  initialInput?: string;
}) {
  const [inputValue, setInputValue] = useState(initialInput);
  const [mode, setMode] = useState<SubnettingCalculatorMode>("quick");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubnetVisualCalculationResult | null>(null);
  const [revealedStepCount, setRevealedStepCount] = useState(0);
  const tutorRequest = buildSubnettingCalculatorTutorRequest({
    inputValue,
    mode,
    result
  });

  useEffect(() => {
    if (!result) {
      return;
    }

    setRevealedStepCount(mode === "quick" ? result.steps.length : 1);
  }, [mode, result]);

  function handleSubmit() {
    try {
      parseIPv4CIDR(inputValue);
      const calculation = buildVisualCalculation(inputValue);

      setError(null);
      setResult(calculation);
      setRevealedStepCount(mode === "quick" ? calculation.steps.length : 1);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to calculate that subnet."
      );
      setResult(null);
      setRevealedStepCount(0);
    }
  }

  return (
    <div className="space-y-6">
      <SubnettingCalculatorForm
        inputValue={inputValue}
        mode={mode}
        onInputChange={setInputValue}
        onModeChange={setMode}
        onSubmit={handleSubmit}
      />

      <Card className="border-cyan/15 bg-cyan/5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Live AI Tutor
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
          Ask about this subnet calculation
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate">
          {result
            ? "Open the current AI tutor with the exact input, interesting octet, block size, and final subnet range from this calculator."
            : "Send the current IPv4/CIDR input and mode to the live tutor for a guided explanation before or after you calculate."}
        </p>
        <OpenAiTutorButton
          className="mt-4"
          label={result ? "Explain This Calculation" : "Help Me Solve This Input"}
          lessonContext={tutorRequest.lessonContext}
          question={tutorRequest.question}
          source="subnetting-calculator-live"
        />
      </Card>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
          <p className="font-semibold">Check the input format.</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : null}

      {!result && !error ? (
        <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            How this helps
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Visualize the subnet, not just the answer
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-slate">
            Enter any IPv4/CIDR value to see the address in binary, watch the mask split
            network bits from host bits, follow the block-size logic, and understand why an
            address falls into a specific subnet range.
          </p>
        </div>
      ) : null}

      {result ? (
        <>
          <SubnetStepByStepPanel
            mode={mode}
            onRevealAll={() => setRevealedStepCount(result.steps.length)}
            onRevealNext={() =>
              setRevealedStepCount((current) => Math.min(current + 1, result.steps.length))
            }
            revealedStepCount={revealedStepCount}
            steps={result.steps}
          />

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <SubnetBinaryBreakdown
                ipAddress={result.inputAddress}
                octets={result.ipBinaryOctets}
                title="IPv4 Address in Binary"
              />
              <SubnetBinaryBreakdown
                ipAddress={result.subnetMask}
                octets={result.maskBinaryOctets}
                title="Subnet Mask in Binary"
              />
              <SubnetRangeExplanation
                containingSubnetEnd={result.containingSubnetEnd}
                containingSubnetStart={result.containingSubnetStart}
                inputAddress={result.inputAddress}
                rangeExplanation={result.rangeExplanation}
              />
            </div>

            <div className="space-y-6">
              <SubnetMaskVisualization
                hostBits={32 - result.prefixLength}
                maskBinaryOctets={result.maskBinaryOctets}
                prefixLength={result.prefixLength}
                subnetMask={result.subnetMask}
              />
              <SubnetBlockSizePanel
                blockSize={result.blockSize}
                interestingOctetLabel={result.interestingOctetLabel}
                interestingOctetValue={result.interestingOctetValue}
                subnetBoundaries={result.subnetBoundaries}
              />
              <SubnetResultCard result={result} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

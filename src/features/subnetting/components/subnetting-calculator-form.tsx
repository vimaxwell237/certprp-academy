"use client";

import { Button } from "@/components/ui/button";
import type { SubnettingCalculatorMode } from "@/types/subnetting";

export function SubnettingCalculatorForm({
  inputValue,
  mode,
  onInputChange,
  onModeChange,
  onSubmit
}: {
  inputValue: string;
  mode: SubnettingCalculatorMode;
  onInputChange: (value: string) => void;
  onModeChange: (mode: SubnettingCalculatorMode) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr_auto] lg:items-end">
        <label className="space-y-2 text-sm font-medium text-ink">
          <span>IPv4/CIDR Input</span>
          <input
            autoComplete="off"
            className="w-full rounded-2xl border border-ink/10 bg-pearl px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/60"
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="192.168.10.70/26"
            spellCheck={false}
            type="text"
            value={inputValue}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-ink">
          <span>Mode</span>
          <select
            className="w-full rounded-2xl border border-ink/10 bg-pearl px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/60"
            onChange={(event) => onModeChange(event.target.value as SubnettingCalculatorMode)}
            value={mode}
          >
            <option value="quick">Quick Calculate</option>
            <option value="guided">Guided Learning</option>
          </select>
        </label>

        <Button onClick={onSubmit}>Calculate</Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate">
        <span className="rounded-full bg-pearl px-3 py-1">
          Try `192.168.10.0/26`
        </span>
        <span className="rounded-full bg-pearl px-3 py-1">
          Try `10.1.5.130/27`
        </span>
      </div>
    </div>
  );
}

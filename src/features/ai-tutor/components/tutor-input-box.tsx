"use client";

import { Button } from "@/components/ui/button";

export function TutorInputBox({
  compact = false,
  disabled,
  onChange,
  onSubmit,
  surface = "card",
  value
}: {
  compact?: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  surface?: "card" | "plain";
  value: string;
}) {
  const plainSurface = surface === "plain";
  const compactPlain = compact && plainSurface;

  return (
    <div className={plainSurface ? "" : "rounded-3xl border border-ink/5 bg-white/90 p-5 shadow-soft"}>
      <label className={`text-sm font-medium text-ink ${compactPlain ? "block" : "space-y-2"}`}>
        {compactPlain ? (
          <span className="sr-only">Ask a networking question</span>
        ) : (
          <span>{compact ? "Ask a networking question" : "Ask a CCNA networking question"}</span>
        )}
        <textarea
          className={`w-full resize-y rounded-2xl border border-ink/10 px-4 py-3 text-sm text-ink outline-none transition focus:border-cyan/60 ${
            plainSurface ? "bg-pearl/70" : "bg-pearl"
          } ${
            compactPlain
              ? "min-h-[3rem] max-h-24 rounded-[1.25rem] py-2.5 leading-6"
              : compact
                ? "min-h-[4.25rem]"
                : "min-h-28"
          }`}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Example: How do I calculate a /27 subnet?"
          value={value}
        />
      </label>

      <div
        className={`${
          compactPlain ? "mt-2" : plainSurface ? "mt-3" : "mt-4"
        } flex flex-wrap justify-end gap-3`}
      >
        <Button disabled={disabled || !value.trim()} onClick={onSubmit}>
          Ask AI Tutor
        </Button>
      </div>
    </div>
  );
}

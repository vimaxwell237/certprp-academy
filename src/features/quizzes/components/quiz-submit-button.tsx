"use client";

import { useFormStatus } from "react-dom";

export function QuizSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Submitting..." : "Submit Quiz"}
    </button>
  );
}


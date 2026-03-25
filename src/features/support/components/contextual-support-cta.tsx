import Link from "next/link";

import { buildSupportRequestHref } from "@/features/support/lib/support-link";
import type { SupportCategory } from "@/types/support";

export function ContextualSupportCta(input: {
  title: string;
  description: string;
  category: SupportCategory;
  subject: string;
  lessonId?: string | null;
  quizAttemptId?: string | null;
  examAttemptId?: string | null;
  labId?: string | null;
  cliChallengeId?: string | null;
}) {
  const href = buildSupportRequestHref(input);

  return (
    <div className="rounded-3xl border border-cyan/15 bg-cyan/5 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
        Tutor Support
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{input.title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate">{input.description}</p>
      <Link
        className="mt-4 inline-flex rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
        href={href}
      >
        Get Tutor Help
      </Link>
    </div>
  );
}

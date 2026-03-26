import { redirect } from "next/navigation";

import { AskAiTutorCta } from "@/features/ai-tutor/components/ask-ai-tutor-cta";
import { generateRandomSubnet } from "@/features/subnetting/lib/subnetting-engine";
import { SubnettingTrainer } from "@/features/subnetting/components/subnetting-trainer";
import {
  buildEmptySubnettingSnapshot,
  fetchSubnettingPracticeSnapshot
} from "@/features/subnetting/data/subnetting-service";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";
import Link from "next/link";

export default async function SubnettingPracticePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  const initialProblem = generateRandomSubnet("beginner");
  let historyLoadError: string | null = null;
  let snapshot = buildEmptySubnettingSnapshot();

  try {
    snapshot = await fetchSubnettingPracticeSnapshot(user.id);
  } catch (error) {
    historyLoadError =
      error instanceof Error ? error.message : "Subnetting history could not be loaded.";
  }

  return (
    <section className="w-full space-y-8 pb-12">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
          Practice Trainer
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Interactive Subnetting Trainer
        </h1>
        <p className="max-w-3xl text-base text-slate">
          Practice IPv4 subnetting with instant feedback on network address, broadcast
          address, host range, usable hosts, CIDR, and subnet masks. Beginner and
          intermediate problems give you direct subnets, while advanced mode turns the
          same logic into VLSM scenarios.
        </p>
      </div>

      <div className="rounded-3xl border border-cyan/20 bg-cyan/5 p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
          Need a visual walkthrough?
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
          Open the Subnetting Visual Calculator
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate">
          Use the calculator when you want to see the address in binary, identify the
          interesting octet, inspect block sizes, and follow the subnet range step by step.
        </p>
        <Link
          className="mt-4 inline-flex rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/50 hover:text-cyan"
          href={APP_ROUTES.subnettingCalculator}
        >
          Open Visual Calculator
        </Link>
      </div>

      {historyLoadError ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="font-semibold">Practice history is temporarily unavailable.</p>
          <p className="mt-2 text-sm">
            The trainer still works, but saved attempts and long-term statistics need the
            subnetting migration to be present in Supabase.
          </p>
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs">{historyLoadError}</p>
        </div>
      ) : null}

      <SubnettingTrainer initialProblem={initialProblem} initialSnapshot={snapshot} />

      <AskAiTutorCta
        description="If the subnetting logic still feels unclear, ask the AI tutor for a simpler walkthrough, a CIDR explanation, or a step-by-step subnet example."
        lessonContext="Subnetting practice trainer"
        question="Can you explain how to solve subnetting problems step by step?"
        source="subnetting-trainer"
        title="Need help with a subnetting concept?"
      />
    </section>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { AskAiTutorCta } from "@/features/ai-tutor/components/ask-ai-tutor-cta";
import { SubnettingVisualCalculator } from "@/features/subnetting/components/subnetting-visual-calculator";
import { APP_ROUTES } from "@/lib/auth/redirects";
import { getCurrentUser } from "@/lib/auth/session";

export default async function SubnettingCalculatorPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(APP_ROUTES.login);
  }

  return (
    <section className="w-full space-y-8 pb-12">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">
          Visual Practice
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Subnetting Visual Calculator
        </h1>
        <p className="max-w-3xl text-base text-slate">
          Turn subnetting into a visible process. This calculator shows the address in
          binary, highlights network bits and host bits, explains block sizes, and walks
          you through how the network, broadcast, and host range are found.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            Quick Access
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            Switch to the trainer
          </h2>
          <p className="mt-2 text-sm text-slate">
            Use the Interactive Subnetting Trainer when you want scored practice problems
            with instant answer checking.
          </p>
          <Link
            className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900"
            href={APP_ROUTES.subnettingPractice}
          >
            Open Interactive Trainer
          </Link>
        </div>

        <div className="rounded-3xl border border-cyan/20 bg-cyan/5 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
            Learning Modes
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            Quick or guided
          </h2>
          <p className="mt-2 text-sm text-slate">
            Quick Calculate reveals the full solution instantly. Guided Learning reveals
            the logic one step at a time so beginners can follow the reasoning.
          </p>
        </div>
      </div>

      <SubnettingVisualCalculator />

      <AskAiTutorCta
        description="Ask the AI tutor to explain the interesting octet, block size, or why an address falls into a specific subnet range."
        lessonContext="Subnetting visual calculator"
        question="Can you explain how the interesting octet and block size work in subnetting?"
        source="subnetting-calculator"
        title="Want a spoken-style explanation too?"
      />
    </section>
  );
}

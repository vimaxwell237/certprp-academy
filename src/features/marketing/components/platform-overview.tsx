import Link from "next/link";

import { Card } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/auth/redirects";

const pillars = [
  {
    title: "Certification-first structure",
    description:
      "Follow a clear CCNA study path with lessons, labs, quizzes, and exam practice arranged in the order learners need."
  },
  {
    title: "Practice that supports retention",
    description:
      "Strengthen networking fundamentals with subnetting tools, CLI practice, and guided exercises designed for exam readiness."
  },
  {
    title: "Professional learner experience",
    description:
      "Study on a clean, responsive platform with AI help, tutor support options, and progress tracking that keeps the experience focused."
  }
];

export function PlatformOverview() {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan">
          Why CertPrep Academy
        </p>
        <h2 className="font-display text-4xl font-bold tracking-tight text-ink">
          A modern CCNA learning platform built for real certification prep.
        </h2>
        <p className="max-w-2xl text-lg text-slate">
          CertPrep Academy combines structured networking lessons with practical CCNA tools
          so learners can move from theory into application without juggling multiple apps.
        </p>
        <p className="max-w-2xl text-base text-slate">
          Compare the{" "}
          <Link className="font-semibold text-cyan underline-offset-4 hover:underline" href={APP_ROUTES.pricing}>
            pricing plans
          </Link>{" "}
          or{" "}
          <Link className="font-semibold text-cyan underline-offset-4 hover:underline" href={APP_ROUTES.signup}>
            create an account
          </Link>{" "}
          to start your CCNA study path.
        </p>
      </div>

      <div className="grid gap-4">
        {pillars.map((pillar) => (
          <Card className="border-ink/5" key={pillar.title}>
            <h3 className="font-display text-2xl font-semibold text-ink">
              {pillar.title}
            </h3>
            <p className="mt-3 text-base text-slate">{pillar.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

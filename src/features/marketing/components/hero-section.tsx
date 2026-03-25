import Link from "next/link";

import { APP_ROUTES } from "@/lib/auth/redirects";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(8,145,178,0.22),_transparent_32%),linear-gradient(135deg,_#0F172A_0%,_#12263A_45%,_#0F766E_100%)] px-6 py-16 text-white shadow-soft lg:px-12 lg:py-20">
      <div className="absolute inset-0 bg-grid-fade bg-[length:36px_36px] opacity-10" />
      <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-end">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-50">
            Certification Learning Platform
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight sm:text-6xl">
              CCNA training built for lessons, labs, quizzes, and subnetting practice.
            </h1>
            <p className="max-w-2xl text-lg text-slate-200">
              CertPrep Academy helps networking students prepare for the Cisco CCNA exam
              with structured study paths, hands-on labs, exam-style practice, and built-in
              AI support.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-sand"
              href={APP_ROUTES.signup}
            >
              Start free CCNA access
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              href={APP_ROUTES.pricing}
            >
              Compare CCNA pricing
            </Link>
          </div>
          <p className="text-sm text-slate-200">
            Already have an account?{" "}
            <Link className="font-semibold text-white underline-offset-4 hover:underline" href={APP_ROUTES.login}>
              Log in
            </Link>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
              Track Focus
            </p>
            <p className="mt-4 font-display text-3xl font-bold">CCNA First</p>
            <p className="mt-2 text-sm text-slate-200">
              Start with CCNA today, then expand into future networking, cloud, Linux, and
              cybersecurity certifications.
            </p>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
              What&apos;s Next
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-100">
              <li>Structured courses</li>
              <li>Hands-on labs</li>
              <li>Practice exams</li>
              <li>Guided support</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

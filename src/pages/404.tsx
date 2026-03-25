import Link from "next/link";

export default function Custom404Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f4fbff_0%,#eef5fb_100%)] px-6 py-12 text-slate-900">
      <section className="w-full max-w-3xl rounded-[2rem] border border-white/70 bg-white/90 p-10 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
          404
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          The page you requested was not found.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Return to the CertPrep Academy dashboard or go back to the homepage to
          continue studying.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            href="/dashboard"
          >
            Go to Dashboard
          </Link>
          <Link
            className="inline-flex rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-cyan-500 hover:text-cyan-700"
            href="/"
          >
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}

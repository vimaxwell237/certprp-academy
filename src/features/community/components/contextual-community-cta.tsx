import Link from "next/link";

export function ContextualCommunityCta({
  title,
  description,
  href
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <div className="rounded-3xl border border-ink/5 bg-white/90 p-6 shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan">
        Community
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate">{description}</p>
      <Link
        className="mt-4 inline-flex rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-cyan/60 hover:text-cyan"
        href={href}
      >
        Ask the Community
      </Link>
    </div>
  );
}

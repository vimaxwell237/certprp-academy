export function AdminSectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan">{eyebrow}</p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-ink">{title}</h1>
      <p className="max-w-3xl text-base text-slate">{description}</p>
    </div>
  );
}

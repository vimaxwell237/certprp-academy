export function OperationsActionButton({
  children,
  tone = "default"
}: {
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
        tone === "danger"
          ? "border border-rose-200 text-rose-900 hover:bg-rose-50"
          : "border border-ink/10 text-ink hover:border-cyan/60 hover:text-cyan"
      }`}
      type="submit"
    >
      {children}
    </button>
  );
}

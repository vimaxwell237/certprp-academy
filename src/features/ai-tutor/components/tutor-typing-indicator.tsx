export function TutorTypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-3xl border border-cyan/15 bg-white/95 px-5 py-4 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
          AI Tutor
        </p>
        <div className="mt-2 flex gap-2">
          {[0, 1, 2].map((index) => (
            <span
              className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan/60"
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

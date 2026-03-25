import { formatTutorResponse } from "@/features/ai-tutor/lib/format-response";

function getSectionTone(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("example")) {
    return "border-amber-200 bg-amber-50";
  }

  if (normalized.includes("exam")) {
    return "border-cyan/20 bg-cyan/5";
  }

  return "border-ink/10 bg-pearl";
}

export function TutorFormattedResponse({
  compact = false,
  content
}: {
  compact?: boolean;
  content: string;
}) {
  const sections = formatTutorResponse(content);

  if (sections.length === 0) {
    return (
      <div className={`whitespace-pre-wrap ${compact ? "text-[13px] leading-6" : "text-sm leading-7"}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {sections.map((section) => (
        <section
          className={`rounded-2xl border ${compact ? "px-3 py-3" : "px-4 py-4"} ${getSectionTone(section.title)}`}
          key={`${section.title}-${section.body.join("|")}`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan">
            {section.title}
          </p>
          <div className={compact ? "mt-2 space-y-2" : "mt-3 space-y-2"}>
            {section.body.map((paragraph, paragraphIndex) => (
              <p
                className={`${compact ? "text-[13px] leading-6" : "text-sm leading-7"} text-ink`}
                key={`${section.title}-${paragraphIndex}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

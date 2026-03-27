import { formatTutorResponse } from "@/features/ai-tutor/lib/format-response";

function getSectionPresentation(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("example")) {
    return {
      badgeClassName: "border border-amber-300 bg-amber-100 text-amber-900",
      cardClassName: "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,247,237,0.96))]",
      eyebrow: "Scenario"
    };
  }

  if (normalized.includes("exam")) {
    return {
      badgeClassName: "border border-cyan/20 bg-cyan/10 text-cyan-900",
      cardClassName: "border-cyan/25 bg-[linear-gradient(180deg,rgba(236,254,255,0.96),rgba(248,250,252,0.98))]",
      eyebrow: "Exam focus"
    };
  }

  if (normalized.includes("step")) {
    return {
      badgeClassName: "border border-violet-200 bg-violet-50 text-violet-900",
      cardClassName: "border-violet-200 bg-[linear-gradient(180deg,rgba(245,243,255,0.96),rgba(255,255,255,0.98))]",
      eyebrow: "Walkthrough"
    };
  }

  return {
    badgeClassName: "border border-slate-200 bg-white text-slate-700",
    cardClassName: "border-ink/10 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.98))]",
    eyebrow: "Core idea"
  };
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
      <div
        className={`rounded-2xl border border-ink/10 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.98))] ${
          compact ? "px-3 py-3 text-[13px] leading-6" : "px-4 py-4 text-sm leading-7"
        } whitespace-pre-wrap text-ink`}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {sections.map((section) => (
        (() => {
          const presentation = getSectionPresentation(section.title);

          return (
            <section
              className={`overflow-hidden rounded-[1.35rem] border ${presentation.cardClassName} ${
                compact ? "px-3 py-3" : "px-4 py-4"
              }`}
              key={`${section.title}-${section.blocks
                .map((block) =>
                  block.type === "paragraph" ? block.text : block.items.join("|")
                )
                .join("::")}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${presentation.badgeClassName}`}
                >
                  {presentation.eyebrow}
                </span>
                <p className="text-sm font-semibold text-ink">{section.title}</p>
              </div>

              <div className={compact ? "mt-2.5 space-y-2.5" : "mt-3 space-y-3"}>
                {section.blocks.map((block, blockIndex) => {
                  if (block.type === "paragraph") {
                    return (
                      <p
                        className={`${compact ? "text-[13px] leading-6" : "text-sm leading-7"} text-ink`}
                        key={`${section.title}-paragraph-${blockIndex}`}
                      >
                        {block.text}
                      </p>
                    );
                  }

                  if (block.type === "bullet-list") {
                    return (
                      <ul
                        className={`${compact ? "space-y-2" : "space-y-2.5"}`}
                        key={`${section.title}-bullets-${blockIndex}`}
                      >
                        {block.items.map((item, itemIndex) => (
                          <li className="flex items-start gap-2.5" key={`${section.title}-bullet-${itemIndex}`}>
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan" />
                            <span
                              className={`${compact ? "text-[13px] leading-6" : "text-sm leading-7"} text-ink`}
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <ol
                      className={`${compact ? "space-y-2" : "space-y-2.5"}`}
                      key={`${section.title}-steps-${blockIndex}`}
                    >
                      {block.items.map((item, itemIndex) => (
                        <li className="flex items-start gap-3" key={`${section.title}-step-${itemIndex}`}>
                          <span
                            className={`inline-flex shrink-0 items-center justify-center rounded-full bg-ink text-white ${
                              compact ? "mt-0.5 h-6 w-6 text-[11px]" : "mt-0.5 h-7 w-7 text-xs"
                            } font-semibold`}
                          >
                            {itemIndex + 1}
                          </span>
                          <span
                            className={`${compact ? "text-[13px] leading-6" : "text-sm leading-7"} text-ink`}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ol>
                  );
                })}
              </div>
            </section>
          );
        })()
      ))}
    </div>
  );
}

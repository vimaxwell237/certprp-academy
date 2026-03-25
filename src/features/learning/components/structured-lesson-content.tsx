function isHeading(line: string) {
  return line.startsWith("## ") || line.startsWith("### ");
}

function isBulletList(lines: string[]) {
  return lines.length > 0 && lines.every((line) => line.startsWith("- "));
}

function isOrderedList(lines: string[]) {
  return lines.length > 0 && lines.every((line) => /^\d+\.\s/.test(line));
}

export function StructuredLessonContent({ content }: { content: string }) {
  const blocks = content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length === 0) {
          return null;
        }

        if (lines.length === 1 && isHeading(lines[0] ?? "")) {
          const line = lines[0] as string;
          const label = line.replace(/^###?\s/, "");
          const isPrimaryHeading = line.startsWith("## ");

          return isPrimaryHeading ? (
            <h2
              className="font-display text-2xl font-semibold tracking-tight text-ink"
              key={`${index}-${label}`}
            >
              {label}
            </h2>
          ) : (
            <h3
              className="text-lg font-semibold tracking-tight text-ink"
              key={`${index}-${label}`}
            >
              {label}
            </h3>
          );
        }

        if (isBulletList(lines)) {
          return (
            <ul className="space-y-2 pl-5 text-ink" key={`${index}-bullets`}>
              {lines.map((line, lineIndex) => (
                <li className="list-disc leading-7" key={`${index}-bullet-${lineIndex}`}>
                  {line.slice(2)}
                </li>
              ))}
            </ul>
          );
        }

        if (isOrderedList(lines)) {
          return (
            <ol className="space-y-2 pl-5 text-ink" key={`${index}-ordered`}>
              {lines.map((line, lineIndex) => (
                <li className="list-decimal leading-7" key={`${index}-ordered-${lineIndex}`}>
                  {line.replace(/^\d+\.\s/, "")}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <div className="space-y-3" key={`${index}-paragraph`}>
            {lines.map((line, lineIndex) => (
              <p className="leading-7 text-ink" key={`${index}-paragraph-${lineIndex}`}>
                {line}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

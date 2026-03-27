export type TutorResponseBlock =
  | {
      text: string;
      type: "paragraph";
    }
  | {
      items: string[];
      type: "bullet-list" | "step-list";
    };

export type TutorResponseSection = {
  blocks: TutorResponseBlock[];
  title: string;
};

const HEADING_PATTERNS = [
  /^(\d+[\.\)]\s*)?simple explanation:?$/i,
  /^(\d+[\.\)]\s*)?example:?$/i,
  /^(\d+[\.\)]\s*)?important ccna exam note:?$/i,
  /^(\d+[\.\)]\s*)?ccna exam note:?$/i,
  /^(\d+[\.\)]\s*)?step-by-step breakdown:?$/i,
  /^(\d+[\.\)]\s*)?steps:?$/i
];

function isHeading(line: string) {
  const normalized = line.trim();

  return HEADING_PATTERNS.some((pattern) => pattern.test(normalized));
}

function normalizeHeading(line: string) {
  return line
    .trim()
    .replace(/^(\d+[\.\)]\s*)/i, "")
    .replace(/:$/, "")
    .trim();
}

function cleanBullet(line: string) {
  return line.replace(/^[-*]\s*/, "").trim();
}

function cleanStep(line: string) {
  return line.replace(/^\d+[\.\)]\s*/, "").trim();
}

function isBulletLine(line: string) {
  return /^[-*]\s+/.test(line);
}

function isStepLine(line: string) {
  return /^\d+[\.\)]\s+/.test(line);
}

export function formatTutorResponse(content: string): TutorResponseSection[] {
  const rawLines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (rawLines.length === 0) {
    return [];
  }

  const lines: string[] = [];

  for (let index = 0; index < rawLines.length; index += 1) {
    const currentLine = rawLines[index];
    const nextLine = rawLines[index + 1];

    if (/^\d+$/.test(currentLine) && nextLine) {
      lines.push(`${currentLine}. ${nextLine}`);
      index += 1;
      continue;
    }

    lines.push(currentLine);
  }

  const sections: TutorResponseSection[] = [];
  let current: TutorResponseSection | null = null;

  for (const line of lines) {
    if (isHeading(line)) {
      current = {
        blocks: [],
        title: normalizeHeading(line)
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = {
        blocks: [],
        title: "Answer"
      };
      sections.push(current);
    }

    const lastBlock = current.blocks.at(-1);

    if (isStepLine(line)) {
      const item = cleanStep(line);

      if (lastBlock?.type === "step-list") {
        lastBlock.items.push(item);
      } else {
        current.blocks.push({
          items: [item],
          type: "step-list"
        });
      }

      continue;
    }

    if (isBulletLine(line)) {
      const item = cleanBullet(line);

      if (lastBlock?.type === "bullet-list") {
        lastBlock.items.push(item);
      } else {
        current.blocks.push({
          items: [item],
          type: "bullet-list"
        });
      }

      continue;
    }

    current.blocks.push({
      text: cleanBullet(line),
      type: "paragraph"
    });
  }

  return sections.filter((section) => section.blocks.length > 0);
}

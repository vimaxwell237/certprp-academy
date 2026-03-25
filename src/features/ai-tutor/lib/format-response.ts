export type TutorResponseSection = {
  title: string;
  body: string[];
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

export function formatTutorResponse(content: string): TutorResponseSection[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const sections: TutorResponseSection[] = [];
  let current: TutorResponseSection | null = null;

  for (const line of lines) {
    if (isHeading(line)) {
      current = {
        title: normalizeHeading(line),
        body: []
      };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = {
        title: "Answer",
        body: []
      };
      sections.push(current);
    }

    current.body.push(cleanBullet(line));
  }

  return sections.filter((section) => section.body.length > 0);
}

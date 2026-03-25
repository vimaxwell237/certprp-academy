export function sanitizeInternalPath(
  value: string | null | undefined,
  fallback: string,
  options?: {
    allowedPrefixes?: string[];
  }
) {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("\r") || trimmed.includes("\n")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;

    if (
      options?.allowedPrefixes &&
      !options.allowedPrefixes.some(
        (prefix) =>
          normalized === prefix ||
          normalized.startsWith(`${prefix}/`) ||
          normalized.startsWith(`${prefix}?`) ||
          normalized.startsWith(`${prefix}#`)
      )
    ) {
      return fallback;
    }

    return normalized;
  } catch {
    return fallback;
  }
}

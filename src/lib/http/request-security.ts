import type { NextRequest } from "next/server";

import { getAppBaseUrl } from "@/lib/app-url";

type RateLimitState = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitState>();

function normalizeOrigin(value: string) {
  return value.trim().replace(/\/$/, "").toLowerCase();
}

function getRefererOrigin(request: NextRequest) {
  const referer = request.headers.get("referer");

  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function isTrustedOrigin(candidate: string | null, trustedOrigins: Set<string>) {
  if (!candidate) {
    return false;
  }

  return trustedOrigins.has(normalizeOrigin(candidate));
}

export function isTrustedRequestOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");

  const trustedOrigins = new Set([
    normalizeOrigin(request.nextUrl.origin),
    normalizeOrigin(getAppBaseUrl())
  ]);

  if (origin) {
    return isTrustedOrigin(origin, trustedOrigins);
  }

  return isTrustedOrigin(getRefererOrigin(request), trustedOrigins);
}

export function checkSlidingWindowRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = rateLimitBuckets.get(input.key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs
    });

    return {
      allowed: true,
      retryAfterSeconds: Math.ceil(input.windowMs / 1000)
    };
  }

  if (current.count >= input.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    };
  }

  current.count += 1;
  rateLimitBuckets.set(input.key, current);

  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
  };
}

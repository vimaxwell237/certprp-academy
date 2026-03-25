import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { hasValidAutomationSecret } from "@/features/delivery/lib/automation-auth";

const AUTOMATION_RESPONSE_HEADERS = {
  "Cache-Control": "no-store"
} as const;

export function readAutomationSecret(request: NextRequest) {
  const authorizationHeader = request.headers.get("authorization");

  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-automation-secret");
}

export function readAutomationLimit(request: NextRequest) {
  const value = Number(request.nextUrl.searchParams.get("limit") ?? "25");

  if (!Number.isFinite(value) || value < 1) {
    return 25;
  }

  return Math.min(Math.floor(value), 100);
}

export function isAuthorizedAutomationRequest(request: NextRequest) {
  return hasValidAutomationSecret(
    readAutomationSecret(request),
    process.env.AUTOMATION_SECRET
  );
}

export function automationUnauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized." },
    {
      headers: AUTOMATION_RESPONSE_HEADERS,
      status: 401
    }
  );
}

export function automationSuccessResponse(summary: unknown) {
  return NextResponse.json(
    {
      ok: true,
      summary
    },
    {
      headers: AUTOMATION_RESPONSE_HEADERS
    }
  );
}

export function automationFailureResponse(
  error: unknown,
  fallbackMessage: string
) {
  const message =
    process.env.NODE_ENV === "production"
      ? fallbackMessage
      : error instanceof Error
        ? error.message
        : fallbackMessage;

  return NextResponse.json(
    { error: message },
    {
      headers: AUTOMATION_RESPONSE_HEADERS,
      status: 500
    }
  );
}

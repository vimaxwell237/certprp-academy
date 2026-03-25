import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

import { getAppBaseUrl } from "@/lib/app-url";
import { isTrustedRequestOrigin } from "@/lib/http/request-security";

const appBaseUrl = getAppBaseUrl();

function buildRequest(headers: Record<string, string> = {}) {
  return new NextRequest(`${appBaseUrl}/api/ai/networking-tutor`, {
    method: "POST",
    headers
  });
}

test("allows same-origin requests with an Origin header", () => {
  assert.equal(
    isTrustedRequestOrigin(
      buildRequest({
        origin: appBaseUrl
      })
    ),
    true
  );
});

test("allows same-origin requests when Origin is missing but Referer matches", () => {
  assert.equal(
    isTrustedRequestOrigin(
      buildRequest({
        referer: `${appBaseUrl}/ai-tutor?source=lesson`
      })
    ),
    true
  );
});

test("rejects requests with no Origin or Referer", () => {
  assert.equal(isTrustedRequestOrigin(buildRequest()), false);
});

test("rejects cross-site Origin and Referer values", () => {
  assert.equal(
    isTrustedRequestOrigin(
      buildRequest({
        origin: "https://evil.example",
        referer: `${appBaseUrl}/ai-tutor`
      })
    ),
    false
  );

  assert.equal(
    isTrustedRequestOrigin(
      buildRequest({
        referer: "https://evil.example/ai-tutor"
      })
    ),
    false
  );
});

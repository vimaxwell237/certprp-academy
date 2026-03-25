import { timingSafeEqual } from "node:crypto";

function toBuffer(value: string) {
  return Buffer.from(value, "utf8");
}

export function hasValidAutomationSecret(
  providedSecret: string | null,
  expectedSecret: string | undefined
) {
  if (!providedSecret || !expectedSecret) {
    return false;
  }

  const providedBuffer = toBuffer(providedSecret);
  const expectedBuffer = toBuffer(expectedSecret);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

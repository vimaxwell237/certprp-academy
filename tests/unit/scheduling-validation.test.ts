import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeMeetingLink,
  readBookingCategory,
  readRequiredText,
  readSessionStatus,
  readUtcIsoDate,
  SchedulingValidationError
} from "@/features/scheduling/lib/validation";

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

test("readBookingCategory and readSessionStatus accept supported values", () => {
  const formData = createFormData({
    category: "quiz_help",
    status: "confirmed"
  });

  assert.equal(readBookingCategory(formData), "quiz_help");
  assert.equal(readSessionStatus(formData), "confirmed");
});

test("readBookingCategory and readSessionStatus reject unsupported values", () => {
  const formData = createFormData({
    category: "coaching",
    status: "done"
  });

  assert.throws(() => readBookingCategory(formData), SchedulingValidationError);
  assert.throws(() => readSessionStatus(formData), SchedulingValidationError);
});

test("readUtcIsoDate parses hidden UTC inputs and required text trims whitespace", () => {
  const formData = createFormData({
    startsAtUtc: "2026-03-11T18:00:00.000Z",
    subject: "  OSPF walkthrough  "
  });

  assert.equal(readUtcIsoDate(formData, "startsAtUtc", "Start time"), "2026-03-11T18:00:00.000Z");
  assert.equal(readRequiredText(formData, "subject", "Subject"), "OSPF walkthrough");
});

test("normalizeMeetingLink accepts http and https URLs only", () => {
  assert.equal(normalizeMeetingLink("https://meet.example.com/session-1"), "https://meet.example.com/session-1");
  assert.equal(normalizeMeetingLink("http://localhost:3000/meeting"), "http://localhost:3000/meeting");
  assert.equal(normalizeMeetingLink(null), null);
  assert.throws(() => normalizeMeetingLink("ftp://example.com"), SchedulingValidationError);
  assert.throws(() => normalizeMeetingLink("not-a-url"), SchedulingValidationError);
});

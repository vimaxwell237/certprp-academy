import assert from "node:assert/strict";
import test from "node:test";

import {
  AdminFormError,
  readDifficulty,
  readExpertiseList,
  readPlanInterval,
  readPositiveInteger,
  readSlug,
  toActionErrorState,
  toActionSuccessState
} from "@/features/admin/lib/validation";

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

test("readSlug normalizes valid slugs", () => {
  const formData = createFormData({
    slug: "CCNA-Track"
  });

  assert.equal(readSlug(formData), "ccna-track");
});

test("readSlug rejects invalid slug characters", () => {
  const formData = createFormData({
    slug: "ccna track"
  });

  assert.throws(() => readSlug(formData), AdminFormError);
});

test("readPositiveInteger enforces positive whole numbers", () => {
  const valid = createFormData({
    estimatedMinutes: "25"
  });
  const invalid = createFormData({
    estimatedMinutes: "0"
  });

  assert.equal(readPositiveInteger(valid, "estimatedMinutes", "Estimated minutes"), 25);
  assert.throws(
    () => readPositiveInteger(invalid, "estimatedMinutes", "Estimated minutes"),
    AdminFormError
  );
});

test("readExpertiseList trims comma-separated topics", () => {
  const formData = createFormData({
    expertise: "routing, OSPF , Packet Tracer"
  });

  assert.deepEqual(readExpertiseList(formData, "expertise"), [
    "routing",
    "OSPF",
    "Packet Tracer"
  ]);
});

test("readPlanInterval and readDifficulty only accept allowed values", () => {
  const valid = createFormData({
    billingInterval: "month",
    difficulty: "advanced"
  });
  const invalid = createFormData({
    billingInterval: "weekly",
    difficulty: "expert"
  });

  assert.equal(readPlanInterval(valid), "month");
  assert.equal(readDifficulty(valid), "advanced");
  assert.throws(() => readPlanInterval(invalid), AdminFormError);
  assert.throws(() => readDifficulty(invalid), AdminFormError);
});

test("action state helpers preserve validation detail", () => {
  const errorState = toActionErrorState(
    new AdminFormError("Slug is already in use.", { slug: "Slug is already in use." })
  );
  const successState = toActionSuccessState("Saved.", "record-1");

  assert.equal(errorState.status, "error");
  assert.equal(errorState.fieldErrors.slug, "Slug is already in use.");
  assert.equal(successState.status, "success");
  assert.equal(successState.savedRecordId, "record-1");
});

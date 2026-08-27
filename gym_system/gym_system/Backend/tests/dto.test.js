import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UpdateTrainingSubscriptionDTO } from "../src/dto/trainingSubscription.dto.js";
import { UpdateTrainerProfileDTO } from "../src/dto/trainerProfile.dto.js";

describe("UpdateTrainingSubscriptionDTO", () => {
  it("allows pending to active status update", () => {
    const { isValid, errors } = UpdateTrainingSubscriptionDTO.from({
      status: "active",
      expire_date: "2026-08-24T00:00:00.000Z",
    });
    assert.equal(isValid, true);
    assert.equal(errors.length, 0);
  });

  it("rejects an invalid subscription status", () => {
    const { isValid, errors } = UpdateTrainingSubscriptionDTO.from({
      status: "approved",
    });
    assert.equal(isValid, false);
    assert.ok(errors.some((e) => e.field === "status"));
  });
});

describe("UpdateTrainerProfileDTO", () => {
  it("accepts a valid admin trainer edit payload", () => {
    const { isValid, errors } = UpdateTrainerProfileDTO.from({
      name: "Alex Rivers",
      email: "alex@cylonforce.com",
      specialization: "CrossFit",
      bio: "Strength coach",
      certifications: ["NASM"],
    });
    assert.equal(isValid, true);
    assert.equal(errors.length, 0);
  });

  it("rejects a short password on trainer update", () => {
    const { isValid, errors } = UpdateTrainerProfileDTO.from({
      password: "123",
    });
    assert.equal(isValid, false);
    assert.ok(errors.some((e) => e.field === "password"));
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/trainerProfile.service.js", [
  "registerTrainerWithFullProfile",
  "getAllTrainerProfiles",
  "updateTrainerProfileById",
  "deleteTrainerProfile",
]);

const ctrl = await import("../../src/controllers/trainerProfile.controller.js");

describe("trainerProfile.controller", () => {
  it("registerTrainer returns 201", async () => {
    setImpl(api.registerTrainerWithFullProfile, async () => ({
      user: { _id: "u1", name: "Coach" },
      profile: { _id: "t1", specialization: "Yoga" },
    }));
    const res = mockRes();
    await ctrl.registerTrainer(
      mockReq({ body: { name: "Coach", email: "c@test.com", password: "secret1" } }),
      res
    );
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.status, "success");
  });

  it("getAllProfiles returns trainers", async () => {
    setImpl(api.getAllTrainerProfiles, async () => ({
      profiles: [{ _id: "t1" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAllProfiles(mockReq({ query: {} }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("updateProfileById returns profile", async () => {
    setImpl(api.updateTrainerProfileById, async () => ({
      _id: "t1",
      specialization: "CrossFit",
    }));
    const res = mockRes();
    await ctrl.updateProfileById(
      mockReq({ params: { id: "t1" }, dto: { specialization: "CrossFit" } }),
      res
    );
    assert.equal(res.body.profile.specialization, "CrossFit");
  });

  it("deleteProfile maps error", async () => {
    setImpl(api.deleteTrainerProfile, async () => {
      throw serviceError("Trainer profile not found.", 404);
    });
    const res = mockRes();
    await ctrl.deleteProfile(mockReq({ params: { id: "x" } }), res);
    assert.equal(res.statusCode, 404);
  });
});

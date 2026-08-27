import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/clientProfile.service.js", [
  "registerMemberWithFullProfile",
  "getAllClientProfiles",
  "getClientProfileById",
  "deleteClientProfile",
]);

const ctrl = await import("../../src/controllers/clientProfile.controller.js");

describe("clientProfile.controller", () => {
  it("registerMember returns 201", async () => {
    setImpl(api.registerMemberWithFullProfile, async () => ({
      user: { _id: "u1", name: "Member" },
      profile: { _id: "p1" },
    }));
    const res = mockRes();
    await ctrl.registerMember(mockReq({ body: { name: "Member", email: "m@test.com" } }), res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.status, "success");
  });

  it("getAllProfiles returns profiles", async () => {
    setImpl(api.getAllClientProfiles, async () => ({
      profiles: [{ _id: "p1" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAllProfiles(mockReq({ query: {} }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("getProfileById returns profile", async () => {
    setImpl(api.getClientProfileById, async () => ({ _id: "p1" }));
    const res = mockRes();
    await ctrl.getProfileById(mockReq({ params: { id: "p1" } }), res);
    assert.equal(res.body.profile._id, "p1");
  });

  it("deleteProfile maps error", async () => {
    setImpl(api.deleteClientProfile, async () => {
      throw serviceError("Client profile not found.", 404);
    });
    const res = mockRes();
    await ctrl.deleteProfile(mockReq({ params: { id: "x" } }), res);
    assert.equal(res.statusCode, 404);
  });
});

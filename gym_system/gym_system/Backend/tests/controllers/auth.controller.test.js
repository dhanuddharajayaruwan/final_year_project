import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/auth.service.js", [
  "registerUser",
  "loginUser",
  "getMe",
  "updateMe",
  "changePassword",
]);

const ctrl = await import("../../src/controllers/auth.controller.js");

describe("auth.controller", () => {
  it("register returns 201 with token", async () => {
    setImpl(api.registerUser, async () => ({
      token: "jwt-token",
      user: { _id: "1", email: "a@test.com", role: "client" },
    }));
    const res = mockRes();
    await ctrl.register(
      mockReq({ dto: { name: "A", email: "a@test.com", password: "secret1" } }),
      res
    );
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.status, "success");
    assert.equal(res.body.token, "jwt-token");
  });

  it("login returns 200 with token", async () => {
    setImpl(api.loginUser, async () => ({
      token: "jwt-token",
      user: { _id: "1", email: "a@test.com" },
    }));
    const res = mockRes();
    await ctrl.login(mockReq({ dto: { email: "a@test.com", password: "secret1" } }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, "success");
  });

  it("getMe returns current user", async () => {
    setImpl(api.getMe, async () => ({ _id: "1", name: "Admin" }));
    const res = mockRes();
    await ctrl.getMe(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.user.name, "Admin");
  });

  it("login maps service errors", async () => {
    setImpl(api.loginUser, async () => {
      throw serviceError("Invalid credentials", 401);
    });
    const res = mockRes();
    await ctrl.login(mockReq({ dto: { email: "bad@test.com", password: "x" } }), res);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.status, "error");
  });

  it("logout returns success", () => {
    const res = mockRes();
    ctrl.logout(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, "success");
  });
});

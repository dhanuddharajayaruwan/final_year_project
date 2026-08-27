import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockDefaultService, setImpl } from "../helpers/mockService.js";

const api = mockDefaultService("services/deliveryFee.service.js", [
  "create",
  "getAll",
  "getById",
  "update",
  "remove",
]);

const ctrl = (await import("../../src/controllers/deliveryFee.controller.js")).default;

describe("deliveryFee.controller", () => {
  it("create returns 201", async () => {
    setImpl(api.create, async () => ({
      _id: "d1",
      district: "Colombo",
      fee: 300,
    }));
    const res = mockRes();
    await ctrl.create(mockReq({ dto: { district: "Colombo", fee: 300 } }), res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.data.district, "Colombo");
  });

  it("getAll returns fees", async () => {
    setImpl(api.getAll, async () => ({
      fees: [{ district: "Colombo" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAll(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("getById returns 404 when missing", async () => {
    setImpl(api.getById, async () => null);
    const res = mockRes();
    await ctrl.getById(mockReq({ params: { id: "x" } }), res);
    assert.equal(res.statusCode, 404);
  });

  it("update maps service error", async () => {
    setImpl(api.update, async () => {
      throw serviceError("Update failed", 400);
    });
    const res = mockRes();
    await ctrl.update(mockReq({ params: { id: "d1" }, dto: { fee: 350 } }), res);
    assert.equal(res.statusCode, 400);
  });
});

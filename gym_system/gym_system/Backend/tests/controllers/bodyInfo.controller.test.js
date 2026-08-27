import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/bodyInfo.service.js", [
  "createBodyInfo",
  "getMyBodyInfo",
  "updateBodyInfoById",
  "deleteBodyInfo",
]);

const ctrl = await import("../../src/controllers/bodyInfo.controller.js");

describe("bodyInfo.controller", () => {
  it("create returns 201", async () => {
    setImpl(api.createBodyInfo, async () => ({
      _id: "b1",
      height: 170,
      weight: 70,
    }));
    const res = mockRes();
    await ctrl.create(mockReq({ dto: { height: 170, weight: 70 } }), res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.info.height, 170);
  });

  it("getMe returns body info", async () => {
    setImpl(api.getMyBodyInfo, async () => ({ height: 170 }));
    const res = mockRes();
    await ctrl.getMe(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.info.height, 170);
  });

  it("updateById returns info", async () => {
    setImpl(api.updateBodyInfoById, async () => ({ weight: 72 }));
    const res = mockRes();
    await ctrl.updateById(mockReq({ params: { id: "b1" }, dto: { weight: 72 } }), res);
    assert.equal(res.body.info.weight, 72);
  });

  it("remove maps error", async () => {
    setImpl(api.deleteBodyInfo, async () => {
      throw serviceError("Body info not found.", 404);
    });
    const res = mockRes();
    await ctrl.remove(mockReq({ params: { id: "x" } }), res);
    assert.equal(res.statusCode, 404);
  });
});

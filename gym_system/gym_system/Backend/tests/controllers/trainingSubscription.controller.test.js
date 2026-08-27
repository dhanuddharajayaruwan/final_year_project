import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/trainingSubscription.service.js", [
  "createSubscription",
  "getAllSubscriptions",
  "updateSubscription",
  "deleteSubscription",
]);

const ctrl = await import("../../src/controllers/trainingSubscription.controller.js");

describe("trainingSubscription.controller", () => {
  it("create returns 201", async () => {
    setImpl(api.createSubscription, async () => ({
      _id: "sub1",
      status: "active",
    }));
    const res = mockRes();
    await ctrl.create(
      mockReq({
        dto: {
          user_id: "507f1f77bcf86cd799439011",
          subscription_plan_id: "507f1f77bcf86cd799439012",
          duration: 30,
          expire_date: "2026-08-24T00:00:00.000Z",
        },
      }),
      res
    );
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.subscription.status, "active");
  });

  it("getAll returns subscriptions", async () => {
    setImpl(api.getAllSubscriptions, async () => ({
      subscriptions: [{ _id: "sub1", status: "pending" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAll(mockReq({ query: {} }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("update can activate pending subscription", async () => {
    setImpl(api.updateSubscription, async () => ({
      _id: "sub1",
      status: "active",
    }));
    const res = mockRes();
    await ctrl.update(
      mockReq({ params: { id: "sub1" }, dto: { status: "active" } }),
      res
    );
    assert.equal(res.body.subscription.status, "active");
  });

  it("remove maps error", async () => {
    setImpl(api.deleteSubscription, async () => {
      throw serviceError("Subscription not found.", 404);
    });
    const res = mockRes();
    await ctrl.remove(mockReq({ params: { id: "x" } }), res);
    assert.equal(res.statusCode, 404);
  });
});

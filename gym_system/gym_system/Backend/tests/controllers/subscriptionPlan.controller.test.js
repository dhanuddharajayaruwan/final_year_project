import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/subscriptionPlan.service.js", [
  "createSubscriptionPlan",
  "getAllSubscriptionPlans",
  "getSubscriptionPlanById",
  "updateSubscriptionPlan",
  "deleteSubscriptionPlan",
]);

const ctrl = await import("../../src/controllers/subscriptionPlan.controller.js");

describe("subscriptionPlan.controller", () => {
  it("create returns 201", async () => {
    setImpl(api.createSubscriptionPlan, async () => ({
      _id: "1",
      name: "Monthly",
      price: 50,
    }));
    const res = mockRes();
    await ctrl.create(mockReq({ dto: { name: "Monthly", price: 50 } }), res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.plan.name, "Monthly");
  });

  it("getAll returns plans", async () => {
    setImpl(api.getAllSubscriptionPlans, async () => ({
      plans: [{ name: "Monthly" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAll(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.plans.length, 1);
  });

  it("update returns plan", async () => {
    setImpl(api.updateSubscriptionPlan, async () => ({
      _id: "1",
      name: "Yearly",
    }));
    const res = mockRes();
    await ctrl.update(mockReq({ params: { id: "1" }, dto: { name: "Yearly" } }), res);
    assert.equal(res.body.plan.name, "Yearly");
  });

  it("remove maps service error", async () => {
    setImpl(api.deleteSubscriptionPlan, async () => {
      throw serviceError("Plan not found.", 404);
    });
    const res = mockRes();
    await ctrl.remove(mockReq({ params: { id: "missing" } }), res);
    assert.equal(res.statusCode, 404);
  });
});

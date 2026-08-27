import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/order.service.js", [
  "createOrder",
  "getMyOrders",
  "getAllOrders",
  "getOrderById",
  "updateOrderStatus",
]);

const ctrl = await import("../../src/controllers/order.controller.js");

describe("order.controller", () => {
  it("create returns 201", async () => {
    setImpl(api.createOrder, async () => ({
      _id: "o1",
      order_status: "pending",
    }));
    const res = mockRes();
    await ctrl.create(mockReq({ dto: { items: [] }, query: {} }), res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.order._id, "o1");
  });

  it("getMy returns orders", async () => {
    setImpl(api.getMyOrders, async () => ({
      orders: [{ _id: "o1" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getMy(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("getAll returns orders", async () => {
    setImpl(api.getAllOrders, async () => ({
      orders: [{ _id: "o1" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAll(mockReq(), res);
    assert.equal(res.body.orders.length, 1);
  });

  it("updateStatus maps error", async () => {
    setImpl(api.updateOrderStatus, async () => {
      throw serviceError("Order not found.", 404);
    });
    const res = mockRes();
    await ctrl.updateStatus(
      mockReq({ params: { id: "x" }, dto: { order_status: "shipped" } }),
      res
    );
    assert.equal(res.statusCode, 404);
  });
});

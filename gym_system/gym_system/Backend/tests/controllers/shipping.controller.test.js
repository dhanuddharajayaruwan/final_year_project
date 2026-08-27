import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/shipping.service.js", [
  "getShippingByOrderId",
  "updateShippingStatus",
  "getAllShippings",
]);

const ctrl = await import("../../src/controllers/shipping.controller.js");

describe("shipping.controller", () => {
  it("getAll returns shipping list", async () => {
    setImpl(api.getAllShippings, async () => ({
      shippings: [{ shipping_status: "pending" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAll(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("getByOrderId returns shipping", async () => {
    setImpl(api.getShippingByOrderId, async () => ({
      shipping: { order_id: "o1", shipping_status: "pending" },
    }));
    const res = mockRes();
    await ctrl.getByOrderId(mockReq({ params: { orderId: "o1" } }), res);
    assert.equal(res.body.shipping.order_id, "o1");
  });

  it("updateStatus returns updated shipping", async () => {
    setImpl(api.updateShippingStatus, async () => ({
      shipping_status: "shipped",
    }));
    const res = mockRes();
    await ctrl.updateStatus(
      mockReq({ params: { id: "1" }, dto: { shipping_status: "shipped" } }),
      res
    );
    assert.equal(res.body.shipping.shipping_status, "shipped");
  });

  it("updateStatus maps error", async () => {
    setImpl(api.updateShippingStatus, async () => {
      throw serviceError("Shipping not found.", 404);
    });
    const res = mockRes();
    await ctrl.updateStatus(
      mockReq({ params: { id: "x" }, dto: { shipping_status: "delivered" } }),
      res
    );
    assert.equal(res.statusCode, 404);
  });
});

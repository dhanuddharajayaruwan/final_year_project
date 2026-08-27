import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/cart.service.js", [
  "getMyCart",
  "addItemToCart",
  "updateCartItem",
  "removeCartItem",
  "clearMyCart",
]);

const ctrl = await import("../../src/controllers/cart.controller.js");

describe("cart.controller", () => {
  it("getMyCart returns cart and items", async () => {
    setImpl(api.getMyCart, async () => ({
      cart: { _id: "c1" },
      items: [],
    }));
    const res = mockRes();
    await ctrl.getMyCart(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.cart._id, "c1");
    assert.deepEqual(res.body.items, []);
  });

  it("addItem returns updated cart", async () => {
    setImpl(api.addItemToCart, async () => ({
      cart: { _id: "c1" },
      items: [{ product_id: "p1", quantity: 1 }],
    }));
    const res = mockRes();
    await ctrl.addItem(mockReq({ dto: { product_id: "p1", quantity: 1 } }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.items.length, 1);
  });

  it("clearCart returns success", async () => {
    setImpl(api.clearMyCart, async () => undefined);
    const res = mockRes();
    await ctrl.clearCart(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, "Cart cleared successfully");
  });

  it("removeItem maps error", async () => {
    setImpl(api.removeCartItem, async () => {
      throw serviceError("Item not found.", 404);
    });
    const res = mockRes();
    await ctrl.removeItem(mockReq({ params: { itemId: "x" } }), res);
    assert.equal(res.statusCode, 404);
  });
});

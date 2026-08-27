import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/product.service.js", [
  "createProduct",
  "getAllProducts",
  "getProductById",
  "updateProduct",
  "deleteProduct",
]);

const ctrl = await import("../../src/controllers/product.controller.js");

describe("product.controller", () => {
  it("create returns 201", async () => {
    setImpl(api.createProduct, async (data) => ({ _id: "1", ...data }));
    const res = mockRes();
    await ctrl.create(mockReq({ dto: { name: "Whey", price: 20 } }), res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.product.name, "Whey");
  });

  it("getAll returns products", async () => {
    setImpl(api.getAllProducts, async () => ({
      products: [{ name: "Whey" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAll(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("getById returns product", async () => {
    setImpl(api.getProductById, async () => ({ _id: "1", name: "Whey" }));
    const res = mockRes();
    await ctrl.getById(mockReq({ params: { id: "1" } }), res);
    assert.equal(res.body.product.name, "Whey");
  });

  it("remove maps not found", async () => {
    setImpl(api.deleteProduct, async () => {
      throw serviceError("Product not found.", 404);
    });
    const res = mockRes();
    await ctrl.remove(mockReq({ params: { id: "x" } }), res);
    assert.equal(res.statusCode, 404);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/category.service.js", [
  "createCategory",
  "getAllCategories",
  "getCategoryById",
  "updateCategory",
  "deleteCategory",
]);

const ctrl = await import("../../src/controllers/category.controller.js");

describe("category.controller", () => {
  it("create returns 201", async () => {
    setImpl(api.createCategory, async () => ({ _id: "1", name: "Supplements" }));
    const res = mockRes();
    await ctrl.create(mockReq({ dto: { name: "Supplements" } }), res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.category.name, "Supplements");
  });

  it("getAll returns list", async () => {
    setImpl(api.getAllCategories, async () => ({
      categories: [{ name: "Gear" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAll(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("getById returns category", async () => {
    setImpl(api.getCategoryById, async () => ({ _id: "1", name: "Gear" }));
    const res = mockRes();
    await ctrl.getById(mockReq({ params: { id: "1" } }), res);
    assert.equal(res.body.category.name, "Gear");
  });

  it("remove returns success", async () => {
    setImpl(api.deleteCategory, async () => undefined);
    const res = mockRes();
    await ctrl.remove(mockReq({ params: { id: "1" } }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.message, "Deleted successfully");
  });

  it("update maps not found error", async () => {
    setImpl(api.updateCategory, async () => {
      throw serviceError("Category not found.", 404);
    });
    const res = mockRes();
    await ctrl.update(mockReq({ params: { id: "x" }, dto: { name: "N" } }), res);
    assert.equal(res.statusCode, 404);
  });
});

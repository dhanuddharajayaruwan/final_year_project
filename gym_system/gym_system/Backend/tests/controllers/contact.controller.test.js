import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/contact.service.js", [
  "createContact",
  "getAllContacts",
  "markRead",
  "deleteContact",
]);

const ctrl = await import("../../src/controllers/contact.controller.js");

describe("contact.controller", () => {
  it("create returns 201", async () => {
    setImpl(api.createContact, async () => ({
      _id: "c1",
      message: "Hello",
    }));
    const res = mockRes();
    await ctrl.create(
      mockReq({ dto: { name: "Sam", email: "s@test.com", message: "Hello" } }),
      res
    );
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.status, "success");
  });

  it("getAll returns contacts", async () => {
    setImpl(api.getAllContacts, async () => ({
      contacts: [{ _id: "c1" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAll(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("markRead returns contact", async () => {
    setImpl(api.markRead, async () => ({ _id: "c1", is_read: true }));
    const res = mockRes();
    await ctrl.markRead(mockReq({ params: { id: "c1" } }), res);
    assert.equal(res.body.contact.is_read, true);
  });

  it("remove maps service error", async () => {
    setImpl(api.deleteContact, async () => {
      throw serviceError("DB error", 500);
    });
    const res = mockRes();
    await ctrl.remove(mockReq({ params: { id: "x" } }), res);
    assert.equal(res.statusCode, 500);
  });
});

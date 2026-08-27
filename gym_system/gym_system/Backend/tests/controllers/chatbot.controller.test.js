import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/chatbot.service.js", ["askChatbot"]);

const ctrl = (await import("../../src/controllers/chatbot.controller.js")).default;

describe("chatbot.controller", () => {
  it("query returns chatbot answer", async () => {
    setImpl(api.askChatbot, async () => "Gym opens at 6 AM.");
    const res = mockRes();
    await ctrl.query(mockReq({ body: { question: "What time do you open?" } }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, "success");
    assert.equal(res.body.answer, "Gym opens at 6 AM.");
  });

  it("query requires a question", async () => {
    const res = mockRes();
    await ctrl.query(mockReq({ body: { question: "   " } }), res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.status, "fail");
  });

  it("query maps service failure", async () => {
    setImpl(api.askChatbot, async () => {
      throw new Error("AI down");
    });
    const res = mockRes();
    await ctrl.query(mockReq({ body: { question: "Hello" } }), res);
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.status, "error");
  });
});

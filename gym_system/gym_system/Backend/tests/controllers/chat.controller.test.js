import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/chat.service.js", [
  "getOrCreateChatRoom",
  "getChatRoomsForUser",
  "getChatMessages",
  "createChatMessage",
]);

const ctrl = await import("../../src/controllers/chat.controller.js");

describe("chat.controller", () => {
  it("createOrGetRoom returns chat", async () => {
    setImpl(api.getOrCreateChatRoom, async () => ({
      _id: "room1",
      trainer_id: "t1",
    }));
    const res = mockRes();
    await ctrl.createOrGetRoom(
      mockReq({
        user: { _id: "c1", role: "client" },
        body: { trainer_id: "t1" },
      }),
      res
    );
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.chat._id, "room1");
  });

  it("getRooms returns rooms", async () => {
    setImpl(api.getChatRoomsForUser, async () => [{ _id: "room1" }]);
    const res = mockRes();
    await ctrl.getRooms(mockReq(), res);
    assert.equal(res.body.rooms.length, 1);
  });

  it("getMessages returns messages", async () => {
    setImpl(api.getChatMessages, async () => [
      { message: "Hi", sender_id: "c1" },
    ]);
    const res = mockRes();
    await ctrl.getMessages(mockReq({ params: { roomId: "room1" } }), res);
    assert.equal(res.body.messages[0].message, "Hi");
  });

  it("sendMessage maps error", async () => {
    setImpl(api.createChatMessage, async () => {
      throw serviceError("Chat room not found.", 404);
    });
    const res = mockRes();
    await ctrl.sendMessage(
      mockReq({ params: { roomId: "x" }, body: { message: "Hello" } }),
      res
    );
    assert.equal(res.statusCode, 404);
  });
});

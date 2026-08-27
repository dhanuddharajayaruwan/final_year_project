import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/schedule.service.js", [
  "createSchedule",
  "getAllSchedules",
  "getMySchedules",
  "deleteSchedule",
]);

const ctrl = await import("../../src/controllers/schedule.controller.js");

describe("schedule.controller", () => {
  it("create as admin returns 201", async () => {
    setImpl(api.createSchedule, async () => ({
      _id: "s1",
      schedule_type: "workout",
    }));
    const res = mockRes();
    await ctrl.create(
      mockReq({
        user: { _id: "a1", role: "admin" },
        dto: { schedule_type: "workout", client_id: "c1", trainer_id: "t1" },
      }),
      res
    );
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.schedule._id, "s1");
  });

  it("getAll returns schedules", async () => {
    setImpl(api.getAllSchedules, async () => ({
      schedules: [{ _id: "s1" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAll(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("getMy returns schedules", async () => {
    setImpl(api.getMySchedules, async () => ({
      schedules: [{ _id: "s1" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getMy(mockReq(), res);
    assert.equal(res.body.schedules.length, 1);
  });

  it("remove maps error", async () => {
    setImpl(api.deleteSchedule, async () => {
      throw serviceError("Schedule not found.", 404);
    });
    const res = mockRes();
    await ctrl.remove(mockReq({ params: { id: "x" } }), res);
    assert.equal(res.statusCode, 404);
  });
});

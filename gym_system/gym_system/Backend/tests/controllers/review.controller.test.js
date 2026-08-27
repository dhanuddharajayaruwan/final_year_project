import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockReq, mockRes, serviceError } from "../helpers/http.js";
import { mockNamedService, setImpl } from "../helpers/mockService.js";

const api = mockNamedService("services/review.service.js", [
  "createReview",
  "getAllReviews",
  "getGymReviews",
  "deleteReview",
]);

const ctrl = await import("../../src/controllers/review.controller.js");

describe("review.controller", () => {
  it("create returns 201", async () => {
    setImpl(api.createReview, async () => ({
      _id: "r1",
      rating: 5,
    }));
    const res = mockRes();
    await ctrl.create(mockReq({ dto: { rating: 5, comment: "Great" } }), res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.review.rating, 5);
  });

  it("getAll returns reviews", async () => {
    setImpl(api.getAllReviews, async () => ({
      reviews: [{ _id: "r1" }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getAll(mockReq(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 1);
  });

  it("getGym returns gym reviews", async () => {
    setImpl(api.getGymReviews, async () => ({
      reviews: [{ rating: 4 }],
      total: 1,
    }));
    const res = mockRes();
    await ctrl.getGym(mockReq(), res);
    assert.equal(res.body.reviews.length, 1);
  });

  it("remove maps error", async () => {
    setImpl(api.deleteReview, async () => {
      throw serviceError("Review not found.", 404);
    });
    const res = mockRes();
    await ctrl.remove(mockReq({ params: { id: "x" } }), res);
    assert.equal(res.statusCode, 404);
  });
});

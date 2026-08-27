import * as service from "../services/review.service.js";

const handle = (res, err) =>
  res
    .status(err.statusCode || 500)
    .json({
      status: "error",
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });

export const create = async (req, res) => {
  try {
    // req.user is null for guests (optionalAuth), userId is null → guest review
    const review = await service.createReview(req.user?._id ?? null, req.dto);
    res.status(201).json({ status: "success", review });
  } catch (err) {
    handle(res, err);
  }
};

export const getMy = async (req, res) => {
  try {
    const result = await service.getMyReviews(req.user._id, req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    handle(res, err);
  }
};

export const getByOrder = async (req, res) => {
  try {
    const review = await service.getReviewsByOrder(req.params.orderId);
    res.status(200).json({ status: "success", review });
  } catch (err) {
    handle(res, err);
  }
};

export const getByProduct = async (req, res) => {
  try {
    const result = await service.getProductReviews(
      req.params.productId,
      req.query
    );
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    handle(res, err);
  }
};

export const getStats = async (req, res) => {
  try {
    const stats = await service.getProductStats(req.params.productId);
    res.status(200).json({ status: "success", stats });
  } catch (err) {
    handle(res, err);
  }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllReviews(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    handle(res, err);
  }
};

export const update = async (req, res) => {
  try {
    const review = await service.updateReview(
      req.params.id,
      req.user?._id,
      req.user?.role,
      req.dto
    );
    res.status(200).json({ status: "success", review });
  } catch (err) {
    handle(res, err);
  }
};

export const remove = async (req, res) => {
  try {
    await service.deleteReview(req.params.id, req.user?._id, req.user?.role);
    res
      .status(200)
      .json({ status: "success", message: "Review deleted successfully" });
  } catch (err) {
    handle(res, err);
  }
};

export const createGym = async (req, res) => {
  try {
    const review = await service.createGymReview(
      req.user?._id ?? null,
      req.dto
    );
    res.status(201).json({ status: "success", review });
  } catch (err) {
    handle(res, err);
  }
};

export const getGym = async (req, res) => {
  try {
    const result = await service.getGymReviews(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    handle(res, err);
  }
};

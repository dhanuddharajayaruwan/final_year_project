import mongoose from "mongoose";
import Review from "../models/Review.js";
import Order from "../models/Order.js";

const fail = (msg, code = 400) => {
  const e = new Error(msg);
  e.statusCode = code;
  throw e;
};

export const createReview = async (userId, data) => {
  const { order_id, rating, title, comments } = data;

  const order = await Order.findById(order_id);
  if (!order) fail("Order not found.", 404);
  if (order.order_status !== "delivered")
    fail("You can only review delivered orders.", 400);

  // Check duplicate review (one per order)
  const existing = await Review.findOne({ order_id });
  if (existing) fail("This order has already been reviewed.", 409);

  if (userId) {
    // Logged-in client — must own the order
    if (!order.user_id || !order.user_id.equals(userId))
      fail("Order not found or access denied.", 404);
    return await Review.create({
      user_id: userId,
      order_id,
      rating,
      title,
      comments,
    });
  } else {
    // Guest — order must be a guest order (no user_id)
    if (order.user_id) fail("Please log in to review this order.", 403);
    const guest_name = order.guest_info?.name || "Guest";
    return await Review.create({
      user_id: null,
      guest_name,
      order_id,
      rating,
      title,
      comments,
    });
  }
};

export const getMyReviews = async (userId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const total = await Review.countDocuments({ user_id: userId });
  const reviews = await Review.find({ user_id: userId })
    .populate({
      path: "order_id",
      populate: { path: "items.product_id", select: "name images" },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    reviews,
  };
};

export const getProductReviews = async (
  productId,
  { page = 1, limit = 5 } = {}
) => {
  const skip = (page - 1) * limit;

  // Find all orders containing this product
  const orders = await Order.find({ "items.product_id": productId }).select(
    "_id"
  );
  const orderIds = orders.map((o) => o._id);

  const filter = { order_id: { $in: orderIds } };

  const [total, reviews, stats] = await Promise.all([
    Review.countDocuments(filter),
    Review.find(filter)
      .populate("user_id", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.aggregate([
      { $match: { order_id: { $in: orderIds } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const avgRating =
    stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    avgRating,
    reviews,
  };
};

export const getProductStats = async (productId) => {
  // Find all orders containing this product
  const orders = await Order.find({ "items.product_id": productId }).select(
    "_id"
  );
  const orderIds = orders.map((o) => o._id);

  const stats = await Review.aggregate([
    { $match: { order_id: { $in: orderIds } } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length === 0) {
    return { avgRating: 0, numReviews: 0 };
  }

  return {
    avgRating: Math.round(stats[0].avgRating * 10) / 10,
    numReviews: stats[0].numReviews,
  };
};

export const getReviewsByOrder = async (orderId) => {
  const review = await Review.findOne({ order_id: orderId });
  return review;
};

export const getAllReviews = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const total = await Review.countDocuments();
  const reviews = await Review.find()
    .populate("user_id", "name email")
    .populate("order_id", "date amount")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    reviews,
  };
};

export const updateReview = async (id, userId, role, updates) => {
  const review = await Review.findById(id);
  if (!review) fail("Review not found.", 404);

  const isOwner =
    (review.user_id === null && !userId) ||
    (review.user_id && userId && review.user_id.equals(userId));

  if (role !== "admin" && !isOwner) {
    fail("You can only edit your own reviews.", 403);
  }

  const allowedUpdates = ["rating", "title", "comments"];
  for (const field of allowedUpdates) {
    if (updates[field] !== undefined) review[field] = updates[field];
  }

  await review.save();
  return review;
};

export const deleteReview = async (id, userId, role) => {
  const review = await Review.findById(id);
  if (!review) fail("Review not found.", 404);

  const isOwner =
    (review.user_id === null && !userId) ||
    (review.user_id && userId && review.user_id.equals(userId));

  if (role !== "admin" && !isOwner) {
    fail("You can only delete your own reviews.", 403);
  }

  await review.deleteOne();
};

// ── Gym Reviews ─────────────────────────────────────────────────────────────

export const createGymReview = async (userId, data) => {
  const { rating, title, comments } = data;
  if (!userId) fail("You must be logged in to review the gym.", 401);

  const existing = await Review.findOne({ user_id: userId, type: "gym" });
  if (existing) fail("You have already reviewed the gym.", 409);

  return await Review.create({
    user_id: userId,
    rating,
    title,
    comments,
    type: "gym",
  });
};

export const getGymReviews = async ({ page = 1, limit = 10 } = {}) => {
  const filter = { type: "gym" };
  const skip = (page - 1) * limit;
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate("user_id", "name profile_image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const stats = await Review.aggregate([
    { $match: filter },
    {
      $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  const avgRating =
    stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    avgRating,
    reviews,
  };
};

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest reviews
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      // omit for gym reviews — do not default to null (unique index collision)
    },
    trainer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      default: null,
    },
    guest_name: {
      type: String,
      default: null, // populated for guest reviews
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
      default: null,
    },
    comments: {
      type: String,
      trim: true,
      default: null,
    },
    type: {
      type: String,
      enum: ["product", "trainer", "gym"],
      default: "product",
    },
  },
  { timestamps: true }
);

// One review per order — only index real order ObjectIds (null/missing must not collide)
reviewSchema.index(
  { order_id: 1 },
  {
    unique: true,
    partialFilterExpression: { order_id: { $type: "objectId" } },
  }
);

// One gym review per user
reviewSchema.index(
  { user_id: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "gym",
      user_id: { $type: "objectId" },
    },
  }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;

import mongoose from "mongoose";

const trainingSubscriptionSchema = new mongoose.Schema(
  {
    subscription_plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    duration: {
      type: Number, // duration in days
      required: [true, "Duration is required"],
    },
    started_date: {
      type: Date,
      default: Date.now,
    },
    expire_date: {
      type: Date,
      required: [true, "Expire date is required"],
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
    },
    payment_type: {
      type: String,
      enum: ["payhere", "bank_transfer", "manual"],
      default: "manual",
    },
    expire_reminder_sent_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const TrainingSubscription = mongoose.model(
  "TrainingSubscription",
  trainingSubscriptionSchema
);

export default TrainingSubscription;

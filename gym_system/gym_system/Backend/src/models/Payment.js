import mongoose from "mongoose";
import { PAYMENT_TYPE_ENUM, PAYMENT_STATUS_ENUM } from "../enums/index.js";

const paymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingSubscription",
      required: false,
    },
    payment_type: {
      type: String,
      enum: PAYMENT_TYPE_ENUM,
      required: [true, "Payment type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: PAYMENT_STATUS_ENUM,
      default: "pending",
    },
    slip_id: {
      type: String, // For bank transfer reference/slip number
      required: false,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;

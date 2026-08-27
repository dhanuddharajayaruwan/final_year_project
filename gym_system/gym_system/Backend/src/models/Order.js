import mongoose from "mongoose";
import { ORDER_STATUS_ENUM, ORDER_PAYMENT_STATUS_ENUM } from "../enums/index.js";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest orders
    },
    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // price at the time of order
      },
    ],
    order_status: {
      type: String,
      enum: ORDER_STATUS_ENUM,
      default: "pending",
    },
    payment_status: {
      type: String,
      enum: ORDER_PAYMENT_STATUS_ENUM,
      default: "pending",
    },
    shipping_address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      postal_code: { type: String, required: true },
      country: { type: String, default: "Sri Lanka" },
    },
    contact_number: { type: String, required: true },
    guest_info: {
      name: { type: String, default: null },
      email: { type: String, default: null },
    },
    subtotal: { type: Number, required: true },
    shipping_charge: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;

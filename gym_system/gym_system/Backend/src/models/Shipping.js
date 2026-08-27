import mongoose from "mongoose";
import { SHIPPING_STATUS_ENUM } from "../enums/index.js";

const shippingSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // one shipping record per order
    },
    delivery_fee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryFee",
      default: null,
    },
    tracking_number: {
      type: String,
      trim: true,
      default: null,
    },
    courier_name: {
      type: String,
      trim: true,
      default: null,
    },
    shipping_status: {
      type: String,
      enum: SHIPPING_STATUS_ENUM,
      default: "pending",
    },
    shipped_date: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Shipping = mongoose.model("Shipping", shippingSchema);

export default Shipping;

import mongoose from "mongoose";

const deliveryFeeSchema = new mongoose.Schema(
  {
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    minimum_days: {
      type: Number,
      required: [true, "Minimum days is required"],
      min: [1, "Minimum days must be at least 1"],
    },
    maximum_days: {
      type: Number,
      required: [true, "Maximum days is required"],
      min: [1, "Maximum days must be at least 1"],
    },
  },
  { timestamps: true }
);

const DeliveryFee = mongoose.model("DeliveryFee", deliveryFeeSchema);

export default DeliveryFee;

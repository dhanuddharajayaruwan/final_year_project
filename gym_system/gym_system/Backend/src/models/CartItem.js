import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
  },
  { timestamps: true }
);

// Prevent duplicate product entries in the same cart
cartItemSchema.index({ cart_id: 1, product_id: 1 }, { unique: true });

const CartItem = mongoose.model("CartItem", cartItemSchema);

export default CartItem;

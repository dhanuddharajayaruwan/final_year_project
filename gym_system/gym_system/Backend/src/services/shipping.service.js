import Shipping from "../models/Shipping.js";

import Order from "../models/Order.js";
import { sendShippingUpdateEmail } from "../utils/email.js";

const fail = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; throw e; };

export const getShippingByOrderId = async (orderId, userId, role) => {
  const shipping = await Shipping.findOne({ order_id: orderId }).populate("order_id");
  if (!shipping) fail("Shipping record not found.", 404);

  // Security check: Client can only view their own shipping
  if (role !== "admin" && !shipping.order_id.user_id.equals(userId)) {
    fail("Access denied.", 403);
  }

  return { shipping };
};

// Admin only overrides and tracking additions
export const updateShippingStatus = async (shippingId, updates) => {
  const shipping = await Shipping.findByIdAndUpdate(shippingId, updates, { new: true, runValidators: true })
    .populate({ path: "order_id", populate: { path: "user_id", select: "name email" } });

  if (!shipping) fail("Shipping not found.", 404);

  if (updates.shipping_status) {
    // Notify User
    sendShippingUpdateEmail({
      to: shipping.order_id.user_id.email,
      name: shipping.order_id.user_id.name,
      orderId: shipping.order_id._id,
      status: updates.shipping_status,
      trackingNumber: updates.tracking_number || shipping.tracking_number,
      courierName: updates.courier_name || shipping.courier_name,
      estimatedDelivery: updates.estimated_delivery_date || shipping.estimated_delivery_date,
    }).catch(e => console.warn("Shipping email log failed:", e.message));
  }

  return shipping;
};



export const getAllShippings = async ({ page = 1, limit = 10, shipping_status } = {}) => {
  const filter = {};
  if (shipping_status) filter.shipping_status = shipping_status;

  const skip  = (page - 1) * limit;
  const total = await Shipping.countDocuments(filter);
  const shippings = await Shipping.find(filter)
    .populate({ path: "order_id", populate: { path: "user_id", select: "name email" } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return { total, page: Number(page), pages: Math.ceil(total / limit), shippings };
};

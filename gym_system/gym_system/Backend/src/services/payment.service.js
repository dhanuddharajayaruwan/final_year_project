import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import TrainingSubscription from "../models/TrainingSubscription.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import crypto from "crypto";
import { sendPaymentSuccessEmail } from "../utils/email.js";

const fail = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; throw e; };

export const getPaymentByOrderId = async (orderId, userId, role) => {
  const payment = await Payment.findOne({ order_id: orderId })
    .populate("order_id");

  if (!payment) fail("Payment record not found.", 404);

  if (role !== "admin" && !payment.order_id.user_id.equals(userId)) {
    fail("Access denied.", 403);
  }

  return payment;
};

// Simulate Payment Process (e.g. Stripe Webhook success equivalent)
export const markPaymentSuccessful = async (orderId) => {
  const payment = await Payment.findOneAndUpdate(
    { order_id: orderId },
    { payment_status: "success" },
    { new: true }
  );
  if (!payment) fail("Payment record not found.", 404);

  await Order.findByIdAndUpdate(orderId, { payment_status: "success" });
  return payment;
};

// Admin only overrides
export const updatePaymentStatus = async (id, status) => {
  const payment = await Payment.findByIdAndUpdate(id, { payment_status: status }, { new: true });
  if (!payment) fail("Payment not found.", 404);
  
  await Order.findByIdAndUpdate(payment.order_id, { payment_status: status });
  return payment;
};

export const getAllPayments = async ({ page = 1, limit = 10, payment_status } = {}) => {
  const filter = {};
  if (payment_status) filter.payment_status = payment_status;

  const skip  = (page - 1) * limit;
  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .populate({ path: "order_id", populate: { path: "user_id", select: "name email" } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return { total, page: Number(page), pages: Math.ceil(total / limit), payments };
};

export const generatePayHereDetails = async (orderId) => {
  const order = await Order.findById(orderId).populate("user_id");
  if (!order) fail("Order not found", 404);

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const secret = process.env.PAYHERE_SECRET;
  const currency = "LKR";
  const amountFormatted = Number(order.total_amount).toFixed(2);

  const hash = crypto
    .createHash("md5")
    .update(
      merchantId +
      orderId +
      amountFormatted +
      currency +
      crypto.createHash("md5").update(secret).digest("hex").toUpperCase()
    )
    .digest("hex")
    .toUpperCase();

  return {
    merchant_id: merchantId,
    return_url: `${process.env.FRONTEND_URL}/orders/${orderId}?payment=success`,
    cancel_url: `${process.env.FRONTEND_URL}/orders/${orderId}?payment=cancel`,
    notify_url: process.env.PAYHERE_NOTIFY,
    order_id: orderId,
    items: order.items.length === 1 ? "Gym Product" : "Gym System Order",
    currency,
    amount: amountFormatted,
    hash,
    // Add user details
    first_name: order.user_id?.name || order.guest_info?.name || "Guest",
    last_name: "Customer",
    email: order.user_id?.email || order.guest_info?.email || "",
    phone: order.contact_number,
    address: order.shipping_address.street,
    city: order.shipping_address.city,
    country: "Sri Lanka",
  };
};

export const generatePayHereSubscriptionDetails = async (subId) => {
  const sub = await TrainingSubscription.findById(subId).populate("user_id").populate("subscription_plan_id");
  if (!sub) fail("Subscription not found", 404);

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const secret = process.env.PAYHERE_SECRET;
  const currency = "LKR";
  const amountFormatted = Number(sub.subscription_plan_id.price).toFixed(2);
  const compositeOrderId = `SUB_${subId}`;

  const hash = crypto
    .createHash("md5")
    .update(
      merchantId +
      compositeOrderId +
      amountFormatted +
      currency +
      crypto.createHash("md5").update(secret).digest("hex").toUpperCase()
    )
    .digest("hex")
    .toUpperCase();

  return {
    merchant_id: merchantId,
    return_url: `${process.env.FRONTEND_URL}/member/subscriptions?payment=success`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription-details/${sub.subscription_plan_id._id}?payment=cancel`,
    notify_url: process.env.PAYHERE_NOTIFY,
    order_id: compositeOrderId,
    items: sub.subscription_plan_id.name,
    currency,
    amount: amountFormatted,
    hash,
    first_name: sub.user_id?.name || "Member",
    last_name: "Client",
    email: sub.user_id?.email || "",
    phone: "", 
    address: "",
    city: "",
    country: "Sri Lanka",
  };
};

export const handlePayHereNotify = async (data) => {
  const { order_id, status_code, md5sig, merchant_id, payhere_amount, payhere_currency } = data;
  const secret = process.env.PAYHERE_SECRET;

  // Verify Hash
  const localHash = crypto
    .createHash("md5")
    .update(
      merchant_id +
      order_id +
      payhere_amount +
      payhere_currency +
      status_code +
      crypto.createHash("md5").update(secret).digest("hex").toUpperCase()
    )
    .digest("hex")
    .toUpperCase();

  if (localHash !== md5sig) {
    console.error("PayHere Hash mismatch!");
    return false;
  }

  if (status_code === "2") {
    // Payment Successful — update DB
    if (order_id.startsWith("SUB_")) {
      const subId = order_id.replace("SUB_", "");
      
      await Payment.findOneAndUpdate(
        { subscription_id: subId },
        { status: "completed" },
        { new: true }
      );

      const sub = await TrainingSubscription.findByIdAndUpdate(
        subId,
        { status: "active" },
        { new: true }
      ).populate("user_id").populate("subscription_plan_id");

      if (sub) {
        // Send subscription success email
        const paidDate = new Date().toLocaleDateString("en-LK", {
          year: "numeric", month: "long", day: "numeric"
        });

        sendPaymentSuccessEmail({
          to: sub.user_id?.email,
          name: sub.user_id?.name,
          orderId: order_id,
          amount: sub.subscription_plan_id.price,
          paymentDate: paidDate,
        }).catch(e => console.warn("Sub success email failed:", e.message));
      }
      return true;
    } else {
      // Logic for SHOP orders (existing)
      await Payment.findOneAndUpdate(
        { order_id: order_id },
        { status: "completed" },
        { new: true }
      );

      const order = await Order.findByIdAndUpdate(
        order_id,
        { payment_status: "paid", order_status: "processing" },
        { new: true }
      ).populate("user_id");

      if (order) {
        const emailTo = order.user_id?.email || order.guest_info?.email;
        const paidDate = new Date().toLocaleDateString("en-LK", {
          year: "numeric", month: "long", day: "numeric"
        });

        if (emailTo) {
          sendPaymentSuccessEmail({
            to: emailTo,
            name: order.user_id?.name || order.guest_info?.name || "Customer",
            orderId: order._id.toString(),
            amount: order.total_amount,
            paymentDate: paidDate,
          }).catch(e => console.warn("Payment success email failed:", e.message));
        }
      }
      return true;
    }
  }

  return false;
};

import TrainingSubscription from "../models/TrainingSubscription.js";
import User from "../models/User.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Payment from "../models/Payment.js";
import { generatePayHereSubscriptionDetails } from "./payment.service.js";
import {
  sendSubscriptionEmail,
  sendPaymentSuccessEmail,
} from "../utils/email.js";

const fail = (msg, code = 400) => {
  const e = new Error(msg);
  e.statusCode = code;
  throw e;
};

// Helper: cancel any active/pending subscription for a user (for upgrade/downgrade)
const cancelExistingSubscription = async (userId, newPlanId) => {
  const existing = await TrainingSubscription.findOne({
    user_id: userId,
    status: { $in: ["active", "pending"] },
  }).populate("subscription_plan_id");

  if (existing) {
    // Block exact same plan while still active/pending
    if (String(existing.subscription_plan_id?._id) === String(newPlanId)) {
      fail(
        "You already have an active or pending subscription for this plan. You can subscribe again after it expires.",
        409
      );
    }
    // Upgrade/downgrade: cancel the old subscription (no refund)
    existing.status = "cancelled";
    await existing.save();
  }
};

export const createSubscription = async (data) => {
  // Admin manual assignment also checks for duplicates
  await cancelExistingSubscription(data.user_id, data.subscription_plan_id);
  const sub = await TrainingSubscription.create(data);
  // Send email notification (non-blocking)
  const populated = await sub.populate("user_id", "name email");
  sendSubscriptionEmail({
    to: populated.user_id.email,
    name: populated.user_id.name,
    duration: sub.duration_in_days,
    startedDate: sub.started_date?.toLocaleDateString() ?? "N/A",
    expireDate: sub.expire_date?.toLocaleDateString() ?? "N/A",
  }).catch((e) => console.warn("Subscription email failed:", e.message));
  return sub;
};

export const initiatePayHereSubscription = async (userId, planId) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) fail("Subscription plan not found.", 404);

  // Prevent duplicate & handle upgrade/downgrade
  await cancelExistingSubscription(userId, planId);

  // 1. Create a pending TrainingSubscription
  // Expire date calculation
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + (plan.duration || 30));

  const sub = await TrainingSubscription.create({
    user_id: userId,
    subscription_plan_id: planId,
    duration: plan.duration || 30,
    expire_date: expireDate,
    status: "pending",
    payment_type: "payhere",
  });

  // 2. Create a pending Payment record
  await Payment.create({
    subscription_id: sub._id,
    payment_type: "payhere",
    amount: plan.price,
    status: "pending",
  });

  // 3. Generate PayHere details
  const payhereData = await generatePayHereSubscriptionDetails(sub._id);

  return { subId: sub._id, payhereData };
};

export const initiateBankSubscription = async (userId, planId, slipId) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) fail("Subscription plan not found.", 404);

  // Prevent duplicate & handle upgrade/downgrade
  await cancelExistingSubscription(userId, planId);

  // 1. Create a pending TrainingSubscription
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + (plan.duration || 30));

  const sub = await TrainingSubscription.create({
    user_id: userId,
    subscription_plan_id: planId,
    duration: plan.duration || 30,
    expire_date: expireDate,
    status: "pending",
    payment_type: "bank_transfer",
  });

  // 2. Create a pending Payment record for Bank Transfer
  await Payment.create({
    subscription_id: sub._id,
    payment_type: "bank_transfer",
    amount: plan.price,
    status: "pending",
    slip_id: slipId,
  });

  return sub;
};

export const getAllSubscriptions = async ({
  page = 1,
  limit = 10,
  status,
  search,
  type,
  paymentType,
} = {}) => {
  const filter = {};
  if (status) filter.status = status;

  // Use Payment collection as source of truth for payment type filtering
  if (paymentType && paymentType !== "all") {
    const payments = await Payment.find({
      payment_type: paymentType,
      subscription_id: { $exists: true, $ne: null },
    }).select("subscription_id");
    const subIds = payments.map((p) => p.subscription_id);
    filter._id = { $in: subIds };
  }

  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("_id");
    filter.user_id = { $in: users.map((u) => u._id) };
  }

  if (type && type !== "all") {
    const plans = await SubscriptionPlan.find({ type }).select("_id");
    filter.subscription_plan_id = { $in: plans.map((p) => p._id) };
  }

  const skip = (page - 1) * limit;
  const total = await TrainingSubscription.countDocuments(filter);
  const subscriptions = await TrainingSubscription.find(filter)
    .populate("user_id", "name email role")
    .populate("subscription_plan_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Enrich each subscription with payment info from Payment collection
  const enrichedSubs = await Promise.all(
    subscriptions.map(async (sub) => {
      const payment = await Payment.findOne({ subscription_id: sub._id })
        .sort({ createdAt: -1 })
        .lean();
      if (payment) {
        // Use Payment collection as source of truth for payment_type
        sub.payment_type = payment.payment_type;
        if (payment.payment_type === "bank_transfer" && payment.slip_id) {
          sub.slip_id = payment.slip_id;
        }
      }
      return sub;
    })
  );

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    subscriptions: enrichedSubs,
  };
};

export const getMySubscriptions = async (
  userId,
  { page = 1, limit = 10 } = {}
) => {
  const filter = { user_id: userId };
  const skip = (page - 1) * limit;
  const total = await TrainingSubscription.countDocuments(filter);
  const subscriptions = await TrainingSubscription.find(filter)
    .populate("subscription_plan_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    subscriptions,
  };
};

export const getSubscriptionById = async (id) => {
  const sub = await TrainingSubscription.findById(id)
    .populate("user_id", "name email role")
    .populate("subscription_plan_id");
  if (!sub) fail("Subscription not found.", 404);
  return sub;
};

export const updateSubscription = async (id, updates) => {
  const oldSub = await TrainingSubscription.findById(id);
  if (!oldSub) fail("Subscription not found.", 404);

  // Only apply defined fields from the DTO (ignore class prototype noise)
  const patch = {};
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.expire_date !== undefined) patch.expire_date = updates.expire_date;

  // Activating a pending bank-transfer/PayHere sub: start the period from now
  // so the member gets the full plan duration after payment is verified
  if (patch.status === "active" && oldSub.status === "pending") {
    const started = new Date();
    const expire = new Date(started);
    expire.setDate(expire.getDate() + (oldSub.duration || 30));
    patch.started_date = started;
    patch.expire_date = expire;
  }

  const sub = await TrainingSubscription.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
  })
    .populate("user_id", "name email role")
    .populate("subscription_plan_id");

  // If admin activates a pending/cancelled subscription
  if (patch.status === "active" && oldSub.status !== "active") {
    // 1. Update matching Payment record to completed
    await Payment.findOneAndUpdate(
      { subscription_id: id },
      { status: "completed" },
      { new: true }
    );

    // 2. Send Payment Success Email
    const paidDate = new Date().toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    sendPaymentSuccessEmail({
      to: sub.user_id?.email,
      name: sub.user_id?.name,
      orderId: `SUB_${sub._id}`,
      amount: sub.subscription_plan_id?.price,
      paymentDate: paidDate,
    }).catch((e) =>
      console.warn("Admin sub activation email failed:", e.message)
    );
  }

  return sub;
};

export const deleteSubscription = async (id) => {
  const sub = await TrainingSubscription.findByIdAndDelete(id);
  if (!sub) fail("Subscription not found.", 404);
};

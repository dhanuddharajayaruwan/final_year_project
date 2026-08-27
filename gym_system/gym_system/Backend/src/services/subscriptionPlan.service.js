import SubscriptionPlan from "../models/SubscriptionPlan.js";

const fail = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; throw e; };

export const createSubscriptionPlan = async (data) => {
  const existing = await SubscriptionPlan.findOne({ name: data.name.trim() });
  if (existing) fail("A subscription plan with this name already exists.", 409);
  return await SubscriptionPlan.create(data);
};

export const getAllSubscriptionPlans = async ({ page = 1, limit = 20, search, type } = {}) => {
  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (type && type !== "all") filter.type = type;
  const skip = (page - 1) * limit;
  const total = await SubscriptionPlan.countDocuments(filter);
  const plans = await SubscriptionPlan.find(filter).sort({ price: 1 }).skip(skip).limit(Number(limit));
  return { total, page: Number(page), pages: Math.ceil(total / limit), plans };
};

export const getSubscriptionPlanById = async (id) => {
  const plan = await SubscriptionPlan.findById(id);
  if (!plan) fail("Subscription plan not found.", 404);
  return plan;
};

export const updateSubscriptionPlan = async (id, updates) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!plan) fail("Subscription plan not found.", 404);
  return plan;
};

export const deleteSubscriptionPlan = async (id) => {
  const plan = await SubscriptionPlan.findByIdAndDelete(id);
  if (!plan) fail("Subscription plan not found.", 404);
};

import BodyInfo from "../models/BodyInfo.js";

const fail = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; throw e; };

export const createBodyInfo = async (data) => {
  const existing = await BodyInfo.findOne({ user_id: data.user_id });
  if (existing) fail("Body info already exists for this user.", 409);
  return await BodyInfo.create(data);
};

export const getAllBodyInfo = async ({ page = 1, limit = 10 } = {}) => {
  const skip  = (page - 1) * limit;
  const total = await BodyInfo.countDocuments();
  const items = await BodyInfo.find()
    .populate("user_id", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip).limit(Number(limit));
  return { total, page: Number(page), pages: Math.ceil(total / limit), items };
};

export const getMyBodyInfo = async (userId) => {
  const info = await BodyInfo.findOne({ user_id: userId }).populate("user_id", "name email");
  return info; // Returns null if not found, instead of throwing 404
};

export const getBodyInfoById = async (id) => {
  const info = await BodyInfo.findById(id).populate("user_id", "name email role");
  if (!info) fail("Body info not found.", 404);
  return info;
};

export const updateMyBodyInfo = async (userId, updates) => {
  const info = await BodyInfo.findOneAndUpdate({ user_id: userId }, updates, { new: true, runValidators: true })
    .populate("user_id", "name email");
  if (!info) fail("Body info not found. Please create one first.", 404);
  return info;
};

export const updateBodyInfoById = async (id, updates) => {
  const info = await BodyInfo.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    .populate("user_id", "name email role");
  if (!info) fail("Body info not found.", 404);
  return info;
};

export const deleteBodyInfo = async (id) => {
  const info = await BodyInfo.findByIdAndDelete(id);
  if (!info) fail("Body info not found.", 404);
};

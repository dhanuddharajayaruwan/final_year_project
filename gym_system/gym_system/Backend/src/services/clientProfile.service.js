import ClientProfile from "../models/ClientProfile.js";
import User from "../models/User.js";
import BodyInfo from "../models/BodyInfo.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper — throw a structured error
// ─────────────────────────────────────────────────────────────────────────────
const fail = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin-specific: registerMemberWithFullProfile
// Creates User + ClientProfile + BodyInfo in one go.
// ─────────────────────────────────────────────────────────────────────────────
export const registerMemberWithFullProfile = async (data) => {
  const {
    name,
    email,
    password,
    dob,
    address,
    contact,
    activity_level,
    medical_notes,
    membership_status,
    height,
    weight,
    gender,
    goal,
  } = data;

  // 1. Check if user already exists
  const existingUser = await User.findOne({
    email: email.toLowerCase().trim(),
  });
  if (existingUser) fail("A user with this email already exists.", 409);

  // 2. Create User
  const user = await User.create({
    name,
    email,
    password,
    dob,
    address,
    contact,
    role: "client",
  });

  // 3. Create ClientProfile
  const profile = await ClientProfile.create({
    user_id: user._id,
    activity_level: activity_level || "beginner",
    medical_notes: medical_notes || null,
    membership_status: membership_status || "active",
  });

  // 4. Create BodyInfo
  const bodyInfo = await BodyInfo.create({
    user_id: user._id,
    height: height || null,
    weight: weight || null,
    gender: gender || null,
    goal: goal || null,
  });

  return {
    user: user.toObject(),
    profile,
    bodyInfo,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// createClientProfile
// ─────────────────────────────────────────────────────────────────────────────
export const createClientProfile = async (data) => {
  const { user_id } = data;

  // Verify user exists and has client role
  const user = await User.findById(user_id);
  if (!user) fail("User not found.", 404);
  if (user.role !== "client" && user.role !== "admin")
    fail("Only users with the 'client' role can have a client profile.", 403);

  // One profile per user
  const existing = await ClientProfile.findOne({ user_id });
  if (existing) fail("A client profile already exists for this user.", 409);

  const profile = await ClientProfile.create(data);
  return profile;
};

// ─────────────────────────────────────────────────────────────────────────────
// getAllClientProfiles  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllClientProfiles = async ({
  page = 1,
  limit = 10,
  membership_status,
} = {}) => {
  const filter = {};
  if (membership_status) filter.membership_status = membership_status;

  const skip = (page - 1) * limit;
  const total = await ClientProfile.countDocuments(filter);

  const profiles = await ClientProfile.find(filter)
    .populate("user_id", "name email contact address role profile_image createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit) || 1,
    profiles,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// getMyClientProfile  — logged-in client fetches their own profile
// ─────────────────────────────────────────────────────────────────────────────
export const getMyClientProfile = async (userId) => {
  const profile = await ClientProfile.findOne({ user_id: userId }).populate(
    "user_id",
    "name email contact address role profile_image createdAt"
  );

  return profile; // Returns null if not found, avoids throwing 404 on clean accounts
};

// ─────────────────────────────────────────────────────────────────────────────
// getClientProfileById  — admin / trainer lookup
// ─────────────────────────────────────────────────────────────────────────────
export const getClientProfileById = async (profileId) => {
  const profile = await ClientProfile.findById(profileId).populate(
    "user_id",
    "name email contact address role dob profile_image createdAt"
  );

  if (!profile) fail("Client profile not found.", 404);

  const bodyInfo = await BodyInfo.findOne({
    user_id: profile.user_id._id,
  }).lean();
  return { ...profile.toObject(), bodyInfo: bodyInfo || null };
};

// ─────────────────────────────────────────────────────────────────────────────
// updateMyClientProfile  — client updates their own profile
// ─────────────────────────────────────────────────────────────────────────────
export const updateMyClientProfile = async (userId, updates) => {
  const profile = await ClientProfile.findOneAndUpdate(
    { user_id: userId },
    updates,
    { new: true, runValidators: true }
  ).populate("user_id", "name email contact address role");

  if (!profile) fail("Client profile not found. Please create one first.", 404);
  return profile;
};

// ─────────────────────────────────────────────────────────────────────────────
// updateClientProfileById  — admin updates any client profile
// ─────────────────────────────────────────────────────────────────────────────
export const updateClientProfileById = async (profileId, updates) => {
  const profile = await ClientProfile.findByIdAndUpdate(profileId, updates, {
    new: true,
    runValidators: true,
  }).populate("user_id", "name email contact address role");

  if (!profile) fail("Client profile not found.", 404);
  return profile;
};

// ─────────────────────────────────────────────────────────────────────────────
// deleteClientProfile  — admin hard-deletes a client profile
// ─────────────────────────────────────────────────────────────────────────────
export const deleteClientProfile = async (profileId) => {
  const profile = await ClientProfile.findByIdAndDelete(profileId);
  if (!profile) fail("Client profile not found.", 404);
};

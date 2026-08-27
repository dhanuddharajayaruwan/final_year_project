import TrainerProfile from "../models/TrainerProfile.js";
import User from "../models/User.js";
import Schedule from "../models/Schedule.js";
import ClientProfile from "../models/ClientProfile.js";
import BodyInfo from "../models/BodyInfo.js";
import TrainingClip from "../models/TrainingClip.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper — throw a structured error
// ─────────────────────────────────────────────────────────────────────────────
const fail = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

// ─────────────────────────────────────────────────────────────────────────────
// Admin-specific: registerTrainerWithFullProfile
// Creates User + TrainerProfile in one go.
// ─────────────────────────────────────────────────────────────────────────────
export const registerTrainerWithFullProfile = async (data) => {
  const { 
    name, email, password, dob, address, contact,
    specialization, bio, certifications, available_to 
  } = data;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) fail("A user with this email already exists.", 409);

  // 2. Create User as Trainer
  const user = await User.create({
    name, email, password, dob, address, contact, role: "trainer"
  });

  // 3. Create TrainerProfile
  const profile = await TrainerProfile.create({
    user_id: user._id,
    specialization: specialization || null,
    bio: bio || null,
    certifications: certifications || [],
    available_to: available_to || null
  });

  return { 
    user: user.toObject(), 
    profile 
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// createTrainerProfile
// ─────────────────────────────────────────────────────────────────────────────
export const createTrainerProfile = async (data) => {
  const { user_id } = data;

  // Verify the user exists and has the trainer role
  const user = await User.findById(user_id);
  if (!user) fail("User not found.", 404);
  if (user.role !== "trainer")
    fail("Only users with the 'trainer' role can have a trainer profile.", 403);

  // One profile per trainer
  const existing = await TrainerProfile.findOne({ user_id });
  if (existing) fail("A trainer profile already exists for this user.", 409);

  const profile = await TrainerProfile.create(data);
  return profile;
};

// ─────────────────────────────────────────────────────────────────────────────
// getAllTrainerProfiles  — public listing with optional search
// ─────────────────────────────────────────────────────────────────────────────
export const getAllTrainerProfiles = async ({ page = 1, limit = 10, specialization } = {}) => {
  const filter = {};
  if (specialization) {
    filter.specialization = { $regex: specialization, $options: "i" };
  }

  const skip  = (page - 1) * limit;
  const total = await TrainerProfile.countDocuments(filter);

  const profiles = await TrainerProfile.find(filter)
    .populate("user_id", "name email contact address role profile_image dob createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    total,
    page    : Number(page),
    pages   : Math.ceil(total / limit) || 1,
    profiles,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// getMyTrainerProfile  — logged-in trainer fetches their own profile
// ─────────────────────────────────────────────────────────────────────────────
export const getMyTrainerProfile = async (userId) => {
  const profile = await TrainerProfile.findOne({ user_id: userId })
    .populate("user_id", "name email contact address role profile_image createdAt");

  return profile; // Returns null if not found, avoids throwing 404 on clean accounts
};

// ─────────────────────────────────────────────────────────────────────────────
// getTrainerProfileById  — any authenticated user can view a trainer
// ─────────────────────────────────────────────────────────────────────────────
export const getTrainerProfileById = async (profileId) => {
  const profile = await TrainerProfile.findById(profileId)
    .populate("user_id", "name email contact address role profile_image createdAt");

  if (!profile) fail("Trainer profile not found.", 404);
  return profile;
};

// ─────────────────────────────────────────────────────────────────────────────
// updateMyTrainerProfile  — trainer updates their own profile
// ─────────────────────────────────────────────────────────────────────────────
export const updateMyTrainerProfile = async (userId, updates) => {
  const profilePatch = {};
  if (updates.specialization !== undefined) profilePatch.specialization = updates.specialization;
  if (updates.bio !== undefined) profilePatch.bio = updates.bio;
  if (updates.certifications !== undefined) profilePatch.certifications = updates.certifications;
  if (updates.available_to !== undefined) {
    profilePatch.available_to = updates.available_to === "" ? null : updates.available_to;
  }

  const profile = await TrainerProfile.findOneAndUpdate(
    { user_id: userId },
    profilePatch,
    { new: true, runValidators: true }
  ).populate("user_id", "name email contact address role");

  if (!profile) fail("Trainer profile not found. Please create one first.", 404);
  return profile;
};

// ─────────────────────────────────────────────────────────────────────────────
// updateTrainerProfileById  — admin updates trainer profile + linked user
// ─────────────────────────────────────────────────────────────────────────────
export const updateTrainerProfileById = async (profileId, updates) => {
  const existing = await TrainerProfile.findById(profileId);
  if (!existing) fail("Trainer profile not found.", 404);

  const {
    name,
    email,
    contact,
    dob,
    password,
    specialization,
    bio,
    certifications,
    available_to,
  } = updates;

  // Update linked user account fields when provided
  const userPatch = {};
  if (name !== undefined) userPatch.name = name;
  if (email !== undefined) userPatch.email = email.toLowerCase().trim();
  if (contact !== undefined) userPatch.contact = contact;
  if (dob !== undefined && dob !== "") userPatch.dob = dob;
  if (password !== undefined && password !== null && password !== "") {
    userPatch.password = password;
  }

  if (Object.keys(userPatch).length > 0) {
    if (userPatch.email) {
      const emailTaken = await User.findOne({
        email: userPatch.email,
        _id: { $ne: existing.user_id },
      });
      if (emailTaken) fail("A user with this email already exists.", 409);
    }

    // Use document.save() so the password pre-save hook hashes correctly
    const user = await User.findById(existing.user_id).select("+password");
    if (!user) fail("Linked trainer user account not found.", 404);
    if (userPatch.name !== undefined) user.name = userPatch.name;
    if (userPatch.email !== undefined) user.email = userPatch.email;
    if (userPatch.contact !== undefined) user.contact = userPatch.contact;
    if (userPatch.dob !== undefined) user.dob = userPatch.dob;
    if (userPatch.password !== undefined) user.password = userPatch.password;
    await user.save();
  }

  const profilePatch = {};
  if (specialization !== undefined) profilePatch.specialization = specialization;
  if (bio !== undefined) profilePatch.bio = bio;
  if (certifications !== undefined) profilePatch.certifications = certifications;
  if (available_to !== undefined) {
    profilePatch.available_to = available_to === "" ? null : available_to;
  }

  const profile = await TrainerProfile.findByIdAndUpdate(
    profileId,
    profilePatch,
    { new: true, runValidators: true }
  ).populate("user_id", "name email contact address role dob profile_image");

  if (!profile) fail("Trainer profile not found.", 404);
  return profile;
};

// ─────────────────────────────────────────────────────────────────────────────
// deleteTrainerProfile  — admin hard-deletes profile, clips, and user account
// ─────────────────────────────────────────────────────────────────────────────
export const deleteTrainerProfile = async (profileId) => {
  const profile = await TrainerProfile.findById(profileId);
  if (!profile) fail("Trainer profile not found.", 404);

  const userId = profile.user_id;

  await TrainingClip.deleteMany({ trainer_id: profileId });
  await TrainerProfile.findByIdAndDelete(profileId);
  if (userId) await User.findByIdAndDelete(userId);
};

// ─────────────────────────────────────────────────────────────────────────────
// getClientsForTrainer — aggregates clients associated with a trainer
// ─────────────────────────────────────────────────────────────────────────────
export const getClientsForTrainer = async (trainerUserId) => {
  const trainerProfile = await TrainerProfile.findOne({ user_id: trainerUserId });
  if (!trainerProfile) fail("Trainer profile not found.", 404);

  const schedules = await Schedule.find({ trainer_id: trainerProfile._id }).select("client_id");
  const clientIds = [...new Set(schedules.map(s => String(s.client_id)))];

  const clients = await Promise.all(
    clientIds.map(async (clientId) => {
      const user = await User.findById(clientId).select("name email profile_image contact dob address");
      if (!user) return null;

      const profile = await ClientProfile.findOne({ user_id: clientId }).select("activity_level medical_notes membership_status");
      const bodyInfo = await BodyInfo.findOne({ user_id: clientId }).select("height weight gender goal");

      return {
        user,
        profile: profile || { activity_level: "beginner", medical_notes: "None", membership_status: "active" },
        bodyInfo: bodyInfo || { height: null, weight: null, gender: null, goal: null }
      };
    })
  );

  return clients.filter(Boolean);
};

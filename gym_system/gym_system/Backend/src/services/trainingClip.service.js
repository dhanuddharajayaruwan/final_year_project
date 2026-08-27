import TrainingClip from "../models/TrainingClip.js";
import TrainerProfile from "../models/TrainerProfile.js";
import Schedule from "../models/Schedule.js";
import { deleteFile } from "../utils/upload.js";

const fail = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; throw e; };

export const createClip = async (data) => {
  // Validate trainer profile exists
  const trainer = await TrainerProfile.findById(data.trainer_id);
  if (!trainer) fail("Trainer profile not found.", 404);
  return await TrainingClip.create(data);
};

export const getAllClips = async ({ page = 1, limit = 10, trainer_id } = {}) => {
  const filter = {};
  if (trainer_id) filter.trainer_id = trainer_id;
  const skip  = (page - 1) * limit;
  const total = await TrainingClip.countDocuments(filter);
  const clips = await TrainingClip.find(filter)
    .populate({ path: "trainer_id", populate: { path: "user_id", select: "name email" } })
    .sort({ createdAt: -1 })
    .skip(skip).limit(Number(limit));
  return { total, page: Number(page), pages: Math.ceil(total / limit), clips };
};

export const getMyClips = async (userId, { page = 1, limit = 10 } = {}) => {
  const trainerProfile = await TrainerProfile.findOne({ user_id: userId });
  if (!trainerProfile) fail("Trainer profile not found.", 404);
  const skip  = (page - 1) * limit;
  const filter = { trainer_id: trainerProfile._id };
  const total = await TrainingClip.countDocuments(filter);
  const clips = await TrainingClip.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  return { total, page: Number(page), pages: Math.ceil(total / limit), clips };
};

export const getClipById = async (id) => {
  const clip = await TrainingClip.findById(id)
    .populate({ path: "trainer_id", populate: { path: "user_id", select: "name email" } });
  if (!clip) fail("Training clip not found.", 404);
  return clip;
};

export const updateClip = async (id, requesterId, requesterRole, updates) => {
  const clip = await TrainingClip.findById(id).populate("trainer_id");
  if (!clip) fail("Training clip not found.", 404);
  // Only the owning trainer or admin can update
  if (requesterRole !== "admin") {
    const trainerProfile = await TrainerProfile.findOne({ user_id: requesterId });
    if (!trainerProfile || !clip.trainer_id._id.equals(trainerProfile._id))
      fail("You are not authorized to update this clip.", 403);
  }

  // Cleanup old clip file if a new one is provided
  if (updates.clip && updates.clip !== clip.clip) {
    await deleteFile(clip.clip);
  }

  Object.assign(clip, updates);
  await clip.save();
  return clip;
};

export const deleteClip = async (id, requesterId, requesterRole) => {
  const clip = await TrainingClip.findById(id).populate("trainer_id");
  if (!clip) fail("Training clip not found.", 404);
  if (requesterRole !== "admin") {
    const trainerProfile = await TrainerProfile.findOne({ user_id: requesterId });
    if (!trainerProfile || !clip.trainer_id._id.equals(trainerProfile._id))
      fail("You are not authorized to delete this clip.", 403);
  }

  // Permanent storage cleanup
  if (clip.clip) {
    await deleteFile(clip.clip);
  }

  await TrainingClip.findByIdAndDelete(id);
};

export const getClipsForClientCoach = async (clientUserId, trainerProfileId) => {
  const activeSchedule = await Schedule.findOne({
    client_id: clientUserId,
    trainer_id: trainerProfileId,
    expire_date: { $gte: new Date() },
  });

  if (!activeSchedule) {
    fail("You need an active schedule with this coach to view their training clips.", 403);
  }

  const clips = await TrainingClip.find({ trainer_id: trainerProfileId })
    .sort({ createdAt: -1 });

  return clips;
};

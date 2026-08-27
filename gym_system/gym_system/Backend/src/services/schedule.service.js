import Schedule from "../models/Schedule.js";
import TrainerProfile from "../models/TrainerProfile.js";

const fail = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; throw e; };

export const createSchedule = async (data) => {
  const trainer = await TrainerProfile.findById(data.trainer_id);
  if (!trainer) fail("Trainer profile not found.", 404);
  return await Schedule.create(data);
};

export const getAllSchedules = async ({ page = 1, limit = 10, schedule_type } = {}) => {
  const filter = {};
  if (schedule_type) filter.schedule_type = schedule_type;
  const skip  = (page - 1) * limit;
  const total = await Schedule.countDocuments(filter);
  const schedules = await Schedule.find(filter)
    .populate("client_id",  "name email")
    .populate({ path: "trainer_id", populate: { path: "user_id", select: "name email" } })
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  return { total, page: Number(page), pages: Math.ceil(total / limit), schedules };
};

export const getMySchedules = async (userId, role, { page = 1, limit = 500, client_id } = {}) => {
  let filter = {};
  if (role === "client") {
    filter.client_id = userId;
  } else if (role === "trainer") {
    const profile = await TrainerProfile.findOne({ user_id: userId });
    if (!profile) fail("Trainer profile not found.", 404);
    filter.trainer_id = profile._id;
    if (client_id) filter.client_id = client_id;
  }
  const skip  = (page - 1) * limit;
  const total = await Schedule.countDocuments(filter);
  const schedules = await Schedule.find(filter)
    .populate("client_id", "name email")
    .populate({ path: "trainer_id", populate: { path: "user_id", select: "name email" } })
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  return { total, page: Number(page), pages: Math.ceil(total / limit), schedules };
};

export const getScheduleById = async (id) => {
  const schedule = await Schedule.findById(id)
    .populate("client_id", "name email")
    .populate({ path: "trainer_id", populate: { path: "user_id", select: "name email" } });
  if (!schedule) fail("Schedule not found.", 404);
  return schedule;
};

export const updateSchedule = async (id, updates, requesterId, requesterRole) => {
  const schedule = await Schedule.findById(id).populate("trainer_id");
  if (!schedule) fail("Schedule not found.", 404);

  if (requesterRole === "trainer") {
    if (!schedule.trainer_id || String(schedule.trainer_id.user_id) !== String(requesterId)) {
      fail("You are not authorized to update this schedule.", 403);
    }
  }

  Object.assign(schedule, updates);
  await schedule.save();

  return await schedule.populate([
    { path: "client_id", select: "name email" },
    { path: "trainer_id", populate: { path: "user_id", select: "name email" } }
  ]);
};

export const deleteSchedule = async (id, requesterId, requesterRole) => {
  const schedule = await Schedule.findById(id).populate("trainer_id");
  if (!schedule) fail("Schedule not found.", 404);

  if (requesterRole === "trainer") {
    if (!schedule.trainer_id || String(schedule.trainer_id.user_id) !== String(requesterId)) {
      fail("You are not authorized to delete this schedule.", 403);
    }
  }

  await Schedule.findByIdAndDelete(id);
};

export const updateScheduleCompletion = async (id, completionStatus, requesterId) => {
  const schedule = await Schedule.findById(id);
  if (!schedule) fail("Schedule not found.", 404);

  if (String(schedule.client_id) !== String(requesterId)) {
    fail("You are not authorized to update this schedule.", 403);
  }

  schedule.completion_status = completionStatus;
  schedule.update_date = new Date();
  await schedule.save();

  return await schedule.populate([
    { path: "client_id", select: "name email" },
    { path: "trainer_id", populate: { path: "user_id", select: "name email" } },
  ]);
};

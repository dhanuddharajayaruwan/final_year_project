import * as service from "../services/schedule.service.js";
import TrainerProfile from "../models/TrainerProfile.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const create = async (req, res) => {
  try {
    let data;
    if (req.user.role === "admin") {
      data = req.dto;
    } else if (req.user.role === "trainer") {
      const profile = await TrainerProfile.findOne({ user_id: req.user._id });
      if (!profile) return res.status(404).json({ status: "error", message: "Trainer profile not found." });
      data = { ...req.dto, trainer_id: profile._id };
    } else {
      data = { ...req.dto, client_id: req.user._id };
    }
    const schedule = await service.createSchedule(data);
    res.status(201).json({ status: "success", schedule });
  } catch (err) { handle(res, err); }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllSchedules(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getMy = async (req, res) => {
  try {
    const result = await service.getMySchedules(req.user._id, req.user.role, req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getById = async (req, res) => {
  try {
    const schedule = await service.getScheduleById(req.params.id);
    res.status(200).json({ status: "success", schedule });
  } catch (err) { handle(res, err); }
};

export const update = async (req, res) => {
  try {
    const schedule = await service.updateSchedule(req.params.id, req.dto, req.user._id, req.user.role);
    res.status(200).json({ status: "success", schedule });
  } catch (err) { handle(res, err); }
};

export const remove = async (req, res) => {
  try {
    await service.deleteSchedule(req.params.id, req.user._id, req.user.role);
    res.status(200).json({ status: "success", message: "Deleted successfully" });
  } catch (err) { handle(res, err); }
};

export const updateCompletion = async (req, res) => {
  try {
    const schedule = await service.updateScheduleCompletion(
      req.params.id,
      req.dto.completion_status,
      req.user._id
    );
    res.status(200).json({ status: "success", schedule });
  } catch (err) { handle(res, err); }
};

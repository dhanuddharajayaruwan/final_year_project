import * as service from "../services/trainingClip.service.js";
import TrainerProfile from "../models/TrainerProfile.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const create = async (req, res) => {
  try {
    let trainer_id = req.dto.trainer_id;
    if (req.user.role !== "admin") {
      const profile = await TrainerProfile.findOne({ user_id: req.user._id });
      if (!profile) return res.status(404).json({ status: "error", message: "Trainer profile not found." });
      trainer_id = profile._id;
    }
    const data = { ...req.dto, trainer_id };
    const clip = await service.createClip(data);
    res.status(201).json({ status: "success", clip });
  } catch (err) { handle(res, err); }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllClips(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getMy = async (req, res) => {
  try {
    const result = await service.getMyClips(req.user._id, req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getById = async (req, res) => {
  try {
    const clip = await service.getClipById(req.params.id);
    res.status(200).json({ status: "success", clip });
  } catch (err) { handle(res, err); }
};

export const update = async (req, res) => {
  try {
    const clip = await service.updateClip(req.params.id, req.user._id, req.user.role, req.dto);
    res.status(200).json({ status: "success", clip });
  } catch (err) { handle(res, err); }
};

export const remove = async (req, res) => {
  try {
    await service.deleteClip(req.params.id, req.user._id, req.user.role);
    res.status(200).json({ status: "success", message: "Clip deleted successfully" });
  } catch (err) { handle(res, err); }
};

export const getForCoach = async (req, res) => {
  try {
    const clips = await service.getClipsForClientCoach(req.user._id, req.params.trainerId);
    res.status(200).json({ status: "success", clips });
  } catch (err) { handle(res, err); }
};

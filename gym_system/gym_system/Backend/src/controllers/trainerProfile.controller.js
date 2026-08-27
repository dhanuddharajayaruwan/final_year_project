import * as service from "../services/trainerProfile.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// Shared error handler
// ─────────────────────────────────────────────────────────────────────────────
const handleError = (res, err) =>
  res.status(err.statusCode || 500).json({
    status : "error",
    message: err.message || "An unexpected error occurred.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/trainer-profiles
// ─────────────────────────────────────────────────────────────────────────────
export const createProfile = async (req, res) => {
  try {
    // Force user_id to their own id unless admin is creating for another user
    const data = req.user.role === "admin"
      ? req.dto
      : { ...req.dto, user_id: String(req.user._id) };

    const profile = await service.createTrainerProfile(data);
    return res.status(201).json({ status: "success", profile });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/trainer-profiles/register [admin]
// Full registration: User (trainer) + Profile
// ─────────────────────────────────────────────────────────────────────────────
export const registerTrainer = async (req, res) => {
  try {
    const result = await service.registerTrainerWithFullProfile(req.body);
    return res.status(201).json({ status: "success", ...result });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/trainer-profiles           [public — no auth required]
// ?page=1 &limit=10 &specialization=yoga
// ─────────────────────────────────────────────────────────────────────────────
export const getAllProfiles = async (req, res) => {
  try {
    const { page, limit, specialization } = req.query;
    const result = await service.getAllTrainerProfiles({ page, limit, specialization });

    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/trainer-profiles/me        [trainer]
// ─────────────────────────────────────────────────────────────────────────────
export const getMyProfile = async (req, res) => {
  try {
    const profile = await service.getMyTrainerProfile(req.user._id);
    return res.status(200).json({ status: "success", profile });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/trainer-profiles/:id       [any authenticated user]
// ─────────────────────────────────────────────────────────────────────────────
export const getProfileById = async (req, res) => {
  try {
    const profile = await service.getTrainerProfileById(req.params.id);
    return res.status(200).json({ status: "success", profile });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/trainer-profiles/me      [trainer]
// ─────────────────────────────────────────────────────────────────────────────
export const updateMyProfile = async (req, res) => {
  try {
    const profile = await service.updateMyTrainerProfile(req.user._id, req.dto);
    return res.status(200).json({
      status : "success",
      message: "Trainer profile updated successfully.",
      profile,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/trainer-profiles/:id     [admin]
// ─────────────────────────────────────────────────────────────────────────────
export const updateProfileById = async (req, res) => {
  try {
    const profile = await service.updateTrainerProfileById(req.params.id, req.dto);
    return res.status(200).json({
      status : "success",
      message: "Trainer profile updated.",
      profile,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/trainer-profiles/:id    [admin]
// ─────────────────────────────────────────────────────────────────────────────
export const deleteProfile = async (req, res) => {
  try {
    await service.deleteTrainerProfile(req.params.id);
    return res.status(200).json({
      status : "success",
      message: "Trainer profile deleted.",
    });
  } catch (err) {
    return handleError(res, err);
  }
};

export const getMyClients = async (req, res) => {
  try {
    const clients = await service.getClientsForTrainer(req.user._id);
    return res.status(200).json({ status: "success", clients });
  } catch (err) {
    return handleError(res, err);
  }
};

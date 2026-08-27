import * as service from "../services/clientProfile.service.js";

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
// POST /api/client-profiles
// Creates a profile. Admin can pass any user_id; a client uses their own id.
// ─────────────────────────────────────────────────────────────────────────────
export const createProfile = async (req, res) => {
  try {
    // If a non-admin calls this, force user_id to their own id
    const data = req.user.role === "admin"
      ? req.dto
      : { ...req.dto, user_id: String(req.user._id) };

    const profile = await service.createClientProfile(data);
    return res.status(201).json({ status: "success", profile });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/client-profiles/register  [admin]
// Full registration: User + Profile + BodyInfo
// ─────────────────────────────────────────────────────────────────────────────
export const registerMember = async (req, res) => {
  try {
    const result = await service.registerMemberWithFullProfile(req.body);
    return res.status(201).json({ status: "success", ...result });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/client-profiles            [admin]
// Paginated list with optional ?membership_status filter and ?page, ?limit
// ─────────────────────────────────────────────────────────────────────────────
export const getAllProfiles = async (req, res) => {
  try {
    const { page, limit, membership_status } = req.query;
    const result = await service.getAllClientProfiles({ page, limit, membership_status });

    return res.status(200).json({ status: "success", ...result });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/client-profiles/me         [client]
// ─────────────────────────────────────────────────────────────────────────────
export const getMyProfile = async (req, res) => {
  try {
    const profile = await service.getMyClientProfile(req.user._id);
    return res.status(200).json({ status: "success", profile });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/client-profiles/:id        [admin | trainer]
// ─────────────────────────────────────────────────────────────────────────────
export const getProfileById = async (req, res) => {
  try {
    const profile = await service.getClientProfileById(req.params.id);
    return res.status(200).json({ status: "success", profile });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/client-profiles/me       [client]
// ─────────────────────────────────────────────────────────────────────────────
export const updateMyProfile = async (req, res) => {
  try {
    const profile = await service.updateMyClientProfile(req.user._id, req.dto);
    return res.status(200).json({
      status : "success",
      message: "Profile updated successfully.",
      profile,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/client-profiles/:id      [admin]
// ─────────────────────────────────────────────────────────────────────────────
export const updateProfileById = async (req, res) => {
  try {
    const profile = await service.updateClientProfileById(req.params.id, req.dto);
    return res.status(200).json({
      status : "success",
      message: "Client profile updated.",
      profile,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/client-profiles/:id     [admin]
// ─────────────────────────────────────────────────────────────────────────────
export const deleteProfile = async (req, res) => {
  try {
    await service.deleteClientProfile(req.params.id);
    return res.status(200).json({
      status : "success",
      message: "Client profile deleted.",
    });
  } catch (err) {
    return handleError(res, err);
  }
};

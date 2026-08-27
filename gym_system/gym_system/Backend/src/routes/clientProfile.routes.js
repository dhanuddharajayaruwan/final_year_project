import { Router } from "express";
import * as ctrl          from "../controllers/clientProfile.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate }           from "../middlewares/validatedto.middleware.js";
import {
  CreateClientProfileDTO,
  UpdateClientProfileDTO,
} from "../dto/clientProfile.dto.js";

const router = Router();

// All client-profile routes require authentication
router.use(protect);

// ── POST /api/client-profiles ─────────────────────────────────────────────────
// client  → creates their own profile (user_id overridden in controller)
// admin   → can create for any user_id
router.post(
  "/",
  authorize("client", "admin"),
  validate(CreateClientProfileDTO),
  ctrl.createProfile
);

// ── POST /api/client-profiles/register ─────────────────────────────────────────
// admin only — register new User + Profile + BodyInfo
router.post(
  "/register",
  authorize("admin"),
  ctrl.registerMember
);

// ── GET /api/client-profiles ──────────────────────────────────────────────────
// admin only — paginated list
// ?page=1 &limit=10 &membership_status=active
router.get(
  "/",
  authorize("admin"),
  ctrl.getAllProfiles
);

// ── GET /api/client-profiles/me ──────────────────────────────────────────────
// client's own profile  (MUST be before /:id to avoid "me" being treated as id)
router.get(
  "/me",
  authorize("client"),
  ctrl.getMyProfile
);

// ── PATCH /api/client-profiles/me ────────────────────────────────────────────
// client updates their own profile
router.patch(
  "/me",
  authorize("client"),
  validate(UpdateClientProfileDTO),
  ctrl.updateMyProfile
);

// ── GET /api/client-profiles/:id ─────────────────────────────────────────────
// admin and trainer can look up any client profile by id
router.get(
  "/:id",
  authorize("admin", "trainer"),
  ctrl.getProfileById
);

// ── PATCH /api/client-profiles/:id ───────────────────────────────────────────
// admin updates any client profile
router.patch(
  "/:id",
  authorize("admin"),
  validate(UpdateClientProfileDTO),
  ctrl.updateProfileById
);

// ── DELETE /api/client-profiles/:id ──────────────────────────────────────────
// admin hard-deletes
router.delete(
  "/:id",
  authorize("admin"),
  ctrl.deleteProfile
);

export default router;

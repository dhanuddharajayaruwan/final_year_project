import { Router } from "express";
import * as ctrl                    from "../controllers/trainerProfile.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate }                 from "../middlewares/validatedto.middleware.js";
import {
  CreateTrainerProfileDTO,
  UpdateTrainerProfileDTO,
} from "../dto/trainerProfile.dto.js";

const router = Router();

// ── GET /api/trainer-profiles ─────────────────────────────────────────────────
// Public — anyone can browse trainers (optionalAuth attaches user if logged in)
// ?page=1 &limit=10 &specialization=yoga
router.get(
  "/",
  optionalAuth,
  ctrl.getAllProfiles
);

// ── Routes below require login ─────────────────────────────────────────────────

// ── POST /api/trainer-profiles ────────────────────────────────────────────────
// trainer → creates their own profile
// admin   → can create for any user_id
router.post(
  "/",
  protect,
  authorize("trainer", "admin"),
  validate(CreateTrainerProfileDTO),
  ctrl.createProfile
);

// ── POST /api/trainer-profiles/register ───────────────────────────────────────
// admin only — register new User (trainer) + Profile
router.post(
  "/register",
  protect,
  authorize("admin"),
  ctrl.registerTrainer
);

// ── GET /api/trainer-profiles/me ─────────────────────────────────────────────
// trainer's own profile  (MUST be before /:id)
router.get(
  "/me",
  protect,
  authorize("trainer"),
  ctrl.getMyProfile
);

// ── GET /api/trainer-profiles/me/clients ─────────────────────────────────────
// trainer's own clients (MUST be before /:id)
router.get(
  "/me/clients",
  protect,
  authorize("trainer"),
  ctrl.getMyClients
);

// ── PATCH /api/trainer-profiles/me ───────────────────────────────────────────
// trainer updates their own profile
router.patch(
  "/me",
  protect,
  authorize("trainer"),
  validate(UpdateTrainerProfileDTO),
  ctrl.updateMyProfile
);

// ── GET /api/trainer-profiles/:id ────────────────────────────────────────────
// Any logged-in user can view a specific trainer's profile
router.get(
  "/:id",
  protect,
  ctrl.getProfileById
);

// ── PATCH /api/trainer-profiles/:id ──────────────────────────────────────────
// admin updates any trainer profile
router.patch(
  "/:id",
  protect,
  authorize("admin"),
  validate(UpdateTrainerProfileDTO),
  ctrl.updateProfileById
);

// ── DELETE /api/trainer-profiles/:id ─────────────────────────────────────────
// admin hard-deletes
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  ctrl.deleteProfile
);

export default router;

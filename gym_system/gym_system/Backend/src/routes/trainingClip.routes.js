import { Router } from "express";
import * as ctrl from "../controllers/trainingClip.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateTrainingClipDTO, UpdateTrainingClipDTO } from "../dto/trainingClip.dto.js";
import TrainerProfile from "../models/TrainerProfile.js";

import { uploadSingle } from "../utils/upload.js";

const router = Router();

router.get("/coach/:trainerId", protect, authorize("client"), ctrl.getForCoach);
router.get("/", optionalAuth, ctrl.getAll);
router.get("/:id", optionalAuth, ctrl.getById);

router.use(protect);
router.post(
  "/",
  authorize("trainer", "admin"),
  uploadSingle("clips", "clip"),
  async (req, _res, next) => {
    if (req.file) req.body.clip = req.file.webPath;
    if (req.user.role === "trainer") {
      const profile = await TrainerProfile.findOne({ user_id: req.user._id });
      if (profile) {
        req.body.trainer_id = String(profile._id);
      }
    }
    next();
  },
  validate(CreateTrainingClipDTO),
  ctrl.create
);

router.get("/me/list", authorize("trainer"), ctrl.getMy);

router.patch(
  "/:id",
  authorize("trainer", "admin"),
  uploadSingle("clips", "clip"),
  (req, _res, next) => {
    if (req.file) req.body.clip = req.file.webPath;
    next();
  },
  validate(UpdateTrainingClipDTO),
  ctrl.update
);

router.delete("/:id", authorize("trainer", "admin"), ctrl.remove);

export default router;

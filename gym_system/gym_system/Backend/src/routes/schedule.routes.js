import { Router } from "express";
import * as ctrl from "../controllers/schedule.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateScheduleDTO, UpdateScheduleDTO, UpdateScheduleCompletionDTO } from "../dto/schedule.dto.js";
import TrainerProfile from "../models/TrainerProfile.js";

const router = Router();
router.use(protect);

router.post(
  "/",
  authorize("client", "trainer", "admin"),
  async (req, res, next) => {
    if (req.user.role === "client") {
      req.body.client_id = String(req.user._id);
    } else if (req.user.role === "trainer") {
      const profile = await TrainerProfile.findOne({ user_id: req.user._id });
      if (profile) {
        req.body.trainer_id = String(profile._id);
      }
    }
    next();
  },
  validate(CreateScheduleDTO),
  ctrl.create
);
router.get("/", authorize("admin"), ctrl.getAll);
router.get("/me", authorize("client", "trainer"), ctrl.getMy);
router.get("/:id", authorize("admin", "client", "trainer"), ctrl.getById);
router.patch("/:id/completion", authorize("client"), validate(UpdateScheduleCompletionDTO), ctrl.updateCompletion);
router.patch("/:id", authorize("admin", "trainer"), validate(UpdateScheduleDTO), ctrl.update);
router.delete("/:id", authorize("admin", "trainer"), ctrl.remove);

export default router;

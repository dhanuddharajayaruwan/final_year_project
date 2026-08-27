import { Router } from "express";
import * as ctrl from "../controllers/trainingSubscription.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateTrainingSubscriptionDTO, UpdateTrainingSubscriptionDTO } from "../dto/trainingSubscription.dto.js";

const router = Router();
router.use(protect);

router.post("/", authorize("client", "admin"), validate(CreateTrainingSubscriptionDTO), ctrl.create);
router.post("/payhere/:planId", authorize("client"), ctrl.initiatePayHere);
router.post("/bank/:planId", authorize("client"), ctrl.initiateBank);
router.get("/", authorize("admin"), ctrl.getAll);
router.get("/me", authorize("client", "trainer", "admin"), ctrl.getMy);
router.get("/:id", authorize("admin"), ctrl.getById);
router.patch("/:id", authorize("admin"), validate(UpdateTrainingSubscriptionDTO), ctrl.update);
router.delete("/:id", authorize("admin"), ctrl.remove);

export default router;

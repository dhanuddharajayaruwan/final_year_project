import { Router } from "express";
import * as ctrl from "../controllers/subscriptionPlan.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateSubscriptionPlanDTO, UpdateSubscriptionPlanDTO } from "../dto/subscriptionPlan.dto.js";

const router = Router();

router.get("/", optionalAuth, ctrl.getAll);
router.get("/:id", optionalAuth, ctrl.getById);

router.use(protect, authorize("admin"));
router.post("/", validate(CreateSubscriptionPlanDTO), ctrl.create);
router.patch("/:id", validate(UpdateSubscriptionPlanDTO), ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;

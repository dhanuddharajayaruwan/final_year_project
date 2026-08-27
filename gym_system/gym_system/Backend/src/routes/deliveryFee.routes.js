import { Router } from "express";
import ctrl from "../controllers/deliveryFee.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { CreateDeliveryFeeDTO, UpdateDeliveryFeeDTO } from "../dto/deliveryFee.dto.js";

const router = Router();

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

// Admin only operations
router.use(protect);
router.use(authorize("admin"));
router.post("/", validate(CreateDeliveryFeeDTO), ctrl.create);
router.patch("/:id", validate(UpdateDeliveryFeeDTO), ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;

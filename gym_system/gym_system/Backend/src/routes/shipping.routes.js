import { Router } from "express";
import * as ctrl from "../controllers/shipping.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validatedto.middleware.js";
import { UpdateShippingDTO } from "../dto/shipping.dto.js";

const router = Router();
router.use(protect);

router.get("/order/:orderId", authorize("admin", "client"), ctrl.getByOrderId);
router.get("/", authorize("admin"), ctrl.getAll);
router.patch("/:id", authorize("admin"), validate(UpdateShippingDTO), ctrl.updateStatus);


export default router;
